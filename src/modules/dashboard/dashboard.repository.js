/**
 * Dashboard Repository
 *
 * 대시보드 집계 데이터 조회 전담
 * DB 조회 등 데이터 접근 로직만 담당
 * 비즈니스 로직이나 HTTP 처리 로직은 포함하지 않음
 *
 */

const db = require('../../config/db');

/**
 * 전체 구매 건수
 * @returns {Promise<number>}
 */
async function countTotalPurchases() {
    const sql = `
        SELECT COUNT(*) AS total
        FROM t_lotto_purchase
    `;

    const rows = await db.query(sql);

    return rows[0].total;
}

/**
 * 전체 추천 건수
 * @returns {Promise<number>}
 */
async function countTotalRecommends() {
    const sql = `
        SELECT COUNT(*) AS total
        FROM t_lotto_recommend_run
    `;

    const rows = await db.query(sql);

    return rows[0].total;
}

/**
 * 전체 당첨 건수 (구매 + 추천, result_rank 1~5)
 * @returns {Promise<number>}
 */
async function countTotalWins() {
    const sql = `
        SELECT (SELECT COUNT(*) FROM t_lotto_purchase_result WHERE result_rank BETWEEN 1 AND 5) +
               (SELECT COUNT(*) FROM t_lotto_recommend_result WHERE result_rank BETWEEN 1 AND 5) AS total
    `;

    const rows = await db.query(sql);

    return rows[0].total;
}

/**
 * 전체 구매 평가 건수 (당첨률 계산용)
 * @returns {Promise<number>}
 */
async function countTotalPurchaseResults() {
    const sql = `
        SELECT COUNT(*) AS total
        FROM t_lotto_purchase_result
    `;

    const rows = await db.query(sql);

    return rows[0].total;
}

/**
 * 전체 추천 평가 건수 (당첨률 계산용)
 * @returns {Promise<number>}
 */
async function countTotalRecommendResults() {
    const sql = `
        SELECT COUNT(*) AS total
        FROM t_lotto_recommend_result
    `;

    const rows = await db.query(sql);

    return rows[0].total;
}

/**
 * 번호별 구매 빈도 TOP N
 * @param {number} limit - 조회 개수 (기본 10)
 * @returns {Promise<Array>} [{ number, count }, ...]
 */
async function findTopPurchasedNumbers(limit = 10) {
    const sql = `
        SELECT number, COUNT(*) AS count
        FROM t_lotto_purchase_number
        GROUP BY number
        ORDER BY count DESC
            LIMIT ?
    `;

    return db.query(sql, [limit]);
}

/**
 * 특정 회차 대상 구매 건수 (실시간 카운터용)
 * @param {number} drwNo - 대상 회차
 * @returns {Promise<number>}
 */
async function countPurchasesByTargetDrwNo(drwNo) {
    const sql = `
        SELECT COUNT(*) AS total
        FROM t_lotto_purchase
        WHERE target_drw_no = ?
    `;

    const rows = await db.query(sql, [drwNo]);

    return rows[0].total;
}

/**
 * 특정 회차 대상 추천 건수 (실시간 카운터용)
 * @param {number} drwNo - 대상 회차
 * @returns {Promise<number>}
 */
async function countRecommendsByTargetDrwNo(drwNo) {
    const sql = `
        SELECT COUNT(*) AS total
        FROM t_lotto_recommend_run
        WHERE target_drw_no = ?
    `;

    const rows = await db.query(sql, [drwNo]);

    return rows[0].total;
}

/**
 * 전체 누적 등수 분포 (구매 + 추천 합산)
 * CTE로 0~5등 빈 등수도 포함
 * @returns {Promise<Array>} [{ result_rank, count }, ...]
 */
async function countCumulativeRankDistribution() {
    const sql = `
        WITH rank_list AS (
            SELECT 1 AS result_rank
            UNION ALL SELECT 2
            UNION ALL SELECT 3
            UNION ALL SELECT 4
            UNION ALL SELECT 5
            UNION ALL SELECT 0
        )
        SELECT
            r.result_rank,
            IFNULL(p.cnt, 0) + IFNULL(rc.cnt, 0) AS count
        FROM rank_list r
        LEFT JOIN (
            SELECT result_rank, COUNT(*) AS cnt
            FROM t_lotto_purchase_result
            GROUP BY result_rank
        ) p ON r.result_rank = p.result_rank
        LEFT JOIN (
            SELECT result_rank, COUNT(*) AS cnt
            FROM t_lotto_recommend_result
            GROUP BY result_rank
        ) rc ON r.result_rank = rc.result_rank
        ORDER BY FIELD(r.result_rank, 1, 2, 3, 4, 5, 0)
    `;

    return db.query(sql);
}

/**
 * 전략(algorithm)별 추천 건수
 * @returns {Promise<Array>} [{ algorithm, count }, ...]
 */
async function countRecommendsByAlgorithm() {
    const sql = `
        SELECT algorithm, COUNT(*) AS count
        FROM t_lotto_recommend_run
        GROUP BY algorithm
        ORDER BY count DESC
    `;

    return db.query(sql);
}

/**
 * 최근 N회차 구매 추이
 * @param {number} limit - 조회 회차 수 (기본 10)
 * @returns {Promise<Array>} [{ drw_no, count }, ...]
 */
async function findPurchaseTrendByRecentDraws(limit = 10) {
    const sql = `
        SELECT d.drw_no, IFNULL(p.cnt, 0) AS count
        FROM (
            SELECT drw_no FROM t_lotto_draw d
            WHERE EXISTS (SELECT 1 FROM t_lotto_draw_number dn WHERE dn.drw_no = d.drw_no)
            ORDER BY drw_no DESC LIMIT ?
        ) d
        LEFT JOIN (
            SELECT target_drw_no, COUNT(*) AS cnt
            FROM t_lotto_purchase
            GROUP BY target_drw_no
        ) p ON d.drw_no = p.target_drw_no
        ORDER BY d.drw_no ASC
    `;

    return db.query(sql, [limit]);
}

/**
 * 최근 N회차 추천 추이
 * @param {number} limit - 조회 회차 수 (기본 10)
 * @returns {Promise<Array>} [{ drw_no, count }, ...]
 */
async function findRecommendTrendByRecentDraws(limit = 10) {
    const sql = `
        SELECT d.drw_no, IFNULL(r.cnt, 0) AS count
        FROM (
            SELECT drw_no FROM t_lotto_draw d
            WHERE EXISTS (SELECT 1 FROM t_lotto_draw_number dn WHERE dn.drw_no = d.drw_no)
            ORDER BY drw_no DESC LIMIT ?
        ) d
        LEFT JOIN (
            SELECT target_drw_no, COUNT(*) AS cnt
            FROM t_lotto_recommend_run
            GROUP BY target_drw_no
        ) r ON d.drw_no = r.target_drw_no
        ORDER BY d.drw_no ASC
    `;

    return db.query(sql, [limit]);
}

/**
 * 최근 N회차 당첨번호 (pos 1~7, 7=보너스)
 * @param {number} limit - 조회 회차 수 (기본 3)
 * @returns {Promise<Array>} [{ drw_no, drw_date, pos, number }, ...]
 */
async function findRecentDrawNumbers(limit = 3) {
    const sql = `
        SELECT d.drw_no, d.drw_date, dn.pos, dn.number
        FROM t_lotto_draw d
                 JOIN t_lotto_draw_number dn ON dn.drw_no = d.drw_no
        WHERE d.drw_no IN (
            SELECT d2.drw_no
            FROM t_lotto_draw d2
            WHERE EXISTS (SELECT 1 FROM t_lotto_draw_number dn2 WHERE dn2.drw_no = d2.drw_no)
            ORDER BY d2.drw_no DESC LIMIT ?
        )
        ORDER BY d.drw_no DESC, dn.pos ASC
    `;

    return db.query(sql, [limit]);
}

module.exports = {
    countTotalPurchases,
    countTotalRecommends,
    countTotalWins,
    countTotalPurchaseResults,
    countTotalRecommendResults,
    findTopPurchasedNumbers,
    countPurchasesByTargetDrwNo,
    countRecommendsByTargetDrwNo,
    countCumulativeRankDistribution,
    countRecommendsByAlgorithm,
    findPurchaseTrendByRecentDraws,
    findRecommendTrendByRecentDraws,
    findRecentDrawNumbers,
};
