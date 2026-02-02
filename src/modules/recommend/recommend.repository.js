/**
 * Recommend Repository
 *
 * 추천 관련 데이터의 영속성 처리 전담
 * DB 조회/저장 등 데이터 접근 로직만 담당
 * 비즈니스 로직이나 HTTP 처리 로직은 포함하지 않음
 *
 */

const db = require('../../config/db');
const { AppError, errorCodes } = require('../../common/errors');

/**
 * 추천 실행 기록 저장
 * @param {string} recommendId - 추천 실행 ID (UUID)
 * @param {number} targetDrwNo - 목표 회차
 * @param {string} algorithm - 추천 알고리즘명 (random, evenOdd, sumRange)
 * @param {object|null} paramsJson - 추천 파라미터 (JSON)
 * @returns {Promise<object>} insert 결과
 */
async function insertRecommendRun(recommendId, targetDrwNo, algorithm, paramsJson) {
    const sql = `
        INSERT INTO t_lotto_recommend_run (recommend_id, target_drw_no, algorithm, params_json)
        VALUES (?, ?, ?, ?)
    `;
    const params = [
        recommendId,
        targetDrwNo,
        algorithm,
        paramsJson ? JSON.stringify(paramsJson) : null,
    ];

    return db.query(sql, params);
}

/**
 * 추천 번호 meta data  insert
 * @param {string} recommendId - 추천 실행 ID (UUID)
 * @param {Array<Array<number>>} tickets - 추천 번호 배열 [[1,2,3,4,5,6], [7,8,9,10,11,12], ...]
 * @returns {Promise<object>} insert 결과
 */
async function insertRecommendNumbers(recommendId, tickets) {
    if (!tickets || tickets.length === 0) {
        return {affectedRows: 0};
    }

    // 배열안에 데이터가 몇개 있는지 확인
    for (const t of tickets) {
        if (!Array.isArray(t) || t.length !== 6) {
            throw new AppError(errorCodes.INVALID_TICKET_FORMAT);
        }
    }

    // 각 티켓(set)별로 6개의 번호를 pos 1~6으로 저장
    const values = [];
    const placeholders = [];

    tickets.forEach((ticket, setIndex) => {
        const setNo = setIndex + 1; // set_no는 1부터 시작
        ticket.forEach((number, posIndex) => {
            const pos = posIndex + 1; // pos는 1부터 시작
            values.push(recommendId, setNo, pos, number);
            placeholders.push('(?, ?, ?, ?)');
        });
    });

    const sql = `
        INSERT INTO t_lotto_recommend_number (recommend_id, set_no, pos, number)
        VALUES ${placeholders.join(', ')}
    `;

    return db.query(sql, values);
}

/**
 * ID로 추천 실행 정보 조회
 * @param {string} recommendId - 추천 실행 ID (UUID)
 * @returns {Promise<object|null>} 추천 실행 정보 또는 null
 */
async function findRecommendById(recommendId) {
    const sql = `
        SELECT recommend_id, target_drw_no, algorithm, params_json, created_date
        FROM t_lotto_recommend_run
        WHERE recommend_id = ?
    `;
    const rows = await db.query(sql, [recommendId]);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * 추천 번호 조회
 * @param {string} recommendId - 추천 실행 ID (UUID)
 * @returns {Promise<Array>} 추천 번호 목록 (set_no, pos, number)
 */
async function findRecommendNumbers(recommendId) {
    const sql = `
        SELECT set_no, pos, number
        FROM t_lotto_recommend_number
        WHERE recommend_id = ?
        ORDER BY set_no, pos
    `;
    return db.query(sql, [recommendId]);
}

/**
 * 추천 목록 조회 (필터링 지원)
 * @param {object} filters - 필터 조건
 * @param {number} [filters.targetDrwNo] - 목표 회차
 * @param {string} [filters.algorithm] - 알고리즘명
 * @returns {Promise<Array>} 추천 목록
 */
async function findRecommendListByFilters({targetDrwNo, algorithm} = {}) {
    const filters = [];
    const params = [];

    if (targetDrwNo) {
        filters.push('target_drw_no = ?');
        params.push(targetDrwNo);
    }

    if (algorithm) {
        filters.push('algorithm = ?');
        params.push(algorithm);
    }

    const whereClause = filters.length > 0
        ? `WHERE ${filters.join(' AND ')}`
        : '';

    const sql = `
        SELECT recommend_id, target_drw_no, algorithm, params_json, created_date
        FROM t_lotto_recommend_run
        ${whereClause}
        ORDER BY created_date DESC
    `;

    return db.query(sql, params);
}

/**
 * 추천 총 개수 조회 (필터링 지원)
 * @param {object} filters - 필터 조건
 * @returns {Promise<number>} 총 개수
 */
async function countRecommendListByFilters({targetDrwNo, algorithm} = {}) {
    const filters = [];
    const params = [];

    if (targetDrwNo) {
        filters.push('target_drw_no = ?');
        params.push(targetDrwNo);
    }

    if (algorithm) {
        filters.push('algorithm = ?');
        params.push(algorithm);
    }

    const whereClause = filters.length > 0
        ? `WHERE ${filters.join(' AND ')}`
        : '';

    const sql = `
        SELECT COUNT(*) as total
        FROM t_lotto_recommend_run ${whereClause}
    `;

    const rows = await db.query(sql, params);
    return rows[0].total;
}

module.exports = {
    insertRecommendRun,
    insertRecommendNumbers,
    findRecommendById,
    findRecommendNumbers,
    findRecommendListByFilters,
    countRecommendListByFilters,
};
