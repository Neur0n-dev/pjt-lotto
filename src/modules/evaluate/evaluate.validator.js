/**
 * Evaluate Validator
 *
 * 평가 API 요청 데이터 유효성 검증 담당
 * 요청 파라미터의 타입, 범위, 필수 여부 확인
 * 검증 실패 시 에러 발생
 *
 */

const {
    toInt
} = require('../../common/utils');
const {
    AppError,
    errorCodes
} = require('../../common/errors');

/**
 * drwNo 파라미터 검증 및 변환
 * @param {*} rawDrwNo - req.params.drwNo (문자열)
 * @returns {number} 검증된 회차 번호
 */
function validateDrwNo(rawDrwNo) {
    const drwNo = toInt(rawDrwNo, null);

    if (drwNo === null || isNaN(drwNo) || drwNo < 1) {
        throw new AppError(errorCodes.EVALUATE_INVALID_DRW_NO);
    }

    return drwNo;
}

module.exports = {
    validateDrwNo
};
