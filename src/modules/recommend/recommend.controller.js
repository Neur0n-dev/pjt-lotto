/**
 * Recommend Controller
 *
 * HTTP 요청(req/res)을 처리하는 계층
 * 요청 데이터 수신 후 validator, service 호출
 * 클라이언트에 요청에 맞게 응답 반환
 * 비즈니스 로직은 직접 처리하지 않음
 *
 */

// 검증 함수 가져오기
const {
    recommendValidatorRequest
} = require('./recommend.validator')

const {
    createRecommend,
    getRecommendById,
    getRecommendListByFilters
} = require('./recommend.service')


// 추천 이력 저장 /recommend
async function postRecommend(req, res) {
    try {
        // 1. 요청 데이터에 관련하여 검증
        const validResult = recommendValidatorRequest(req.body);

        // 2. 검증된 데이터로 비즈니스로직
        const result = await createRecommend(validResult);

        // 3. 결과 반환
        return res.json(result);

    } catch (err) {
        return res.json({
            result: false,
            message: err.message || '에러!!',
            status: err.status || 400,
            errors: err.details || []
        });
    }
}

// 추천 이력 조회 GET /recommend/:id
async function getRecommend(req, res) {
    try {
        const { id } = req.params;

        // UUID 형식 간단 검증
        if (!id || id.length < 36) {
            return res.json({
                result: false,
                message: '유효하지 않은 추천 ID입니다.',
                status: 400
            });
        }

        const result = await getRecommendById(id);

        if (!result) {
            return res.json({
                result: false,
                message: '해당 추천 이력을 찾을 수 없습니다.',
                status: 404
            });
        }

        return res.json(result);

    } catch (err) {
        return res.json({
            result: false,
            message: err.message || '조회 중 에러 발생',
            status: err.status || 500
        });
    }
}

// 추천 목록 조회 GET /recommend
async function getRecommendList(req, res) {
    try {
        const { targetDrwNo, strategy } = req.query;

        const result = await getRecommendListByFilters({
            targetDrwNo: targetDrwNo ? parseInt(targetDrwNo, 10) : undefined,
            algorithm: strategy || undefined
        });

        return res.json(result);

    } catch (err) {
        return res.json({
            result: false,
            message: err.message || '목록 조회 중 에러 발생',
            status: err.status || 500
        });
    }
}

module.exports = {
    postRecommend,
    getRecommend,
    getRecommendList
};