/**
 * 일정 유효성 검증 및 비즈니스 규칙
 */

import { isValidTimeRange } from '../timeUtils';

export const SCHEDULE_CONSTRAINTS = {
  MAX_OVERLAPPING_SCHEDULES: 5, // 최대 겹침 수
  MIN_DURATION_MINUTES: 5, // 최소 일정 길이 (5분)
  MAX_DURATION_MINUTES: 24 * 60, // 최대 일정 길이 (24시간)
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

export interface ScheduleValidationError {
  field: string;
  message: string;
}

/**
 * 일정 기본 유효성 검증
 */
export function validateScheduleData(data: {
  title: string;
  startTimeMinutes: number;
  endTimeMinutes: number;
  description?: string;
}): ScheduleValidationError[] {
  const errors: ScheduleValidationError[] = [];

  // 제목 검증
  if (!data.title || data.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: '제목은 필수입니다.',
    });
  } else if (data.title.length > SCHEDULE_CONSTRAINTS.MAX_TITLE_LENGTH) {
    errors.push({
      field: 'title',
      message: `제목은 최대 ${SCHEDULE_CONSTRAINTS.MAX_TITLE_LENGTH}자까지 가능합니다.`,
    });
  }

  // 설명 검증
  if (data.description && data.description.length > SCHEDULE_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: `설명은 최대 ${SCHEDULE_CONSTRAINTS.MAX_DESCRIPTION_LENGTH}자까지 가능합니다.`,
    });
  }

  // 시간 범위 검증
  if (!isValidTimeRange(data.startTimeMinutes, data.endTimeMinutes)) {
    errors.push({
      field: 'time',
      message: '시작 시간은 종료 시간보다 빨라야 합니다.',
    });
  }

  // 최소 길이 검증
  const duration = data.endTimeMinutes - data.startTimeMinutes;
  if (duration < SCHEDULE_CONSTRAINTS.MIN_DURATION_MINUTES) {
    errors.push({
      field: 'time',
      message: `일정은 최소 ${SCHEDULE_CONSTRAINTS.MIN_DURATION_MINUTES}분 이상이어야 합니다.`,
    });
  }

  // 최대 길이 검증
  if (duration > SCHEDULE_CONSTRAINTS.MAX_DURATION_MINUTES) {
    errors.push({
      field: 'time',
      message: `일정은 최대 ${SCHEDULE_CONSTRAINTS.MAX_DURATION_MINUTES / 60}시간까지 가능합니다.`,
    });
  }

  return errors;
}

/**
 * 겹침 수 검증
 */
export function validateOverlapCount(
  newSchedule: {
    startTimeMinutes: number;
    endTimeMinutes: number;
  },
  existingSchedules: Array<{
    id: string;
    startTimeMinutes: number;
    endTimeMinutes: number;
  }>,
  excludeId?: string
): { valid: boolean; overlapCount: number; error?: string } {
  // 겹치는 일정 찾기
  const overlapping = existingSchedules.filter((existing) => {
    if (excludeId && existing.id === excludeId) return false;

    return (
      newSchedule.startTimeMinutes < existing.endTimeMinutes &&
      existing.startTimeMinutes < newSchedule.endTimeMinutes
    );
  });

  const overlapCount = overlapping.length + 1; // 자기 자신 포함

  if (overlapCount > SCHEDULE_CONSTRAINTS.MAX_OVERLAPPING_SCHEDULES) {
    return {
      valid: false,
      overlapCount,
      error: `최대 ${SCHEDULE_CONSTRAINTS.MAX_OVERLAPPING_SCHEDULES}개까지만 겹칠 수 있습니다. 현재 ${overlapCount}개가 겹칩니다.`,
    };
  }

  return {
    valid: true,
    overlapCount,
  };
}

/**
 * 날짜별 일정 수 제한 검증
 */
export function validateDailyScheduleCount(
  currentCount: number,
  maxCount: number = 100
): { valid: boolean; error?: string } {
  if (currentCount >= maxCount) {
    return {
      valid: false,
      error: `하루 최대 ${maxCount}개까지 일정을 추가할 수 있습니다.`,
    };
  }

  return { valid: true };
}

