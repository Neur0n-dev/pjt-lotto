/**
 * Draw Service
 *
 * 핵심 비즈니스 로직을 담당하는 서비스 계층
 * 로또 회차(동행복권) 당첨 정보를 조회 및 가공
 * validator에서 검증된 데이터를 기반으로 동작
 * 필요 시 repository를 통해 데이터 저장 및 조회
 *
 */

const repository = require('./draw.repository');
const lottoApiClient = require('../../external/lotto-api.client');
const { formatDateTime } = require('../../common/utils');
const { AppError, errorCodes } = require('../../common/errors');

/**
 * 동행복권 API에서 회차 정보 동기화
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<object>} 동기화 결과
 */
async function syncDrawFromAPI(drwNo) {
    // 1. 외부 API 호출
    const apiData = await lottoApiClient.fetchDraw(drwNo);

    // 2. 회차 정보 저장
    await repository.insertDraw(apiData.drwNo, apiData.drwDate);

    // 3. 당첨번호 저장
    await repository.insertDrawNumbers(apiData.drwNo, apiData.numbers, apiData.bonusNo);

    return {
        result: true,
        message: `${drwNo}회차 동기화 완료`,
        data: {
            drwNo: apiData.drwNo,
            drwDate: apiData.drwDate,
            numbers: apiData.numbers,
            bonusNo: apiData.bonusNo
        }
    };
}

/**
 * 추천용 목표 회차 번호 조회
 * - 최신 회차를 목표 회차로 반환
 * - 데이터 없으면 에러 발생
 * @returns {Promise<number>} 목표 회차 번호
 */
async function getTargetDrwNo() {
    const latestDraw = await repository.findLatestDraw();

    if (!latestDraw) {
        throw new AppError(errorCodes.DRAW_NO_DATA);
    }

    return latestDraw.drw_no;
}

/**
 * 최신 회차 정보 조회
 * @returns {Promise<object|null>} 회차 정보
 */
async function getLatestDraw() {
    const draw = await repository.findLatestDraw();

    if (!draw) {
        return null;
    }

    return {
        result: true,
        drwNo: draw.drw_no,
        drwDate: formatDateTime(draw.drw_date),
        createdDate: formatDateTime(draw.created_date)
    };
}

/**
 * 특정 회차 정보 조회
 * @param {number} drwNo - 회차 번호
 * @returns {Promise<object|null>} 회차 정보
 */
async function getDrawByNo(drwNo) {
    const draw = await repository.findDrawByNo(drwNo);

    if (!draw) {
        return null;
    }

    return {
        result: true,
        drwNo: draw.drw_no,
        drwDate: formatDateTime(draw.drw_date),
        createdDate: formatDateTime(draw.created_date)
    };
}

module.exports = {
    syncDrawFromAPI,
    getTargetDrwNo,
    getLatestDraw,
    getDrawByNo,
};
