/**
 * 스케줄 레이아웃 빌더
 * 순수 함수로 구성된 레이아웃 계산 로직
 */

import { ScheduleWithRelations } from '@/types/schedule';
import { ScheduleBlockProps } from '@/components/ScheduleBlock/ScheduleBlockPure';
import { GridLineProps } from '@/components/ScheduleGrid/ScheduleGridPure';
import {
  timeToPixel,
  calculateBlockHeight,
  TimeToPixelConfig,
} from './timeToPixel';
import {
  calculateAllScheduleLayouts,
  ScheduleItem,
} from './overlapCalculation';
import { generateTimeGrid } from '../timeUtils';

/**
 * 일정을 ScheduleItem으로 변환
 */
function toScheduleItem(schedule: ScheduleWithRelations): ScheduleItem {
  return {
    id: schedule.id,
    startMinutes: schedule.startTimeMinutes,
    endMinutes: schedule.endTimeMinutes,
    layer: schedule.layer,
    zIndex: schedule.zIndex,
  };
}

/**
 * 그리드 라인 생성
 */
export function buildGridLines(
  intervalMinutes: number,
  pixelsPerMinute: number
): GridLineProps[] {
  const timeGrid = generateTimeGrid(intervalMinutes);
  const config: TimeToPixelConfig = { pixelsPerMinute };

  return timeGrid.map((minutes) => ({
    top: timeToPixel(minutes, config),
    isHour: minutes % 60 === 0,
  }));
}

/**
 * 일정 블록 Props 생성
 */
export function buildScheduleBlocks(
  schedules: ScheduleWithRelations[],
  pixelsPerMinute: number,
  minBlockHeight: number
): ScheduleBlockProps[] {
  const config: TimeToPixelConfig = { pixelsPerMinute };

  // 1. 일정을 ScheduleItem으로 변환
  const items = schedules.map(toScheduleItem);

  // 2. 겹침 레이아웃 계산
  const layouts = calculateAllScheduleLayouts(items);

  // 3. 레이아웃 맵 생성
  const layoutMap = new Map(
    layouts.map((layout) => [layout.item.id, layout.position])
  );

  // 4. 최종 Props 생성
  return schedules.map((schedule) => {
    const position = layoutMap.get(schedule.id) || { width: 100, left: 0 };

    const top = timeToPixel(schedule.startTimeMinutes, config);
    const height = calculateBlockHeight(
      schedule.startTimeMinutes,
      schedule.endTimeMinutes,
      config,
      minBlockHeight
    );

    const backgroundColor =
      schedule.customColor || schedule.category?.color || '#868e96';

    // 겹치는 일정들은 같은 z-index 사용 (옆으로 나란히 배치)
    // width가 100%가 아니면 겹치는 것으로 판단
    const isOverlapping = position.width < 100;
    const zIndex = isOverlapping ? 1 : schedule.zIndex || 0;

    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description || undefined,
      backgroundColor,
      isPlan: schedule.type === 'PLAN',
      isExecution: schedule.type === 'EXECUTION',
      completed: schedule.completed,
      zIndex,
      top,
      height,
      width: position.width,
      left: position.left,
    };
  });
}

/**
 * 전체 그리드 높이 계산
 */
export function calculateTotalHeight(pixelsPerMinute: number): number {
  return 24 * 60 * pixelsPerMinute; // 24시간
}

