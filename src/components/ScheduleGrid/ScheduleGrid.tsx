/**
 * 스케줄 그리드 메인 컴포넌트
 */

import React, { useRef } from 'react';
import { TimeAxis } from '@/components/TimeAxis/TimeAxis';
import { ScheduleBlock } from '@/components/ScheduleBlock/ScheduleBlock';
import { CurrentTimeLine } from '@/components/CurrentTimeLine/CurrentTimeLine';
import { ScheduleWithRelations } from '@/types/schedule';
import { generateTimeGrid } from '@/lib/timeUtils';
import { findOverlappingSchedules, calculateOverlapLayout } from '@/lib/scheduleHelpers';
import styles from './ScheduleGrid.module.css';

interface ScheduleGridProps {
  schedules: ScheduleWithRelations[];
  date: Date;
  pixelsPerMinute?: number; // 1분당 픽셀 (기본: 1)
  intervalMinutes?: number; // 그리드 간격 (기본: 60분)
  minBlockHeight?: number; // 최소 블록 높이 (기본: 60px)
  showCurrentTime?: boolean; // 현재 시각 표시 (기본: true)
}

export function ScheduleGrid({
  schedules,
  date,
  pixelsPerMinute = 1,
  intervalMinutes = 60,
  minBlockHeight = 60,
  showCurrentTime = true,
}: ScheduleGridProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timeAxisRef = useRef<HTMLDivElement>(null);

  const timeGrid = generateTimeGrid(intervalMinutes);
  const height = 24 * 60 * pixelsPerMinute; // 24시간

  // 겹침 처리
  const overlappingSchedules = findOverlappingSchedules(schedules);
  const layoutedSchedules = calculateOverlapLayout(overlappingSchedules);

  // 스크롤 동기화
  const handleScroll = () => {
    if (timeAxisRef.current && timelineRef.current) {
      timeAxisRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  };

  return (
    <div className={styles.container}>
      {/* 시간축 */}
      <TimeAxis
        intervalMinutes={intervalMinutes}
        pixelsPerMinute={pixelsPerMinute}
        scrollRef={timeAxisRef}
      />

      {/* 타임라인 */}
      <div
        className={styles.timeline}
        ref={timelineRef}
        onScroll={handleScroll}
      >
        <div className={styles.grid} style={{ height: `${height}px` }}>
          {/* 배경 그리드 라인 */}
          {timeGrid.map((minutes) => {
            const top = minutes * pixelsPerMinute;
            const isHour = minutes % 60 === 0;
            
            return (
              <div
                key={minutes}
                className={
                  isHour ? styles.gridLineHour : styles.gridLineHalf
                }
                style={{ top: `${top}px` }}
              />
            );
          })}

          {/* 현재 시각 라인 */}
          {showCurrentTime && (
            <CurrentTimeLine pixelsPerMinute={pixelsPerMinute} />
          )}

          {/* 일정 블록들 */}
          <div className={styles.schedules}>
            {layoutedSchedules.map((item) => (
              <ScheduleBlock
                key={item.schedule.id}
                schedule={item.schedule}
                pixelsPerMinute={pixelsPerMinute}
                width={item.width}
                left={item.left}
                minHeight={minBlockHeight}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

