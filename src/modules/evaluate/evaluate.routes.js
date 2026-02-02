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

router.get('/recommend/:drwNo', evaluateController.getRecommendEvaluate);
router.get('/purchase/:drwNo', evaluateController.getPurchaseEvaluate);

module.exports = router;