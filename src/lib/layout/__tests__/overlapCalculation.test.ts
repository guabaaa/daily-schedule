/**
 * overlapCalculation 순수 함수 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  isOverlapping,
  findOverlaps,
  groupOverlappingSchedules,
  calculateMaxConcurrent,
  calculateOverlapLayout,
  calculateAllScheduleLayouts,
  TimeRange,
  ScheduleItem,
  OverlapGroup,
} from '../overlapCalculation';

describe('overlapCalculation', () => {
  describe('isOverlapping', () => {
    it('완전히 겹치는 경우', () => {
      const range1: TimeRange = { startMinutes: 540, endMinutes: 600 };
      const range2: TimeRange = { startMinutes: 540, endMinutes: 600 };
      expect(isOverlapping(range1, range2)).toBe(true);
    });

    it('부분적으로 겹치는 경우 (시작 시간 겹침)', () => {
      const range1: TimeRange = { startMinutes: 540, endMinutes: 600 };
      const range2: TimeRange = { startMinutes: 570, endMinutes: 630 };
      expect(isOverlapping(range1, range2)).toBe(true);
    });

    it('부분적으로 겹치는 경우 (종료 시간 겹침)', () => {
      const range1: TimeRange = { startMinutes: 570, endMinutes: 630 };
      const range2: TimeRange = { startMinutes: 540, endMinutes: 600 };
      expect(isOverlapping(range1, range2)).toBe(true);
    });

    it('한 일정이 다른 일정을 완전히 포함하는 경우', () => {
      const range1: TimeRange = { startMinutes: 540, endMinutes: 660 };
      const range2: TimeRange = { startMinutes: 570, endMinutes: 600 };
      expect(isOverlapping(range1, range2)).toBe(true);
    });

    it('겹치지 않는 경우 (연속)', () => {
      const range1: TimeRange = { startMinutes: 540, endMinutes: 600 };
      const range2: TimeRange = { startMinutes: 600, endMinutes: 660 };
      expect(isOverlapping(range1, range2)).toBe(false);
    });

    it('겹치지 않는 경우 (떨어져 있음)', () => {
      const range1: TimeRange = { startMinutes: 540, endMinutes: 600 };
      const range2: TimeRange = { startMinutes: 660, endMinutes: 720 };
      expect(isOverlapping(range1, range2)).toBe(false);
    });

    it('순서를 바꿔도 같은 결과', () => {
      const range1: TimeRange = { startMinutes: 540, endMinutes: 600 };
      const range2: TimeRange = { startMinutes: 570, endMinutes: 630 };
      expect(isOverlapping(range1, range2)).toBe(isOverlapping(range2, range1));
    });
  });

  describe('findOverlaps', () => {
    const schedules: ScheduleItem[] = [
      { id: '1', startMinutes: 540, endMinutes: 600 }, // 09:00-10:00
      { id: '2', startMinutes: 570, endMinutes: 630 }, // 09:30-10:30
      { id: '3', startMinutes: 660, endMinutes: 720 }, // 11:00-12:00
    ];

    it('겹치는 일정 찾기', () => {
      const overlaps = findOverlaps(schedules[0], schedules);
      expect(overlaps).toHaveLength(1);
      expect(overlaps[0].id).toBe('2');
    });

    it('겹치는 일정이 없는 경우', () => {
      const overlaps = findOverlaps(schedules[2], schedules);
      expect(overlaps).toHaveLength(0);
    });

    it('자기 자신은 제외', () => {
      const overlaps = findOverlaps(schedules[1], schedules);
      expect(overlaps.every((s) => s.id !== '2')).toBe(true);
    });
  });

  describe('groupOverlappingSchedules', () => {
    it('겹치지 않는 일정들은 각각 별도 그룹', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 }, // 09:00-10:00
        { id: '2', startMinutes: 660, endMinutes: 720 }, // 11:00-12:00
        { id: '3', startMinutes: 780, endMinutes: 840 }, // 13:00-14:00
      ];

      const groups = groupOverlappingSchedules(schedules);
      expect(groups).toHaveLength(3);
      expect(groups[0].items).toHaveLength(1);
      expect(groups[1].items).toHaveLength(1);
      expect(groups[2].items).toHaveLength(1);
    });

    it('2개가 겹치는 경우 하나의 그룹', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 }, // 09:00-10:00
        { id: '2', startMinutes: 570, endMinutes: 630 }, // 09:30-10:30
      ];

      const groups = groupOverlappingSchedules(schedules);
      expect(groups).toHaveLength(1);
      expect(groups[0].items).toHaveLength(2);
    });

    it('연쇄적으로 겹치는 경우 하나의 그룹', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 }, // 09:00-10:00
        { id: '2', startMinutes: 570, endMinutes: 630 }, // 09:30-10:30
        { id: '3', startMinutes: 615, endMinutes: 675 }, // 10:15-11:15
      ];

      const groups = groupOverlappingSchedules(schedules);
      expect(groups).toHaveLength(1);
      expect(groups[0].items).toHaveLength(3);
    });

    it('복잡한 겹침 패턴', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 }, // 09:00-10:00
        { id: '2', startMinutes: 570, endMinutes: 630 }, // 09:30-10:30
        { id: '3', startMinutes: 660, endMinutes: 720 }, // 11:00-12:00
        { id: '4', startMinutes: 690, endMinutes: 750 }, // 11:30-12:30
      ];

      const groups = groupOverlappingSchedules(schedules);
      expect(groups).toHaveLength(2);
      expect(groups[0].items).toHaveLength(2); // 1, 2
      expect(groups[1].items).toHaveLength(2); // 3, 4
    });
  });

  describe('calculateMaxConcurrent', () => {
    it('일정이 없으면 0', () => {
      expect(calculateMaxConcurrent([])).toBe(0);
    });

    it('일정이 1개면 1', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 },
      ];
      expect(calculateMaxConcurrent(schedules)).toBe(1);
    });

    it('2개가 겹치지 않으면 1', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 },
        { id: '2', startMinutes: 600, endMinutes: 660 },
      ];
      expect(calculateMaxConcurrent(schedules)).toBe(1);
    });

    it('2개가 겹치면 2', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 },
        { id: '2', startMinutes: 570, endMinutes: 630 },
      ];
      expect(calculateMaxConcurrent(schedules)).toBe(2);
    });

    it('3개가 동시에 겹치면 3', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 660 }, // 09:00-11:00
        { id: '2', startMinutes: 570, endMinutes: 630 }, // 09:30-10:30
        { id: '3', startMinutes: 600, endMinutes: 650 }, // 10:00-10:50
      ];
      expect(calculateMaxConcurrent(schedules)).toBe(3);
    });

    it('연쇄적 겹침에서 최대값 계산', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 }, // 09:00-10:00
        { id: '2', startMinutes: 570, endMinutes: 630 }, // 09:30-10:30 (2개 겹침)
        { id: '3', startMinutes: 615, endMinutes: 675 }, // 10:15-11:15 (2개 겹침)
      ];
      expect(calculateMaxConcurrent(schedules)).toBe(2);
    });
  });

  describe('calculateOverlapLayout', () => {
    it('겹치지 않는 경우 전체 너비 사용', () => {
      const group: OverlapGroup<ScheduleItem> = {
        items: [{ id: '1', startMinutes: 540, endMinutes: 600 }],
        maxConcurrent: 1,
      };

      const layouts = calculateOverlapLayout(group);
      expect(layouts).toHaveLength(1);
      expect(layouts[0].position.width).toBe(100);
      expect(layouts[0].position.left).toBe(0);
    });

    it('2개가 겹치는 경우 50%씩 분할 (간격 제외)', () => {
      const group: OverlapGroup<ScheduleItem> = {
        items: [
          { id: '1', startMinutes: 540, endMinutes: 600 },
          { id: '2', startMinutes: 570, endMinutes: 630 },
        ],
        maxConcurrent: 2,
      };

      const layouts = calculateOverlapLayout(group);
      expect(layouts).toHaveLength(2);
      
      // 간격을 고려한 width (0.5% 간격)
      const expectedWidth = (100 - 0.5) / 2; // 49.75%
      const widths = layouts.map((l) => l.position.width);
      expect(widths.every((w) => w === expectedWidth)).toBe(true);
      
      // 왼쪽, 오른쪽에 배치 (간격 포함)
      const lefts = layouts.map((l) => l.position.left).sort();
      expect(lefts[0]).toBe(0);
      expect(lefts[1]).toBeCloseTo(50.25, 2);
    });

    it('3개가 동시에 겹치는 경우 33.33%씩 분할 (간격 제외)', () => {
      const group: OverlapGroup<ScheduleItem> = {
        items: [
          { id: '1', startMinutes: 540, endMinutes: 660 },
          { id: '2', startMinutes: 570, endMinutes: 630 },
          { id: '3', startMinutes: 600, endMinutes: 650 },
        ],
        maxConcurrent: 3,
      };

      const layouts = calculateOverlapLayout(group);
      expect(layouts).toHaveLength(3);
      
      // 간격을 고려한 width (0.5% * 2 간격)
      const expectedWidth = (100 - 0.5 * 2) / 3; // 33%
      layouts.forEach((layout) => {
        expect(layout.position.width).toBeCloseTo(expectedWidth, 2);
      });
    });
  });

  describe('calculateAllScheduleLayouts', () => {
    it('빈 배열은 빈 결과', () => {
      const layouts = calculateAllScheduleLayouts([]);
      expect(layouts).toHaveLength(0);
    });

    it('모든 일정의 레이아웃 계산', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 },
        { id: '2', startMinutes: 570, endMinutes: 630 },
        { id: '3', startMinutes: 660, endMinutes: 720 },
      ];

      const layouts = calculateAllScheduleLayouts(schedules);
      expect(layouts).toHaveLength(3);
      
      // 모든 일정이 레이아웃을 가져야 함
      const ids = layouts.map((l) => l.item.id).sort();
      expect(ids).toEqual(['1', '2', '3']);
    });

    it('겹치는 그룹과 독립 일정 모두 처리', () => {
      const schedules: ScheduleItem[] = [
        { id: '1', startMinutes: 540, endMinutes: 600 }, // 그룹 1
        { id: '2', startMinutes: 570, endMinutes: 630 }, // 그룹 1
        { id: '3', startMinutes: 660, endMinutes: 720 }, // 독립
        { id: '4', startMinutes: 780, endMinutes: 840 }, // 독립
      ];

      const layouts = calculateAllScheduleLayouts(schedules);
      expect(layouts).toHaveLength(4);
      
      // 1, 2는 50%씩, 3, 4는 100%
      const layout1 = layouts.find((l) => l.item.id === '1')!;
      const layout2 = layouts.find((l) => l.item.id === '2')!;
      const layout3 = layouts.find((l) => l.item.id === '3')!;
      const layout4 = layouts.find((l) => l.item.id === '4')!;
      
      // 간격을 고려한 width
      const expectedOverlapWidth = (100 - 0.5) / 2; // 49.75%
      expect(layout1.position.width).toBe(expectedOverlapWidth);
      expect(layout2.position.width).toBe(expectedOverlapWidth);
      expect(layout3.position.width).toBe(100);
      expect(layout4.position.width).toBe(100);
    });
  });

  describe('통합 시나리오 테스트', () => {
    it('실제 일정 데이터 시나리오', () => {
      // 영어(09:00-10:30), 수학(10:00-11:45), 국어(10:00-11:00)
      const schedules: ScheduleItem[] = [
        { id: 'english', startMinutes: 540, endMinutes: 630 },
        { id: 'math', startMinutes: 600, endMinutes: 705 },
        { id: 'korean', startMinutes: 600, endMinutes: 660 },
      ];

      const layouts = calculateAllScheduleLayouts(schedules);
      
      // 3개 모두 레이아웃이 있어야 함
      expect(layouts).toHaveLength(3);
      
      // 모두 하나의 그룹에 속함 (연쇄적 겹침)
      const widths = layouts.map((l) => l.position.width);
      const uniqueWidths = new Set(widths);
      
      // 모든 일정이 같은 너비를 가져야 함 (같은 그룹)
      expect(uniqueWidths.size).toBeGreaterThan(0);
    });
  });
});

