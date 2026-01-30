/**
 * Recommend Validator
 *
 * 추천 API 요청 데이터 유효성 검증 담당
 * 요청 파라미터의 타입, 범위, 필수 여부 확인
 * 검증 실패 시 에러 발생
 *
 */

// 유틸 함수 가져오기
const {
    uniqArray, isEmpty, toInt
} = require('../../common/utils');
const { AppError, errorCodes } = require('../../common/errors');

const {
    getStrategyNames,
    hasStrategy
} = require('./strategies/index');

// 데이터 검증하는 함수
function recommendValidatorRequest(body = {}) {
    const errors = [];

    const strategy = body.strategy;
    const count = toInt(body.count, 1);
    const fixedNumbers = uniqArray(body.fixedNumbers || []);
    const excludeNumbers = uniqArray(body.excludeNumbers || []);


    // strategy 검증 -> 어떤 전략으로 할것인지
    if (isEmpty(strategy)) {
        errors.push('strategy는 필수 값입니다.');
    } else if (!hasStrategy(strategy)) {
        errors.push(`지원하지 않는 strategy 입니다. => ${strategy}`);
    }

    // count 검증 -> 로또가 몇개의 묶음을 추천 받을지
    if (count < 1 || count > 5) {
        errors.push('count는 1 이상 5 이하만 가능합니다.');
    }

    // fixedNumbers 검증 -> 꼭 들어가야하는 번호 -> 추가로 나중에 확장 가능 성 있음
    if (fixedNumbers.length > 6) {
        errors.push('fixedNumbers는 최대 6개까지 가능합니다.');
    }

    fixedNumbers.forEach(n => {
        if (!Number.isInteger(n) || n < 1 || n > 45) {
            errors.push('fixedNumbers는 1~45 사이의 정수만 가능합니다.');
        }
    });

    // excludeNumbers 검증 -> 제외 해야하는 숫자
    excludeNumbers.forEach(n => {
        if (!Number.isInteger(n) || n < 1 || n > 45) {
            errors.push('excludeNumbers는 1~45 사이의 정수만 가능합니다.');
        }
    });

    // fixed / exclude 중복 검증
    fixedNumbers.forEach(n => {
        if (excludeNumbers.includes(n)) {
            errors.push('fixedNumbers와 excludeNumbers는 중복될 수 없습니다.');
        }
    });

    if (errors.length > 0) {
        throw new AppError(errorCodes.INVALID_PARAM, null, errors);
    }

    return {
        strategy,
        count,
        fixedNumbers,
        excludeNumbers
    };
}

module.exports = {
    recommendValidatorRequest
};