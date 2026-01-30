/**
 * Purchase Controller
 *
 * HTTP 요청(req/res)을 처리하는 계층
 * 요청 데이터 수신 후 validator, service 호출
 * 클라이언트에 요청에 맞게 응답 반환
 * 비즈니스 로직은 직접 처리하지 않음
 *
 */

const {
    purchaseValidatorRequest
} = require('./purchase.validator');

const {
    createPurchase,
    getPurchaseById,
    getPurchaseListByFilters
} = require('./purchase.service');

const {
    AppError,
    errorCodes
} = require('../../common/errors');

// 구매 생성 POST /purchase
async function postPurchase(req, res, next) {
    try {
        // 1. 요청 데이터에 관련하여 검증
        const validResult = purchaseValidatorRequest(req.body);

        // 2. 검증된 데이터로 비즈니스로직
        const result = await createPurchase(validResult);

        // 3. 결과 반환
        return res.json(result);

    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 구매 조회 GET /purchase/:id
async function getPurchase(req, res, next) {
    try {
        const { id } = req.params;

        // UUID 형식 간단 검증
        if (!id || id.length < 36) {
            throw new AppError(errorCodes.INVALID_PARAM, '유효하지 않은 구매 ID');
        }

        const result = await getPurchaseById(id);

        if (!result) {
            throw new AppError(errorCodes.PURCHASE_NOT_FOUND, id);
        }

        return res.json(result);

    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 구매 목록 조회 GET /purchase
async function getPurchaseList(req, res, next) {
    try {
        const { targetDrwNo, sourceType } = req.query;

        const result = await getPurchaseListByFilters({
            targetDrwNo: targetDrwNo ? parseInt(targetDrwNo, 10) : undefined,
            sourceType: sourceType || undefined
        });

        return res.json(result);

    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

module.exports = {
    postPurchase,
    getPurchase,
    getPurchaseList
};
