/**
 * HotCold Recommend Strategy
 *
 * 최근 N회차 당첨번호를 핫(자주 출현) / 콜드(출현 적음)로 분류하고
 * 핫 4개 + 콜드 2개를 조합하여 로또 번호 6개를 생성하는 전략
 *
 * 규칙
 * - fixedNumbers는 반드시 포함
 * - excludeNumbers는 반드시 제거
 * - 최근 50회차 기준 출현 빈도로 핫/콜드 분류
 * - 핫(상위 15개)에서 4개, 콜드(하위 15개)에서 2개 선택
 * - 1~45 중 중복 없이 6개 생성
 * - 결과는 오름차순 정렬
 *
 * DB 조회가 필요한 비동기 전략
 *
 */

const db = require('../../../config/db');
const { uniqArray, shuffleArray } = require('../../../common/utils');
const { AppError, errorCodes } = require('../../../common/errors');

const LOTTO_MIN = 1;
const LOTTO_MAX = 45;
const LOTTO_SIZE = 6;
const RECENT_ROUNDS = 50;
const HOT_COUNT = 4;
const COLD_COUNT = 2;
const GROUP_SIZE = 15;

/**
 * 최근 N회차 번호별 출현 빈도 조회
 * @returns {Promise<Array<{number: number, cnt: number}>>} 빈도 내림차순 정렬
 */
async function getFrequencyList() {
    const sql = `
        SELECT dn.number, COUNT(*) AS cnt
        FROM t_lotto_draw_number dn
        INNER JOIN (
            SELECT drw_no FROM t_lotto_draw
            ORDER BY drw_no DESC LIMIT ?
        ) d ON dn.drw_no = d.drw_no
        WHERE dn.pos BETWEEN 1 AND 6
        GROUP BY dn.number
        ORDER BY cnt DESC
    `;
    return db.query(sql, [RECENT_ROUNDS]);
}

async function hotColdStrategy(fixedNumbers = [], excludeNumbers = []) {
    const fixedArr = uniqArray(fixedNumbers);
    const excludeArr = uniqArray(excludeNumbers);

    const freqList = await getFrequencyList();

    // 1~45 전체 번호에 빈도 매핑 (DB에 없는 번호는 0회)
    const allNumbers = [];
    for (let i = LOTTO_MIN; i <= LOTTO_MAX; i++) {
        const found = freqList.find(row => row.number === i);
        allNumbers.push({ number: i, cnt: found ? found.cnt : 0 });
    }

    // 빈도 내림차순 정렬 후 핫/콜드 분류
    allNumbers.sort((a, b) => b.cnt - a.cnt);
    const hotGroup = allNumbers.slice(0, GROUP_SIZE).map(item => item.number);
    const coldGroup = allNumbers.slice(-GROUP_SIZE).map(item => item.number);

    // 고정/제외 번호 제거
    const hotPool = hotGroup.filter(n => !fixedArr.includes(n) && !excludeArr.includes(n));
    const coldPool = coldGroup.filter(n => !fixedArr.includes(n) && !excludeArr.includes(n));

    // 고정 번호가 핫/콜드에 몇 개 속하는지 계산하여 필요 개수 조정
    const fixedInHot = fixedArr.filter(n => hotGroup.includes(n)).length;
    const fixedInCold = fixedArr.filter(n => coldGroup.includes(n)).length;
    const needHot = Math.max(0, HOT_COUNT - fixedInHot);
    const needCold = Math.max(0, COLD_COUNT - fixedInCold);

    if (hotPool.length < needHot || coldPool.length < needCold) {
        throw new AppError(errorCodes.RECOMMEND_GENERATION_FAILED);
    }

    const pickedHot = shuffleArray(hotPool).slice(0, needHot);
    const pickedCold = shuffleArray(coldPool).slice(0, needCold);

    const result = [...fixedArr, ...pickedHot, ...pickedCold];

    // 6개에 못 미치면 나머지는 전체 풀에서 랜덤
    if (result.length < LOTTO_SIZE) {
        const remaining = [];
        for (let i = LOTTO_MIN; i <= LOTTO_MAX; i++) {
            if (result.includes(i) || excludeArr.includes(i)) continue;
            remaining.push(i);
        }
        const needMore = LOTTO_SIZE - result.length;
        result.push(...shuffleArray(remaining).slice(0, needMore));
    }

    return result.sort((a, b) => a - b);
}

module.exports = {
    hotColdStrategy
};
