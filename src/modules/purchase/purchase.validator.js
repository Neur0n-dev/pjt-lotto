/**
 * Purchase Validator
 *
 * 구매 API 요청 데이터 유효성 검증 담당
 * 요청 파라미터의 타입, 범위, 필수 여부 확인
 * 검증 실패 시 에러 발생
 *
 */

const {
    uniqArray,
    isEmpty,
    toInt
} = require('../../common/utils');

const { AppError, errorCodes } = require('../../common/errors');

const VALID_SOURCE_TYPES = ['MANUAL', 'RANDOM', 'RECOMMEND'];

// 구매 요청 데이터 검증
function purchaseValidatorRequest(body = {}) {
    const errors = [];

    const sourceType = body.sourceType;
    const tickets = body.tickets;
    const targetDrwNo = body.targetDrwNo;
    const purchaseAt = body.purchaseAt;

    // sourceType 검증 -> 구매 출처
    if (isEmpty(sourceType)) {
        errors.push(errorCodes.PURCHASE_REQUIRED_SOURCE_TYPE.message);
    } else if (!VALID_SOURCE_TYPES.includes(sourceType)) {
        errors.push(`${errorCodes.PURCHASE_INVALID_SOURCE_TYPE.message} (${VALID_SOURCE_TYPES.join('/')}) => ${sourceType}`);
    }

    // tickets 검증 -> 구매 번호 배열
    if (!Array.isArray(tickets) || tickets.length === 0) {
        errors.push(errorCodes.PURCHASE_INVALID_TICKETS.message);
    } else {
        if (tickets.length > 5) {
            errors.push(errorCodes.PURCHASE_INVALID_TICKET_COUNT.message);
        }

        tickets.forEach((ticket, idx) => {
            if (!Array.isArray(ticket)) {
                errors.push(`tickets[${idx}]: ${errorCodes.PURCHASE_INVALID_TICKET_FORMAT.message}`);
                return;
            }

            const uniqTicket = uniqArray(ticket);

            if (uniqTicket.length !== 6) {
                errors.push(`tickets[${idx}]: ${errorCodes.PURCHASE_INVALID_TICKET_FORMAT.message}`);
                return;
            }

            uniqTicket.forEach(n => {
                if (!Number.isInteger(n) || n < 1 || n > 45) {
                    errors.push(`tickets[${idx}]: ${errorCodes.PURCHASE_INVALID_NUMBERS.message}`);
                }
            });
        });
    }

    // targetDrwNo 검증 (선택)
    if (targetDrwNo !== undefined && targetDrwNo !== null) {
        const drwNo = toInt(targetDrwNo, -1);
        if (drwNo < 1) {
            errors.push(errorCodes.PURCHASE_INVALID_DRW_NO.message);
        }
    }

    // purchaseAt 검증 (선택)
    if (purchaseAt !== undefined && purchaseAt !== null) {
        const parsed = new Date(purchaseAt);
        if (isNaN(parsed.getTime())) {
            errors.push(errorCodes.PURCHASE_INVALID_PURCHASE_AT.message);
        }
    }

    if (errors.length > 0) {
        throw new AppError(errorCodes.INVALID_PARAM, null, errors);
    }

    return {
        sourceType,
        tickets: tickets.map(t => uniqArray(t)),
        targetDrwNo: targetDrwNo ? toInt(targetDrwNo) : undefined,
        purchaseAt: purchaseAt || undefined
    };
}

module.exports = {
    purchaseValidatorRequest
};