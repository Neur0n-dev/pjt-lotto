-- =========================================================
-- 02_indexes.sql
-- 목적: 추가 인덱스(선택)
-- =========================================================

-- 결과 테이블에서 recommend_id + drw_no 같은 조회가 잦으면 도움
CREATE INDEX ix_recommend_result_recommend_drw
    ON t_lotto_recommend_result (recommend_id, drw_no);

-- 구매 결과에서 drw_no별 통계 조회가 잦으면 도움(이미 ix_purchase_result_drw_no 있음)
-- 구매번호에서 number별 빈도 분석을 자주 하면 도움
CREATE INDEX ix_purchase_number_number
    ON t_lotto_purchase_number (number);

CREATE INDEX ix_recommend_number_number
    ON t_lotto_recommend_number (number);

-- 구매 목록에서 source_type별 필터 조회
CREATE INDEX ix_purchase_source_type
    ON t_lotto_purchase (source_type);
