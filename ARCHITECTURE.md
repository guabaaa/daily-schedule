# 아키텍처 가이드

## 설계 원칙

### 순수 함수 기반 설계
모든 계산 로직은 순수 함수로 분리하여 테스트 가능하고 예측 가능한 코드를 작성합니다.

### 관심사의 분리
- **계산 로직**: 순수 함수 (`src/lib/layout/`)
- **렌더링**: React 컴포넌트 (`src/components/`)
- **데이터**: Prisma ORM (`src/lib/prisma.ts`)

---

## 디렉토리 구조

```
src/
├── lib/
│   ├── layout/                    # 레이아웃 계산 순수 함수
│   │   ├── timeToPixel.ts         # 시간 → 픽셀 변환
│   │   ├── overlapCalculation.ts # 겹침 계산
│   │   ├── scheduleLayoutBuilder.ts # 레이아웃 빌더
│   │   └── __tests__/             # 단위 테스트
│   │       ├── timeToPixel.test.ts
│   │       └── overlapCalculation.test.ts
│   ├── timeUtils.ts               # 시간 유틸리티
│   ├── scheduleHelpers.ts         # 일정 헬퍼 (레거시)
│   └── prisma.ts                  # Prisma 클라이언트
├── components/
│   ├── ScheduleBlock/
│   │   ├── ScheduleBlockPure.tsx  # 순수 렌더링 블록
│   │   └── ScheduleBlock.module.css
│   ├── ScheduleGrid/
│   │   ├── ScheduleGridPure.tsx   # 순수 렌더링 그리드
│   │   └── ScheduleGrid.module.css
│   └── ...
└── app/
    ├── page.tsx                   # 메인 페이지 (서버 컴포넌트)
    └── ScheduleViewer.tsx         # 클라이언트 컴포넌트
```

---

## 핵심 모듈

### 1. 시간 → 픽셀 변환 (`timeToPixel.ts`)

**순수 함수로 구성된 시간-픽셀 변환 모듈**

```typescript
import { timeToPixel, TimeToPixelConfig } from '@/lib/layout/timeToPixel';

const config: TimeToPixelConfig = { pixelsPerMinute: 2 };

// 09:00 (540분) → 1080px
const y = timeToPixel(540, config);

// 역변환: 1080px → 540분
const minutes = pixelToTime(1080, config);

// 시간 범위 → 높이
const height = timeDurationToHeight(540, 600, config); // 60분 → 120px

// 최소 높이 적용
const blockHeight = calculateBlockHeight(540, 560, config, 60); // 최소 60px
```

**테스트 커버리지**: 25개 테스트 케이스 ✅

---

### 2. 겹침 계산 (`overlapCalculation.ts`)

**순수 함수로 구성된 일정 겹침 계산 모듈**

```typescript
import {
  isOverlapping,
  groupOverlappingSchedules,
  calculateAllScheduleLayouts,
  ScheduleItem,
} from '@/lib/layout/overlapCalculation';

// 두 시간 범위가 겹치는지 확인
const overlaps = isOverlapping(
  { startMinutes: 540, endMinutes: 600 },
  { startMinutes: 570, endMinutes: 630 }
); // true

// 일정들을 겹치는 그룹으로 분류
const groups = groupOverlappingSchedules(schedules);

// 모든 일정의 레이아웃 계산 (width, left)
const layouts = calculateAllScheduleLayouts(schedules);
// [
//   { item: schedule1, position: { width: 50, left: 0 } },
//   { item: schedule2, position: { width: 50, left: 50 } },
// ]
```

**주요 기능**:
- 시간 범위 겹침 감지
- 연쇄적 겹침 그룹화
- 최대 동시 겹침 수 계산
- 컬럼 기반 레이아웃 계산

**테스트 커버리지**: 27개 테스트 케이스 ✅

---

### 3. 레이아웃 빌더 (`scheduleLayoutBuilder.ts`)

**순수 함수를 조합하여 최종 레이아웃 생성**

```typescript
import {
  buildGridLines,
  buildScheduleBlocks,
  calculateTotalHeight,
} from '@/lib/layout/scheduleLayoutBuilder';

// 그리드 라인 생성
const gridLines = buildGridLines(60, 2);
// [
//   { top: 0, isHour: true },
//   { top: 120, isHour: true },
//   ...
// ]

// 일정 블록 Props 생성
const scheduleBlocks = buildScheduleBlocks(schedules, 2, 60);
// [
//   {
//     id: '1',
//     title: '영어',
//     top: 1080,
//     height: 120,
//     width: 50,
//     left: 0,
//     ...
//   },
//   ...
// ]

// 전체 그리드 높이
const totalHeight = calculateTotalHeight(2); // 2880px (24시간)
```

---

### 4. 순수 렌더링 컴포넌트

#### ScheduleBlockPure

**계산된 레이아웃 정보만 받아서 렌더링**

```typescript
interface ScheduleBlockProps {
  id: string;
  title: string;
  description?: string;
  backgroundColor: string;
  isPlan: boolean;
  isExecution: boolean;
  completed: boolean;
  zIndex: number;
  // 레이아웃 정보 (이미 계산된 값)
  top: number;    // px
  height: number; // px
  width: number;  // %
  left: number;   // %
}

<ScheduleBlockPure
  id="1"
  title="영어"
  top={1080}
  height={120}
  width={50}
  left={0}
  {...otherProps}
/>
```

**특징**:
- 계산 로직 없음 (순수 렌더링)
- Props만으로 완전히 제어 가능
- 테스트 용이

#### ScheduleGridPure

**계산된 그리드 라인과 일정 블록을 렌더링**

```typescript
interface ScheduleGridPureProps {
  totalHeight: number;
  pixelsPerMinute: number;
  intervalMinutes: number;
  gridLines: GridLineProps[];
  scheduleBlocks: ScheduleBlockProps[];
  showCurrentTime?: boolean;
}

<ScheduleGridPure
  totalHeight={2880}
  pixelsPerMinute={2}
  intervalMinutes={60}
  gridLines={gridLines}
  scheduleBlocks={scheduleBlocks}
/>
```

---

## 데이터 흐름

```
┌─────────────────────────────────────────────────────┐
│ 1. 서버: 데이터베이스에서 일정 조회                  │
│    (page.tsx - Server Component)                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 2. 클라이언트: 레이아웃 계산                         │
│    (ScheduleViewer.tsx)                             │
│                                                      │
│    schedules → buildScheduleBlocks()                │
│             → { top, height, width, left }          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 3. 렌더링: 순수 컴포넌트                             │
│    (ScheduleGridPure, ScheduleBlockPure)            │
│                                                      │
│    계산된 Props만 받아서 렌더링                      │
└─────────────────────────────────────────────────────┘
```

---

## 계산 로직 상세

### 시간 → Y 좌표 변환

```typescript
// 공식
y = minutes × pixelsPerMinute

// 예시 (pixelsPerMinute = 2)
09:00 (540분) → 1080px
12:00 (720분) → 1440px
17:00 (1020분) → 2040px
```

### 블록 높이 계산

```typescript
// 기본 높이
height = (endMinutes - startMinutes) × pixelsPerMinute

// 최소 높이 적용
finalHeight = Math.max(height, minHeight)

// 예시
30분 일정 → 60px (계산값) → 60px (최소 높이 60px)
20분 일정 → 40px (계산값) → 60px (최소 높이 60px)
```

### 겹침 레이아웃 계산

```
1. 겹치는 일정들을 그룹화
   - 연쇄적 겹침도 하나의 그룹

2. 각 그룹 내에서 컬럼 배치
   - 겹치지 않는 일정끼리 같은 컬럼

3. 너비와 위치 계산
   width = 100 / 컬럼 수
   left = width × 컬럼 인덱스
```

**예시**:

```
영어 09:00-10:30 ─────────┐
수학 10:00-11:45      겹침 ├─→ 하나의 그룹
국어 10:00-11:00 ─────────┘

→ 3개 컬럼 필요
→ width: 33.33%, left: 0%, 33.33%, 66.66%
```

---

## 테스트 전략

### 단위 테스트 (Vitest)

**순수 함수는 100% 테스트 가능**

```bash
# 모든 테스트 실행
npm test

# 테스트 UI
npm run test:ui

# 단일 실행
npm run test:run
```

### 테스트 케이스 구성

#### timeToPixel.test.ts (25개)
- ✅ 기본 변환 (자정, 정오, 일반 시간)
- ✅ 역변환 (�elToTime)
- ✅ 시간 범위 → 높이
- ✅ 최소 높이 적용
- ✅ 경계값 테스트
- ✅ 일관성 테스트 (역함수 관계)

#### overlapCalculation.test.ts (27개)
- ✅ 겹침 감지 (완전, 부분, 포함, 비겹침)
- ✅ 겹치는 일정 찾기
- ✅ 그룹화 (단순, 연쇄적, 복잡한 패턴)
- ✅ 최대 동시 겹침 수 계산
- ✅ 레이아웃 계산 (50%, 33.33% 분할)
- ✅ 통합 시나리오

**결과**: 52/52 테스트 통과 ✅

---

## 성능 최적화

### 1. 메모이제이션

```typescript
const { totalHeight, gridLines, scheduleBlocks } = useMemo(() => {
  return {
    totalHeight: calculateTotalHeight(pixelsPerMinute),
    gridLines: buildGridLines(intervalMinutes, pixelsPerMinute),
    scheduleBlocks: buildScheduleBlocks(schedules, pixelsPerMinute, minBlockHeight),
  };
}, [schedules, pixelsPerMinute, intervalMinutes, minBlockHeight]);
```

**효과**:
- 일정 데이터가 변경되지 않으면 재계산 안 함
- 렌더링 성능 향상

### 2. 순수 함수

**장점**:
- 예측 가능한 동작
- 테스트 용이
- 디버깅 쉬움
- 재사용 가능

### 3. CSS Module

**장점**:
- 스타일 충돌 방지
- 최적화된 번들
- 트리 쉐이킹

---

## 확장 가능성

### 새로운 레이아웃 알고리즘 추가

```typescript
// 새로운 레이아웃 계산 함수 추가
export function calculateCompactLayout<T extends ScheduleItem>(
  group: OverlapGroup<T>
): ScheduleLayout<T>[] {
  // 새로운 알고리즘 구현
}

// 테스트 작성
describe('calculateCompactLayout', () => {
  it('컴팩트하게 배치', () => {
    // ...
  });
});
```

### 새로운 시간 변환 로직

```typescript
// 새로운 변환 함수 추가
export function timeToPixelWithZoom(
  minutes: number,
  config: TimeToPixelConfig,
  zoomLevel: number
): number {
  return minutes * config.pixelsPerMinute * zoomLevel;
}
```

---

## 마이그레이션 가이드

### 기존 컴포넌트 → 순수 컴포넌트

**Before**:
```typescript
<ScheduleBlock
  schedule={schedule}
  pixelsPerMinute={2}
  minHeight={60}
/>
```

**After**:
```typescript
// 1. 레이아웃 계산
const blocks = buildScheduleBlocks([schedule], 2, 60);

// 2. 순수 컴포넌트 렌더링
<ScheduleBlockPure {...blocks[0]} />
```

---

## 디버깅 팁

### 1. 레이아웃 계산 확인

```typescript
const layouts = calculateAllScheduleLayouts(schedules);
console.log('Layouts:', layouts);
```

### 2. 겹침 그룹 확인

```typescript
const groups = groupOverlappingSchedules(schedules);
console.log('Groups:', groups);
```

### 3. 테스트로 검증

```typescript
it('특정 시나리오', () => {
  const schedules = [/* ... */];
  const layouts = calculateAllScheduleLayouts(schedules);
  expect(layouts[0].position.width).toBe(50);
});
```

---

## 베스트 프랙티스

### ✅ DO

- 순수 함수로 계산 로직 작성
- 단위 테스트 작성
- Props 타입 명시
- 메모이제이션 활용
- 의미 있는 변수명 사용

### ❌ DON'T

- 컴포넌트 내부에서 복잡한 계산
- 사이드 이펙트가 있는 함수
- 타입 any 사용
- 불필요한 재계산
- 매직 넘버 사용

---

## 참고 자료

- [Vitest 문서](https://vitest.dev/)
- [React 테스팅 라이브러리](https://testing-library.com/react)
- [순수 함수 (Pure Functions)](https://en.wikipedia.org/wiki/Pure_function)
- [관심사의 분리 (Separation of Concerns)](https://en.wikipedia.org/wiki/Separation_of_concerns)

