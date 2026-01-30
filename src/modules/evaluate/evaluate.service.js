/**
 * Evaluate Service
 *
 * 추천/구매 결과 당첨 평가 비즈니스 로직 담당
 * 당첨번호와 추천/구매 번호를 비교하여 등수 판정
 * repository를 통해 매칭 조회 및 결과 저장
 *
 */

const repository = require('./evaluate.repository');
const drawRepository = require('../draw/draw.repository');
const { getRank } = require('../../common/utils');
const { AppError, errorCodes } = require('../../common/errors');

/**
 * 특정 회차의 추천 결과 일괄 평가
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, evaluatedCount }
 */
async function evaluateRecommendsByDrwNo(drwNo) {
    // 1. 당첨번호 존재 확인
    const drawNumbers = await drawRepository.findDrawNumbers(drwNo);
    if (!drawNumbers || drawNumbers.length === 0) {
        throw new AppError(errorCodes.EVALUATE_RECOMMEND_NUMBERS_NOT_FOUND, `${drwNo}회차`);
    }

    // 2. 미평가 추천 매칭 결과 일괄 조회
    const matches = await repository.evaluateRecommendMatches(drwNo);

    // 3. 각 결과에 등수 판정 후 저장
    for (const row of matches) {
        const resultRank = getRank(row.match_count, row.bonus_match);
        await repository.insertRecommendResult(row.recommend_id, row.set_no, drwNo, row.match_count, row.bonus_match, resultRank);
    }

    return { drwNo, evaluatedCount: matches.length };
}

/**
 * 특정 회차의 구매 결과 일괄 평가
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, evaluatedCount }
 */
async function evaluatePurchasesByDrwNo(drwNo) {
    // 1. 당첨번호 존재 확인
    const drawNumbers = await drawRepository.findDrawNumbers(drwNo);
    if (!drawNumbers || drawNumbers.length === 0) {
        throw new AppError(errorCodes.EVALUATE_PURCHASE_NUMBERS_NOT_FOUND, `${drwNo}회차`);
    }

    // 2. 미평가 구매 매칭 결과 일괄 조회
    const matches = await repository.evaluatePurchaseMatches(drwNo);

    // 3. 각 결과에 등수 판정 후 저장
    for (const row of matches) {
        const resultRank = getRank(row.match_count, row.bonus_match);
        await repository.insertPurchaseResult(row.purchase_id, drwNo, row.match_count, row.bonus_match, resultRank);
    }

    return { drwNo, evaluatedCount: matches.length };
}

/**
 * 특정 회차의 추천 + 구매 결과 전체 평가
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, recommend, purchase }
 */
async function evaluateAllByDrwNo(drwNo) {
    const recommend = await evaluateRecommendsByDrwNo(drwNo);
    const purchase = await evaluatePurchasesByDrwNo(drwNo);

    return {
        drwNo,
        recommend: { evaluatedCount: recommend.evaluatedCount },
        purchase: { evaluatedCount: purchase.evaluatedCount }
    };
}

module.exports = {
    evaluateRecommendsByDrwNo,
    evaluatePurchasesByDrwNo,
    evaluateAllByDrwNo,
};
