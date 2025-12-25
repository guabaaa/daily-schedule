/**
 * Schedule 관련 타입 정의
 */

import { Schedule, ScheduleType, Category } from "@prisma/client";

// 계획과 실행을 함께 조회하는 확장 타입
export type ScheduleWithRelations = Schedule & {
  category: Category | null;
  plan: Schedule | null;
  executions: Schedule[];
};

// 계획-실행 페어 타입
export type PlanExecutionPair = {
  plan: ScheduleWithRelations;
  execution?: ScheduleWithRelations;
};

// 일정 생성 타입
export type CreateScheduleInput = {
  date: Date;
  startTimeMinutes: number;
  endTimeMinutes: number;
  type: ScheduleType;
  title: string;
  description?: string;
  categoryId?: string;
  customColor?: string;
  layer?: number;
  zIndex?: number;
  planId?: string; // 실행인 경우 연관된 계획 ID
};

// 일정 업데이트 타입
export type UpdateScheduleInput = Partial<CreateScheduleInput> & {
  id: string;
  completed?: boolean;
};

// 일정 필터 타입
export type ScheduleFilter = {
  date?: Date;
  dateRange?: {
    from: Date;
    to: Date;
  };
  type?: ScheduleType;
  categoryId?: string;
  completed?: boolean;
};

// 겹치는 일정 정보
export type OverlappingSchedule = {
  schedule: ScheduleWithRelations;
  overlaps: ScheduleWithRelations[];
  layer: number;
  width: number; // 화면에 표시할 너비 (%)
  left: number; // 화면에 표시할 왼쪽 위치 (%)
};

// 시간대별 일정 그룹
export type SchedulesByTimeSlot = {
  timeSlot: number; // 시작 시간 (분)
  schedules: ScheduleWithRelations[];
  hasOverlap: boolean;
};

// 날짜별 일정 통계
export type DailyScheduleStats = {
  date: Date;
  totalSchedules: number;
  plans: number;
  executions: number;
  completed: number;
  totalDuration: number; // 분 단위
  categories: {
    categoryId: string;
    categoryName: string;
    count: number;
    duration: number;
  }[];
};
