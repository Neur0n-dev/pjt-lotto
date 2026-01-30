/**
 * Lotto API Client
 *
 * 동행복권 메인 API에서 당첨 정보 조회
 * https://www.dhlottery.co.kr/selectMainInfo.do
 *
 */

const { AppError, errorCodes } = require('../common/errors');

/**
 * 특정 회차 당첨 정보 조회
 * @param {number} drwNo - 요청 회차 번호
 * @returns {Promise<object>} 당첨 정보
 */
async function fetchDraw(drwNo) {
    const url = 'https://www.dhlottery.co.kr/selectMainInfo.do';

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new AppError(errorCodes.DRAW_API_CALL_FAILED, `HTTP ${response.status}`);
    }

    const data = await response.json();

    // 로또645 데이터 추출
    const lt645List = data?.data?.result?.pstLtEpstInfo?.lt645;

    if (!lt645List || lt645List.length === 0) {
        throw new AppError(errorCodes.DRAW_API_NOT_FOUND);
    }

    // 요청한 회차 찾기
    const drawData = lt645List.find(item => item.ltEpsd === drwNo);

    if (!drawData) {
        const latestDrwNo = Math.max(...lt645List.map(item => item.ltEpsd));
        throw new AppError(errorCodes.DRAW_NOT_FOUND, `${drwNo}회 (최신: ${latestDrwNo}회)`);
    }

    // 날짜 형식 변환 (YYYYMMDD → YYYY-MM-DD)
    const rawDate = drawData.ltRflYmd;
    const drwDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;

    return {
        drwNo: drawData.ltEpsd,
        drwDate,
        numbers: [
            drawData.tm1WnNo,
            drawData.tm2WnNo,
            drawData.tm3WnNo,
            drawData.tm4WnNo,
            drawData.tm5WnNo,
            drawData.tm6WnNo
        ],
        bonusNo: drawData.bnsWnNo
    };
}

module.exports = {
    fetchDraw
};
