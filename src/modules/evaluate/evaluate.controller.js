/**
 * Evaluate Controller
 *
 * HTTP 요청(req/res)을 처리하는 계층
 * 요청 데이터 수신 후 validator, service 호출
 * 클라이언트에 요청에 맞게 응답 반환
 * 비즈니스 로직은 직접 처리하지 않음
 *
 */

const {
    getRecommendByDrwNo,
    getRecommendResultRankStatisticsByDrwNo,
    getPurchaseByDrwNo,
    getPurchaseResultRankStatisticsByDrwNo
} = require('./evaluate.service');

const {
    AppError,
    errorCodes
} = require('../../common/errors');

const {
    validateDrwNo
} = require('./evaluate.validator');

// 추천 결과 조회 GET /evaluate/recommend/:drwNo
async function getRecommendEvaluate(req, res, next) {
    try {
        const drwNo = validateDrwNo(req.params.drwNo);

        // 병렬로 2개 호출 (성능/응답속도 유리)
        const [recommend, recommendRankStatistics] = await Promise.all([
            getRecommendByDrwNo(drwNo),
            getRecommendResultRankStatisticsByDrwNo(drwNo),
        ]);

        return res.json({
            result: true,
            drwNo,
            recommend: recommend?.items ?? recommend,
            recommendRankStatistics: recommendRankStatistics?.items ?? recommendRankStatistics
        });
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 구매 결과 조회 GET /evaluate/purchase/:drwNo
async function getPurchaseEvaluate(req, res, next) {
    try {
        const drwNo = validateDrwNo(req.params.drwNo);

        // 병렬로 2개 호출 (성능/응답속도 유리)
        const [purchase, purchaseRankStatistics] = await Promise.all([
            getPurchaseByDrwNo(drwNo),
            getPurchaseResultRankStatisticsByDrwNo(drwNo),
        ]);

        return res.json({
            result: true,
            drwNo,
            purchase: purchase?.items ?? purchase,
            purchaseRankStatistics: purchaseRankStatistics?.items ?? purchaseRankStatistics
        });
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

module.exports = {
    getRecommendEvaluate,
    getPurchaseEvaluate
}