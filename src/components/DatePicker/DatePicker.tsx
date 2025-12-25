/**
 * 날짜 선택 컴포넌트
 */

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/timeUtils';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  currentDate: Date;
}

export function DatePicker({ currentDate }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    
    // URL 파라미터 업데이트
    const params = new URLSearchParams(searchParams);
    params.set('date', newDate);
    
    router.push(`/?${params.toString()}`);
  };

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    
    const params = new URLSearchParams(searchParams);
    params.set('date', formatDate(prevDay));
    
    router.push(`/?${params.toString()}`);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const params = new URLSearchParams(searchParams);
    params.set('date', formatDate(nextDay));
    
    router.push(`/?${params.toString()}`);
  };

  const handleToday = () => {
    const params = new URLSearchParams(searchParams);
    params.set('date', formatDate(new Date()));
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <button className={styles.todayButton} onClick={handleToday}>
        오늘
      </button>
      
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrevDay}
          title="이전 날"
        >
          ◀
        </button>
        
        <input
          type="date"
          className={styles.dateInput}
          value={formatDate(currentDate)}
          onChange={handleDateChange}
        />
        
        <button
          className={styles.navButton}
          onClick={handleNextDay}
          title="다음 날"
        >
          ▶
        </button>
      </div>

      <div className={styles.dateDisplay}>
        {currentDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}
      </div>
    </div>
  );
}

