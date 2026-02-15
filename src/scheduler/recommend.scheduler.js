/**
 * Recommend Scheduler
 *
 * 자동 추천 스케줄러
 * 20분마다 실행, 1~5개 랜덤 추천 생성
 * 전략 랜덤 선택, 모드별 fixedNumbers/excludeNumbers 자동 산출
 */

const cron = require('node-cron');
const recommendService = require('../modules/recommend/recommend.service');
const { getStrategyNames } = require('../modules/recommend/strategies');
const drawRepository = require('../modules/draw/draw.repository');
const { getKstDate, getRandomInt, shuffleArray } = require('../common/utils');

/** tick당 생성 티켓 수 범위 */
const MIN_TICKETS_PER_TICK = 1;
const MAX_TICKETS_PER_TICK = 5;

/** 빈도 조회 기준 회차 수 */
const FREQUENCY_ROUNDS = 20;

/** 동시 실행 방지 플래그 */
let isRunning = false;

/**
 * - 현재 KST 시각이 추천 가능 시간인지 판단
 * - 일요일 06:00 ~ 토요일 20:00
 * - 토 20:00 이후 ~ 일 06:00 → 불가
 * @returns {boolean}
 */
function isRecommendableTime() {
    const kstDate = getKstDate();
    const day = kstDate.getUTCDay();    // 0=일, 6=토
    const hours = kstDate.getUTCHours();

    if (day === 0 && hours < 6) return false;
    if (day === 6 && hours >= 20) return false;

    return true;
}

/**
 * 직전 회차 당첨번호 6개 조회 (보너스 제외)
 * @returns {Promise<Array<number>>} 당첨번호 배열
 */
async function getLastDrawNumbers() {
    const latestDraw = await drawRepository.findLatestSyncedDraw();
    if (!latestDraw) return [];

    const rows = await drawRepository.findDrawNumbers(latestDraw.drw_no);
    return rows.filter(r => r.pos <= 6).map(r => r.number);
}

/**
 * 최근 N회차 미출현 번호 조회
 * @returns {Promise<Array<number>>} 미출현 번호 배열
 */
async function getDormantNumbers() {
    const freqRows = await drawRepository.findNumberFrequency(FREQUENCY_ROUNDS);
    const appearedNumbers = new Set(freqRows.map(r => r.number));

    const dormant = [];
    for (let i = 1; i <= 45; i++) {
        if (!appearedNumbers.has(i)) dormant.push(i);
    }
    return dormant;
}

/**
 * 최근 N회차 과다출현 번호 조회 (상위 5개)
 * @returns {Promise<Array<number>>} 과다출현 번호 배열
 */
async function getHotNumbers() {
    const freqRows = await drawRepository.findNumberFrequency(FREQUENCY_ROUNDS);
    // cnt 오름차순이므로 뒤에서 5개가 최다 출현
    return freqRows.slice(-5).map(r => r.number);
}

/**
 * 모드 정의
 * 모드별로 fixedNumbers/excludeNumbers를 산출하는 함수 맵
 */
const MODES = {
    /** 제약 없음 */
    none: async () => ({
        fixedNumbers: [],
        excludeNumbers: []
    }),

    /** 직전 당첨번호 중 1~2개 고정 (연속 출현 기대) */
    repeat: async () => {
        const lastNumbers = await getLastDrawNumbers();
        if (lastNumbers.length === 0) return { fixedNumbers: [], excludeNumbers: [] };

        const pickCount = getRandomInt(1, 2);
        const fixed = shuffleArray(lastNumbers).slice(0, pickCount);
        return { fixedNumbers: fixed, excludeNumbers: [] };
    },

    /** 직전 당첨번호 전부 제외 (신선한 번호) */
    fresh: async () => {
        const lastNumbers = await getLastDrawNumbers();
        return { fixedNumbers: [], excludeNumbers: lastNumbers };
    },

    /** 최근 N회차 미출현 번호 1~2개 고정 (가뭄 해소) */
    dormant: async () => {
        const dormantNumbers = await getDormantNumbers();
        if (dormantNumbers.length === 0) return { fixedNumbers: [], excludeNumbers: [] };

        const pickCount = getRandomInt(1, Math.min(2, dormantNumbers.length));
        const fixed = shuffleArray(dormantNumbers).slice(0, pickCount);
        return { fixedNumbers: fixed, excludeNumbers: [] };
    },

    /** 미출현 1개 고정 + 과다출현 2~3개 제외 (혼합) */
    mixed: async () => {
        const [dormantNumbers, hotNumbers] = await Promise.all([
            getDormantNumbers(),
            getHotNumbers()
        ]);

        const fixed = dormantNumbers.length > 0
            ? shuffleArray(dormantNumbers).slice(0, 1)
            : [];

        const excludeCount = getRandomInt(2, Math.min(3, hotNumbers.length));
        const exclude = shuffleArray(hotNumbers).slice(0, excludeCount);

        return { fixedNumbers: fixed, excludeNumbers: exclude };
    }
};

const MODE_NAMES = Object.keys(MODES);

/**
 * - 10분마다 호출되는 핵심 실행 함수
 * - isRunning 가드로 동시 실행 방지
 * - 추천 불가 시간이면 skip
 * - 모드 랜덤 선택 → fixedNumbers/excludeNumbers 산출
 * - 1~5개 랜덤 생성, 티켓별 전략 랜덤 선택
 */
async function executeRecommend() {
    if (isRunning) return;
    if (!isRecommendableTime()) return;

    isRunning = true;

    try {
        // 모드 랜덤 선택 → fixed/exclude 산출
        const modeName = MODE_NAMES[Math.floor(Math.random() * MODE_NAMES.length)];
        const { fixedNumbers, excludeNumbers } = await MODES[modeName]();

        const strategyNames = getStrategyNames();
        const ticketCount = getRandomInt(MIN_TICKETS_PER_TICK, MAX_TICKETS_PER_TICK);

        // 티켓별 전략 랜덤 선택 후 전략별 그룹핑
        const countByStrategy = {};
        for (let i = 0; i < ticketCount; i++) {
            const selected = strategyNames[Math.floor(Math.random() * strategyNames.length)];
            countByStrategy[selected] = (countByStrategy[selected] || 0) + 1;
        }

        // 전략별로 추천 생성
        for (const [strategy, count] of Object.entries(countByStrategy)) {
            await recommendService.createRecommend({
                strategy,
                count,
                fixedNumbers,
                excludeNumbers
            });
        }
    } catch (err) {
        console.error('[Recommend Scheduler] 추천 실행 실패:', err.message);
    } finally {
        isRunning = false;
    }
}

/**
 * 스케줄러 시작
 * 20분마다 executeRecommend 실행
 */
function start() {
    // Cron 6필드: 초 분 시 일 월 요일
    // '0 */10 * * * *' = 매 20분 정각
    const schedule = '0 */10 * * * *';

    cron.schedule(schedule, executeRecommend, {
        timezone: 'Asia/Seoul'
    });

    console.log('[Recommend Scheduler] 스케줄러 시작 (10분 간격)');
}

module.exports = {
    start,
};
