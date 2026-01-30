/**
 * SumRange Recommend Strategy
 *
 * 로또 번호 6개의 합이 특정 범위 안에 들어오도록
 * 랜덤 추천 결과를 필터링하는 전략
 *
 * 규칙
 * - fixedNumbers는 반드시 포함
 * - excludeNumbers는 반드시 제거
 * - 1~45 중 중복 없이 6개 생성
 * - 결과는 오름차순 정렬
 * - 6개 합계가 MIN_SUM ~ MAX_SUM 범위 내
 *
 * 외부 상태(DB, req/res)에 의존하지 않는 순수 함수
 * 추천 알고리즘 로직만 담당
 *
 */

const {
    randomStrategy
} = require('./random.strategy');
const { AppError, errorCodes } = require('../../../common/errors');

const MIN_SUM = 100;
const MAX_SUM = 200;
const MAX_TRY_COUNT = 500;

function sumRangeStrategy(fixedNumbers = [], excludeNumbers = []) {

    for (let i = 0; i < MAX_TRY_COUNT; i++) {
        const sumRangePicked = randomStrategy(fixedNumbers, excludeNumbers);
        const sum = sumRangePicked.reduce((acc, n) => acc + n, 0);

        if(sum >= MIN_SUM && sum <= MAX_SUM) {
            return sumRangePicked;
        }
    }

    throw new AppError(errorCodes.RECOMMEND_GENERATION_FAILED, `시도횟수 ${MAX_TRY_COUNT}번 초과`);
}

module.exports = {
    sumRangeStrategy
};