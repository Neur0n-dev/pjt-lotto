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
// 1행 요약 카드 데이터 (총 구매/추천 수, 최고 등수 등)
router.get('/api/summary/row1', dashboardController.getSummaryRow1);

// 2행 구매/추천 비율 차트 데이터
router.get('/api/summary/row2', dashboardController.getSummaryRow2);

// 3행 빈도/추이/등수 분포 차트 데이터
router.get('/api/summary/row3', dashboardController.getSummaryRow3);

// 실시간 카운터 (구매/추천 누적 수, 1초 폴링)
router.get('/api/realtime', dashboardController.getRealtimeCounters);

// 페이지 라우트
// 대시보드 메인 (최신 회차)
router.get('/', dashboardController.getDashboardPage);

// 대시보드 특정 회차
router.get('/:drwNo', dashboardController.getDashboardPage);

module.exports = router;
