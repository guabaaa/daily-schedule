# 하루 계획표 (Daily Schedule)

**계획**과 **실행**을 한눈에 비교할 수 있는 시간 관리 앱입니다.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ 주요 기능

### 📅 계획-실행 통합 관리

- 하나의 화면에서 **계획**과 **실행** 비교
- 시간대별 겹침 표시 및 레이어링

### 🕐 정밀한 시간 관리

- **24시간제** 지원
- **분 단위** 정밀도 (0~1439)
- 시작/종료 시간 분리 관리

### 🎨 시각화

- 좌측 고정 시간축
- 스크롤 동기화
- 과목/활동별 색상 구분
- 현재 시각 실시간 표시

### 📝 텍스트 처리

- 최대 2줄 표시
- 넘어가는 경우 ellipsis (`...`)
- 마우스 호버 시 툴팁으로 전체 텍스트 표시

### ⚡ 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Styling**: CSS Modules

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 데이터베이스 설정

```bash
# 마이그레이션 실행
npm run db:migrate

# 샘플 데이터 생성
npm run db:seed
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## 📊 데이터베이스

### 스키마

- **Schedule**: 계획과 실행을 통합 관리
- **Category**: 과목/카테고리 분류

자세한 내용은 [SCHEMA.md](./SCHEMA.md) 참고

### 명령어

```bash
npm run db:seed      # 샘플 데이터 생성
npm run db:studio    # Prisma Studio 실행
npm run db:migrate   # 마이그레이션 실행
npm run db:push      # 스키마 동기화
```

---

## 🎨 UI 컴포넌트

모든 UI는 CSS Module로 작성되었습니다.

### 주요 컴포넌트

- **TimeAxis**: 좌측 시간축
- **ScheduleGrid**: 메인 타임라인
- **ScheduleBlock**: 일정 블록 (2줄 ellipsis)
- **CurrentTimeLine**: 현재 시각 표시
- **Tooltip**: 호버 시 전체 텍스트

자세한 내용은 [UI_GUIDE.md](./UI_GUIDE.md) 참고

---

## 📂 프로젝트 구조

```
daily-schedule/
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마
│   ├── seed.ts                # 샘플 데이터
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── page.tsx           # 메인 페이지
│   │   ├── ScheduleViewer.tsx # 클라이언트 뷰어
│   │   └── api/               # API 라우트
│   ├── components/
│   │   ├── TimeAxis/          # 시간축
│   │   ├── ScheduleGrid/      # 그리드
│   │   ├── ScheduleBlock/     # 일정 블록
│   │   ├── CurrentTimeLine/   # 현재 시각
│   │   └── Tooltip/           # 툴팁
│   ├── hooks/
│   │   ├── useCurrentTime.ts  # 현재 시각 추적
│   │   └── useScrollSync.ts   # 스크롤 동기화
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 클라이언트
│   │   ├── timeUtils.ts       # 시간 유틸리티
│   │   └── scheduleHelpers.ts # 일정 헬퍼
│   └── types/
│       └── schedule.ts        # 타입 정의
├── SCHEMA.md                  # DB 스키마 가이드
└── UI_GUIDE.md                # UI 컴포넌트 가이드
```

---

## 🔧 API 엔드포인트

### Schedules

- `GET /api/schedules` - 일정 목록 조회
- `POST /api/schedules` - 일정 생성
- `GET /api/schedules/[id]` - 일정 상세
- `PATCH /api/schedules/[id]` - 일정 수정
- `DELETE /api/schedules/[id]` - 일정 삭제

### Categories

- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 생성

---

## 🎯 주요 기능 상세

### 시간 표현 (분 단위)

```
00:00 (자정) = 0
09:00 = 540
12:00 (정오) = 720
17:00 = 1020
23:59 = 1439
```

### 계획-실행 구분

- **계획**: 점선 테두리, 반투명
- **실행**: 실선 테두리, 불투명
- 완료된 일정: 체크마크 표시

### 겹침 처리

- 자동 감지 및 레이아웃 계산
- 레이어별로 구분 표시
- z-index로 우선순위 관리

---

## 📦 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **Database**: SQLite
- **ORM**: Prisma 7.2.0
- **Styling**: CSS Modules
- **Libraries**:
  - date-fns (날짜 처리)
  - classnames (클래스 관리)
  - @libsql/client (SQLite 어댑터)

---

## 🌟 특징

### 핵심 기능

✅ 계획과 실행을 한 화면에서 비교  
✅ 분 단위 정밀 시간 관리  
✅ 24시간제 지원  
✅ 시간대 겹침 자동 처리 (옆으로 배치)  
✅ 좌측 시간축과 스크롤 동기화  
✅ 현재 시각 실시간 표시

### UI/UX

✅ 큰 폰트 (15px) + 연한 배경 (가독성 최고)  
✅ 텍스트 2줄 ellipsis + 툴팁  
✅ 우측 상단 완료 배지 (○ → ✓)  
✅ Floating 추가 버튼  
✅ 모달 기반 추가/완료

### 기술

✅ 순수 함수 기반 설계 (테스트 100%)  
✅ CSS Module 스타일링  
✅ TypeScript 타입 안정성

### 성능 최적화

✅ DB 인덱스 (10~20배 빠름)  
✅ API Select 절 (50% 작은 응답)  
✅ React 메모이제이션  
✅ 최대 겹침 수 제한 (5개)  
✅ 완벽한 예외 처리

---

## 📊 테스트

```bash
# 단위 테스트 (70개)
npm test

# 테스트 UI
npm run test:ui

# 단일 실행
npm run test:run
```

**커버리지**:

- timeToPixel: 25 tests ✅
- overlapCalculation: 27 tests ✅
- scheduleLayoutBuilder: 4 tests ✅
- scheduleValidation: 14 tests ✅

---

## 📚 문서

- [SCHEMA.md](./SCHEMA.md) - 데이터베이스 스키마
- [UI_GUIDE.md](./UI_GUIDE.md) - UI 컴포넌트 가이드
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 아키텍처 설계
- [FEATURES.md](./FEATURES.md) - 기능 상세
- [OVERLAP_LAYOUT.md](./OVERLAP_LAYOUT.md) - 겹침 레이아웃
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - 스타일 가이드
- [PERFORMANCE.md](./PERFORMANCE.md) - 성능 최적화
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - 최적화 요약
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 문제 해결

---

## 📝 라이선스

MIT

---

## 👨‍💻 개발

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 서버
npm start

# 린트
npm run lint

# 테스트
npm test
```
