/**
 * Evaluate Repository
 *
 * 추천/구매 결과 당첨 평가 데이터 영속성 전담
 * DB 조회/저장 등 데이터 접근 로직만 담당
 * 비즈니스 로직이나 HTTP 처리 로직은 포함하지 않음
 *
 */

const db = require('../../config/db');

/**
 * 미평가 추천 매칭 결과 일괄 조회
 * - target_drw_no = drwNo인 추천 중 result에 없는 건만 대상
 * - SQL JOIN으로 match_count, bonus_match를 set_no별 계산
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<Array>} [{ recommend_id, set_no, match_count, bonus_match }, ...]
 */
async function evaluateRecommendMatches(drwNo) {
    const sql = `
        SELECT
            rn.recommend_id,
            rn.set_no,
            COALESCE(SUM(CASE WHEN dn.pos BETWEEN 1 AND 6 THEN 1 ELSE 0 END), 0) AS match_count,
            COALESCE(MAX(CASE WHEN dn.pos = 7 THEN 1 ELSE 0 END), 0) AS bonus_match
        FROM t_lotto_recommend_run rr
        JOIN t_lotto_recommend_number rn ON rn.recommend_id = rr.recommend_id
        LEFT JOIN t_lotto_draw_number dn
            ON dn.drw_no = ?
            AND dn.number = rn.number
        WHERE rr.target_drw_no = ?
            AND NOT EXISTS (
                SELECT 1 FROM t_lotto_recommend_result res
                WHERE res.recommend_id = rr.recommend_id
            )
        GROUP BY rn.recommend_id, rn.set_no
        ORDER BY rn.recommend_id, rn.set_no
    `;

    return db.query(sql, [drwNo, drwNo]);
}

/**
 * 추천 평가 결과 저장
 * @param {string} recommendId - 추천 실행 ID (UUID)
 * @param {number} setNo - 추천 번호 세트 순번
 * @param {number} drwNo - 평가 대상 회차
 * @param {number} matchCount - 기본번호 일치 개수 (0~6)
 * @param {number} bonusMatch - 보너스 일치 여부 (0/1)
 * @param {number} resultRank - 등수 (1~5, 낙첨 0)
 * @returns {Promise<object>} insert 결과
 */
async function insertRecommendResult(recommendId, setNo, drwNo, matchCount, bonusMatch, resultRank) {
    const sql = `
        INSERT INTO t_lotto_recommend_result (recommend_id, set_no, drw_no, match_count, bonus_match, result_rank)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    return db.query(sql, [recommendId, setNo, drwNo, matchCount, bonusMatch, resultRank]);
}

/**
 * 미평가 구매 매칭 결과 일괄 조회
 * - target_drw_no = drwNo인 구매 중 result에 없는 건만 대상
 * - SQL JOIN으로 match_count, bonus_match를 purchase_id별 계산
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<Array>} [{ purchase_id, match_count, bonus_match }, ...]
 */
async function evaluatePurchaseMatches(drwNo) {
    const sql = `
        SELECT
            pn.purchase_id,
            COALESCE(SUM(CASE WHEN dn.pos BETWEEN 1 AND 6 THEN 1 ELSE 0 END), 0) AS match_count,
            COALESCE(MAX(CASE WHEN dn.pos = 7 THEN 1 ELSE 0 END), 0) AS bonus_match
        FROM t_lotto_purchase p
        JOIN t_lotto_purchase_number pn ON pn.purchase_id = p.purchase_id
        LEFT JOIN t_lotto_draw_number dn
            ON dn.drw_no = ?
            AND dn.number = pn.number
        WHERE p.target_drw_no = ?
            AND NOT EXISTS (
                SELECT 1 FROM t_lotto_purchase_result res
                WHERE res.purchase_id = p.purchase_id
            )
        GROUP BY pn.purchase_id
    `;

    return db.query(sql, [drwNo, drwNo]);
}

/**
 * 구매 평가 결과 저장
 * @param {string} purchaseId - 구매 ID (UUID)
 * @param {number} drwNo - 평가 대상 회차
 * @param {number} matchCount - 기본번호 일치 개수 (0~6)
 * @param {number} bonusMatch - 보너스 일치 여부 (0/1)
 * @param {number} resultRank - 등수 (1~5, 낙첨 0)
 * @returns {Promise<object>} insert 결과
 */
async function insertPurchaseResult(purchaseId, drwNo, matchCount, bonusMatch, resultRank) {
    const sql = `
        INSERT INTO t_lotto_purchase_result (purchase_id, drw_no, match_count, bonus_match, result_rank)
        VALUES (?, ?, ?, ?, ?)
    `;

    return db.query(sql, [purchaseId, drwNo, matchCount, bonusMatch, resultRank]);
}

/**
 * 특정 회차 추천 평가 결과 상세 조회
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<Array>} [{ recommend_id, set_no, match_count, bonus_match, result_rank }, ...]
 */
async function findRecommendResultsByDrwNo(drwNo) {
    const sql = `
        SELECT recommend_id, set_no, drw_no, match_count, bonus_match, result_rank, created_date
        FROM t_lotto_recommend_result
        WHERE drw_no = ?
        ORDER BY created_date
    `;

    return db.query(sql, [drwNo]);
}

/**
 * 특정 회차 추천 평가 등수별 집계
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<Array>} [{ drw_no, result_rank, count }, ...]
 */
async function countRecommendRanksByDrwNo(drwNo) {
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
            ? AS drw_no,
            r.result_rank,
            IFNULL(c.cnt, 0) AS count
        FROM rank_list r
            LEFT JOIN (
            SELECT result_rank, COUNT(*) AS cnt
            FROM t_lotto_recommend_result
            WHERE drw_no = ?
            GROUP BY result_rank
            ) c
        ON r.result_rank = c.result_rank
        ORDER BY FIELD(r.result_rank, 1, 2, 3, 4, 5, 0);
    `;

    return db.query(sql, [drwNo, drwNo]);
}

/**
 * 특정 회차 구매 평가 결과 상세 조회
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<Array>} [{ purchase_id, match_count, bonus_match, result_rank }, ...]
 */
async function findPurchaseResultsByDrwNo(drwNo) {
    const sql = `
        SELECT purchase_id, drw_no, match_count, bonus_match, result_rank, created_date
        FROM t_lotto_purchase_result
        WHERE drw_no = ?
        ORDER BY created_date
    `;

    return db.query(sql, [drwNo]);
}

/**
 * 특정 회차 구매 평가 등수별 집계
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<Array>} [{ drw_no, result_rank, count }, ...]
 */
async function countPurchaseRanksByDrwNo(drwNo) {
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
            ? AS drw_no,
            r.result_rank,
            IFNULL(c.cnt, 0) AS count
        FROM rank_list r
            LEFT JOIN (
            SELECT result_rank, COUNT(*) AS cnt
            FROM t_lotto_purchase_result
            WHERE drw_no = ?
            GROUP BY result_rank
            ) c
        ON r.result_rank = c.result_rank
        ORDER BY FIELD(r.result_rank, 1, 2, 3, 4, 5, 0);
    `;

    return db.query(sql, [drwNo, drwNo]);
}

module.exports = {
    evaluateRecommendMatches,
    insertRecommendResult,
    evaluatePurchaseMatches,
    insertPurchaseResult,
    findRecommendResultsByDrwNo,
    countRecommendRanksByDrwNo,
    findPurchaseResultsByDrwNo,
    countPurchaseRanksByDrwNo,
};
