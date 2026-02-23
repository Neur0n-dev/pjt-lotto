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
- 자동 구매 스케줄러 (매 1초, tick당 1~5장 랜덤, 티켓별 전략 개별 선택)
- 자동 추천 스케줄러 (매 20분, tick당 1~5개 랜덤, 모드별 fixed/exclude 자동 산출)
- 추천/구매 결과 당첨 평가

---

## 사용 기술

### 백엔드
- Node.js + Express
- node-cron (스케줄링)

### 데이터베이스
- MySQL (mysql2/promise)
- Repository 패턴 적용

### 프론트엔드
- EJS 템플릿 엔진
- Chart.js (대시보드 차트)

### CI/CD
- GitHub Actions (lint + 자동 배포)
- Self-hosted Runner
- ESLint v9
- PM2

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
├─ .nvmrc                   # Node.js 버전 (20)
├─ eslint.config.js         # ESLint v9 설정
├─ ecosystem.config.js      # PM2 설정 (앱명: lotto-api)
├─ .github/
│  └─ workflows/
│     └─ deploy.yml         # GitHub Actions 워크플로우
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
│  │  ├─ draw.scheduler.js        # 회차 동기화 + 평가 스케줄러
│  │  ├─ purchase.scheduler.js    # 자동 구매 스케줄러
│  │  └─ recommend.scheduler.js   # 자동 추천 스케줄러
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
│     ├─ evaluate/          # 평가 모듈
│     │  ├─ evaluate.routes.js
│     │  ├─ evaluate.controller.js
│     │  ├─ evaluate.service.js
│     │  ├─ evaluate.validator.js
│     │  └─ evaluate.repository.js
│     └─ dashboard/         # 대시보드 모듈
│        ├─ dashboard.routes.js
│        ├─ dashboard.controller.js
│        ├─ dashboard.service.js
│        └─ dashboard.repository.js
├─ views/
│  ├─ dashboard.ejs         # 대시보드 EJS 템플릿
│  ├─ pick.ejs              # 번호추천 EJS 템플릿
│  └─ error.ejs             # 에러 페이지
└─ public/
   ├─ css/
   │  ├─ dashboard.css      # 대시보드 스타일
   │  └─ pick.css           # 번호추천 스타일
   └─ js/
      ├─ dashboard.js       # 대시보드 프론트엔드
      └─ pick.js            # 번호추천 프론트엔드
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

### Dashboard API

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/` | 대시보드 리다이렉트 (`/dashboard`로 이동) |
| GET | `/dashboard` | 대시보드 페이지 (최신 회차) |
| GET | `/dashboard/:drwNo` | 대시보드 페이지 (특정 회차) |
| GET | `/dashboard/api/summary/row1` | 1행 요약 카드 데이터 (60초 폴링) |
| GET | `/dashboard/api/summary/row2` | 2행 구매/추천 비율 차트 (60초 폴링) |
| GET | `/dashboard/api/summary/row3` | 3행 빈도/추이/등수 차트 (60초 폴링) |
| GET | `/dashboard/api/realtime` | 실시간 카운터 (1초 폴링) |

### Pick (번호추천 페이지)

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/pick` | 번호추천 페이지 (3단계 UI: 전략선택 → 옵션설정 → 결과확인) |

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
| 자동 구매 | 매 1초 | tick당 1~5장 랜덤 생성, 티켓마다 전략 개별 랜덤 선택, sourceType에 전략명 저장 |
| 자동 추천 | 매 20분 | tick당 1~5개 랜덤 생성, 모드별 fixedNumbers/excludeNumbers 자동 산출 |

**구매 가능 시간 (KST):**
- 일~금: 06:00 ~ 24:00
- 토: 06:00 ~ 20:00

**추천 가능 시간 (KST):**
- 일요일 06:00 ~ 토요일 20:00

## 추천 모드
| 모드 | fixedNumbers | excludeNumbers | 설명 |
|------|-------------|---------------|------|
| `none` | `[]` | `[]` | 제약 없음 |
| `repeat` | 직전 당첨 1~2개 | `[]` | 연속 출현 기대 |
| `fresh` | `[]` | 직전 당첨 6개 | 신선한 번호 |
| `dormant` | 미출현 1~2개 | `[]` | 가뭄 해소 |
| `mixed` | 미출현 1개 | 과다출현 2~3개 | 혼합 |

---

## CI/CD

```
master push → lint (GitHub 클라우드) → deploy (서버 self-hosted runner)
```

| 단계 | 실행 환경 | 동작 |
|------|-----------|------|
| lint | GitHub 클라우드 | `npm install` → `npm run lint` (ESLint) |
| deploy | 서버 self-hosted runner | `git pull` → `npm install --omit=dev` → `pm2 restart lotto-api` |

- master 브랜치 push 시 자동 실행
- lint 실패 시 배포 중단
- Self-hosted runner: 서버 neuron 계정에 설치

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
- [x] Recommend: 자동 추천 스케줄러 (매 20분, 모드 시스템)
- [x] Dashboard: 대시보드 (EJS + Chart.js, 행별 API 분리)
- [x] Pick: 번호추천 페이지 (3단계 UI, 전략별 색상, 프로그레스 바)
- [x] Pick: API 오류 시 토스트 알림 (에러 메시지/검증 에러 표시)
- [x] Pick: all 전략 결과 카드에 개별 전략 태그 표시
- [x] Pick: 코드 리팩토링 (소스 순서 정리, var→const/let, DOM 통합, 화살표 함수 통일)
- [x] Dashboard: 추천 집계 기준 변경 (recommend_run → recommend_number 티켓 단위)
- [ ] 코드 정리 (미사용 유틸/에러코드/파일/미들웨어 제거)
- [ ] 통계 API
- [ ] 테스트 코드
- [x] CI/CD: GitHub Actions + Self-hosted Runner 자동 배포
