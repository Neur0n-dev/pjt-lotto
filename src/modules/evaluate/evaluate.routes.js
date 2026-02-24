/**
 * evaluate Routes
 *
 * /evaluate 엔드포인트에 대한 HTTP 경로 설정
 * 요청을 controller로 전달하는 역할만 담당
 * API 라우팅 정의만 담당
 *
 */

const express = require('express');
const router = express.Router();

const evaluateController = require('./evaluate.controller');

// 추천 평가 결과 조회 (회차별 당첨 결과 + 등수별 집계)
router.get('/recommend/:drwNo', evaluateController.getRecommendEvaluate);

// 구매 평가 결과 조회 (회차별 당첨 결과 + 등수별 집계)
router.get('/purchase/:drwNo', evaluateController.getPurchaseEvaluate);

module.exports = router;
