/**
 * Dashboard Repository
 *
 * 대시보드 집계 데이터 조회 전담
 * DB 조회 등 데이터 접근 로직만 담당
 * 비즈니스 로직이나 HTTP 처리 로직은 포함하지 않음
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
        SELECT COUNT(DISTINCT recommend_id, set_no) AS total
        FROM t_lotto_recommend_number
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
 * 특정 회차 번호별 구매 빈도 TOP N
 * @param {number} drwNo - 대상 회차
 * @param {number} limit - 조회 개수 (기본 7)
 * @returns {Promise<Array>} [{ number, count }, ...]
 */
async function findTopPurchasedNumbersByDrwNo(drwNo, limit = 7) {
    const sql = `
        SELECT pn.number, COUNT(*) AS count
        FROM (
            SELECT purchase_id
            FROM t_lotto_purchase
            WHERE target_drw_no = ?
            ) p
            JOIN t_lotto_purchase_number pn ON pn.purchase_id = p.purchase_id
        GROUP BY pn.number
        ORDER BY count DESC
            LIMIT ?
    `;

    return db.query(sql, [drwNo, limit]);
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
        SELECT COUNT(DISTINCT rn.recommend_id, rn.set_no) AS total
        FROM t_lotto_recommend_number rn
            INNER JOIN t_lotto_recommend_run rr ON rn.recommend_id = rr.recommend_id
        WHERE rr.target_drw_no = ?
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
 * 특정 회차 전략(algorithm)별 추천 건수
 * @param {number} drwNo - 대상 회차
 * @returns {Promise<Array>} [{ algorithm, count }, ...]
 */
async function countRecommendsByAlgorithmAndDrwNo(drwNo) {
    const sql = `
        SELECT rr.algorithm, COUNT(DISTINCT rn.recommend_id, rn.set_no) AS count
        FROM t_lotto_recommend_number rn
            INNER JOIN t_lotto_recommend_run rr ON rn.recommend_id = rr.recommend_id
        WHERE rr.target_drw_no = ?
        GROUP BY rr.algorithm
        ORDER BY count DESC
    `;

    return db.query(sql, [drwNo]);
}

/**
 * 특정 회차 구매 유형(source_type)별 건수
 * @param {number} drwNo - 대상 회차
 * @returns {Promise<Array>} [{ source_type, count }, ...]
 */
async function countPurchasesBySourceType(drwNo) {
    const sql = `
        SELECT source_type, COUNT(*) AS count
        FROM t_lotto_purchase
        WHERE target_drw_no = ?
        GROUP BY source_type
        ORDER BY count DESC
    `;

    return db.query(sql, [drwNo]);
}

/**
 * 최근 7회차 구매 추이 (기준 회차부터 역순 7개)
 * @param {number} drwNo - 기준 회차
 * @returns {Promise<Array>} [{ drw_no, count }, ...]
 */
async function findPurchaseTrendByRecentDraws(drwNo) {
    const sql = `
        SELECT (drw.base - n.offset) AS drw_no, IFNULL(p.cnt, 0) AS count
        FROM (SELECT ? AS base) drw
            CROSS JOIN (
            SELECT 0 AS offset UNION ALL SELECT 1 UNION ALL SELECT 2
            UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
            UNION ALL SELECT 6
            ) n
            LEFT JOIN (
            SELECT target_drw_no, COUNT(*) AS cnt
            FROM t_lotto_purchase
            GROUP BY target_drw_no
            ) p ON (drw.base - n.offset) = p.target_drw_no
        WHERE (drw.base - n.offset) > 0
        ORDER BY drw_no ASC
    `;

    return db.query(sql, [drwNo]);
}

/**
 * 최근 7회차 추천 추이 (기준 회차부터 역순 7개)
 * @param {number} drwNo - 기준 회차
 * @returns {Promise<Array>} [{ drw_no, count }, ...]
 */
async function findRecommendTrendByRecentDraws(drwNo) {
    const sql = `
        SELECT (drw.base - n.offset) AS drw_no, IFNULL(r.cnt, 0) AS count
        FROM (SELECT ? AS base) drw
            CROSS JOIN (
            SELECT 0 AS offset UNION ALL SELECT 1 UNION ALL SELECT 2
            UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
            UNION ALL SELECT 6
            ) n
            LEFT JOIN (
            SELECT rr.target_drw_no, COUNT(DISTINCT rn.recommend_id, rn.set_no) AS cnt
            FROM t_lotto_recommend_number rn
                INNER JOIN t_lotto_recommend_run rr ON rn.recommend_id = rr.recommend_id
            GROUP BY rr.target_drw_no
            ) r ON (drw.base - n.offset) = r.target_drw_no
        WHERE (drw.base - n.offset) > 0
        ORDER BY drw_no ASC
    `;

    return db.query(sql, [drwNo]);
}

module.exports = {
    countTotalPurchases,
    countTotalRecommends,
    countTotalWins,
    countTotalPurchaseResults,
    countTotalRecommendResults,
    findTopPurchasedNumbersByDrwNo,
    countPurchasesByTargetDrwNo,
    countRecommendsByTargetDrwNo,
    countCumulativeRankDistribution,
    countPurchasesBySourceType,
    findPurchaseTrendByRecentDraws,
    findRecommendTrendByRecentDraws,
    countRecommendsByAlgorithmAndDrwNo,
};
