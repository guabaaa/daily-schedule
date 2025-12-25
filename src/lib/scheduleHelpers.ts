import {
  ScheduleWithRelations,
  OverlappingSchedule,
  PlanExecutionPair,
} from "@/types/schedule";
import { isTimeOverlapping } from "./timeUtils";

/**
 * 겹치는 일정 찾기
 * @param schedules - 일정 배열
 * @returns 겹치는 일정 정보 배열
 */
export function findOverlappingSchedules(
  schedules: ScheduleWithRelations[]
): OverlappingSchedule[] {
  const result: OverlappingSchedule[] = [];

  // 시작 시간순으로 정렬
  const sorted = [...schedules].sort(
    (a, b) => a.startTimeMinutes - b.startTimeMinutes
  );

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const overlaps: ScheduleWithRelations[] = [];

    // 현재 일정과 겹치는 모든 일정 찾기
    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;

      const other = sorted[j];
      if (
        isTimeOverlapping(
          current.startTimeMinutes,
          current.endTimeMinutes,
          other.startTimeMinutes,
          other.endTimeMinutes
        )
      ) {
        overlaps.push(other);
      }
    }

    result.push({
      schedule: current,
      overlaps,
      layer: current.layer,
      width: 100, // 기본값, 레이아웃 계산 시 업데이트됨
      left: 0, // 기본값, 레이아웃 계산 시 업데이트됨
    });
  }

  return result;
}

/**
 * 겹치는 일정의 레이아웃 계산 (너비와 위치)
 * @param overlappingSchedules - 겹치는 일정 정보 배열
 * @returns 레이아웃이 계산된 일정 배열
 */
export function calculateOverlapLayout(
  overlappingSchedules: OverlappingSchedule[]
): OverlappingSchedule[] {
  const result = [...overlappingSchedules];

  // 겹치는 그룹 찾기
  const groups: OverlappingSchedule[][] = [];
  const processed = new Set<string>();

  for (const item of result) {
    if (processed.has(item.schedule.id)) continue;

    const group = [item];
    processed.add(item.schedule.id);

    // 현재 일정과 겹치는 모든 일정을 그룹에 추가
    for (const overlap of item.overlaps) {
      const overlappingItem = result.find((r) => r.schedule.id === overlap.id);
      if (overlappingItem && !processed.has(overlappingItem.schedule.id)) {
        group.push(overlappingItem);
        processed.add(overlappingItem.schedule.id);
      }
    }

    groups.push(group);
  }

  // 각 그룹의 레이아웃 계산
  for (const group of groups) {
    const count = group.length;
    const width = 100 / count;

    group.forEach((item, index) => {
      item.width = width;
      item.left = width * index;
    });
  }

  return result;
}

/**
 * 계획과 실행을 페어링
 * @param schedules - 일정 배열
 * @returns 계획-실행 페어 배열
 */
export function pairPlanWithExecution(
  schedules: ScheduleWithRelations[]
): PlanExecutionPair[] {
  const plans = schedules.filter((s) => s.type === "PLAN");
  const executions = schedules.filter((s) => s.type === "EXECUTION");

  const pairs: PlanExecutionPair[] = [];

  for (const plan of plans) {
    const execution = executions.find((e) => e.planId === plan.id);
    pairs.push({
      plan,
      execution,
    });
  }

  return pairs;
}

/**
 * 시간대별로 일정 그룹화
 * @param schedules - 일정 배열
 * @param intervalMinutes - 시간 간격 (분, 기본: 60분)
 * @returns 시간대별 일정 맵
 */
export function groupSchedulesByTimeSlot(
  schedules: ScheduleWithRelations[],
  intervalMinutes: number = 60
): Map<number, ScheduleWithRelations[]> {
  const groups = new Map<number, ScheduleWithRelations[]>();

  for (const schedule of schedules) {
    const slot =
      Math.floor(schedule.startTimeMinutes / intervalMinutes) * intervalMinutes;

    if (!groups.has(slot)) {
      groups.set(slot, []);
    }

    groups.get(slot)!.push(schedule);
  }

  return groups;
}

/**
 * 카테고리별 총 시간 계산
 * @param schedules - 일정 배열
 * @returns 카테고리별 시간 (분)
 */
export function calculateCategoryDurations(
  schedules: ScheduleWithRelations[]
): Map<string, number> {
  const durations = new Map<string, number>();

  for (const schedule of schedules) {
    const categoryId = schedule.categoryId || "uncategorized";
    const duration = schedule.endTimeMinutes - schedule.startTimeMinutes;

    const current = durations.get(categoryId) || 0;
    durations.set(categoryId, current + duration);
  }

  return durations;
}

/**
 * 일정이 현재 시간에 진행 중인지 확인
 * @param schedule - 일정
 * @param currentTimeMinutes - 현재 시간 (분)
 * @returns 진행 중이면 true
 */
export function isScheduleActive(
  schedule: ScheduleWithRelations,
  currentTimeMinutes: number
): boolean {
  return (
    schedule.startTimeMinutes <= currentTimeMinutes &&
    currentTimeMinutes < schedule.endTimeMinutes
  );
}

/**
 * 일정의 진행률 계산
 * @param schedule - 일정
 * @param currentTimeMinutes - 현재 시간 (분)
 * @returns 진행률 (0~100)
 */
export function calculateScheduleProgress(
  schedule: ScheduleWithRelations,
  currentTimeMinutes: number
): number {
  if (currentTimeMinutes < schedule.startTimeMinutes) return 0;
  if (currentTimeMinutes >= schedule.endTimeMinutes) return 100;

  const total = schedule.endTimeMinutes - schedule.startTimeMinutes;
  const elapsed = currentTimeMinutes - schedule.startTimeMinutes;

  return Math.round((elapsed / total) * 100);
}
