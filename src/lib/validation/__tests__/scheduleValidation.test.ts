/**
 * scheduleValidation 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  validateScheduleData,
  validateOverlapCount,
  validateDailyScheduleCount,
  SCHEDULE_CONSTRAINTS,
} from '../scheduleValidation';

describe('scheduleValidation', () => {
  describe('validateScheduleData', () => {
    it('유효한 데이터는 에러 없음', () => {
      const errors = validateScheduleData({
        title: '영어 공부',
        startTimeMinutes: 540,
        endTimeMinutes: 600,
        description: '토익 LC 연습',
      });

      expect(errors).toHaveLength(0);
    });

    it('제목이 없으면 에러', () => {
      const errors = validateScheduleData({
        title: '',
        startTimeMinutes: 540,
        endTimeMinutes: 600,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].field).toBe('title');
    });

    it('제목이 너무 길면 에러', () => {
      const longTitle = 'a'.repeat(SCHEDULE_CONSTRAINTS.MAX_TITLE_LENGTH + 1);
      const errors = validateScheduleData({
        title: longTitle,
        startTimeMinutes: 540,
        endTimeMinutes: 600,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].field).toBe('title');
    });

    it('설명이 너무 길면 에러', () => {
      const longDescription = 'a'.repeat(SCHEDULE_CONSTRAINTS.MAX_DESCRIPTION_LENGTH + 1);
      const errors = validateScheduleData({
        title: '영어',
        startTimeMinutes: 540,
        endTimeMinutes: 600,
        description: longDescription,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].field).toBe('description');
    });

    it('시작 시간 >= 종료 시간이면 에러', () => {
      const errors = validateScheduleData({
        title: '영어',
        startTimeMinutes: 600,
        endTimeMinutes: 540,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === 'time')).toBe(true);
    });

    it('최소 길이 미달이면 에러', () => {
      const errors = validateScheduleData({
        title: '영어',
        startTimeMinutes: 540,
        endTimeMinutes: 542, // 2분
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === 'time')).toBe(true);
    });
  });

  describe('validateOverlapCount', () => {
    it('겹치는 일정이 없으면 통과', () => {
      const result = validateOverlapCount(
        { startTimeMinutes: 540, endTimeMinutes: 600 },
        []
      );

      expect(result.valid).toBe(true);
      expect(result.overlapCount).toBe(1);
    });

    it('겹치는 일정이 4개까지는 통과 (자신 포함 5개)', () => {
      const existing = [
        { id: '1', startTimeMinutes: 540, endTimeMinutes: 600 },
        { id: '2', startTimeMinutes: 570, endTimeMinutes: 630 },
        { id: '3', startTimeMinutes: 580, endTimeMinutes: 640 },
        { id: '4', startTimeMinutes: 590, endTimeMinutes: 650 },
      ];

      const result = validateOverlapCount(
        { startTimeMinutes: 550, endTimeMinutes: 610 },
        existing
      );

      expect(result.valid).toBe(true);
      expect(result.overlapCount).toBe(5);
    });

    it('겹치는 일정이 5개 이상이면 실패', () => {
      const existing = [
        { id: '1', startTimeMinutes: 540, endTimeMinutes: 600 },
        { id: '2', startTimeMinutes: 570, endTimeMinutes: 630 },
        { id: '3', startTimeMinutes: 580, endTimeMinutes: 640 },
        { id: '4', startTimeMinutes: 590, endTimeMinutes: 650 },
        { id: '5', startTimeMinutes: 595, endTimeMinutes: 655 },
      ];

      const result = validateOverlapCount(
        { startTimeMinutes: 550, endTimeMinutes: 610 },
        existing
      );

      expect(result.valid).toBe(false);
      expect(result.overlapCount).toBe(6);
      expect(result.error).toContain('최대 5개');
    });

    it('excludeId로 자기 자신은 제외', () => {
      const existing = [
        { id: '1', startTimeMinutes: 540, endTimeMinutes: 600 },
        { id: '2', startTimeMinutes: 570, endTimeMinutes: 630 },
      ];

      const result = validateOverlapCount(
        { startTimeMinutes: 550, endTimeMinutes: 610 },
        existing,
        '1' // 자기 자신 제외
      );

      expect(result.valid).toBe(true);
      expect(result.overlapCount).toBe(2); // 자신 + 2번만
    });

    it('시간이 겹치지 않으면 카운트 안 됨', () => {
      const existing = [
        { id: '1', startTimeMinutes: 540, endTimeMinutes: 600 },
        { id: '2', startTimeMinutes: 660, endTimeMinutes: 720 },
      ];

      const result = validateOverlapCount(
        { startTimeMinutes: 600, endTimeMinutes: 660 },
        existing
      );

      expect(result.valid).toBe(true);
      expect(result.overlapCount).toBe(1); // 자신만
    });
  });

  describe('validateDailyScheduleCount', () => {
    it('제한 미만이면 통과', () => {
      const result = validateDailyScheduleCount(50, 100);
      expect(result.valid).toBe(true);
    });

    it('제한 도달하면 실패', () => {
      const result = validateDailyScheduleCount(100, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('최대 100개');
    });

    it('제한 초과하면 실패', () => {
      const result = validateDailyScheduleCount(150, 100);
      expect(result.valid).toBe(false);
    });
  });
});

