/**
 * Purchase Routes
 *
 * /purchase 엔드포인트에 대한 HTTP 경로 설정
 * 요청을 controller로 전달하는 역할만 담당
 * API 라우팅 정의만 담당
 *
 */

const express = require('express');
const router = express.Router();

const purchaseController = require('./purchase.controller');

/**
 * @openapi
 * /purchase:
 *   post:
 *     tags: [Purchase]
 *     summary: 구매 생성
 *     description: 지정된 번호와 출처 타입으로 가상 구매를 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceType, tickets]
 *             properties:
 *               sourceType:
 *                 type: string
 *                 enum: [MANUAL, RANDOM, RECOMMEND]
 *                 description: 구매 출처 타입
 *                 example: MANUAL
 *               tickets:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/LottoTicket'
 *                 minItems: 1
 *                 maxItems: 5
 *                 description: 로또 티켓 배열 (각 티켓은 1~45 범위의 6개 번호)
 *               targetDrwNo:
 *                 type: integer
 *                 description: 목표 회차 번호 (미지정 시 최신 회차)
 *                 example: 1208
 *               purchaseAt:
 *                 type: string
 *                 format: date-time
 *                 description: 구매 일시 (미지정 시 현재 시각)
 *                 example: "2026-01-24T12:00:00Z"
 *     responses:
 *       200:
 *         description: 구매 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseCreateResponse'
 *       400:
 *         description: 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', purchaseController.postPurchase);

/**
 * @openapi
 * /purchase:
 *   get:
 *     tags: [Purchase]
 *     summary: 구매 목록 조회
 *     description: 필터 조건에 맞는 구매 목록을 반환합니다.
 *     parameters:
 *       - in: query
 *         name: targetDrwNo
 *         schema:
 *           type: integer
 *         description: 목표 회차 번호로 필터
 *         example: 1208
 *       - in: query
 *         name: sourceType
 *         schema:
 *           type: string
 *           enum: [MANUAL, RANDOM, RECOMMEND]
 *         description: 구매 출처 타입으로 필터
 *     responses:
 *       200:
 *         description: 구매 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseListResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', purchaseController.getPurchaseList);

/**
 * @openapi
 * /purchase/{id}:
 *   get:
 *     tags: [Purchase]
 *     summary: 구매 상세 조회
 *     description: 구매 ID로 구매 이력과 번호를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 구매 ID (UUID)
 *     responses:
 *       200:
 *         description: 구매 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseDetail'
 *       400:
 *         description: 유효하지 않은 ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 구매 이력 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', purchaseController.getPurchase);

module.exports = router;
