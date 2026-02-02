/**
 * Draw Repository
 *
 * 로또 회차(동행복권) 관련 데이터의 영속성 처리를 담당
 * DB 조회/저장 등 데이터 접근 로직만 포함
 * 비즈니스 로직이나 HTTP 처리 로직은 포함하지 않음
 *
 */

const db = require('../../config/db');

/**
 * 회차 저장
 * @param {number} drwNo - 회차 번호
 * @param {string} drwDate - 추첨일 (YYYY-MM-DD)
 * @returns {Promise<object>} insert 결과
 */
async function insertDraw(drwNo, drwDate) {
    const sql = `
        INSERT INTO t_lotto_draw (drw_no, drw_date)
        VALUES (?, ?) ON DUPLICATE KEY
        UPDATE drw_date =
        VALUES (drw_date)
    `;
    return db.query(sql, [drwNo, drwDate]);
}

/**
 * 당첨회차 번호 저장
 * @param {number} drwNo - 회차 번호
 * @param {Array<number>} numbers - 당첨번호 배열 (6개)
 * @param {number} bonusNo - 보너스 번호
 * @returns {Promise<object>} insert 결과
 */
async function insertDrawNumbers(drwNo, numbers, bonusNo) {
    // 기존 데이터 삭제 후 재삽입
    await db.query('DELETE FROM t_lotto_draw_number WHERE drw_no = ?', [drwNo]);

    const values = [];
    const placeholders = [];

    // 기본번호 1~6
    numbers.forEach((number, index) => {
        const pos = index + 1;
        values.push(drwNo, pos, number);
        placeholders.push('(?, ?, ?)');
    });

    // 보너스번호 pos=7
    values.push(drwNo, 7, bonusNo);
    placeholders.push('(?, ?, ?)');

    const sql = `
        INSERT INTO t_lotto_draw_number (drw_no, pos, number)
        VALUES ${placeholders.join(', ')}
    `;

    return db.query(sql, values);
}

/**
 * 최신 회차 조회 (가장 큰 drw_no)
 * @returns {Promise<object|null>} 최신 회차 정보
 */
async function findLatestDraw() {
    const sql = `
        SELECT drw_no, drw_date, created_date
        FROM t_lotto_draw
        ORDER BY drw_no
            DESC LIMIT 1
    `;
    const rows = await db.query(sql);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * 특정 회차 조회
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<object|null>} 회차 정보
 */
async function findDrawByNo(drwNo) {
    const sql = `
        SELECT drw_no, drw_date, created_date
        FROM t_lotto_draw
        WHERE drw_no = ?
    `;
    const rows = await db.query(sql, [drwNo]);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * 특정 회차 당첨번호 조회
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<Array>} 당첨번호 목록
 */
async function findDrawNumbers(drwNo) {
    const sql = `
        SELECT pos, number
        FROM t_lotto_draw_number
        WHERE drw_no = ?
        ORDER BY pos
    `;
    return db.query(sql, [drwNo]);
}

/**
 * 당첨번호가 등록된 최신 회차 조회
 * 선등록(FK용 껍데기)된 회차는 제외
 * @returns {Promise<object|null>} 최신 동기화 완료 회차 정보
 */
async function findLatestSyncedDraw() {
    const sql = `
        SELECT d.drw_no, d.drw_date, d.created_date
        FROM t_lotto_draw d
        WHERE EXISTS (
            SELECT 1 FROM t_lotto_draw_number dn WHERE dn.drw_no = d.drw_no
        )
        ORDER BY d.drw_no DESC
        LIMIT 1
    `;
    const rows = await db.query(sql);
    return rows.length > 0 ? rows[0] : null;
}

module.exports = {
    insertDraw,
    insertDrawNumbers,
    findLatestDraw,
    findLatestSyncedDraw,
    findDrawByNo,
    findDrawNumbers,
};
