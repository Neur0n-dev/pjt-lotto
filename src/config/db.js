/**
 * Database Configuration
 *
 * 데이터베이스 연결 설정 및 초기화 담당
 * DB 클라이언트 또는 커넥션 풀 생성
 * repository 계층에서 사용하는 DB 인스턴스 제공
 *
 */

const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * 쿼리 실행 유틸리티
 * @param {string} sql - SQL 쿼리
 * @param {Array} params - 바인딩 파라미터
 * @returns {Promise<Array>} 쿼리 결과
 */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * 커넥션 획득 (트랜잭션 등에 사용)
 * @returns {Promise<PoolConnection>}
 */
async function getConnection() {
  return pool.getConnection();
}

/**
 * DB 연결 테스트
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    await pool.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('DB 연결 실패:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
};