/**
 * 시간축 컴포넌트
 */

import React, { RefObject } from 'react';
import { generateTimeGrid, minutesToTimeString } from '@/lib/timeUtils';
import styles from './TimeAxis.module.css';

interface TimeAxisProps {
  intervalMinutes?: number; // 시간 간격 (기본: 60분)
  pixelsPerMinute?: number; // 1분당 픽셀 (기본: 1)
  scrollRef?: RefObject<HTMLDivElement>;
}

export function TimeAxis({
  intervalMinutes = 60,
  pixelsPerMinute = 1,
  scrollRef,
}: TimeAxisProps) {
  const timeGrid = generateTimeGrid(intervalMinutes);
  const height = 24 * 60 * pixelsPerMinute; // 24시간
  
  // 24시(다음날 00시) 추가
  const extendedTimeGrid = [...timeGrid, 24 * 60]; // 1440 (24:00)

  return (
    <div className={styles.container} ref={scrollRef}>
      <div className={styles.inner} style={{ height: `${height}px` }}>
        {extendedTimeGrid.map((minutes) => {
          const top = minutes * pixelsPerMinute;
          const displayTime = minutes === 1440 ? '24:00' : minutesToTimeString(minutes);
          
          return (
            <div
              key={minutes}
              className={styles.timeLabel}
              style={{ top: `${top}px` }}
            >
              <span className={styles.timeText}>
                {displayTime}
              </span>
              <div className={styles.timeLine} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

