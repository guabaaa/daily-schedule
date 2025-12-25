/**
 * 일정 블록 컴포넌트
 */

import React from 'react';
import classNames from 'classnames';
import { ScheduleWithRelations } from '@/types/schedule';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import styles from './ScheduleBlock.module.css';

interface ScheduleBlockProps {
  schedule: ScheduleWithRelations;
  pixelsPerMinute: number;
  width?: number; // 퍼센트 (겹침 시 사용)
  left?: number; // 퍼센트 (겹침 시 사용)
  minHeight?: number; // 최소 높이 (px)
}

export function ScheduleBlock({
  schedule,
  pixelsPerMinute,
  width = 100,
  left = 0,
  minHeight = 60,
}: ScheduleBlockProps) {
  const duration = schedule.endTimeMinutes - schedule.startTimeMinutes;
  const height = Math.max(duration * pixelsPerMinute, minHeight);
  const top = schedule.startTimeMinutes * pixelsPerMinute;

  // 카테고리 색상 또는 커스텀 색상
  const backgroundColor =
    schedule.customColor || schedule.category?.color || '#868e96';

  // 타입에 따른 스타일
  const isPlan = schedule.type === 'PLAN';
  const isExecution = schedule.type === 'EXECUTION';

  // 툴팁 내용
  const tooltipContent = `${schedule.title}${
    schedule.description ? `\n${schedule.description}` : ''
  }`;

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={classNames(styles.block, {
          [styles.plan]: isPlan,
          [styles.execution]: isExecution,
          [styles.completed]: schedule.completed,
        })}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          width: `${width}%`,
          left: `${left}%`,
          backgroundColor,
          zIndex: schedule.zIndex,
        }}
      >
        <div className={styles.content}>
          <div className={styles.title}>{schedule.title}</div>
          {schedule.description && (
            <div className={styles.description}>{schedule.description}</div>
          )}
        </div>
        
        {schedule.completed && (
          <div className={styles.completedBadge}>✓</div>
        )}
      </div>
    </Tooltip>
  );
}

