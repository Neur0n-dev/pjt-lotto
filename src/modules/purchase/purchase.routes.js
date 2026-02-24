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

// 구매 생성
router.post('/', purchaseController.postPurchase);

// 구매 목록 조회 (targetDrwNo, sourceType 필터)
router.get('/', purchaseController.getPurchaseList);

// 구매 상세 조회
router.get('/:id', purchaseController.getPurchase);

module.exports = router;
