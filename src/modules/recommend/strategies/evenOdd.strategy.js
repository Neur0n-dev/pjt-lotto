/**
 * EvenOdd Recommend Strategy
 *
 * 홀수/짝수 비율을 3:3으로 맞춰 => 추후 비율을 정할 수 있도록?
 * 균형 잡힌 로또 번호를 생성하는 전략
 *
 * 규칙
 * - fixedNumbers는 반드시 포함
 * - excludeNumbers는 반드시 제거
 * - 전체 6개 중 홀수 3개 / 짝수 3개 구성
 * - fixedNumbers가 홀/짝 조건을 초과할 경우 에러 반환
 * - 1~45 중 중복 없이 6개 생성
 * - 결과는 오름차순 정렬
 *
 * 외부 상태(DB, req/res)에 의존하지 않는 순수 함수
 * 추천 알고리즘 로직만 담당
 *
 */

const {
    uniqArray,
    getRandomInt
} = require('../../../common/utils');
const { AppError, errorCodes } = require('../../../common/errors');

const TARGET_ODD = 3;
const TARGET_EVEN = 3;

function evenOddStrategy(fixedNumbers = [], excludeNumbers = []) {
    const fixedArr = uniqArray(fixedNumbers);
    const excludeArr = new Set(excludeNumbers);
    const evenOddPicked = new Set(fixedArr);

    const countEvenOdd = () => {
        let odd = 0;
        let even = 0;
        for (const n of evenOddPicked) {
            if (n % 2 === 0) {
                even++;
            } else {
                odd++;
            }
        }
        return { odd, even };
    };

    // fixedArr안에 값이 홀/짝이 3개 이상 있으면 문제됨.
    const initial = countEvenOdd();
    if (initial.odd > TARGET_ODD || initial.even > TARGET_EVEN) {
        throw new AppError(errorCodes.RECOMMEND_GENERATION_FAILED, 'fixedNumbers의 홀/짝 각 갯수를 확인하세요.');
    }

    // 후보 풀 생성
    const oddPool = [];
    const evenPool = [];

    for (let n = 1; n <= 45; n++) {
        if (excludeArr.has(n)) continue;
        if (evenOddPicked.has(n)) continue;

        if (n % 2 === 0) {
            evenPool.push(n);
        } else {
            oddPool.push(n);
        }
    }

    // 데이터를 하나씩 넣는다.
    while (evenOddPicked.size < 6) {
        const {odd, even} = countEvenOdd();

        let candidates;
        if (odd < TARGET_ODD) {
            candidates = oddPool;
        } else if (even < TARGET_EVEN) {
            candidates = evenPool;
        } else {
            break;
        }

        const idx = getRandomInt(0, candidates.length - 1);
        const [picked] = candidates.splice(idx, 1);
        evenOddPicked.add(picked);
    }

    return Array.from(evenOddPicked).sort((a, b) => a - b);
}

module.exports = {
    evenOddStrategy
};
