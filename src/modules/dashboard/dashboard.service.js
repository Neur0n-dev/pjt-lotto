/**
 * Dashboard Service
 *
 * 대시보드 데이터 조회 비즈니스 로직 담당
 * repository 쿼리를 병렬 실행하여 집계 데이터 조합
 * drwNo 없으면 최신회차 기준으로 조회
 */

const repository = require('./dashboard.repository');
const drawRepository = require('../draw/draw.repository');

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
 * 1행 요약 카드 데이터 조회
 * @param {number|undefined} drwNo - 대상 회차 (없으면 최신)
 * @returns {Promise<object>} drwNo, latestDrwNo, summary
 */
async function getSummaryRow1(drwNo) {
    const latestDraw = await drawRepository.findLatestDraw();
    const latestDrwNo = latestDraw ? latestDraw.drw_no : 1;
    const targetDrwNo = drwNo || latestDrwNo;

    const [
        totalPurchases,
        totalRecommends,
        totalWins,
        totalPurchaseResults,
        totalRecommendResults,
    ] = await Promise.all([
        repository.countTotalPurchases(),
        repository.countTotalRecommends(),
        repository.countTotalWins(),
        repository.countTotalPurchaseResults(),
        repository.countTotalRecommendResults(),
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
        },
    };
}

/**
 * 2행 차트 데이터 조회 (구매 유형 비율, 추천 전략 비율)
 * @param {number|undefined} drwNo - 대상 회차 (없으면 최신)
 * @returns {Promise<object>} purchaseSourceRatio, recommendAlgorithmRatio
 */
async function getSummaryRow2(drwNo) {
    const targetDrwNo = await findTargetDrwNo(drwNo);

    const [
        purchaseSourceRatio,
        recommendAlgorithmRatio,
    ] = await Promise.all([
        repository.countPurchasesBySourceType(targetDrwNo),
        repository.countRecommendsByAlgorithmAndDrwNo(targetDrwNo),
    ]);

    return {
        result: true,
        drwNo: targetDrwNo,
        purchaseSourceRatio: purchaseSourceRatio.map(row => ({
            sourceType: row.source_type,
            count: row.count,
        })),
        recommendAlgorithmRatio: recommendAlgorithmRatio.map(row => ({
            algorithm: row.algorithm,
            count: row.count,
        })),
    };
}

/**
 * 3행 차트 데이터 조회 (구매빈도 TOP7, 추이, 등수 분포)
 * @param {number|undefined} drwNo - 대상 회차 (없으면 최신)
 * @returns {Promise<object>} topPurchasedNumbers, trends, rankDistribution
 */
async function getSummaryRow3(drwNo) {
    const targetDrwNo = await findTargetDrwNo(drwNo);

    const [
        topPurchasedNumbers,
        purchaseTrend,
        recommendTrend,
        cumulativeRankDistribution,
    ] = await Promise.all([
        repository.findTopPurchasedNumbersByDrwNo(targetDrwNo, 7),
        repository.findPurchaseTrendByRecentDraws(targetDrwNo),
        repository.findRecommendTrendByRecentDraws(targetDrwNo),
        repository.countCumulativeRankDistribution(),
    ]);

    return {
        result: true,
        drwNo: targetDrwNo,
        topPurchasedNumbers: topPurchasedNumbers.map(row => ({
            number: row.number,
            count: row.count,
        })),
        purchaseTrend: purchaseTrend.map(row => ({
            drwNo: row.drw_no,
            count: row.count,
        })),
        recommendTrend: recommendTrend.map(row => ({
            drwNo: row.drw_no,
            count: row.count,
        })),
        cumulativeRankDistribution: cumulativeRankDistribution.map(row => ({
            resultRank: row.result_rank,
            count: row.count,
        })),
    };
}

/**
 * 실시간 데이터 조회 (5초 폴링용, 경량)
 * @param {number|undefined} drwNo - 대상 회차 (없으면 최신)
 * @returns {Promise<object>} 실시간 카운터
 */
async function getRealtimeCounters(drwNo) {
    const targetDrwNo = await findTargetDrwNo(drwNo);

    const [
        purchaseCount,
        recommendCount,
    ] = await Promise.all([
        repository.countPurchasesByTargetDrwNo(targetDrwNo),
        repository.countRecommendsByTargetDrwNo(targetDrwNo),
    ]);

    return {
        result: true,
        drwNo: targetDrwNo,
        purchaseCount,
        recommendCount,
    };
}

module.exports = {
    getSummaryRow1,
    getSummaryRow2,
    getSummaryRow3,
    getRealtimeCounters,
};
