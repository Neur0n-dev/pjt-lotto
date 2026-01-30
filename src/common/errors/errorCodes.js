/**
 * Error Codes
 *
 * 애플리케이션 전역 에러 코드 정의
 * 코드 체계: XXXX
 *   - 1XXX: 공통 에러
 *   - 2XXX: Draw 모듈
 *   - 3XXX: Recommend 모듈
 *   - 4XXX: Purchase 모듈
 *   - 5XXX: Evaluate 모듈
 */

module.exports = {
    // ================================
    // 공통 에러 (1XXX)
    // ================================
    INVALID_PARAM: {
        code: 1001,
        status: 400,
        message: '유효하지 않은 파라미터입니다.'
    },
    NOT_FOUND: {
        code: 1002,
        status: 404,
        message: '데이터를 찾을 수 없습니다.'
    },
    INTERNAL_ERROR: {
        code: 1003,
        status: 500,
        message: '서버 내부 오류가 발생했습니다.'
    },
    INVALID_TICKET_FORMAT: {
        code: 1004,
        status: 400,
        message: 'tickets는 6개의 번호로 구성된 배열이어야 합니다.'
    },

    // ================================
    // Draw 모듈 (2XXX)
    // ================================
    DRAW_INVALID_DRW_NO: {
        code: 2001,
        status: 400,
        message: '유효하지 않은 회차 번호입니다.'
    },
    DRAW_NOT_FOUND: {
        code: 2002,
        status: 404,
        message: '회차 정보를 찾을 수 없습니다.'
    },
    DRAW_NO_DATA: {
        code: 2003,
        status: 404,
        message: '등록된 회차 정보가 없습니다.'
    },
    DRAW_SYNC_FAILED: {
        code: 2004,
        status: 500,
        message: '회차 동기화에 실패했습니다.'
    },
    DRAW_API_CALL_FAILED: {
        code: 2005,
        status: 502,
        message: '동행복권 API 호출에 실패했습니다.'
    },
    DRAW_API_NOT_FOUND: {
        code: 2006,
        status: 404,
        message: 'API에서 로또 당첨정보를 찾을 수 없습니다.'
    },

    // ================================
    // Recommend 모듈 (3XXX)
    // ================================
    RECOMMEND_INVALID_STRATEGY: {
        code: 3001,
        status: 400,
        message: '유효하지 않은 추천 전략입니다.'
    },
    RECOMMEND_INVALID_COUNT: {
        code: 3002,
        status: 400,
        message: '추천 개수는 1~10 사이여야 합니다.'
    },
    RECOMMEND_INVALID_NUMBERS: {
        code: 3003,
        status: 400,
        message: '유효하지 않은 번호입니다. (1~45)'
    },
    RECOMMEND_NOT_FOUND: {
        code: 3004,
        status: 404,
        message: '추천 이력 정보를 찾을 수 없습니다.'
    },
    RECOMMEND_GENERATION_FAILED: {
        code: 3005,
        status: 500,
        message: '번호 생성에 실패했습니다.'
    },

    // ================================
    // Purchase 모듈 (4XXX)
    // ================================
    PURCHASE_INVALID_NUMBERS: {
        code: 4001,
        status: 400,
        message: '유효하지 않은 번호입니다. (1~45 사이의 정수)'
    },
    PURCHASE_INVALID_SOURCE_TYPE: {
        code: 4002,
        status: 400,
        message: '유효하지 않은 구매 유형입니다.'
    },
    PURCHASE_NOT_FOUND: {
        code: 4003,
        status: 404,
        message: '구매 정보를 찾을 수 없습니다.'
    },
    PURCHASE_TIME_NOT_ALLOWED: {
        code: 4004,
        status: 400,
        message: '구매 가능 시간이 아닙니다.'
    },
    PURCHASE_REQUIRED_SOURCE_TYPE: {
        code: 4005,
        status: 400,
        message: 'sourceType은 필수 값입니다.'
    },
    PURCHASE_INVALID_TICKETS: {
        code: 4006,
        status: 400,
        message: 'tickets는 1개 이상의 번호 배열이어야 합니다.'
    },
    PURCHASE_INVALID_TICKET_COUNT: {
        code: 4007,
        status: 400,
        message: 'tickets는 최대 5개까지 가능합니다.'
    },
    PURCHASE_INVALID_TICKET_FORMAT: {
        code: 4008,
        status: 400,
        message: '각 ticket은 중복 없는 6개의 번호 배열이어야 합니다.'
    },
    PURCHASE_INVALID_DRW_NO: {
        code: 4009,
        status: 400,
        message: 'targetDrwNo는 1 이상의 정수여야 합니다.'
    },
    PURCHASE_INVALID_PURCHASE_AT: {
        code: 4010,
        status: 400,
        message: 'purchaseAt은 유효한 날짜 형식이어야 합니다.'
    },

    // ================================
    // Evaluate 모듈 (5XXX)
    // ================================
    EVALUATE_RECOMMEND_NUMBERS_NOT_FOUND: {
        code: 5001,
        status: 404,
        message: '구매 내역 중 평가 할 ticket이 없습니다'
    },
    EVALUATE_PURCHASE_NUMBERS_NOT_FOUND: {
        code: 5002,
        status: 404,
        message: '구매 내역 중 평가 할 ticket이 없습니다.'
    },
};