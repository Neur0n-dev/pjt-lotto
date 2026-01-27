/**
 * Draw Controller
 *
 * HTTP 요청(req/res)을 처리하는 계층
 * 요청 데이터 수신 후 validator, service 호출
 * 클라이언트에 요청에 맞게 응답 반환
 * 비즈니스 로직은 직접 처리하지 않음
 *
 */

const {
    getLatestDraw,
    getDrawByNo
} = require('./draw.service');

// 최신 회차 조회 GET /draw/latest
async function getLatest(req, res) {
    try {
        const result = await getLatestDraw();

        if (!result) {
            return res.json({
                result: false,
                message: '등록된 회차 정보가 없습니다.',
                status: 404
            });
        }

        return res.json(result);

    } catch (err) {
        return res.json({
            result: false,
            message: err.message || '회차 조회 중 에러 발생',
            status: err.status || 500
        });
    }
}

// 특정 회차 조회 GET /draw/:drwNo
async function getByDrwNo(req, res) {
    try {
        const {drwNo} = req.params;

        if (!drwNo || isNaN(drwNo)) {
            return res.json({
                result: false,
                message: '유효하지 않은 회차 번호입니다.',
                status: 400
            });
        }

        const result = await getDrawByNo(parseInt(drwNo, 10));

        if (!result) {
            return res.json({
                result: false,
                message: '해당 회차 정보를 찾을 수 없습니다.',
                status: 404
            });
        }

        return res.json(result);

    } catch (err) {
        return res.json({
            result: false,
            message: err.message || '회차 조회 중 에러 발생',
            status: err.status || 500
        });
    }
}

module.exports = {
    getLatest,
    getByDrwNo
};
