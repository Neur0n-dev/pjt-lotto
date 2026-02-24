/**
 * Consecutive Recommend Strategy
 *
 * 랜덤으로 기준 숫자 1개를 선택한 후, 해당 숫자를 포함한 연속된 번호 쌍을 조합하여
 * 로또 번호 6개를 생성하는 전략
 *
 * 규칙
 * - fixedNumbers는 반드시 포함
 * - excludeNumbers는 반드시 제거
 * - 연속된 번호 쌍(n, n+1)이 최소 1쌍 이상 포함
 * - 1~45 중 중복 없이 6개 생성
 * - 결과는 오름차순 정렬
 *
 * 외부 상태(DB, req/res)에 의존하지 않는 순수 함수
 * 추천 알고리즘 로직만 담당
 *
 */

const {
    uniqArray,
    getRandomInt, shuffleArray
} = require('../../../common/utils');
const {AppError, errorCodes} = require('../../../common/errors');

const LOTTO_MIN = 1;
const LOTTO_MAX = 45;
const LOTTO_SIZE = 6;

function consecutiveStrategy(fixedNumbers = [], excludeNumbers = []) {
    const fixedArr = uniqArray(fixedNumbers);
    const excludeArr = uniqArray(excludeNumbers);

    // 고정 번호에 이미 연속 쌍이 있는지 확인
    const hasConsecutiveInFixed = fixedArr.some(n => fixedArr.includes(n + 1));

    const numbers = [];

    for (let i = LOTTO_MIN; i <= LOTTO_MAX; i++) {
        if (fixedArr.includes(i) || excludeArr.includes(i)) continue;
        numbers.push(i);
    }

    const result = [...fixedArr];

    if (!hasConsecutiveInFixed) {
        // 후보 풀에서 유효한 연속 쌍 찾기
        const validPairs = [];
        for (const n of numbers) {
            if (n + 1 <= LOTTO_MAX && numbers.includes(n + 1)) {
                validPairs.push([n, n + 1]);
            }
        }

        if (validPairs.length === 0) {
            throw new AppError(errorCodes.RECOMMEND_GENERATION_FAILED);
        }

        // 연속 쌍 1개 랜덤 선택
        const pair = validPairs[getRandomInt(0, validPairs.length - 1)];
        result.push(pair[0], pair[1]);

        // 나머지 번호 랜덤 채우기 (연속 쌍 제외)
        const remaining = numbers.filter(n => n !== pair[0] && n !== pair[1]);
        const needCount = LOTTO_SIZE - result.length;

        if (remaining.length < needCount) {
            throw new AppError(errorCodes.RECOMMEND_GENERATION_FAILED);
        }

        result.push(...shuffleArray(remaining).slice(0, needCount));
    } else {
        // 고정 번호에 이미 연속 쌍 있으면 나머지만 랜덤
        const needCount = LOTTO_SIZE - result.length;

        if (numbers.length < needCount) {
            throw new AppError(errorCodes.RECOMMEND_GENERATION_FAILED);
        }

        result.push(...shuffleArray(numbers).slice(0, needCount));
    }

    return result.sort((a, b) => a - b);
}

module.exports = {
    consecutiveStrategy
}