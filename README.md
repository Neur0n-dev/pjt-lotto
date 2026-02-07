# PJT-Lotto

로또 번호 추천 API 개인 프로젝트
(Node.js + Express 기반 백엔드 프로젝트)

---

## 프로젝트 소개

**PJT-Lotto**는 다양한 규칙과 전략을 기반으로
로또 번호 6개를 추천해주는 **백엔드 중심 API 프로젝트**입니다.

- 고정 번호 / 제외 번호 처리
- 추천 규칙 적용 (랜덤, 홀짝 비율, 합계 범위 등)
- 추천 이력 DB 저장
- 동행복권 당첨번호 자동 동기화
- 자동 구매 스케줄러 (매 1초, tick당 12장)
- 추천/구매 결과 당첨 평가

---

## 사용 기술

### 백엔드
- Node.js + Express
- node-cron (스케줄링)

### 데이터베이스
- MySQL (mysql2/promise)
- Repository 패턴 적용

### 기타
- dotenv 환경 변수 관리
- 동행복권 API 연동
- swagger-jsdoc + swagger-ui-express (API 문서)

---

## 프로젝트 구조

```
lotto/
├─ app.js
├─ package.json
├─ .env                     # 환경 변수 (gitignore)
├─ sql/
│  ├─ query/                # 쿼리문
│  ├─ schema/               # 테이블 DDL
│  └─ seed/                 # 테스트 데이터
├─ scripts/
│  └─ import-draw-excel.js  # 엑셀 import 스크립트
├─ src/
│  ├─ config/
│  │  ├─ db.js                 # DB 커넥션 풀
│  │  ├─ env.js                # 환경 변수 로드
│  │  └─ swagger.js            # Swagger 설정 (OpenAPI 3.0)
│  ├─ common/
│  │  ├─ utils.js           # 공통 유틸리티
│  │  └─ errors/            # 에러 코드 및 AppError
│  ├─ external/
│  │  └─ lotto-api.client.js  # 동행복권 API 클라이언트
│  ├─ scheduler/
│  │  ├─ index.js              # 스케줄러 초기화
│  │  ├─ draw.scheduler.js     # 회차 동기화 + 평가 스케줄러
│  │  └─ purchase.scheduler.js # 자동 구매 스케줄러
│  └─ modules/
│     ├─ draw/              # 회차 모듈
│     │  ├─ draw.routes.js
│     │  ├─ draw.controller.js
│     │  ├─ draw.service.js
│     │  ├─ draw.validator.js
│     │  └─ draw.repository.js
│     ├─ recommend/         # 추천 모듈
│     │  ├─ recommend.routes.js
│     │  ├─ recommend.controller.js
│     │  ├─ recommend.service.js
│     │  ├─ recommend.repository.js
│     │  ├─ recommend.validator.js
│     │  └─ strategies/
│     │     ├─ index.js
│     │     ├─ random.strategy.js
│     │     ├─ evenOdd.strategy.js
│     │     ├─ sumRange.strategy.js
│     │     ├─ frequency.strategy.js
│     │     └─ hotCold.strategy.js
│     ├─ purchase/          # 구매 모듈
│     │  ├─ purchase.routes.js
│     │  ├─ purchase.controller.js
│     │  ├─ purchase.service.js
│     │  ├─ purchase.validator.js
│     │  └─ purchase.repository.js
│     └─ evaluate/          # 평가 모듈
│        ├─ evaluate.routes.js
│        ├─ evaluate.controller.js
│        ├─ evaluate.service.js
│        ├─ evaluate.validator.js
│        └─ evaluate.repository.js
├─ views/                   # EJS 템플릿
└─ public/                  # 정적 리소스
```

---

## API 목록

### Draw API

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/draw/latest` | 최신 회차 조회 |
| GET | `/draw/:drwNo` | 특정 회차 조회 |
| POST | `/draw/sync/:drwNo` | 회차 동기화 (동행복권) |

### Recommend API

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/recommend` | 번호 추천 생성 |
| GET | `/recommend/:id` | 추천 이력 조회 |
| GET | `/recommend` | 추천 목록 조회 (필터 지원) |

### Purchase API

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/purchase` | 구매 생성 |
| GET | `/purchase/:id` | 구매 이력 조회 |
| GET | `/purchase` | 구매 목록 조회 (필터 지원) |

### Evaluate API

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/evaluate/recommend/:drwNo` | 추천 평가 결과 + 등수별 집계 조회 |
| GET | `/evaluate/purchase/:drwNo` | 구매 평가 결과 + 등수별 집계 조회 |

---

## API 사용 예시

### 추천 요청

```bash
curl -X POST http://localhost:3000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "evenOdd",
    "count": 3,
    "fixedNumbers": [7, 14],
    "excludeNumbers": [1, 2, 3]
  }'
```

### 응답

```json
{
  "result": true,
  "recommendId": "48ea7d8d-f053-4070-9b9f-2f407920c45e",
  "strategy": "evenOdd",
  "count": 3,
  "targetDrwNo": 1208,
  "tickets": [
    [7, 12, 14, 15, 32, 41],
    [7, 14, 23, 30, 31, 43],
    [7, 14, 18, 25, 36, 44]
  ]
}
```

### 회차 조회

```bash
curl http://localhost:3000/draw/1208
```

```json
{
  "result": true,
  "drwNo": 1208,
  "drwDate": "2026-01-24 00:00:00",
  "createdDate": "2026-01-27 21:58:55"
}
```

---

## 에러 응답

```json
{
  "result": false,
  "code": 2002,
  "message": "회차 정보를 찾을 수 없습니다. (9999회)"
}
```

### 검증 에러 (validator)

```json
{
  "result": false,
  "code": 1001,
  "message": "유효하지 않은 파라미터입니다.",
  "errors": [
    "strategy는 필수 값입니다.",
    "count는 1 이상 5 이하만 가능합니다."
  ]
}
```

### 에러 코드 체계

| 범위 | 모듈 |
|------|------|
| 1XXX | 공통 |
| 2XXX | Draw |
| 3XXX | Recommend |
| 4XXX | Purchase |
| 5XXX | Evaluate |

---

## 추천 전략

| 전략 | 설명 |
|------|------|
| `random` | 기본 랜덤 선택 |
| `evenOdd` | 홀수/짝수 3:3 균형 |
| `sumRange` | 합계 100-200 범위 필터링 |
| `frequency` | 최근 50회차 출현 빈도 기반 가중 랜덤 |
| `hotCold` | 핫(상위 15) 4개 + 콜드(하위 15) 2개 조합 |
| `all` | 등록된 모든 전략을 1회씩 실행 후 결과 통합 반환 |

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DB 접속 정보 수정

# DB 스키마 적용
mysql -u root -p lotto < sql/schema/01_create_tables.sql
mysql -u root -p lotto < sql/schema/02_indexes.sql
mysql -u root -p lotto < sql/schema/03_constraints.sql

# 역대 회차 데이터 import (선택)
node scripts/import-draw-excel.js ./data/lotto.xlsx

# 서버 실행
npm start

# API 문서 확인
# http://localhost:3000/api-docs
```

---

## 스케줄러

| 스케줄러 | 주기 | 설명 |
|----------|------|------|
| 회차 동기화 | 매주 토요일 21:20 KST | 동행복권 API에서 최신 당첨번호 수집 + 평가 실행 |
| 자동 구매 | 매 1초 | 전략 랜덤 선택, tick당 12장 생성 (주간 약 527만 건) |

**구매 가능 시간 (KST):**
- 일~금: 06:00 ~ 24:00
- 토: 06:00 ~ 20:00

---

## 데이터베이스

### 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `t_lotto_draw` | 회차 정보 |
| `t_lotto_draw_number` | 회차별 당첨 번호 |
| `t_lotto_recommend_run` | 추천 실행 이력 |
| `t_lotto_recommend_number` | 추천 번호 상세 |
| `t_lotto_recommend_result` | 추천 당첨 평가 결과 |
| `t_lotto_purchase` | 구매(가상) 메타 |
| `t_lotto_purchase_number` | 구매 번호 상세 |
| `t_lotto_purchase_result` | 구매 당첨 평가 결과 |

---

## 개발 진행 현황

- [x] Recommend: 기본 구조 설계 및 랜덤 전략
- [x] Recommend: 전략 패턴 확장 (random, evenOdd, sumRange)
- [x] Recommend: Repository 패턴 및 DB 연동
- [x] Recommend: 추천 이력 조회 API
- [x] Draw: 회차 조회 API
- [x] Draw: 동행복권 API 연동
- [x] Draw: 스케줄러 (자동 동기화)
- [x] Draw: 엑셀 import 스크립트
- [x] 공통: 에러 코드 템플릿화 (AppError + errorCodes, 1xxx~5xxx)
- [x] 공통: 전체 소스 AppError 통일
- [x] Purchase: 구매 모듈 (API + 자동 구매 스케줄러)
- [x] Evaluate: 추천/구매 결과 당첨 평가 + draw 스케줄러 연동
- [x] Draw: 스케줄러 버그 수정
- [x] Evaluate: 평가 결과 조회 API (추천/구매 + 등수별 집계)
- [x] Swagger API 문서화
- [x] 새 전략 추가 (frequency, hotCold)
- [x] strategy `all` 옵션 (모든 전략 한번에 실행)
- [x] 목록 조회 API 페이징 (recommend, purchase)
- [ ] 통계 API
- [ ] 테스트 코드
- [ ] 프론트엔드
- [ ] 배포 설정
