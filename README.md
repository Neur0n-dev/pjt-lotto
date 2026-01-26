# 🎰 PJT-Lotto

로또 번호 추천 API 개인 프로젝트
(Node.js + Express 기반 백엔드 프로젝트)

---

## 📌 프로젝트 소개

**PJT-Lotto**는 다양한 규칙과 전략을 기반으로
로또 번호 6개를 추천해주는 **백엔드 중심 API 프로젝트**입니다.

단순한 랜덤 추천에서 시작하여,

- 고정 번호 / 제외 번호 처리
- 추천 규칙 적용 (랜덤, 홀짝 비율, 합계 범위 등)
- 추천 이력 DB 저장
- 통계 기반 추천 전략

과 같이 **단계적으로 기능을 확장**하는 것을 목표로 합니다.

본 프로젝트는 단순 연습용이 아니라,
**실제 서버 배포를 전제로 한 구조 설계와 개발 흐름**을 중점으로 진행합니다.

---

## 🛠️ 사용 기술

### 백엔드
- Node.js
- Express

### 데이터베이스
- MySQL (mysql2/promise)
- Repository 패턴 적용
- 추천 결과 및 이력 저장

### 기타
- npm (패키지 관리)
- dotenv 기반 환경 변수 관리
- Linux 서버 배포 고려

---

## 📂 프로젝트 구조

```txt
lotto/
├─ app.js
├─ package.json
├─ .env                 # 환경 변수 (gitignore)
├─ CLAUDE.md            # Claude Code 가이드
├─ sql/
│  ├─ query/            # 쿼리문
│  ├─ schema/           # 테이블 DDL
│  └─ seed/             # 테스트 데이터
├─ src/
│  ├─ common/
│  │  └─ utils.js       # 공통 유틸리티 (14개 함수)
│  ├─ congif/           # 환경 / DB 설정
│  │  ├─ env.js
│  │  └─ db.js          # MySQL 커넥션 풀
│  └─ modules/
│     └─ recommend/
│        ├─ recommend.routes.js
│        ├─ recommend.controller.js
│        ├─ recommend.service.js
│        ├─ recommend.repository.js
│        ├─ recommend.validator.js
│        └─ strategies/
│           ├─ index.js           # STRATEGY_MAP
│           ├─ random.strategy.js
│           ├─ evenOdd.strategy.js
│           └─ sumRange.strategy.js
├─ tests/               # 테스트 스크립트
├─ views/               # EJS 템플릿
└─ public/              # 정적 리소스
```

---

## API 사용법

### 추천 요청

```bash
POST /recommend
Content-Type: application/json

{
  "strategy": "random",
  "count": 3,
  "fixedNumbers": [7, 14],
  "excludeNumbers": [1, 2, 3]
}
```

### 파라미터

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| strategy | string | O | 추천 전략 (random, evenOdd, sumRange) |
| count | number | X | 티켓 수 (1-5, 기본값: 1) |
| fixedNumbers | number[] | X | 반드시 포함할 번호 (최대 6개) |
| excludeNumbers | number[] | X | 반드시 제외할 번호 |

### 응답 예시

```json
{
  "ok": true,
  "recommendId": "48ea7d8d-f053-4070-9b9f-2f407920c45e",
  "strategy": "random",
  "count": 3,
  "targetDrwNo": "1101",
  "tickets": [
    [7, 12, 14, 15, 32, 41],
    [7, 14, 23, 30, 31, 43],
    [7, 14, 18, 25, 36, 44]
  ]
}
```

---

## 추천 전략

| 전략 | 설명 |
|------|------|
| `random` | 기본 랜덤 선택 |
| `evenOdd` | 홀수/짝수 3:3 균형 |
| `sumRange` | 합계 100-200 범위 필터링 |

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DB 접속 정보 수정

# 서버 실행
npm start

# 테스트
curl -X POST http://localhost:3000/recommend \
  -H "Content-Type: application/json" \
  -d '{"strategy":"evenOdd","count”:3,”fixedNumbers":[3,12],"excludeNumbers":[1,2,45]}' 
```

---

## 데이터베이스

### 주요 테이블

- `t_lotto_draw` - 회차 정보
- `t_lotto_draw_number` - 회차별 당첨 번호
- `t_lotto_recommend_run` - 추천 실행 이력
- `t_lotto_recommend_number` - 추천 번호 상세

### 스키마 적용

```bash
mysql -u root -p lotto < sql/schema/01_create_tables.sql
mysql -u root -p lotto < sql/schema/02_indexes.sql
mysql -u root -p lotto < sql/schema/03_constraints.sql
mysql -u root -p lotto < sql/seed/draw_sample.sql
```

---

## 개발 진행 현황

- [x] Step 1: 기본 구조 설계 및 랜덤 전략
- [x] Step 2: 전략 패턴 확장 (random, evenOdd, sumRange)
- [x] Step 3-1: DB 연결 준비
- [x] Step 3-2: Repository 패턴 도입
- [x] Step 3-3: Service-Repository 연동
- [ ] Step 3-4: (진행 예정)
