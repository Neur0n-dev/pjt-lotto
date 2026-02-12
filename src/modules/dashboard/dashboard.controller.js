/**
 * Dashboard Controller
 *
 * HTTP 요청(req/res)을 처리하는 계층
 * 대시보드 페이지 렌더링 및 API JSON 응답 담당
 * 비즈니스 로직은 직접 처리하지 않음
 */

const service = require('./dashboard.service');
const { AppError, errorCodes } = require('../../common/errors');

// drwNo 파싱 헬퍼 (NaN이면 null 반환)
function parseDrwNo(value) {
    if (!value) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

// 대시보드 페이지 렌더링 GET /dashboard, GET /dashboard/:drwNo
async function getDashboardPage(req, res, next) {
    try {
        const drwNo = parseDrwNo(req.params.drwNo);
        res.render('dashboard', { drwNo });
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 1행 요약 카드 GET /dashboard/api/summary/row1?drwNo=
async function getSummaryRow1(req, res, next) {
    try {
        const drwNo = parseDrwNo(req.query.drwNo);
        const data = await service.getSummaryRow1(drwNo);
        return res.json(data);
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 2행 차트 GET /dashboard/api/summary/row2?drwNo=
async function getSummaryRow2(req, res, next) {
    try {
        const drwNo = parseDrwNo(req.query.drwNo);
        const data = await service.getSummaryRow2(drwNo);
        return res.json(data);
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 3행 차트 GET /dashboard/api/summary/row3?drwNo=
async function getSummaryRow3(req, res, next) {
    try {
        const drwNo = parseDrwNo(req.query.drwNo);
        const data = await service.getSummaryRow3(drwNo);
        return res.json(data);
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 실시간 카운터 GET /dashboard/api/realtime?drwNo=
async function getRealtimeCounters(req, res, next) {
    try {
        const drwNo = parseDrwNo(req.query.drwNo);
        const data = await service.getRealtimeCounters(drwNo);
        return res.json(data);
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

module.exports = {
    getDashboardPage,
    getSummaryRow1,
    getSummaryRow2,
    getSummaryRow3,
    getRealtimeCounters,
};
