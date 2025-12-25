/**
 * 순수 렌더링 스케줄 그리드 컴포넌트
 * 계산 로직은 분리되어 있고, 렌더링만 담당
 */

import React, { useRef } from 'react';
import { TimeAxis } from '@/components/TimeAxis/TimeAxis';
import { ScheduleBlockPure, ScheduleBlockProps } from '@/components/ScheduleBlock/ScheduleBlockPure';
import { CurrentTimeLine } from '@/components/CurrentTimeLine/CurrentTimeLine';
import styles from './ScheduleGrid.module.css';

export interface GridLineProps {
  top: number; // px
  isHour: boolean;
}

export interface ScheduleGridPureProps {
  // 그리드 설정
  totalHeight: number; // px
  pixelsPerMinute: number;
  intervalMinutes: number;
  
  // 그리드 라인 (이미 계산된 값)
  gridLines: GridLineProps[];
  
  // 일정 블록 (이미 계산된 레이아웃)
  scheduleBlocks: ScheduleBlockProps[];
  
  // 현재 시각 표시 여부
  showCurrentTime?: boolean;
}

/**
 * 순수 렌더링 스케줄 그리드
 * 모든 계산은 외부에서 수행되고, 이 컴포넌트는 렌더링만 담당
 */
export function ScheduleGridPure({
  totalHeight,
  pixelsPerMinute,
  intervalMinutes,
  gridLines,
  scheduleBlocks,
  showCurrentTime = true,
}: ScheduleGridPureProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timeAxisRef = useRef<HTMLDivElement>(null);

  // 스크롤 동기화
  const handleScroll = () => {
    if (timeAxisRef.current && timelineRef.current) {
      timeAxisRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  };

  // 24시(1440분) 그리드 라인 추가
  const extendedGridLines = [
    ...gridLines,
    { top: 24 * 60 * pixelsPerMinute, isHour: true }
  ];

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
        <div className={styles.grid} style={{ height: `${totalHeight}px` }}>
          {/* 배경 그리드 라인 (24:00 포함) */}
          {extendedGridLines.map((line, index) => (
            <div
              key={index}
              className={
                line.isHour ? styles.gridLineHour : styles.gridLineHalf
              }
              style={{ top: `${line.top}px` }}
            />
          ))}

          {/* 현재 시각 라인 */}
          {showCurrentTime && (
            <CurrentTimeLine pixelsPerMinute={pixelsPerMinute} />
          )}

          {/* 일정 블록들 */}
          <div className={styles.schedules}>
            {scheduleBlocks.map((block) => (
              <ScheduleBlockPure key={block.id} {...block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

