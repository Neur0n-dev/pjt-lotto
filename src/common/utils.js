/**
 * Common Utilities
 *
 * 프로젝트 전반에서 공통으로 사용하는 유틸리티 함수 모음
 * 특정 도메인에 종속되지 않는 순수 함수
 * 문자열, 숫자, 배열, 날짜 등 범용 기능 제공
 *
 */

/**
 * 배열 관련
 */

/**
 * 배열의 중복 값을 제거한다.
 *
 * **@param** {Array<any>} **arr** 중복 제거할 배열
 * **@returns** {Array<any>} 중복이 제거된 배열
 *
 * **@example**
 * uniqArray([1,2,3,3,5,6])
 * // → [1,2,3,5,6]
 */
function uniqArray(arr) {
    return [...new Set(arr)];
}

/**
 * 배열을 랜덤하게 섞는다(셔플).
 *
 * **@param** {Array<any>} **arr** 섞을 배열
 * **@returns** {Array<any>} 섞인 새로운 배열
 *
 * **@example**
 * shuffleArray([1,2,3,4])
 * // → [3,1,4,2] (결과는 매번 다를 수 있음)
 */
function shuffleArray(arr) {
    return arr
        .map(v => ({ v, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ v }) => v);
}

/**
 * 배열을 지정한 크기만큼 분할한다.
 *
 * **@param** {Array<any>} **arr** 대상 배열
 * **@param** {number} **size** 분할 크기
 * **@returns** {Array<Array<any>>} 분할된 배열
 *
 * **@example**
 * chunkArray([1,2,3,4,5,6], 2)
 * // → [[1,2],[3,4],[5,6]]
 */
function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/**
 * 비교 / 계산
 */

/**
 * 두 배열에서 일치하는 원소의 개수를 반환한다.
 * (arr1의 각 원소가 arr2에 포함되어 있는지 기준)
 *
 * **@param** {Array<any>} **arr1** 비교 기준 배열
 * **@param** {Array<any>} **arr2** 포함 여부를 확인할 배열
 * **@returns** {number} 일치하는 원소 개수
 *
 * **@example**
 * getMatchCount([1,2,3], [2,3,4])
 * // → 2
 */
function getMatchCount(arr1, arr2) {
    return arr1.filter(n => arr2.includes(n)).length;
}

/**
 * 두 배열이 동일한지 비교한다(순서 무시).
 *
 * **@param** {Array<any>} **a** 비교할 배열 A
 * **@param** {Array<any>} **b** 비교할 배열 B
 * **@returns** {boolean} 동일하면 true, 아니면 false
 *
 * **@example**
 * isSameArray([1,2,3], [3,2,1])
 * // → true
 *
 * **@example**
 * isSameArray([1,2,3], [1,2,4])
 * // → false
 */
function isSameArray(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((v, i) => v === sortedB[i]);
}

/**
 * 숫자
 */

/**
 * min ~ max 범위의 정수 난수를 반환한다(양끝 포함).
 *
 * **@param** {number} **min** 최소값(포함)
 * **@param** {number} **max** 최대값(포함)
 * **@returns** {number} 난수 정수
 *
 * **@example**
 * getRandomInt(1, 45)
 * // → 17 (결과는 매번 다를 수 있음)
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * min ~ max 범위에서 중복 없이 count개 숫자를 랜덤으로 뽑는다.
 *
 * **@param** {number} **min** 최소값(포함)
 * **@param** {number} **max** 최대값(포함)
 * **@param** {number} **count** 뽑을 개수
 * **@returns** {Array<number>} 랜덤으로 뽑은 숫자 배열
 *
 * **@example**
 * pickRandomNumbers(1, 45, 6)
 * // → [3,12,19,27,35,44] (결과는 매번 다를 수 있음)
 */
function pickRandomNumbers(min, max, count) {
    const pool = [];
    for (let i = min; i <= max; i++) {
        pool.push(i);
    }
    return shuffleArray(pool).slice(0, count);
}

/**
 * 날짜
 */

/**
 * 현재 시각을 KST(UTC+9) 기준 Date 객체로 반환한다.
 * getUTCDay(), getUTCHours() 등으로 KST 요일/시간 추출 가능.
 *
 * **@returns** {Date} KST 기준 Date 객체
 *
 * **@example**
 * const kst = getKstDate();
 * kst.getUTCHours(); // KST 시간
 * kst.getUTCDay();   // KST 요일 (0=일, 6=토)
 */
function getKstDate() {
    return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

/**
 * 날짜를 YYYY-MM-DD 형태로 포맷팅한다.
 *
 * **@param** {Date|string|number} [date=new Date()] Date 객체 또는 date로 변환 가능한 값
 * **@returns** {string} YYYY-MM-DD 형식 문자열
 *
 * **@example**
 * formatDate(new Date('2026-01-18'))
 * // → "2026-01-18"
 */
function formatDate(date = new Date()) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * 날짜/시간을 YYYY-MM-DD HH:mm:ss 형태로 포맷팅한다.
 *
 * **@param** {Date|string|number} [date=new Date()] Date 객체 또는 date로 변환 가능한 값
 * **@returns** {string} YYYY-MM-DD HH:mm:ss 형식 문자열
 *
 * **@example**
 * formatDateTime(new Date('2026-01-18T12:34:56'))
 * // → "2026-01-18 12:34:56"
 */
function formatDateTime(date = new Date()) {
    const d = new Date(date);
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${formatDate(d)} ${hh}:${mi}:${ss}`;
}

/**
 * 타입/값 체크
 */

/**
 * 값이 비어있는지 판단한다.
 * - null/undefined → true
 * - 빈 문자열(공백만 포함) → true
 * - 빈 배열 → true
 * - 키가 없는 객체 → true
 *
 * **@param** {any} **value** 검사할 값
 * **@returns** {boolean} 비어있으면 true, 아니면 false
 *
 * **@example**
 * isEmpty("")
 * // → true
 *
 * **@example**
 * isEmpty({ a: 1 })
 * // → false
 */
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
}

/**
 * 값을 정수로 변환한다. 변환 실패 시 기본값을 반환한다.
 *
 * **@param** {any} **value** 변환할 값
 * **@param** {number} [defaultValue=0] 변환 실패 시 반환할 기본값
 * **@returns** {number} 변환된 정수 또는 기본값
 *
 * **@example**
 * toInt("12")
 * // → 12
 *
 * **@example**
 * toInt("abc", 99)
 * // → 99
 */
function toInt(value, defaultValue = 0) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? defaultValue : n;
}

/**
 * 문자열
 */

/**
 * 문자열(또는 숫자)을 왼쪽으로 패딩한다.
 *
 * **@param** {string|number} **str** 원본 값
 * **@param** {number} **length** 목표 길이
 * **@param** {string} [char='0'] 채울 문자
 * **@returns** {string} 패딩된 문자열
 *
 * **@example**
 * padLeft(7, 2)
 * // → "07"
 */
function padLeft(str, length, char = '0') {
    return String(str).padStart(length, char);
}

/**
 * 문자열이면 trim()을 수행하고, 문자열이 아니면 원본을 그대로 반환한다.
 *
 * **@param** {any} **str** 값
 * **@returns** {any} 문자열이면 trim된 문자열, 아니면 원본
 *
 * **@example**
 * safeTrim("  hello  ")
 * // → "hello"
 */
function safeTrim(str) {
    return typeof str === 'string' ? str.trim() : str;
}

/**
 * 오브젝트
 */

/**
 * 객체에서 지정한 키만 골라 새 객체로 반환한다.
 *
 * **@param** {Record<string, any>} **obj** 대상 객체
 * **@param** {Array<string>} [keys=[]] 선택할 키 목록
 * **@returns** {Record<string, any>} 선택된 키로 구성된 새 객체
 *
 * **@example**
 * pick({ a: 1, b: 2, c: 3 }, ["a", "c"])
 * // → { a: 1, c: 3 }
 */
function pick(obj, keys = []) {
    return keys.reduce((acc, key) => {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}

/**
 * 객체에서 지정한 키를 제외한 새 객체를 반환한다.
 *
 * **@param** {Record<string, any>} **obj** 대상 객체
 * **@param** {Array<string>} [keys=[]] 제외할 키 목록
 * **@returns** {Record<string, any>} 제외된 키를 뺀 새 객체
 *
 * **@example**
 * omit({ a: 1, b: 2, c: 3 }, ["b"])
 * // → { a: 1, c: 3 }
 */
function omit(obj, keys = []) {
    const clone = { ...obj };
    keys.forEach(k => delete clone[k]);
    return clone;
}

/**
 * 랭크관련
 */

/**
 * 기본번호 일치 개수와 보너스 일치 여부로 등수를 판정한다.
 * - 6개 일치 → 1등
 * - 5개 + 보너스 → 2등
 * - 5개 → 3등
 * - 4개 → 4등
 * - 3개 → 5등
 * - 그 외 → 0 (낙첨)
 *
 * **@param** {number} **matchCount** 기본번호 일치 개수 (0~6)
 * **@param** {boolean|number} **bonusMatch** 보너스 번호 일치 여부
 * **@returns** {number} 등수 (1~5), 낙첨은 0
 *
 * **@example**
 * getRank(6, false) // → 1
 * getRank(5, true)  // → 2
 * getRank(2, false) // → 0
 */
function getRank(matchCount, bonusMatch) {
    switch (matchCount) {
        case 6:
            return 1;
        case 5:
            return bonusMatch ? 2 : 3;
        case 4:
            return 4;
        case 3:
            return 5;
        default:
            return 0;
    }
}

module.exports = {
    uniqArray,
    shuffleArray,
    chunkArray,
    getMatchCount,
    isSameArray,
    getRandomInt,
    pickRandomNumbers,
    getKstDate,
    formatDate,
    formatDateTime,
    isEmpty,
    toInt,
    padLeft,
    safeTrim,
    pick,
    omit,
    getRank
};
