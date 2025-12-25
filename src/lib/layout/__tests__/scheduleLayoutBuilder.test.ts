/**
 * scheduleLayoutBuilder 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import { buildScheduleBlocks } from '../scheduleLayoutBuilder';
import { ScheduleWithRelations } from '@/types/schedule';

describe('scheduleLayoutBuilder', () => {
  describe('buildScheduleBlocks', () => {
    it('겹치지 않는 일정은 width 100%', () => {
      const schedules: ScheduleWithRelations[] = [
        {
          id: '1',
          date: new Date('2025-09-10'),
          startTimeMinutes: 540,
          endTimeMinutes: 600,
          type: 'PLAN',
          title: '영어',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 0,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const blocks = buildScheduleBlocks(schedules, 2, 60);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].width).toBe(100);
      expect(blocks[0].left).toBe(0);
      expect(blocks[0].zIndex).toBe(0);
    });

    it('겹치는 일정은 width가 분할되고 zIndex는 1로 통일', () => {
      const schedules: ScheduleWithRelations[] = [
        {
          id: '1',
          date: new Date('2025-09-10'),
          startTimeMinutes: 540,
          endTimeMinutes: 600,
          type: 'PLAN',
          title: '영어',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 5,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          date: new Date('2025-09-10'),
          startTimeMinutes: 570,
          endTimeMinutes: 630,
          type: 'PLAN',
          title: '수학',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 3,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const blocks = buildScheduleBlocks(schedules, 2, 60);

      expect(blocks).toHaveLength(2);
      
      // 간격을 고려한 width (49.75%)
      const expectedWidth = (100 - 0.5) / 2;
      expect(blocks[0].width).toBe(expectedWidth);
      expect(blocks[1].width).toBe(expectedWidth);
      
      // 겹치는 일정들은 zIndex가 1로 통일
      expect(blocks[0].zIndex).toBe(1);
      expect(blocks[1].zIndex).toBe(1);
      
      // left는 0과 50.25 (간격 포함)
      const lefts = blocks.map((b) => b.left).sort();
      expect(lefts[0]).toBe(0);
      expect(lefts[1]).toBeCloseTo(50.25, 2);
    });

    it('3개가 겹치면 각각 33.33% width', () => {
      const schedules: ScheduleWithRelations[] = [
        {
          id: '1',
          date: new Date('2025-09-10'),
          startTimeMinutes: 540,
          endTimeMinutes: 660,
          type: 'PLAN',
          title: '일정1',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 0,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          date: new Date('2025-09-10'),
          startTimeMinutes: 570,
          endTimeMinutes: 630,
          type: 'PLAN',
          title: '일정2',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 0,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          date: new Date('2025-09-10'),
          startTimeMinutes: 600,
          endTimeMinutes: 650,
          type: 'PLAN',
          title: '일정3',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 0,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const blocks = buildScheduleBlocks(schedules, 2, 60);

      expect(blocks).toHaveLength(3);
      
      // 간격을 고려한 width (33%)
      const expectedWidth = (100 - 0.5 * 2) / 3;
      blocks.forEach((block) => {
        expect(block.width).toBeCloseTo(expectedWidth, 2);
        expect(block.zIndex).toBe(1); // 겹치는 일정은 zIndex 1
      });
    });

    it('겹침 + 독립 일정 혼합', () => {
      const schedules: ScheduleWithRelations[] = [
        {
          id: '1',
          date: new Date('2025-09-10'),
          startTimeMinutes: 540,
          endTimeMinutes: 600,
          type: 'PLAN',
          title: '일정1',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 2,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          date: new Date('2025-09-10'),
          startTimeMinutes: 570,
          endTimeMinutes: 630,
          type: 'PLAN',
          title: '일정2',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 3,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          date: new Date('2025-09-10'),
          startTimeMinutes: 660,
          endTimeMinutes: 720,
          type: 'PLAN',
          title: '일정3',
          description: null,
          categoryId: null,
          category: null,
          customColor: null,
          layer: 0,
          zIndex: 1,
          planId: null,
          plan: null,
          executions: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const blocks = buildScheduleBlocks(schedules, 2, 60);

      expect(blocks).toHaveLength(3);
      
      // 일정1, 2는 겹침 (49.75%)
      const block1 = blocks.find((b) => b.id === '1')!;
      const block2 = blocks.find((b) => b.id === '2')!;
      const block3 = blocks.find((b) => b.id === '3')!;
      
      const expectedOverlapWidth = (100 - 0.5) / 2;
      expect(block1.width).toBe(expectedOverlapWidth);
      expect(block2.width).toBe(expectedOverlapWidth);
      expect(block3.width).toBe(100);
      
      // 겹치는 일정은 zIndex 1, 독립은 원래 zIndex
      expect(block1.zIndex).toBe(1);
      expect(block2.zIndex).toBe(1);
      expect(block3.zIndex).toBe(1); // 원래는 1이었으므로 그대로
    });
  });
});

