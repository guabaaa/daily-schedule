/**
 * 현재 시각 표시 라인 컴포넌트
 */

import React from 'react';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { minutesToTimeString } from '@/lib/timeUtils';
import styles from './CurrentTimeLine.module.css';

interface CurrentTimeLineProps {
  pixelsPerMinute: number;
}

export function CurrentTimeLine({ pixelsPerMinute }: CurrentTimeLineProps) {
  const currentTimeMinutes = useCurrentTime();
  const top = currentTimeMinutes * pixelsPerMinute;

  return (
    <div className={styles.container} style={{ top: `${top}px` }}>
      <div className={styles.dot} />
      <div className={styles.line} />
      <div className={styles.timeLabel}>
        {minutesToTimeString(currentTimeMinutes)}
      </div>
    </div>
  );
}

