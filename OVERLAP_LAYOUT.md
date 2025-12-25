# 겹침 레이아웃 가이드

## 개선 사항

### ✅ 문제
기존에는 시간대가 겹치는 일정들이 `zIndex`로 인해 **위로 레이어처럼 쌓여** 있어 UX가 불편했습니다.

### ✅ 해결
이제 겹치는 일정들이 **옆으로 나란히 배치**됩니다!

---

## 동작 방식

### 1. 겹침 감지
```typescript
// 두 일정이 시간적으로 겹치는지 확인
isOverlapping(range1, range2)
// start1 < end2 && start2 < end1
```

### 2. 그룹화
```typescript
// 겹치는 일정들을 하나의 그룹으로 묶음
groupOverlappingSchedules(schedules)
// 연쇄적 겹침도 하나의 그룹으로 처리
```

### 3. 컬럼 배치
```typescript
// 각 컬럼에 일정 배치
// 같은 컬럼의 일정들은 시간적으로 겹치지 않음
calculateOverlapLayout(group)
```

### 4. 레이아웃 계산
```typescript
// 2개 겹침: 49.75% + 0.5% 간격 + 49.75%
// 3개 겹침: 33% + 0.5% + 33% + 0.5% + 33%

const gapPercent = 0.5;
const columnCount = columns.length;
const totalGap = gapPercent * (columnCount - 1);
const availableWidth = 100 - totalGap;
const width = availableWidth / columnCount;
```

---

## 예시

### 2개 일정이 겹치는 경우

```
시간    일정
09:00   ┌─────────────┐ ┌─────────────┐
        │   영어      │ │             │
09:30   │             │ │   수학      │
        │             │ │             │
10:00   └─────────────┘ │             │
10:30                   └─────────────┘

→ 영어: width 49.75%, left 0%
→ 수학: width 49.75%, left 50.25%
```

### 3개 일정이 겹치는 경우

```
시간    일정
09:00   ┌────────┐ ┌────────┐ ┌────────┐
        │ 일정1  │ │        │ │        │
09:30   │        │ │ 일정2  │ │        │
        │        │ │        │ │        │
10:00   │        │ └────────┘ │ 일정3  │
        │        │             │        │
10:30   └────────┘             │        │
11:00                          └────────┘

→ 일정1: width 33%, left 0%
→ 일정2: width 33%, left 33.5%
→ 일정3: width 33%, left 67%
```

---

## 코드 구현

### overlapCalculation.ts

```typescript
export function calculateOverlapLayout<T extends ScheduleItem>(
  group: OverlapGroup<T>
): ScheduleLayout<T>[] {
  const { items, maxConcurrent } = group;

  if (maxConcurrent === 1) {
    return items.map((item) => ({
      item,
      position: { width: 100, left: 0 },
    }));
  }

  // 컬럼에 배치
  const columns: T[][] = [];
  for (const item of items) {
    let placed = false;
    
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const canPlace = column.every((existing) => 
        !isOverlapping(item, existing)
      );
      
      if (canPlace) {
        column.push(item);
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      columns.push([item]);
    }
  }

  // 간격을 고려한 레이아웃 계산
  const columnCount = columns.length;
  const gapPercent = 0.5; // 0.5% 간격
  const totalGap = gapPercent * (columnCount - 1);
  const availableWidth = 100 - totalGap;
  const width = availableWidth / columnCount;
  
  const layouts: ScheduleLayout<T>[] = [];

  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const column = columns[colIndex];
    
    for (const item of column) {
      layouts.push({
        item,
        position: {
          width,
          left: (width + gapPercent) * colIndex,
        },
      });
    }
  }

  return layouts;
}
```

### scheduleLayoutBuilder.ts

```typescript
// 겹치는 일정들은 같은 z-index 사용
const isOverlapping = position.width < 100;
const zIndex = isOverlapping ? 1 : schedule.zIndex || 0;
```

### CSS

```css
.block {
  position: absolute;
  /* width와 left가 %로 적용됨 */
}

.block:hover {
  z-index: 1000 !important; /* 호버 시 맨 위로 */
}
```

---

## 장점

### ✅ UX 개선
- 겹치는 모든 일정이 한눈에 보임
- 클릭하기 쉬움
- 시각적으로 명확함

### ✅ 간격
- 0.5% 간격으로 일정들 구분
- 시각적 분리 효과

### ✅ 호버 효과
- 호버 시 `z-index: 1000`으로 상승
- 전체 내용 확인 가능

---

## 테스트

### 단위 테스트
```bash
npm test
```

**결과**: 56/56 테스트 통과 ✅

### 테스트 케이스
- ✅ 겹치지 않는 일정: width 100%
- ✅ 2개 겹침: width 49.75% + 간격
- ✅ 3개 겹침: width 33% + 간격
- ✅ 복잡한 패턴 (연쇄적 겹침)
- ✅ 겹침 + 독립 일정 혼합

---

## 실제 예시

### 시나리오: 학습 일정

```
09:00 - 10:30  영어 (계획)
10:00 - 11:45  수학 (계획)
10:00 - 11:00  국어 (계획)
```

**렌더링**:
- 영어: 왼쪽 컬럼 (49.75%)
- 수학: 중간 컬럼 (33%)
- 국어: 오른쪽 컬럼 (33%)

모두 옆으로 나란히 배치되어 한눈에 확인 가능!

---

## 성능

### 시간 복잡도
- **그룹화**: O(n²) - 모든 일정 쌍 비교
- **컬럼 배치**: O(n × c) - n개 일정, c개 컬럼
- **전체**: O(n²) - 일반적으로 충분히 빠름

### 메모이제이션
```typescript
const { gridLines, scheduleBlocks } = useMemo(() => {
  return {
    gridLines: buildGridLines(...),
    scheduleBlocks: buildScheduleBlocks(...),
  };
}, [schedules, pixelsPerMinute]);
```

---

## 향후 개선

### 가능한 확장
- [ ] 간격 크기 조정 가능 (0.5% → 사용자 설정)
- [ ] 최대 컬럼 수 제한 (4개 이상은 탭으로 전환)
- [ ] 드래그로 일정 이동 시 자동 재배치
- [ ] 애니메이션 효과

---

## 참고

- [overlapCalculation.ts](./src/lib/layout/overlapCalculation.ts)
- [scheduleLayoutBuilder.ts](./src/lib/layout/scheduleLayoutBuilder.ts)
- [테스트 코드](./src/lib/layout/__tests__/)

