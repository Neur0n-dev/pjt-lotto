/**
 * Purchase Repository
 *
 * 구매 관련 데이터의 영속성 처리 전담
 * DB 조회/저장 등 데이터 접근 로직만 담당
 * 비즈니스 로직이나 HTTP 처리 로직은 포함하지 않음
 *
 */

const db = require('../../config/db');

/**
 * 구매 실행 기록 저장
 * @param {string} purchaseId - 구매 실행 ID (UUID)
 * @param {number} targetDrwNo - 목표 회차
 * @param {timestamp} purchaseAt - 구매 시간
 * @param {string} sourceType - 구매 방법 (manual, auto, 반자동)
 * @returns {Promise<object>} insert 결과
 */
async function insertPurchase(purchaseId, targetDrwNo, purchaseAt, sourceType) {
    const sql = `
        INSERT INTO t_lotto_purchase (purchase_id, target_drw_no, purchase_at, source_type)
        VALUES (?, ?, ?, ?)
    `;

    return db.query(sql, [purchaseId, targetDrwNo, purchaseAt, sourceType]);
}

/**
 * 구매 번호 meta data  insert
 * @param {string} purchaseId - 구매 실행 ID (UUID)
 * @param {Array<number>} tickets - 구매 번호 배열 [1,2,3,4,5,6]
 * @returns {Promise<object>} insert 결과
 */
async function insertPurchaseNumbers(purchaseId, tickets) {
    if (!tickets || tickets.length === 0) {
        return {affectedRows: 0};
    }

    // 각 티켓(set)별로 6개의 번호를 pos 1~6으로 저장
    const values = [];
    const placeholders = [];

    tickets.forEach((number, posIndex) => {
        const pos = posIndex + 1; // pos는 1부터 시작
        values.push(purchaseId, pos, number);
        placeholders.push('(?, ?, ?)');
    });

    const sql = `
        INSERT INTO t_lotto_purchase_number (purchase_id, pos, number)
        VALUES ${placeholders.join(', ')}
    `;

    return db.query(sql, values);
}

/**
 * ID로 구매 실행 정보 조회
 * @param {string} purchaseId - 구매 실행 ID (UUID)
 * @returns {Promise<object|null>} 구매 실행 정보 또는 null
 */
async function findPurchaseById(purchaseId) {
    const sql = `
        SELECT purchase_id, target_drw_no, purchase_at, source_type, created_date
        FROM t_lotto_purchase
        WHERE purchase_id = ?
    `;

    const rows = await db.query(sql, [purchaseId]);

    return rows.length > 0 ? rows[0] : null;
}

/**
 * 구매 번호 조회
 * @param {string} purchaseId - 구매 실행 ID (UUID)
 * @returns {Promise<Array>} 구매 번호 목록 (pos, number)
 */
async function findPurchaseNumbers(purchaseId) {
    const sql = `
        SELECT pos, number
        FROM t_lotto_purchase_number
        WHERE purchase_id = ?
        ORDER BY pos
    `;

    return db.query(sql, [purchaseId]);
}

/**
 * 구매 목록 조회 (필터링 지원)
 * @param {object} filters - 필터 조건
 * @param {number} [filters.targetDrwNo] - 목표 회차
 * @param {string} [filters.sourceType] - 구매 타입
 * @returns {Promise<Array>} 구매 목록
 */
async function findPurchasesListByFilters({targetDrwNo, sourceType, limit, offset} = {}) {
    const filters = [];
    const params = [];

    if (targetDrwNo) {
        filters.push('target_drw_no = ?');
        params.push(targetDrwNo);
    }

    if (sourceType) {
        filters.push('source_type = ?');
        params.push(sourceType);
    }

    const whereClause = filters.length > 0
        ? `WHERE ${filters.join(' AND ')}`
        : '';

    const sql = `
        SELECT purchase_id, target_drw_no, purchase_at, source_type, created_date
        FROM t_lotto_purchase
            ${whereClause}
        ORDER BY created_date DESC
            LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    return db.query(sql, params);
}

/**
 * 구매 총 개수 조회 (필터링 지원)
 * @param {object} filters - 필터 조건
 * @returns {Promise<number>} 총 개수
 */
async function countPurchasesListByFilters({targetDrwNo, sourceType} = {}) {
    const filters = [];
    const params = [];

    if (targetDrwNo) {
        filters.push('target_drw_no = ?');
        params.push(targetDrwNo);
    }

    if (sourceType) {
        filters.push('source_type = ?');
        params.push(sourceType);
    }

    const whereClause = filters.length > 0
        ? `WHERE ${filters.join(' AND ')}`
        : '';

    const sql = `
        SELECT COUNT(*) as total
        FROM t_lotto_purchase ${whereClause}
    `;

    const rows = await db.query(sql, params);
    return Number(rows[0].total);
}

module.exports = {
    insertPurchase,
    insertPurchaseNumbers,
    findPurchaseById,
    findPurchaseNumbers,
    findPurchasesListByFilters,
    countPurchasesListByFilters,
};