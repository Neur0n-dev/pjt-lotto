/**
 * AppError
 *
 * 애플리케이션 커스텀 에러 클래스
 * errorCodes와 함께 사용하여 일관된 에러 응답 생성
 *
 */

class AppError extends Error {
    /**
     * @param {object} errorCode - errorCodes.js에서 정의된 에러 코드 객체
     * @param {string|null} detail - 추가 상세 정보 (선택)
     * @param {Array<string>|null} errors - 검증 에러 목록 (선택, validator용)
     */
    constructor(errorCode, detail = null, errors = null) {
        super(detail ? `${errorCode.message} (${detail})` : errorCode.message);
        this.name = 'AppError';
        this.code = errorCode.code;
        this.status = errorCode.status;
        this.detail = detail;
        this.errors = errors;

        // 스택 트레이스 캡처
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * JSON 응답 형태로 변환
     * @returns {object} 에러 응답 객체
     */
    toJSON() {
        const response = {
            result: false,
            code: this.code,
            message: this.message
        };

        if (this.errors) {
            response.errors = this.errors;
        }

        return response;
    }
}

module.exports = AppError;
