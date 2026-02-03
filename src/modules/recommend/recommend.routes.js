/**
 * Recommend Routes
 *
 * /recommend 엔드포인트에 대한 HTTP 경로 설정
 * 요청을 controller로 전달하는 역할만 담당
 * API 라우팅 정의만 담당
 *
 */

const express = require('express');
const router = express.Router();

const recommendController = require('./recommend.controller');

/**
 * @openapi
 * /recommend:
 *   post:
 *     tags: [Recommend]
 *     summary: 번호 추천 생성
 *     description: 지정된 전략 알고리즘으로 로또 번호를 추천합니다. 고정/제외 번호 설정 가능.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [strategy]
 *             properties:
 *               strategy:
 *                 type: string
 *                 enum: [random, evenOdd, sumRange]
 *                 description: 추천 전략 알고리즘
 *                 example: random
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 1
 *                 description: 생성할 티켓 수
 *                 example: 3
 *               fixedNumbers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 45
 *                 maxItems: 6
 *                 description: 반드시 포함할 번호
 *                 example: [7, 14]
 *               excludeNumbers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 45
 *                 description: 제외할 번호
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 추천 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendCreateResponse'
 *       400:
 *         description: 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: 추천 생성 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', recommendController.postRecommend);

/**
 * @openapi
 * /recommend:
 *   get:
 *     tags: [Recommend]
 *     summary: 추천 목록 조회
 *     description: 필터 조건에 맞는 추천 이력 목록을 반환합니다.
 *     parameters:
 *       - in: query
 *         name: targetDrwNo
 *         schema:
 *           type: integer
 *         description: 목표 회차 번호로 필터
 *         example: 1208
 *       - in: query
 *         name: strategy
 *         schema:
 *           type: string
 *           enum: [random, evenOdd, sumRange]
 *         description: 전략 알고리즘으로 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 페이지 번호 (1부터 시작)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 100
 *         description: 한 페이지당 건수
 *     responses:
 *       200:
 *         description: 추천 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendListResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', recommendController.getRecommendList);

/**
 * @openapi
 * /recommend/{id}:
 *   get:
 *     tags: [Recommend]
 *     summary: 추천 상세 조회
 *     description: 추천 실행 ID로 추천 이력과 생성된 티켓을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 추천 실행 ID (UUID)
 *     responses:
 *       200:
 *         description: 추천 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendDetail'
 *       400:
 *         description: 유효하지 않은 ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 추천 이력 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', recommendController.getRecommend);

module.exports = router;
