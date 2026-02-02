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

/**
 * @openapi
 * /evaluate/recommend/{drwNo}:
 *   get:
 *     tags: [Evaluate]
 *     summary: 추천 평가 결과 조회
 *     description: 해당 회차를 대상으로 한 모든 추천의 당첨 평가 결과와 등수별 통계를 반환합니다.
 *     parameters:
 *       - in: path
 *         name: drwNo
 *         required: true
 *         schema:
 *           type: integer
 *         description: 평가할 회차 번호
 *         example: 1208
 *     responses:
 *       200:
 *         description: 추천 평가 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EvaluateRecommendResponse'
 *       400:
 *         description: 유효하지 않은 회차 번호
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/recommend/:drwNo', evaluateController.getRecommendEvaluate);

/**
 * @openapi
 * /evaluate/purchase/{drwNo}:
 *   get:
 *     tags: [Evaluate]
 *     summary: 구매 평가 결과 조회
 *     description: 해당 회차를 대상으로 한 모든 구매의 당첨 평가 결과와 등수별 통계를 반환합니다.
 *     parameters:
 *       - in: path
 *         name: drwNo
 *         required: true
 *         schema:
 *           type: integer
 *         description: 평가할 회차 번호
 *         example: 1208
 *     responses:
 *       200:
 *         description: 구매 평가 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EvaluatePurchaseResponse'
 *       400:
 *         description: 유효하지 않은 회차 번호
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/purchase/:drwNo', evaluateController.getPurchaseEvaluate);

module.exports = router;
