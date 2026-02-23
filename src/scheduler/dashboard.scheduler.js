/**
 * Dashboard Scheduler
 *
 * 서버 기동 시: 전 회차 순차 캐시 워밍 (백그라운드)
 * 이후 1분마다: 최신 회차만 갱신 (데이터가 바뀔 수 있는 건 최신 회차뿐)
 */

const cron = require('node-cron');
const drawRepository = require('../modules/draw/draw.repository');
const dashboardService = require('../modules/dashboard/dashboard.service');
const dashboardCache = require('../cache/dashboard.cache');

let isRunning = false;

/**
 * 단일 회차 row1/2/3 병렬 조회 후 캐시 저장
 * @param {number} drwNo
 */
async function warmDrwNo(drwNo) {
    const [row1, row2, row3] = await Promise.all([
        dashboardService.getSummaryRow1(drwNo),
        dashboardService.getSummaryRow2(drwNo),
        dashboardService.getSummaryRow3(drwNo),
    ]);
    dashboardCache.set('row1', drwNo, row1);
    dashboardCache.set('row2', drwNo, row2);
    dashboardCache.set('row3', drwNo, row3);
}

/**
 * 최신 회차 갱신 (1분 주기 cron)
 */
async function executeLatestRefresh() {
    if (isRunning) return;
    isRunning = true;

    try {
        const latestDraw = await drawRepository.findLatestDraw();
        if (!latestDraw) return;

        await warmDrwNo(latestDraw.drw_no);
        console.log(`[Dashboard Scheduler] 최신 회차 캐시 갱신 완료 (drwNo: ${latestDraw.drw_no})`);
    } catch (err) {
        console.error('[Dashboard Scheduler] 갱신 실패:', err.message);
    } finally {
        isRunning = false;
    }
}

/**
 * 전 회차 순차 캐시 워밍 (서버 기동 시 1회 실행)
 */
async function warmAll() {
    try {
        const allDrawNos = (await drawRepository.findAllDrawNos()).reverse();
        console.log(`[Dashboard Scheduler] 캐시 워밍 시작 (총 ${allDrawNos.length}회차)`);

        for (const drwNo of allDrawNos) {
            await warmDrwNo(drwNo);
            console.log(`[Dashboard Scheduler] 캐시 워밍 완료: ${drwNo}회차`);
        }

        console.log('[Dashboard Scheduler] 전 회차 캐시 워밍 완료');
    } catch (err) {
        console.error('[Dashboard Scheduler] 캐시 워밍 실패:', err.message);
    }
}

function start() {
    cron.schedule('* * * * *', executeLatestRefresh, {
        timezone: 'Asia/Seoul'
    });

    // 서버 기동 시 전 회차 백그라운드 캐시 워밍
    warmAll();

    console.log('[Dashboard Scheduler] 스케줄러 시작');
}

module.exports = { start };
