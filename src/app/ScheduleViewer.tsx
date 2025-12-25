/**
 * 스케줄 뷰어 클라이언트 컴포넌트
 * 레이아웃 계산 + 순수 렌더링 컴포넌트 사용
 */

'use client';

import React, { useMemo } from 'react';
import { ScheduleGridPure } from '@/components/ScheduleGrid/ScheduleGridPure';
import { ScheduleWithRelations } from '@/types/schedule';
import {
  buildGridLines,
  buildScheduleBlocks,
  calculateTotalHeight,
} from '@/lib/layout/scheduleLayoutBuilder';

interface ScheduleViewerProps {
  schedules: ScheduleWithRelations[];
  date: Date;
}

export function ScheduleViewer({ schedules, date }: ScheduleViewerProps) {
  const pixelsPerMinute = 2;
  const intervalMinutes = 60;
  const minBlockHeight = 60;

  // 레이아웃 계산 (메모이제이션)
  const { totalHeight, gridLines, scheduleBlocks } = useMemo(() => {
    return {
      totalHeight: calculateTotalHeight(pixelsPerMinute),
      gridLines: buildGridLines(intervalMinutes, pixelsPerMinute),
      scheduleBlocks: buildScheduleBlocks(
        schedules,
        pixelsPerMinute,
        minBlockHeight
      ),
    };
  }, [schedules, pixelsPerMinute, intervalMinutes, minBlockHeight]);

  // 순수 렌더링 컴포넌트에 전달
  return (
    <ScheduleGridPure
      totalHeight={totalHeight}
      pixelsPerMinute={pixelsPerMinute}
      intervalMinutes={intervalMinutes}
      gridLines={gridLines}
      scheduleBlocks={scheduleBlocks}
      showCurrentTime={true}
    />
  );
}
