/**
 * Frequency Recommend Strategy
 *
 * 최근 N회차 당첨번호의 출현 빈도를 기반으로
 * 자주 나온 번호에 가중치를 부여하여 로또 번호 6개를 생성하는 전략
 *
 * 규칙
 * - fixedNumbers는 반드시 포함
 * - excludeNumbers는 반드시 제거
 * - 최근 50회차 당첨번호에서 출현 빈도 집계
 * - 빈도 높은 번호 우선 선택 (가중 랜덤)
 * - 1~45 중 중복 없이 6개 생성
 * - 결과는 오름차순 정렬
 *
 * DB 조회가 필요한 비동기 전략
 *
 */

const db = require('../../../config/db');
const { uniqArray } = require('../../../common/utils');
const { AppError, errorCodes } = require('../../../common/errors');

const LOTTO_MIN = 1;
const LOTTO_MAX = 45;
const LOTTO_SIZE = 6;
const RECENT_ROUNDS = 50;

/**
 * 최근 N회차 번호별 출현 빈도 조회
 * @returns {Promise<Map<number, number>>} 번호 → 출현 횟수 Map
 */
async function getFrequencyMap(rounds = RECENT_ROUNDS) {
    let sql;
    let params;

    if (rounds > 0) {
        sql = `
            SELECT dn.number, COUNT(*) AS count
            FROM t_lotto_draw_number dn
            INNER JOIN (
                SELECT drw_no FROM t_lotto_draw
                ORDER BY drw_no DESC LIMIT ?
            ) d ON dn.drw_no = d.drw_no
            WHERE dn.pos BETWEEN 1 AND 6
            GROUP BY dn.number
            ORDER BY count DESC
        `;
        params = [rounds];
    } else {
        sql = `
            SELECT dn.number, COUNT(*) AS count
            FROM t_lotto_draw_number dn
            WHERE dn.pos BETWEEN 1 AND 6
            GROUP BY dn.number
            ORDER BY count DESC
        `;
        params = [];
    }

    const rows = await db.query(sql, params);

    const freqMap = new Map();
    for (const row of rows) {
        freqMap.set(row.number, row.count);
    }
    return freqMap;
}

/**
 * 빈도 가중 랜덤 선택
 * @param {Array<{number: number, weight: number}>} weighted - 가중치 배열
 * @param {number} count - 선택 개수
 * @returns {Array<number>} 선택된 번호
 */
function weightedPick(weighted, count) {
    const result = [];
    const pool = [...weighted];

    for (let i = 0; i < count; i++) {
        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let rand = Math.random() * totalWeight;

        for (let j = 0; j < pool.length; j++) {
            rand -= pool[j].weight;
            if (rand <= 0) {
                result.push(pool[j].number);
                pool.splice(j, 1);
                break;
            }
        }
    }

    return result;
}

async function frequencyStrategy(fixedNumbers = [], excludeNumbers = []) {
    const fixedArr = uniqArray(fixedNumbers);
    const excludeArr = uniqArray(excludeNumbers);

    const freqMap = await getFrequencyMap();

    // 후보 풀 생성 (고정/제외 번호 제거) + 가중치 부여
    const weighted = [];
    for (let i = LOTTO_MIN; i <= LOTTO_MAX; i++) {
        if (fixedArr.includes(i) || excludeArr.includes(i)) continue;
        weighted.push({
            number: i,
            weight: (freqMap.get(i) || 0) + 1  // 출현 0회인 번호도 최소 가중치 1
        });
    }

    const needCount = LOTTO_SIZE - fixedArr.length;

    if (weighted.length < needCount) {
        throw new AppError(errorCodes.RECOMMEND_GENERATION_FAILED);
    }

    const picked = weightedPick(weighted, needCount);

    return [...fixedArr, ...picked].sort((a, b) => a - b);
}

module.exports = {
    frequencyStrategy
};
