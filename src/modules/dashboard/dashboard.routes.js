/**
 * Dashboard Routes
 *
 * /dashboard 엔드포인트에 대한 HTTP 경로 설정
 * 요청을 controller로 전달하는 역할만 담당
 * API 라우팅 정의만 담당
 */

const express = require('express');
const router = express.Router();

const dashboardController = require('./dashboard.controller');

// API 라우트 (/:drwNo 보다 먼저 선언)
router.get('/api/summary/row1', dashboardController.getSummaryRow1);
router.get('/api/summary/row2', dashboardController.getSummaryRow2);
router.get('/api/summary/row3', dashboardController.getSummaryRow3);
router.get('/api/realtime', dashboardController.getRealtimeCounters);

// 페이지 라우트
router.get('/', dashboardController.getDashboardPage);
router.get('/:drwNo', dashboardController.getDashboardPage);

module.exports = router;
