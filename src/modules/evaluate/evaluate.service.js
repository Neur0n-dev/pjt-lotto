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
const { getRank, formatDateTime} = require('../../common/utils');
const { AppError, errorCodes } = require('../../common/errors');

/**
 * 특정 회차의 추천 결과 일괄 평가
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, evaluatedCount }
 */
async function createEvaluateRecommendsByDrwNo(drwNo) {
    // 1. 당첨번호 존재 확인 + 미평가 추천 매칭 결과 조회 (병렬)
    const [drawNumbers, matches] = await Promise.all([
        drawRepository.findDrawNumbers(drwNo),
        repository.evaluateRecommendMatches(drwNo)
    ]);
    if (!drawNumbers || drawNumbers.length === 0) {
        throw new AppError(errorCodes.EVALUATE_RECOMMEND_NUMBERS_NOT_FOUND, `${drwNo}회차`);
    }

    // 2. 각 결과에 등수 판정 후 저장
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
async function createEvaluatePurchasesByDrwNo(drwNo) {
    // 1. 당첨번호 존재 확인 + 미평가 구매 매칭 결과 조회 (병렬)
    const [drawNumbers, matches] = await Promise.all([
        drawRepository.findDrawNumbers(drwNo),
        repository.evaluatePurchaseMatches(drwNo)
    ]);

    if (!drawNumbers || drawNumbers.length === 0) {
        throw new AppError(errorCodes.EVALUATE_PURCHASE_NUMBERS_NOT_FOUND, `${drwNo}회차`);
    }

    // 2. 각 결과에 등수 판정 후 저장
    for (const row of matches) {
        const resultRank = getRank(row.match_count, row.bonus_match);
        await repository.insertPurchaseResult(row.purchase_id, drwNo, row.match_count, row.bonus_match, resultRank);
    }

    return { drwNo, evaluatedCount: matches.length };
}

/**
 * 특정 회차의 추천 + 구매 결과 전체 평가 (몇 건 인지)
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, recommend, purchase }
 */
async function createEvaluateAllByDrwNo(drwNo) {
    const [recommend, purchase] = await Promise.all([
        createEvaluateRecommendsByDrwNo(drwNo),
        createEvaluatePurchasesByDrwNo(drwNo)
    ]);

    return {
        drwNo,
        recommend: { evaluatedCount: recommend.evaluatedCount },
        purchase: { evaluatedCount: purchase.evaluatedCount }
    };
}

/**
 * 특정 회차 추천 평가 결과 조회
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, recommend, purchase }
 */

async function getRecommendByDrwNo(drwNo) {
    const records = await repository.findRecommendResultsByDrwNo(drwNo);

    const items = records.map(record => ({
        recommendId: record.recommend_id,
        setNo: record.set_no,
        drwNo: record.drw_no,
        matchCount: record.match_count,
        bonusMatch: record.bonus_match,
        resultRank: record.result_rank,
        createdDate: formatDateTime(record.created_date)
    }));

    return {
        result: true,
        items,
    }
}

/**
 * 특정 회차 추천 평가 결과 카운트 조회
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, recommend, purchase }
 */

async function getRecommendResultRankStatisticsByDrwNo(drwNo) {
    const records = await repository.countRecommendRanksByDrwNo(drwNo);

    const items = records.map(record => ({
        drwNo: record.drw_no,
        resultRank: record.result_rank,
        count: record.count,
    }));

    return {
        result: true,
        items,
    }
}

/**
 * 특정 회차 구매 평가 결과 조회
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, recommend, purchase }
 */

async function getPurchaseByDrwNo(drwNo) {
    const records = await repository.findPurchaseResultsByDrwNo(drwNo);

    const items = records.map(record => ({
        purchaseId: record.purchase_id,
        drwNo: record.drw_no,
        matchCount: record.match_count,
        bonusMatch: record.bonus_match,
        resultRank: record.result_rank,
        createdDate: formatDateTime(record.created_date)
    }));

    return {
        result: true,
        items,
    }
}

/**
 * 특정 회차 구매 평가 결과 카운트 조회
 * @param {number} drwNo - 평가 대상 회차
 * @returns {Promise<object>} 평가 결과 { drwNo, recommend, purchase }
 */

async function getPurchaseResultRankStatisticsByDrwNo(drwNo) {
    const records = await repository.countPurchaseRanksByDrwNo(drwNo);

    const items = records.map(record => ({
        drwNo: record.drw_no,
        resultRank: record.result_rank,
        count: record.count,
    }));

    return {
        result: true,
        items,
    }
}

module.exports = {
    createEvaluateRecommendsByDrwNo,
    createEvaluatePurchasesByDrwNo,
    createEvaluateAllByDrwNo,
    getRecommendByDrwNo,
    getRecommendResultRankStatisticsByDrwNo,
    getPurchaseByDrwNo,
    getPurchaseResultRankStatisticsByDrwNo
};
