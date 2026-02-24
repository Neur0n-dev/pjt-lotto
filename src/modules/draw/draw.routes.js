/**
 * Draw Routes
 *
 * /draw 엔드포인트에 대한 HTTP 경로 설정
 * 요청을 controller로 전달하는 역할만 담당
 * API 라우팅 정의만 담당
 *
 */

const express = require('express');
const router = express.Router();

const drawController = require('./draw.controller');

// 회차 동기화 (동행복권 API → DB 저장)
router.post('/sync/:drwNo', drawController.syncDraw);

// 최신 회차 조회
router.get('/latest', drawController.getLatest);

// 특정 회차 조회
router.get('/:drwNo', drawController.getByDrwNo);

module.exports = router;
