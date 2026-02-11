/**
 * Dashboard Controller
 *
 * HTTP 요청(req/res)을 처리하는 계층
 * 대시보드 페이지 렌더링 및 API JSON 응답 담당
 * 비즈니스 로직은 직접 처리하지 않음
 */

const service = require('./dashboard.service');
const { AppError, errorCodes } = require('../../common/errors');

// 대시보드 페이지 렌더링 GET /dashboard, GET /dashboard/:drwNo
async function getDashboardPage(req, res, next) {
    try {
        const drwNo = req.params.drwNo ? Number(req.params.drwNo) : null;
        res.render('dashboard', { drwNo });
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 대시보드 전체 요약 데이터 GET /dashboard/api/summary?drwNo=
async function getDashboardSummary(req, res, next) {
    try {
        const drwNo = req.query.drwNo ? Number(req.query.drwNo) : null;
        const data = await service.getDashboardSummary(drwNo);
        return res.json(data);
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

// 실시간 카운터 + 최근 3건 GET /dashboard/api/realtime?drwNo=
async function getRealtimeCounters(req, res, next) {
    try {
        const drwNo = req.query.drwNo ? Number(req.query.drwNo) : null;
        const data = await service.getRealtimeCounters(drwNo);
        return res.json(data);
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(errorCodes.INTERNAL_ERROR, err.message));
    }
}

module.exports = {
    getDashboardPage,
    getDashboardSummary,
    getRealtimeCounters,
};
