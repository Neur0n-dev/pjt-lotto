/**
 * Purchase Scheduler
 *
 * 자동 구매 스케줄러
 * 1초마다 실행, tick당 12장 티켓 생성
 * 전략 랜덤 선택, 구매 가능 시간에만 동작
 */

const cron = require('node-cron');
const purchaseService = require('../modules/purchase/purchase.service');
const { STRATEGY_MAP, getStrategyNames } = require('../modules/recommend/strategies');
const drawRepository = require('../modules/draw/draw.repository');
const { getKstDate, formatDate, getRandomInt } = require('../common/utils');

/** tick당 생성 티켓 수 범위 */
const MIN_TICKETS_PER_TICK = 1;
const MAX_TICKETS_PER_TICK = 5;

/** 동시 실행 방지 플래그 */
let isRunning = false;

/** targetDrwNo 캐싱값 */
let cachedDrwNo = null;

/** 캐싱 기준 주차 (일요일 06:00 판단용) */
let cachedWeekStart = null;

/**
 * - 현재 KST 시각이 구매 가능 시간인지 판단
 * - 일~금: 06:00 ~ 24:00
 * - 토: 06:00 ~ 20:00
 * - 모든 요일 00:00~06:00, 토 20:00 이후 → 불가
 * @returns {boolean}
 */
function isPurchasableTime() {
    const kstDate = getKstDate();
    const day = kstDate.getUTCDay();    // 0=일, 6=토
    const hours = kstDate.getUTCHours();

    if (hours < 6) return false;
    if (day === 6 && hours >= 20) return false;

    return true;
}

/**
 * - targetDrwNo를 주 1회만 DB 조회하고 캐싱
 * - 현재 KST 기준 "이번 주 일요일 06:00" 시각 계산
 * - 같은 주차면 캐시 반환, 주차 변경 시 DB 재조회
 * @returns {Promise<number>} 목표 회차 번호
 */
async function getTargetDrwNoCached() {
    const kstDate = getKstDate();

    // 이번 주 일요일 06:00 KST 기준 시각 계산
    const sundayOffset = kstDate.getUTCDay(); // 0=일, 일요일까지 되돌릴 일수
    const weekStart = new Date(kstDate);
    weekStart.setUTCDate(kstDate.getUTCDate() - sundayOffset);
    weekStart.setUTCHours(6, 0, 0, 0);
    const weekStartTime = weekStart.getTime();

    if (cachedWeekStart === weekStartTime && cachedDrwNo !== null) {
        return cachedDrwNo;
    }

    // 최신 회차 조회 후 다음 회차 계산
    const latestDraw = await drawRepository.findLatestSyncedDraw();
    if(!latestDraw) {
        throw new Error('동기화 된 회차가 없습니다. 동기화를 먼저 실행 하세요.')
    }
    const nextDrwNo = latestDraw.drw_no + 1;

    // 다음 회차를 draw 테이블에 선등록 (FK 제약 충족)
    // 추첨일 = 직전 회차 + 7일
    const nextDate = new Date(latestDraw.drw_date);
    nextDate.setDate(nextDate.getDate() + 7);
    await drawRepository.insertDraw(nextDrwNo, formatDate(nextDate));

    cachedDrwNo = nextDrwNo;
    cachedWeekStart = weekStartTime;

    return cachedDrwNo;
}

/**
 * - 매 초마다 호출되는 핵심 실행 함수
 * - isRunning 가드로 동시 실행 방지
 * - 구매 불가 시간이면 skip
 * - 1~5장 랜덤 생성, 티켓마다 전략 개별 랜덤 선택
 * - 전략별로 그룹핑하여 sourceType에 전략명 저장
 */
async function executePurchase() {
    if (isRunning) return;
    if (!isPurchasableTime()) return;

    isRunning = true;

    try {
        const targetDrwNo = await getTargetDrwNoCached();
        const strategyNames = getStrategyNames();
        const ticketCount = getRandomInt(MIN_TICKETS_PER_TICK, MAX_TICKETS_PER_TICK);

        // 티켓별 전략 랜덤 선택 후 전략별 그룹핑
        const ticketsByStrategy = {};
        for (let i = 0; i < ticketCount; i++) {
            const selectedName = strategyNames[Math.floor(Math.random() * strategyNames.length)];
            const strategy = STRATEGY_MAP[selectedName];
            const ticket = await strategy.execute([], []);
            if (!ticketsByStrategy[selectedName]) ticketsByStrategy[selectedName] = [];
            ticketsByStrategy[selectedName].push(ticket);
        }

        // 전략별로 구매 생성
        for (const [strategyName, tickets] of Object.entries(ticketsByStrategy)) {
            await purchaseService.createPurchase({
                targetDrwNo,
                sourceType: strategyName,
                tickets
            });
        }
    } catch (err) {
        console.error('[Purchase Scheduler] 구매 실행 실패:', err.message);
    } finally {
        isRunning = false;
    }
}

/**
 * 스케줄러 시작
 * 매 1초마다 executePurchase 실행
 */
function start() {
    // Cron 6필드: 초 분 시 일 월 요일
    // '* * * * * *' = 매 1초
    const schedule = '* * * * * *';

    cron.schedule(schedule, executePurchase, {
        timezone: 'Asia/Seoul'
    });

    console.log('[Purchase Scheduler] 스케줄러 시작');
}

module.exports = {
    start,
};