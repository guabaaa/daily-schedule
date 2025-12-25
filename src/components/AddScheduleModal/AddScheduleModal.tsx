/**
 * 계획 추가 모달
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { minutesToTimeString, timeStringToMinutes } from '@/lib/timeUtils';
import styles from './AddScheduleModal.module.css';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddScheduleData) => Promise<void>;
  date: Date;
}

export interface AddScheduleData {
  title: string;
  description: string;
  startTimeMinutes: number;
  endTimeMinutes: number;
  type: 'PLAN' | 'EXECUTION';
  categoryId?: string;
}

export function AddScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  date,
}: AddScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [scheduleType, setScheduleType] = useState<'PLAN' | 'EXECUTION'>('PLAN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    const startMinutes = timeStringToMinutes(startTime);
    const endMinutes = timeStringToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      setError('종료 시간이 시작 시간보다 늦어야 합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        startTimeMinutes: startMinutes,
        endTimeMinutes: endMinutes,
        type: scheduleType,
      });

      // 성공 시 초기화
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
      setScheduleType('PLAN');
      onClose();
    } catch (err: any) {
      // 에러 메시지 표시
      setError(err.message || '일정 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="계획 추가">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            제목 <span className={styles.required}>*</span>
          </label>
          <input
            id="title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 영어 공부"
            maxLength={100}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            설명
          </label>
          <textarea
            id="description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 토익 LC 연습"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.timeFields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="startTime">
              시작 시간 <span className={styles.required}>*</span>
            </label>
            <input
              id="startTime"
              type="time"
              className={styles.input}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="endTime">
              종료 시간 <span className={styles.required}>*</span>
            </label>
            <input
              id="endTime"
              type="time"
              className={styles.input}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>유형</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="scheduleType"
                value="PLAN"
                checked={scheduleType === 'PLAN'}
                onChange={() => setScheduleType('PLAN')}
                disabled={isSubmitting}
              />
              <span>실행 필요 (계획)</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="scheduleType"
                value="EXECUTION"
                checked={scheduleType === 'EXECUTION'}
                onChange={() => setScheduleType('EXECUTION')}
                disabled={isSubmitting}
              />
              <span>알림만 (실행 불필요)</span>
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

