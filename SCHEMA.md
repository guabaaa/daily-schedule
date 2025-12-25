# 하루 계획표 데이터베이스 스키마

## 개요
이 프로젝트는 **계획(Plan)**과 **실행(Execution)**을 함께 관리할 수 있는 하루 일정 관리 시스템입니다.

## 주요 특징

### 1. 시간 관리
- **24시간제** 사용
- **분 단위 정밀도**: 0~1439 (00:00~23:59)
- **시작/종료 시간 분리**: `startTimeMinutes`, `endTimeMinutes`
- **정오/자정 구분**: 유틸리티 함수로 지원

### 2. 계획-실행 통합
- 하나의 `Schedule` 테이블에서 계획과 실행 모두 관리
- `type` 필드로 구분 (PLAN | EXECUTION)
- `planId`로 계획-실행 연결

### 3. 시간 겹침 처리
- 겹침 허용
- `layer`와 `zIndex`로 레이어 관리
- 헬퍼 함수로 겹침 감지 및 레이아웃 계산

### 4. 날짜별 관리
- `date` 필드로 날짜 선택
- 날짜 인덱스로 빠른 조회

---

## 데이터베이스 스키마

### Schedule 테이블
메인 일정 테이블 - 계획과 실행을 모두 포함

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | String (UUID) | 고유 식별자 |
| **날짜/시간** |
| `date` | DateTime | 일정 날짜 (YYYY-MM-DD) |
| `startTimeMinutes` | Int | 시작 시간 (분, 0~1439) |
| `endTimeMinutes` | Int | 종료 시간 (분, 0~1439) |
| **타입/내용** |
| `type` | ScheduleType | PLAN 또는 EXECUTION |
| `title` | String | 일정 제목 |
| `description` | String? | 상세 설명 (선택) |
| **카테고리** |
| `categoryId` | String? | 카테고리 ID |
| `category` | Category? | 카테고리 관계 |
| `customColor` | String? | 커스텀 색상 (HEX) |
| **레이어링** |
| `layer` | Int | 레이어 순서 (높을수록 위) |
| `zIndex` | Int | z-index (겹칠 때 우선순위) |
| **계획-실행 연결** |
| `planId` | String? | 연관된 계획 ID |
| `plan` | Schedule? | 계획 관계 |
| `executions` | Schedule[] | 실행 배열 |
| **메타** |
| `completed` | Boolean | 완료 여부 |
| `createdAt` | DateTime | 생성 시간 |
| `updatedAt` | DateTime | 수정 시간 |

### Category 테이블
과목/카테고리 분류

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | String (UUID) | 고유 식별자 |
| `name` | String | 카테고리 이름 (예: "영어", "수학") |
| `color` | String | HEX 색상 코드 |
| `schedules` | Schedule[] | 연관된 일정들 |
| `createdAt` | DateTime | 생성 시간 |
| `updatedAt` | DateTime | 수정 시간 |

---

## 시간 표현 방식

### 분 단위 변환
```
00:00 (자정) = 0
09:00 (오전 9시) = 540
12:00 (정오) = 720
17:00 (오후 5시) = 1020
23:59 (자정 직전) = 1439
```

### 예시
```typescript
// 09:00 ~ 10:30 수업
{
  startTimeMinutes: 540,  // 09:00
  endTimeMinutes: 630,    // 10:30
  // 소요 시간: 90분 (1.5시간)
}
```

---

## API 엔드포인트

### Schedules
- `GET /api/schedules` - 일정 목록 조회
  - Query: `?date=2025-09-10&type=PLAN&categoryId=uuid`
- `POST /api/schedules` - 일정 생성
- `GET /api/schedules/[id]` - 일정 상세
- `PATCH /api/schedules/[id]` - 일정 수정
- `DELETE /api/schedules/[id]` - 일정 삭제

### Categories
- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 생성

---

## 유틸리티 함수

### 시간 관리 (`src/lib/timeUtils.ts`)
- `timeStringToMinutes(timeString)` - "HH:MM" → 분
- `minutesToTimeString(minutes)` - 분 → "HH:MM"
- `isTimeOverlapping(start1, end1, start2, end2)` - 겹침 체크
- `to12HourFormat(minutes)` - 12시간제 변환
- `generateTimeGrid(intervalMinutes)` - 그리드용 시간 배열

### 일정 헬퍼 (`src/lib/scheduleHelpers.ts`)
- `findOverlappingSchedules(schedules)` - 겹치는 일정 찾기
- `calculateOverlapLayout(overlappingSchedules)` - 레이아웃 계산
- `pairPlanWithExecution(schedules)` - 계획-실행 페어링
- `groupSchedulesByTimeSlot(schedules, interval)` - 시간대별 그룹화

---

## 사용 예시

### 계획 생성
```typescript
// POST /api/schedules
{
  "date": "2025-09-10",
  "startTimeMinutes": 540,  // 09:00
  "endTimeMinutes": 630,    // 10:30
  "type": "PLAN",
  "title": "영어 공부",
  "description": "토익 LC 연습",
  "categoryId": "category-uuid",
  "layer": 0,
  "zIndex": 0
}
```

### 실행 생성 (계획 연결)
```typescript
// POST /api/schedules
{
  "date": "2025-09-10",
  "startTimeMinutes": 545,  // 09:05 (5분 늦게 시작)
  "endTimeMinutes": 640,    // 10:40 (10분 더 했음)
  "type": "EXECUTION",
  "title": "영어 공부 실행",
  "planId": "plan-uuid",    // 위에서 생성한 계획 ID
  "categoryId": "category-uuid",
  "layer": 1,
  "zIndex": 1
}
```

### 날짜별 조회
```typescript
// GET /api/schedules?date=2025-09-10
// 2025년 9월 10일의 모든 일정 조회
```

### 계획만 조회
```typescript
// GET /api/schedules?date=2025-09-10&type=PLAN
// 2025년 9월 10일의 계획만 조회
```

---

## 확장 스키마 - 계획과 실행 통합 뷰

### ScheduleWithRelations
```typescript
type ScheduleWithRelations = Schedule & {
  category: Category | null;
  plan: Schedule | null;
  executions: Schedule[];
};
```

### PlanExecutionPair
```typescript
type PlanExecutionPair = {
  plan: ScheduleWithRelations;
  execution?: ScheduleWithRelations;
};
```

이 타입을 사용하면 계획과 실행을 함께 표시할 수 있습니다.

---

## 그리드 시스템

### 분 단위 그리드
- 기본 간격: 15분
- 1시간당 4개 그리드
- 24시간 = 96개 그리드

### 사용 예시
```typescript
import { generateTimeGrid, minutesToTimeString } from '@/lib/timeUtils';

const grid = generateTimeGrid(15); // [0, 15, 30, 45, 60, ...]
grid.forEach(minutes => {
  console.log(minutesToTimeString(minutes)); // "00:00", "00:15", ...
});
```

---

## 데이터베이스 초기화

```bash
# 마이그레이션 실행
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate

# Prisma Studio 실행 (데이터 확인)
npx prisma studio
```

---

## 타입 시스템

모든 타입은 `src/types/schedule.ts`에 정의되어 있습니다:

- `ScheduleWithRelations` - 관계 포함 일정
- `PlanExecutionPair` - 계획-실행 페어
- `CreateScheduleInput` - 생성 입력
- `UpdateScheduleInput` - 수정 입력
- `ScheduleFilter` - 필터
- `OverlappingSchedule` - 겹침 정보
- `DailyScheduleStats` - 통계

---

## 다음 단계

1. ✅ 데이터베이스 스키마 설계
2. ✅ 시간 관리 유틸리티
3. ✅ API 라우트 구현
4. 🔲 UI 컴포넌트 개발
   - 캘린더 뷰
   - 시간 그리드
   - 일정 카드
   - 계획-실행 비교 뷰
5. 🔲 드래그 앤 드롭
6. 🔲 반응형 디자인

