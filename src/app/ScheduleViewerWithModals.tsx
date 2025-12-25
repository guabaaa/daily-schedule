/**
 * 스케줄 뷰어 + 모달 통합 컴포넌트
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScheduleGridPure } from '@/components/ScheduleGrid/ScheduleGridPure';
import { AddScheduleModal, AddScheduleData } from '@/components/AddScheduleModal';
import { CompleteScheduleModal } from '@/components/CompleteScheduleModal';
import { ScheduleWithRelations } from '@/types/schedule';
import {
  buildGridLines,
  buildScheduleBlocks,
  calculateTotalHeight,
} from '@/lib/layout/scheduleLayoutBuilder';
import { formatDate } from '@/lib/timeUtils';
import styles from './ScheduleViewerWithModals.module.css';

interface ScheduleViewerWithModalsProps {
  schedules: ScheduleWithRelations[];
  date: Date;
}

export function ScheduleViewerWithModals({
  schedules,
  date,
}: ScheduleViewerWithModalsProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithRelations | null>(null);

  const pixelsPerMinute = 2;
  const intervalMinutes = 60;
  const minBlockHeight = 60;

  // 레이아웃 계산 (메모이제이션)
  const { totalHeight, gridLines, scheduleBlocks } = useMemo(() => {
    const blocks = buildScheduleBlocks(schedules, pixelsPerMinute, minBlockHeight);
    
    // 디버깅: 레이아웃 확인
    console.log('Schedules:', JSON.stringify(schedules.map(s => ({
      id: s.id.slice(0, 8),
      title: s.title,
      start: s.startTimeMinutes,
      end: s.endTimeMinutes,
      layer: s.layer,
    })), null, 2));
    console.log('Blocks:', JSON.stringify(blocks.map(b => ({
      id: b.id.slice(0, 8),
      title: b.title,
      width: b.width,
      left: b.left,
      zIndex: b.zIndex,
    })), null, 2));
    
    // onComplete 핸들러 추가
    const blocksWithHandlers = blocks.map((block) => ({
      ...block,
      onComplete: (id: string) => {
        const schedule = schedules.find((s) => s.id === id);
        if (schedule) {
          setSelectedSchedule(schedule);
          setIsCompleteModalOpen(true);
        }
      },
    }));

    return {
      totalHeight: calculateTotalHeight(pixelsPerMinute),
      gridLines: buildGridLines(intervalMinutes, pixelsPerMinute),
      scheduleBlocks: blocksWithHandlers,
    };
  }, [schedules, pixelsPerMinute, intervalMinutes, minBlockHeight]);

  // 계획 추가
  const handleAddSchedule = async (data: AddScheduleData) => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: formatDate(date),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 겹침 수 초과 에러 처리
        if (errorData.overlapCount) {
          throw new Error(errorData.error || '일정 추가에 실패했습니다.');
        }
        
        throw new Error('Failed to add schedule');
      }

      // 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error('Failed to add schedule:', error);
      throw error;
    }
  };

  // 계획 완료/취소 토글
  const handleCompleteSchedule = async (scheduleId: string) => {
    try {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      // 현재 상태의 반대로 토글
      const newCompletedState = !schedule.completed;

      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: newCompletedState,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle schedule completion');
      }

      // 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle schedule completion:', error);
      throw error;
    }
  };

  return (
    <>
      {/* 추가 버튼 */}
      <button
        className={styles.floatingButton}
        onClick={() => setIsAddModalOpen(true)}
        title="계획 추가"
      >
        +
      </button>

      {/* 그리드 */}
      <ScheduleGridPure
        totalHeight={totalHeight}
        pixelsPerMinute={pixelsPerMinute}
        intervalMinutes={intervalMinutes}
        gridLines={gridLines}
        scheduleBlocks={scheduleBlocks}
        showCurrentTime={true}
      />

      {/* 추가 모달 */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSchedule}
        date={date}
      />

      {/* 완료 모달 */}
      <CompleteScheduleModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedSchedule(null);
        }}
        onConfirm={handleCompleteSchedule}
        schedule={selectedSchedule}
      />
    </>
  );
}

