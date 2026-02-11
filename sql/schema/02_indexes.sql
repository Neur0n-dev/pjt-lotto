-- =========================================================
-- 02_indexes.sql
-- 목적: 추가 인덱스 (성능 최적화)
-- 실행: 이미 존재하는 인덱스는 IF NOT EXISTS로 스킵됨
--       MySQL 8.0 미만이면 DROP IF EXISTS + CREATE 패턴 사용
-- =========================================================

-- =========================================================
-- 현재 인덱스 확인 방법 (테이블별)
-- =========================================================
-- SHOW INDEX FROM t_lotto_draw;
-- SHOW INDEX FROM t_lotto_draw_number;
-- SHOW INDEX FROM t_lotto_purchase;
-- SHOW INDEX FROM t_lotto_purchase_number;
-- SHOW INDEX FROM t_lotto_purchase_result;
-- SHOW INDEX FROM t_lotto_recommend_run;
-- SHOW INDEX FROM t_lotto_recommend_number;
-- SHOW INDEX FROM t_lotto_recommend_result;

-- =========================================================
-- 전체 인덱스 한눈에 확인
-- =========================================================
-- SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
-- FROM INFORMATION_SCHEMA.STATISTICS
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME LIKE 't_lotto_%'
-- ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;


-- =========================================================
-- [1] t_lotto_draw
-- =========================================================
-- PK: drw_no (이미 존재)
-- 추가 인덱스 불필요 (drw_no PK가 ORDER BY DESC LIMIT 1 커버)


-- =========================================================
-- [2] t_lotto_draw_number
-- =========================================================
-- PK: (drw_no, pos) 이미 존재
-- UK: (drw_no, number) 이미 존재

-- frequency/hotCold 전략에서 JOIN + WHERE pos BETWEEN 1 AND 6 + GROUP BY number
-- UK (drw_no, number) 가 커버하므로 추가 불필요


-- =========================================================
-- [3] t_lotto_purchase (200만건+, 성능 핵심)
-- =========================================================
-- PK: purchase_id (이미 존재)
-- KEY: ix_purchase_target_drw_no (target_drw_no) (이미 존재)
-- KEY: ix_purchase_purchase_at (purchase_at) (이미 존재)

-- [신규] source_type 단독 — dashboard GROUP BY source_type
-- 사용처: dashboard.repository.countPurchasesBySourceType()
CREATE INDEX ix_purchase_source_type
    ON t_lotto_purchase (source_type);

-- [신규] (target_drw_no, source_type) 복합 — 회차별 구매유형 집계
-- 사용처: dashboard.repository.countPurchasesBySourceType(drwNo)
--         purchase.repository.countPurchasesListByFilters()
CREATE INDEX ix_purchase_target_drw_source
    ON t_lotto_purchase (target_drw_no, source_type);

-- [신규] (target_drw_no, created_date DESC) 복합 — 목록 페이징
-- 사용처: purchase.repository.findPurchasesListByFilters()
CREATE INDEX ix_purchase_target_drw_created
    ON t_lotto_purchase (target_drw_no, created_date DESC);

-- [신규] (source_type, created_date DESC) 복합 — 유형별 목록 페이징
-- 사용처: purchase.repository.findPurchasesListByFilters() (source_type 필터)
CREATE INDEX ix_purchase_source_created
    ON t_lotto_purchase (source_type, created_date DESC);


-- =========================================================
-- [4] t_lotto_purchase_number
-- =========================================================
-- PK: (purchase_id, pos) 이미 존재
-- UK: (purchase_id, number) 이미 존재

-- [신규] number 단독 — 번호별 빈도 분석
-- 사용처: dashboard.repository.findTopPurchasedNumbersByDrwNo()
CREATE INDEX ix_purchase_number_number
    ON t_lotto_purchase_number (number);


-- =========================================================
-- [5] t_lotto_purchase_result
-- =========================================================
-- PK: purchase_id (이미 존재)
-- KEY: ix_purchase_result_drw_no (drw_no) (이미 존재)

-- [신규] result_rank — 당첨 건수 COUNT
-- 사용처: dashboard.repository.countTotalWins() WHERE result_rank BETWEEN 1 AND 5
--         dashboard.repository.countCumulativeRankDistribution() GROUP BY result_rank
CREATE INDEX ix_purchase_result_rank
    ON t_lotto_purchase_result (result_rank);

-- [신규] (purchase_id, drw_no) 복합 — 평가 존재 여부 체크
-- 사용처: evaluate.repository.evaluatePurchaseMatches() EXISTS 서브쿼리
-- 참고: purchase_id가 PK이므로 drw_no 추가 시 커버링 인덱스 효과
CREATE INDEX ix_purchase_result_id_drw
    ON t_lotto_purchase_result (purchase_id, drw_no);

-- [신규] (drw_no, result_rank) 복합 — 회차별 등수 통계
-- 사용처: evaluate.repository.countPurchaseRanksByDrwNo()
CREATE INDEX ix_purchase_result_drw_rank
    ON t_lotto_purchase_result (drw_no, result_rank);


-- =========================================================
-- [6] t_lotto_recommend_run
-- =========================================================
-- PK: recommend_id (이미 존재)
-- KEY: ix_recommend_run_target_drw_no (target_drw_no) (이미 존재)
-- KEY: ix_recommend_run_created_date (created_date) (이미 존재)

-- [신규] algorithm — 전략별 집계
-- 사용처: dashboard.repository.countRecommendsByAlgorithm() GROUP BY algorithm
CREATE INDEX ix_recommend_run_algorithm
    ON t_lotto_recommend_run (algorithm);

-- [신규] (target_drw_no, algorithm) 복합 — 회차+전략 필터
-- 사용처: recommend.repository.countRecommendListByFilters()
CREATE INDEX ix_recommend_run_target_algo
    ON t_lotto_recommend_run (target_drw_no, algorithm);

-- [신규] (target_drw_no, created_date DESC) 복합 — 목록 페이징
-- 사용처: recommend.repository.findRecommendListByFilters()
--         dashboard.repository.findRecentRecommends()
CREATE INDEX ix_recommend_run_target_created
    ON t_lotto_recommend_run (target_drw_no, created_date DESC);

-- [신규] (algorithm, created_date DESC) 복합 — 전략별 목록 페이징
-- 사용처: recommend.repository.findRecommendListByFilters() (algorithm 필터)
CREATE INDEX ix_recommend_run_algo_created
    ON t_lotto_recommend_run (algorithm, created_date DESC);


-- =========================================================
-- [7] t_lotto_recommend_number
-- =========================================================
-- PK: (recommend_id, set_no, pos) 이미 존재
-- UK: (recommend_id, set_no, number) 이미 존재

-- [신규] number 단독 — 번호별 빈도 분석
CREATE INDEX ix_recommend_number_number
    ON t_lotto_recommend_number (number);


-- =========================================================
-- [8] t_lotto_recommend_result
-- =========================================================
-- PK: (recommend_id, set_no) 이미 존재
-- KEY: ix_recommend_result_drw_no (drw_no) (이미 존재)

-- [신규] (recommend_id, drw_no) 복합 — 평가 존재 여부 체크
-- 사용처: evaluate.repository.evaluateRecommendMatches() EXISTS 서브쿼리
CREATE INDEX ix_recommend_result_id_drw
    ON t_lotto_recommend_result (recommend_id, drw_no);

-- [신규] result_rank — 당첨 건수 COUNT
-- 사용처: dashboard.repository.countTotalWins() WHERE result_rank BETWEEN 1 AND 5
--         dashboard.repository.countCumulativeRankDistribution() GROUP BY result_rank
CREATE INDEX ix_recommend_result_rank
    ON t_lotto_recommend_result (result_rank);

-- [신규] (drw_no, result_rank) 복합 — 회차별 등수 통계
-- 사용처: evaluate.repository.countRecommendRanksByDrwNo()
CREATE INDEX ix_recommend_result_drw_rank
    ON t_lotto_recommend_result (drw_no, result_rank);


-- =========================================================
-- 인덱스 요약
-- =========================================================
-- 테이블                     | 기존 인덱스 | 신규 추가 | 합계
-- --------------------------|-----------|---------|-----
-- t_lotto_draw              | PK        | 0       | 1
-- t_lotto_draw_number       | PK+UK     | 0       | 2
-- t_lotto_purchase          | PK+2      | 4       | 7
-- t_lotto_purchase_number   | PK+UK     | 1       | 3
-- t_lotto_purchase_result   | PK+1      | 3       | 5
-- t_lotto_recommend_run     | PK+2      | 4       | 7
-- t_lotto_recommend_number  | PK+UK     | 1       | 3
-- t_lotto_recommend_result  | PK+1      | 3       | 5
-- 합계                       | 14        | 16      | 30

-- =========================================================
-- 우선순위 (성능 임팩트 큰 순서)
-- =========================================================
-- 1순위 (CRITICAL): t_lotto_purchase 관련 4개
--    - ix_purchase_source_type
--    - ix_purchase_target_drw_source
--    - ix_purchase_target_drw_created
--    - ix_purchase_source_created
--    → 200만건+ 테이블, dashboard/purchase 목록 쿼리 직접 영향
--
-- 2순위 (HIGH): result 테이블 6개
--    - ix_purchase_result_rank, ix_purchase_result_id_drw, ix_purchase_result_drw_rank
--    - ix_recommend_result_rank, ix_recommend_result_id_drw, ix_recommend_result_drw_rank
--    → evaluate/dashboard 집계 쿼리에서 풀 스캔 방지
--
-- 3순위 (MEDIUM): recommend_run 4개
--    - ix_recommend_run_algorithm
--    - ix_recommend_run_target_algo
--    - ix_recommend_run_target_created
--    - ix_recommend_run_algo_created
--    → 추천 목록/필터 쿼리 성능 개선
--
-- 4순위 (LOW): number 테이블 2개
--    - ix_purchase_number_number
--    - ix_recommend_number_number
--    → 번호 빈도 분석 시에만 사용
