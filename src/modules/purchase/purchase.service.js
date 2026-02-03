/**
 * Purchase Service
 *
 * 핵심 비즈니스 로직 담당
 * 구매 생성 및 조회 흐름 제어
 * validator에서 검증된 데이터를 기반으로 동작
 * 필요 시 repository를 통해 데이터 저장/조회
 *
 */

const crypto = require('crypto');
const repository = require('./purchase.repository');
const drawService = require('../draw/draw.service');
const { formatDateTime } = require('../../common/utils');

/**
 * 구매 번호 생성 및 저장
 * @param {object} params - 검증된 요청 파라미터
 * @param {number} [params.targetDrwNo] - 목표 회차 (미지정 시 최신 회차)
 * @param {string} [params.purchaseAt] - 구매 시각 (미지정 시 현재 시각)
 * @param {string} params.sourceType - 구매 출처 (MANUAL/AUTO/RECOMMEND)
 * @param {Array<Array<number>>} params.tickets - 구매 번호 배열 [[1,2,3,4,5,6], ...]
 * @returns {Promise<object>} 구매 결과
 */
async function createPurchase({ targetDrwNo, purchaseAt, sourceType, tickets }) {
    const drwNo = targetDrwNo || await drawService.getTargetDrwNo();
    const purchaseTime = purchaseAt || new Date();

    const purchaseIds = [];

    for (const ticket of tickets) {
        const purchaseId = crypto.randomUUID();
        await repository.insertPurchase(purchaseId, drwNo, purchaseTime, sourceType);
        await repository.insertPurchaseNumbers(purchaseId, ticket);
        purchaseIds.push(purchaseId);
    }

    return {
        result: true,
        targetDrwNo: drwNo,
        sourceType,
        purchaseAt: formatDateTime(purchaseTime),
        count: purchaseIds.length,
        purchaseIds
    };
}

/**
 * 구매 이력 조회
 * @param {string} purchaseId - 구매 ID (UUID)
 * @returns {Promise<object|null>} 구매 정보 또는 null
 */
async function getPurchaseById(purchaseId) {
    const purchaseRecord = await repository.findPurchaseById(purchaseId);

    if (!purchaseRecord) {
        return null;
    }

    const numberRecords = await repository.findPurchaseNumbers(purchaseId);
    const numbers = numberRecords.map(row => row.number);

    return {
        result: true,
        purchaseId: purchaseRecord.purchase_id,
        targetDrwNo: purchaseRecord.target_drw_no,
        purchaseAt: formatDateTime(purchaseRecord.purchase_at),
        sourceType: purchaseRecord.source_type,
        createdDate: formatDateTime(purchaseRecord.created_date),
        numbers
    };
}

/**
 * 구매 목록 조회
 * @param {object} filters - 필터 조건
 * @param {number} [filters.targetDrwNo] - 목표 회차
 * @param {string} [filters.sourceType] - 구매 출처
 * @returns {Promise<object>} 구매 목록 및 페이지 정보
 */
async function getPurchaseListByFilters({ targetDrwNo, sourceType, page = 1, pageSize = 30 } = {}) {
    page = Math.max(1, page);
    pageSize = Math.min(Math.max(1, pageSize), 100);
    const offset = (page - 1) * pageSize;

    const [records, total] = await Promise.all([
        repository.findPurchasesListByFilters({ targetDrwNo, sourceType, limit: pageSize, offset }),
        repository.countPurchasesListByFilters({ targetDrwNo, sourceType })
    ]);

    const items = records.map(record => ({
        purchaseId: record.purchase_id,
        targetDrwNo: record.target_drw_no,
        purchaseAt: formatDateTime(record.purchase_at),
        sourceType: record.source_type,
        createdDate: formatDateTime(record.created_date)
    }));

    return {
        result: true,
        items,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}

module.exports = {
    createPurchase,
    getPurchaseById,
    getPurchaseListByFilters
};
