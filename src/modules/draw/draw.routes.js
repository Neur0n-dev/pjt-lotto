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

/**
 * @openapi
 * /draw/sync/{drwNo}:
 *   post:
 *     tags: [Draw]
 *     summary: 회차 동기화
 *     description: 동행복권 외부 API에서 해당 회차 당첨 정보를 가져와 DB에 저장합니다.
 *     parameters:
 *       - in: path
 *         name: drwNo
 *         required: true
 *         schema:
 *           type: integer
 *         description: 동기화할 회차 번호
 *         example: 1
 *     responses:
 *       200:
 *         description: 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DrawSyncResponse'
 *       400:
 *         description: 유효하지 않은 회차 번호
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 동기화 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sync/:drwNo', drawController.syncDraw);

/**
 * @openapi
 * /draw/latest:
 *   get:
 *     tags: [Draw]
 *     summary: 최신 회차 조회
 *     description: DB에 저장된 가장 최신 회차 정보를 반환합니다.
 *     responses:
 *       200:
 *         description: 최신 회차 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DrawInfo'
 *       404:
 *         description: 회차 데이터 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /draw/{drwNo}:
 *   get:
 *     tags: [Draw]
 *     summary: 특정 회차 조회
 *     description: 지정된 회차 번호의 당첨 정보를 반환합니다.
 *     parameters:
 *       - in: path
 *         name: drwNo
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회차 번호
 *         example: 1208
 *     responses:
 *       200:
 *         description: 회차 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DrawInfo'
 *       400:
 *         description: 유효하지 않은 회차 번호
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 회차 정보 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:drwNo', drawController.getByDrwNo);
router.get('/latest', drawController.getLatest);

module.exports = router;
