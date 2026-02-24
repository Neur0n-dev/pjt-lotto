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

// 번호 추천 생성
router.post('/', recommendController.postRecommend);

// 추천 목록 조회 (targetDrwNo, strategy 필터)
router.get('/', recommendController.getRecommendList);

// 추천 상세 조회
router.get('/:id', recommendController.getRecommend);

module.exports = router;
