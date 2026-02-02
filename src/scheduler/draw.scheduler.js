/**
 * Draw Scheduler
 *
 * 로또 회차 정보 자동 동기화 스케줄러
 * 매주 토요일 21:20 KST에 실행
 * 동행복권 API에서 최신 당첨 정보 조회
 *
 */

const cron = require('node-cron');
const drawService = require('../modules/draw/draw.service');
const drawRepository = require('../modules/draw/draw.repository');
const evaluateService = require('../modules/evaluate/evaluate.service');

/**
 * 다음 동기화할 회차 번호 계산
 * @returns {Promise<number>} 다음 동기화 대상 회차 번호
 */
async function getNextSyncDrwNo() {
    const latestDraw = await drawRepository.findLatestSyncedDraw();

    if (!latestDraw) {
        return 1;
    }

    return latestDraw.drw_no + 1;
}

/**
 * 회차 동기화 실행
 */
async function syncLatestDraw() {
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    console.log(`[${timestamp}] 회차 동기화 스케줄러 실행`);

    try {
        const nextDrwNo = await getNextSyncDrwNo();
        console.log(`[${timestamp}] 동기화 대상 회차: ${nextDrwNo}`);

        const result = await drawService.syncDrawFromAPI(nextDrwNo);
        console.log(`[${timestamp}] 동기화 완료:`, result.message);

        // 동기화 완료 후 추천/구매 결과 평가
        try {
            const evalResult = await evaluateService.createEvaluateAllByDrwNo(nextDrwNo);
            console.log(`[${timestamp}] 평가 완료: 추천 ${evalResult.recommend.evaluatedCount}건, 구매 ${evalResult.purchase.evaluatedCount}건`);
        } catch (evalErr) {
            console.error(`[${timestamp}] 평가 실패:`, evalErr.message);
        }

        return result;

    } catch (err) {
        console.error(`[${timestamp}] 동기화 실패:`, err.message);
        return {
            result: false,
            message: err.message
        };
    }
}

/**
 * 스케줄러 시작
 * 매주 토요일 21:20 KST 실행
 */
function start() {
    // Cron: 분 시 일 월 요일 (0=일요일, 6=토요일)
    // '20 21 * * 6' = 매주 토요일 21:20
    const schedule = '20 21 * * 6';

    cron.schedule(schedule, syncLatestDraw, {
        timezone: 'Asia/Seoul'
    });

    console.log('[Draw Scheduler] 스케줄러 시작 - 매주 토요일 21:20 KST');
}

module.exports = {
    start,
};
