# UI 컴포넌트 가이드

## 구현된 기능

### ✅ 완료된 기능

#### 1. **시간축 (TimeAxis)**
- 좌측에 고정된 시간 라벨
- 스크롤과 동기화
- 24시간제 표시 (00:00 ~ 23:59)
- 1시간 간격으로 표시

#### 2. **스케줄 그리드 (ScheduleGrid)**
- 메인 타임라인 영역
- 시간별 그리드 라인
- 스크롤 가능한 영역
- 시간축과 스크롤 동기화

#### 3. **스케줄 블록 (ScheduleBlock)**
- 과목/활동별 시각화
- 카테고리별 색상 구분
- **텍스트 처리:**
  - 제목: 최대 2줄 표시
  - 설명: 최대 2줄 표시
  - 넘어가는 경우 ellipsis (`...`) 처리
- **최소 블록 높이:** 60px
- **계획/실행 구분:**
  - 계획: 점선 테두리, 반투명
  - 실행: 실선 테두리, 불투명
- **완료 표시:** 체크마크 배지

#### 4. **현재 시각 표시 (CurrentTimeLine)**
- 빨간색 라인으로 현재 시각 표시
- 좌측 점(dot) 애니메이션
- 우측 시간 라벨
- 1분마다 자동 업데이트

#### 5. **툴팁 (Tooltip)**
- 마우스 호버 시 전체 텍스트 표시
- 제목 + 설명 모두 표시
- 부드러운 페이드인 애니메이션
- 화살표 포인터

#### 6. **겹침 처리**
- 시간대가 겹치는 일정 자동 감지
- 레이어링으로 구분 표시
- 너비와 위치 자동 계산
- z-index로 우선순위 관리

#### 7. **스크롤 동기화**
- 타임라인 스크롤 시 시간축도 동기화
- 부드러운 스크롤 경험

---

## 컴포넌트 구조

```
src/
├── components/
│   ├── TimeAxis/
│   │   ├── TimeAxis.tsx           # 시간축 컴포넌트
│   │   ├── TimeAxis.module.css
│   │   └── index.ts
│   ├── ScheduleGrid/
│   │   ├── ScheduleGrid.tsx       # 메인 그리드
│   │   ├── ScheduleGrid.module.css
│   │   └── index.ts
│   ├── ScheduleBlock/
│   │   ├── ScheduleBlock.tsx      # 일정 블록
│   │   ├── ScheduleBlock.module.css
│   │   └── index.ts
│   ├── CurrentTimeLine/
│   │   ├── CurrentTimeLine.tsx    # 현재 시각 표시
│   │   ├── CurrentTimeLine.module.css
│   │   └── index.ts
│   └── Tooltip/
│       ├── Tooltip.tsx            # 툴팁
│       ├── Tooltip.module.css
│       └── index.ts
├── hooks/
│   ├── useCurrentTime.ts          # 현재 시각 추적
│   └── useScrollSync.ts           # 스크롤 동기화
└── app/
    ├── page.tsx                   # 메인 페이지
    ├── ScheduleViewer.tsx         # 클라이언트 뷰어
    └── page.module.css
```

---

## 사용 예시

### 기본 사용

```tsx
import { ScheduleGrid } from '@/components/ScheduleGrid';

function MySchedule() {
  return (
    <ScheduleGrid
      schedules={schedules}        // 일정 배열
      date={new Date('2025-09-10')}// 날짜
      pixelsPerMinute={2}          // 1분당 2픽셀
      intervalMinutes={60}         // 1시간 간격
      minBlockHeight={60}          // 최소 높이 60px
      showCurrentTime={true}       // 현재 시각 표시
    />
  );
}
```

### 스케줄 데이터 형식

```typescript
const schedule = {
  id: "uuid",
  date: new Date("2025-09-10"),
  startTimeMinutes: 540,  // 09:00
  endTimeMinutes: 630,    // 10:30
  type: "PLAN",           // "PLAN" | "EXECUTION"
  title: "영어 공부",
  description: "토익 LC 연습",
  categoryId: "category-uuid",
  category: {
    name: "영어",
    color: "#FFE066"      // HEX 색상
  },
  layer: 0,
  zIndex: 0,
  completed: false
};
```

---

## CSS Module 사용

모든 스타일은 CSS Module로 작성되었습니다:

```css
/* ScheduleBlock.module.css */
.block {
  position: absolute;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.title {
  font-weight: 600;
  font-size: 13px;
  
  /* 2줄 ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

## 스타일 커스터마이징

### 색상 변경

```typescript
// 카테고리별 색상 설정
const category = {
  name: "영어",
  color: "#FFE066"  // 원하는 HEX 색상
};

// 또는 커스텀 색상 직접 지정
const schedule = {
  ...
  customColor: "#FF6B9D"
};
```

### 높이 조정

```tsx
<ScheduleGrid
  pixelsPerMinute={3}    // 더 넓게
  minBlockHeight={80}    // 최소 높이 증가
/>
```

### 간격 조정

```tsx
<ScheduleGrid
  intervalMinutes={30}   // 30분 간격
/>
```

---

## 주요 특징

### 📏 최소 블록 높이
- 기본값: 60px
- 짧은 일정도 최소 높이 보장
- 가독성 확보

### 📝 텍스트 처리
- 제목: 최대 2줄
- 설명: 최대 2줄
- 넘어가면 `...` 표시
- 호버 시 툴팁으로 전체 내용 표시

### 🕐 현재 시각
- 빨간색 라인
- 좌측 펄스 애니메이션 점
- 우측 시간 라벨
- 1분마다 자동 업데이트

### 🔄 스크롤 동기화
- 타임라인 스크롤 ↔ 시간축 동기화
- 부드러운 스크롤 경험

### 📊 겹침 처리
- 자동 감지 및 레이아웃 계산
- 레이어별 구분
- z-index 관리

---

## 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 확인
http://localhost:3000
```

---

## 샘플 데이터

프로젝트에는 2025년 9월 10일의 샘플 데이터가 포함되어 있습니다:

- 영어, 수학, 국어, 과학, 사회 과목
- 계획과 실행 일정
- 겹치는 시간대 예시
- 완료/미완료 상태

```bash
# Prisma Studio로 데이터 확인
npm run db:studio
```

---

## 브라우저 호환성

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

---

## 성능 최적화

1. **CSS Module**: 스타일 충돌 방지, 최적화된 번들
2. **React.memo**: 불필요한 리렌더링 방지 (필요 시 추가)
3. **useEffect**: 이벤트 리스너 정리
4. **현재 시각**: 1분마다만 업데이트

---

## 다음 단계 (추가 구현 가능)

- [ ] 드래그 앤 드롭으로 일정 이동
- [ ] 일정 추가/수정/삭제 모달
- [ ] 날짜 선택기
- [ ] 주간/월간 뷰
- [ ] 다크 모드
- [ ] 반응형 디자인 (모바일)
- [ ] 일정 검색 및 필터
- [ ] 통계 대시보드

