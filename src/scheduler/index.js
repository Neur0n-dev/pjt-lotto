/**
 * Scheduler Index
 *
 * 모든 스케줄러 초기화 및 시작
 *
 */

const drawScheduler = require('./draw.scheduler');
const purchaseScheduler = require('./purchase.scheduler');
const recommendScheduler = require('./recommend.scheduler');
const dashboardScheduler = require('./dashboard.scheduler');

/**
 * 모든 스케줄러 시작
 */
function startAll() {
    console.log('[Scheduler] 스케줄러 초기화 시작');

    drawScheduler.start();
    purchaseScheduler.start();
    recommendScheduler.start();
    dashboardScheduler.start();

    console.log('[Scheduler] 모든 스케줄러 초기화 완료');
}

module.exports = {
    startAll,
    drawScheduler,  // 개별 접근용
    purchaseScheduler,
    recommendScheduler,
    dashboardScheduler,
};
