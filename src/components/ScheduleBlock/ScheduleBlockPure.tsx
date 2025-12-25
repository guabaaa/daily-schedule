/**
 * 순수 렌더링 일정 블록 컴포넌트
 * 계산된 레이아웃 정보만 받아서 렌더링
 */

import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import styles from './ScheduleBlock.module.css';

export interface ScheduleBlockProps {
  id: string;
  title: string;
  description?: string;
  backgroundColor: string;
  isPlan: boolean;
  isExecution: boolean;
  completed: boolean;
  zIndex: number;
  // 레이아웃 정보 (이미 계산된 값)
  top: number; // px
  height: number; // px
  width: number; // %
  left: number; // %
  // 핸들러
  onComplete?: (id: string) => void;
}

/**
 * 순수 렌더링 일정 블록
 * 모든 계산은 외부에서 수행되고, 이 컴포넌트는 렌더링만 담당
 */
export function ScheduleBlockPure({
  id,
  title,
  description,
  backgroundColor,
  isPlan,
  isExecution,
  completed,
  zIndex,
  top,
  height,
  width,
  left,
  onComplete,
}: ScheduleBlockProps) {
  const tooltipContent = `${title}${description ? `\n${description}` : ''}`;

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 계획인 경우 완료/미완료 토글 가능
    if (onComplete && isPlan) {
      onComplete(id);
    }
  };

  return (
    <Tooltip content={tooltipContent}>
      <div
        data-schedule-id={id}
        className={classNames(styles.block, {
          [styles.plan]: isPlan,
          [styles.execution]: isExecution,
          [styles.completed]: completed,
        })}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          width: `${width}%`,
          left: `${left}%`,
          backgroundColor,
          zIndex,
        }}
      >
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          {description && (
            <div className={styles.description}>{description}</div>
          )}
        </div>

        {/* 우측 상단 완료 표시 (계획인 경우만) */}
        {isPlan && onComplete && (
          <div
            className={classNames(styles.completeBadge, {
              [styles.completed]: completed,
              [styles.clickable]: true,
            })}
            onClick={handleCompleteClick}
            title={completed ? '완료 취소' : '완료 처리'}
          >
            {completed ? '✓' : '○'}
          </div>
        )}
      </div>
    </Tooltip>
  );
}

