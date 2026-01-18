# 🎰 PJT-Lotto

로또 번호 추천 API 개인 프로젝트  
(Node.js + Express 기반 백엔드 프로젝트)

---

## 📌 프로젝트 소개

**PJT-Lotto**는 다양한 규칙과 전략을 기반으로  
로또 번호 6개를 추천해주는 **백엔드 중심 API 프로젝트**입니다.

단순한 랜덤 추천에서 시작하여,

- 고정 번호 / 제외 번호 처리
- 추천 규칙 적용 (홀짝 비율, 구간 분포 등)
- 과거 추천 이력 관리
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
- MySQL
- Repository 패턴 적용
- 추천 결과 및 이력 저장 용도

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
├─ package-lock.json
├─ .gitignore
├─ .env            # 환경 변수 (gitignore)
├─ src/
│  ├─ common/      # 공통 유틸리티
│  ├─ config/      # 환경 / DB 설정
│  ├─ middleware/  # 공통 미들웨어
│  └─ modules/
│     └─ recommend/
│        ├─ recommend.routes.js 
│        ├─ recommend.controller.js
│        ├─ recommend.service.js
│        ├─ recommend.repository.js
│        ├─ recommend.validator.js
│        └─ strategies/
│           └─ random.strategy.js
├─ views/          # 화면 템플릿
└─ public/         # 정적 리소스
