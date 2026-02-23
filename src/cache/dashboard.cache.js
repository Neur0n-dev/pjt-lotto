/**
 * Dashboard Cache
 *
 * node-cache 싱글톤 인스턴스 (TTL 없음 - 영구 캐시)
 * 이전 회차는 데이터 변경 없으므로 서버 재기동 전까지 유지
 * 키: row1:{drwNo}, row2:{drwNo}, row3:{drwNo}
 */

const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 0 });

function cacheKey(row, drwNo) {
    return `${row}:${drwNo}`;
}

function get(row, drwNo) {
    return cache.get(cacheKey(row, drwNo));
}

function set(row, drwNo, value) {
    cache.set(cacheKey(row, drwNo), value);
}

module.exports = { get, set };
