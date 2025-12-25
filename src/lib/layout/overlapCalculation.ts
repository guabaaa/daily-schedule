/**
 * 일정 겹침 계산 순수 함수
 */

export interface TimeRange {
  startMinutes: number;
  endMinutes: number;
}

export interface ScheduleItem extends TimeRange {
  id: string;
  layer?: number;
  zIndex?: number;
}

export interface OverlapGroup<T extends ScheduleItem> {
  items: T[];
  maxConcurrent: number; // 최대 동시 겹침 수
}

export interface LayoutPosition {
  width: number; // 퍼센트 (0~100)
  left: number; // 퍼센트 (0~100)
}

export interface ScheduleLayout<T extends ScheduleItem> {
  item: T;
  position: LayoutPosition;
}

/**
 * 두 시간 범위가 겹치는지 확인
 * @param range1 - 첫 번째 시간 범위
 * @param range2 - 두 번째 시간 범위
 * @returns 겹치면 true
 */
export function isOverlapping(range1: TimeRange, range2: TimeRange): boolean {
  return range1.startMinutes < range2.endMinutes && 
         range2.startMinutes < range1.endMinutes;
}

/**
 * 특정 일정과 겹치는 모든 일정 찾기
 * @param target - 대상 일정
 * @param schedules - 전체 일정 배열
 * @returns 겹치는 일정 배열
 */
export function findOverlaps<T extends ScheduleItem>(
  target: T,
  schedules: T[]
): T[] {
  return schedules.filter(
    (schedule) => schedule.id !== target.id && isOverlapping(target, schedule)
  );
}

/**
 * 일정 배열을 겹치는 그룹으로 분류
 * @param schedules - 일정 배열
 * @returns 겹치는 그룹 배열
 */
export function groupOverlappingSchedules<T extends ScheduleItem>(
  schedules: T[]
): OverlapGroup<T>[] {
  const sorted = [...schedules].sort(
    (a, b) => a.startMinutes - b.startMinutes
  );
  
  const groups: OverlapGroup<T>[] = [];
  const processed = new Set<string>();

  for (const schedule of sorted) {
    if (processed.has(schedule.id)) continue;

    const group: T[] = [schedule];
    processed.add(schedule.id);

    // 현재 일정과 겹치는 모든 일정 찾기 (재귀적으로)
    const findConnectedSchedules = (current: T) => {
      const overlaps = findOverlaps(current, sorted);
      
      for (const overlap of overlaps) {
        if (!processed.has(overlap.id)) {
          group.push(overlap);
          processed.add(overlap.id);
          findConnectedSchedules(overlap); // 재귀
        }
      }
    };

    findConnectedSchedules(schedule);

    // 최대 동시 겹침 수 계산
    const maxConcurrent = calculateMaxConcurrent(group);

    groups.push({
      items: group,
      maxConcurrent,
    });
  }

  return groups;
}

/**
 * 그룹 내 최대 동시 겹침 수 계산
 * @param schedules - 일정 배열
 * @returns 최대 동시 겹침 수
 */
export function calculateMaxConcurrent<T extends ScheduleItem>(
  schedules: T[]
): number {
  if (schedules.length === 0) return 0;
  if (schedules.length === 1) return 1;

  // 모든 시작/종료 이벤트를 수집
  const events: Array<{ time: number; type: 'start' | 'end' }> = [];
  
  for (const schedule of schedules) {
    events.push({ time: schedule.startMinutes, type: 'start' });
    events.push({ time: schedule.endMinutes, type: 'end' });
  }

  // 시간순 정렬 (같은 시간이면 end가 start보다 먼저)
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return a.type === 'end' ? -1 : 1;
  });

  let maxConcurrent = 0;
  let currentConcurrent = 0;

  for (const event of events) {
    if (event.type === 'start') {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
    } else {
      currentConcurrent--;
    }
  }

  return maxConcurrent;
}

/**
 * 겹치는 일정들의 레이아웃 위치 계산
 * @param group - 겹치는 일정 그룹
 * @returns 각 일정의 레이아웃 위치
 */
export function calculateOverlapLayout<T extends ScheduleItem>(
  group: OverlapGroup<T>
): ScheduleLayout<T>[] {
  const { items, maxConcurrent } = group;

  if (maxConcurrent === 1) {
    // 겹치지 않는 경우
    return items.map((item) => ({
      item,
      position: { width: 100, left: 0 },
    }));
  }

  // 각 컬럼에 일정 배치
  const columns: T[][] = [];
  
  for (const item of items) {
    // 배치 가능한 첫 번째 컬럼 찾기
    let placed = false;
    
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const canPlace = column.every((existing) => !isOverlapping(item, existing));
      
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

  // 레이아웃 계산 (간격을 위해 약간 조정)
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

/**
 * 모든 일정의 레이아웃 계산 (메인 함수)
 * @param schedules - 일정 배열
 * @returns 각 일정의 레이아웃 위치
 */
export function calculateAllScheduleLayouts<T extends ScheduleItem>(
  schedules: T[]
): ScheduleLayout<T>[] {
  const groups = groupOverlappingSchedules(schedules);
  
  const allLayouts: ScheduleLayout<T>[] = [];
  
  for (const group of groups) {
    const layouts = calculateOverlapLayout(group);
    allLayouts.push(...layouts);
  }
  
  return allLayouts;
}

