/**
 * Recommend Controller
 *
 * HTTP 요청(req/res)을 처리하는 계층
 * 요청 데이터 수신 후 validator, service 호출
 * 클라이언트에 요청에 맞게 응답 반환
 * 비즈니스 로직은 직접 처리하지 않음
 *
 */

const {
    recommendValidatorRequest
} = require('./recommend.validator');

const {
    createRecommend,
    getRecommendById,
    getRecommendListByFilters
} = require('./recommend.service');

const {
    AppError,
    errorCodes
} = require('../../common/errors');


// 추천 이력 저장 /recommend
async function postRecommend(req, res, next) {
    try {
        // 1. 요청 데이터에 관련하여 검증
        const validResult = recommendValidatorRequest(req.body);

        // 2. 검증된 데이터로 비즈니스로직
        const result = await createRecommend(validResult);

        // 3. 결과 반환
        return res.json(result);

    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.RECOMMEND_GENERATION_FAILED, err.message));
    }
}

// 추천 이력 조회 GET /recommend/:id
async function getRecommend(req, res, next) {
    try {
        const {id} = req.params;

        // UUID 형식 간단 검증
        if (!id || id.length < 36) {
            throw new AppError(errorCodes.INVALID_PARAM, '유효하지 않은 추천 ID');
        }

        const result = await getRecommendById(id);

        if (!result) {
            throw new AppError(errorCodes.RECOMMEND_NOT_FOUND, id);
        }

        return res.json(result);

    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 추천 목록 조회 GET /recommend
async function getRecommendList(req, res, next) {
    try {
        const {targetDrwNo, strategy} = req.query;

        const result = await getRecommendListByFilters({
            targetDrwNo: targetDrwNo ? parseInt(targetDrwNo, 10) : undefined,
            algorithm: strategy || undefined
        });

        return res.json(result);

    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

module.exports = {
    postRecommend,
    getRecommend,
    getRecommendList
};