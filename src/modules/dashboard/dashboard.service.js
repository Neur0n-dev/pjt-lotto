/**
 * Dashboard Service
 *
 * 대시보드 데이터 조회 비즈니스 로직 담당
 * repository 쿼리를 병렬 실행하여 집계 데이터 조합
 * drwNo 없으면 최신회차 기준으로 조회
 */

const repository = require('./dashboard.repository');
const drawRepository = require('../draw/draw.repository');
const { formatDateTime } = require('../../common/utils');

/**
 * 대시보드 대상 회차 결정
 * drwNo가 없으면 최신 회차 기준으로 조회
 * @param {number|undefined} drwNo
 * @returns {Promise<number>}
 */
async function findTargetDrwNo(drwNo) {
    if (drwNo) return drwNo;

    const latestDraw = await drawRepository.findLatestDraw();
    return latestDraw ? latestDraw.drw_no : 1;
}

/**
 * 대시보드 전체 요약 데이터 조회 (60초 폴링용)
 * @param {number|undefined} drwNo - 대상 회차 (없으면 최신)
 * @returns {Promise<object>} 대시보드 전체 데이터
 */
async function getDashboardSummary(drwNo) {
    const latestDraw = await drawRepository.findLatestDraw();
    const latestDrwNo = latestDraw ? latestDraw.drw_no : 1;
    const targetDrwNo = drwNo || latestDrwNo;

    const [
        totalPurchases,
        totalRecommends,
        totalWins,
        totalPurchaseResults,
        totalRecommendResults,
        topPurchasedNumbers,
    //     recentPurchases,
    //     recentRecommends,
        purchaseCount,
        recommendCount,
        purchaseSourceRatio,
    //     purchaseTrend,
    //     recommendTrend,
    //     cumulativeRankDistribution,
    ] = await Promise.all([
        repository.countTotalPurchases(),
        repository.countTotalRecommends(),
        repository.countTotalWins(),
        repository.countTotalPurchaseResults(),
        repository.countTotalRecommendResults(),
        repository.findTopPurchasedNumbersByDrwNo(targetDrwNo, 7),
    //     repository.findRecentPurchases(targetDrwNo, 3),
    //     repository.findRecentRecommends(targetDrwNo, 3),
        repository.countPurchasesByTargetDrwNo(targetDrwNo),
        repository.countRecommendsByTargetDrwNo(targetDrwNo),
        repository.countPurchasesBySourceType(targetDrwNo),
    //     repository.findPurchaseTrendByRecentDraws(10),
    //     repository.findRecommendTrendByRecentDraws(10),
    //     repository.countCumulativeRankDistribution(),
    ]);

    const totalEvaluated = totalPurchaseResults + totalRecommendResults;
    const winRate = totalEvaluated > 0
        ? Math.round((totalWins / totalEvaluated) * 10000) / 100
        : 0;

    return {
        result: true,
        drwNo: targetDrwNo,
        latestDrwNo,
        summary: {
            totalPurchases,
            totalRecommends,
            totalWins,
            winRate,
        //     totalEvaluated,
        },
        topPurchasedNumbers: topPurchasedNumbers.map(row => ({
            number: row.number,
            count: row.count,
        })),
        // recentPurchases: recentPurchases.map(row => ({
        //     purchaseAt: formatDateTime(row.purchase_at),
        //     numbers: row.numbers.split(',').map(Number),
        // })),
        // recentRecommends: recentRecommends.map(row => ({
        //     createdDate: formatDateTime(row.created_date),
        //     numbers: row.numbers.split(',').map(Number),
        // })),
        realtimeCounters: {
            drwNo: targetDrwNo,
            purchaseCount,
            recommendCount,
        },
        purchaseSourceRatio: purchaseSourceRatio.map(row => ({
            sourceType: row.source_type,
            count: row.count,
        })),
        // purchaseTrend: purchaseTrend.map(row => ({
        //     drwNo: row.drw_no,
        //     count: row.count,
        // })),
        // recommendTrend: recommendTrend.map(row => ({
        //     drwNo: row.drw_no,
        //     count: row.count,
        // })),
        // cumulativeRankDistribution: cumulativeRankDistribution.map(row => ({
        //     resultRank: row.result_rank,
        //     count: row.count,
        // })),
    };
}

/**
 * 실시간 데이터 조회 (5초 폴링용, 경량)
 * @param {number|undefined} drwNo - 대상 회차 (없으면 최신)
 * @returns {Promise<object>} 실시간 카운터 + 최근 3건
 */
async function getRealtimeCounters(drwNo) {
    const targetDrwNo = await findTargetDrwNo(drwNo);

    const [
        purchaseCount,
        recommendCount,
        // recentPurchases,
        // recentRecommends,
    ] = await Promise.all([
        repository.countPurchasesByTargetDrwNo(targetDrwNo),
        repository.countRecommendsByTargetDrwNo(targetDrwNo),
        // repository.findRecentPurchases(targetDrwNo, 3),
        // repository.findRecentRecommends(targetDrwNo, 3),
    ]);

    return {
        result: true,
        drwNo: targetDrwNo,
        purchaseCount,
        recommendCount,
        // recentPurchases: recentPurchases.map(row => ({
        //     purchaseAt: formatDateTime(row.purchase_at),
        //     numbers: row.numbers.split(',').map(Number),
        // })),
        // recentRecommends: recentRecommends.map(row => ({
        //     createdDate: formatDateTime(row.created_date),
        //     numbers: row.numbers.split(',').map(Number),
        // })),
    };
}

module.exports = {
    getDashboardSummary,
    getRealtimeCounters,
};
