/**
 * 툴팁 컴포넌트
 */

import React, { useState, useRef, ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    
    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
    
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={styles.trigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={styles.tooltip}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className={styles.content}>{content}</div>
          <div className={styles.arrow} />
        </div>
      )}
    </>
  );
}

