/**
 * 계획 완료 확인 모달
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { ScheduleWithRelations } from '@/types/schedule';
import { minutesToTimeString } from '@/lib/timeUtils';
import styles from './CompleteScheduleModal.module.css';

interface CompleteScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduleId: string) => Promise<void>;
  schedule: ScheduleWithRelations | null;
}

export function CompleteScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  schedule,
}: CompleteScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!schedule) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(schedule.id);
      onClose();
    } catch (error) {
      console.error('Failed to toggle schedule completion:', error);
      alert('일정 상태 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTime = minutesToTimeString(schedule.startTimeMinutes);
  const endTime = minutesToTimeString(schedule.endTimeMinutes);
  const isCompleted = schedule.completed;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isCompleted ? "완료 취소 확인" : "계획 완료 확인"}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          {isCompleted ? '↺' : '✓'}
        </div>
        
        <div className={styles.message}>
          <p className={styles.question}>
            {isCompleted 
              ? '이 계획을 미완료 상태로 되돌리시겠습니까?' 
              : '이 계획을 완료하셨나요?'}
          </p>
        </div>

        <div className={styles.scheduleInfo}>
          <div className={styles.scheduleTitle}>{schedule.title}</div>
          {schedule.description && (
            <div className={styles.scheduleDescription}>
              {schedule.description}
            </div>
          )}
          <div className={styles.scheduleTime}>
            {startTime} - {endTime}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? '처리 중...' 
              : isCompleted 
                ? '완료 취소' 
                : '완료 처리'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

