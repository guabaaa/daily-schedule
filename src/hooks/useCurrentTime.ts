/**
 * 현재 시각을 추적하는 커스텀 훅
 */

import { useState, useEffect } from "react";

export function useCurrentTime() {
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 60 + minutes;
  });

  useEffect(() => {
    // 1분마다 업데이트
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setCurrentTimeMinutes(hours * 60 + minutes);
    }, 60000); // 60초

    return () => clearInterval(interval);
  }, []);

  return currentTimeMinutes;
}
