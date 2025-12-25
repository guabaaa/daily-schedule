/**
 * timeToPixel 순수 함수 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  timeToPixel,
  pixelToTime,
  timeDurationToHeight,
  calculateBlockHeight,
  TimeToPixelConfig,
} from '../timeToPixel';

describe('timeToPixel', () => {
  const config: TimeToPixelConfig = { pixelsPerMinute: 2 };

  describe('timeToPixel', () => {
    it('자정(00:00 = 0분)을 0px로 변환', () => {
      expect(timeToPixel(0, config)).toBe(0);
    });

    it('09:00(540분)을 1080px로 변환', () => {
      expect(timeToPixel(540, config)).toBe(1080);
    });

    it('정오(12:00 = 720분)을 1440px로 변환', () => {
      expect(timeToPixel(720, config)).toBe(1440);
    });

    it('17:00(1020분)을 2040px로 변환', () => {
      expect(timeToPixel(1020, config)).toBe(2040);
    });

    it('23:59(1439분)을 2878px로 변환', () => {
      expect(timeToPixel(1439, config)).toBe(2878);
    });

    it('pixelsPerMinute가 1일 때 올바르게 변환', () => {
      const config1: TimeToPixelConfig = { pixelsPerMinute: 1 };
      expect(timeToPixel(540, config1)).toBe(540);
    });

    it('pixelsPerMinute가 3일 때 올바르게 변환', () => {
      const config3: TimeToPixelConfig = { pixelsPerMinute: 3 };
      expect(timeToPixel(540, config3)).toBe(1620);
    });
  });

  describe('pixelToTime', () => {
    it('0px를 자정(0분)으로 역변환', () => {
      expect(pixelToTime(0, config)).toBe(0);
    });

    it('1080px를 09:00(540분)으로 역변환', () => {
      expect(pixelToTime(1080, config)).toBe(540);
    });

    it('1440px를 정오(720분)으로 역변환', () => {
      expect(pixelToTime(1440, config)).toBe(720);
    });

    it('소수점 픽셀을 반올림하여 변환', () => {
      expect(pixelToTime(1081, config)).toBe(541); // 반올림
      expect(pixelToTime(1080.4, config)).toBe(540); // 반올림
      expect(pixelToTime(1080.6, config)).toBe(540); // 반올림
    });
  });

  describe('timeDurationToHeight', () => {
    it('30분 = 60px', () => {
      expect(timeDurationToHeight(540, 570, config)).toBe(60);
    });

    it('1시간(60분) = 120px', () => {
      expect(timeDurationToHeight(540, 600, config)).toBe(120);
    });

    it('1.5시간(90분) = 180px', () => {
      expect(timeDurationToHeight(540, 630, config)).toBe(180);
    });

    it('2시간(120분) = 240px', () => {
      expect(timeDurationToHeight(540, 660, config)).toBe(240);
    });

    it('시작과 종료가 같으면 0px', () => {
      expect(timeDurationToHeight(540, 540, config)).toBe(0);
    });
  });

  describe('calculateBlockHeight', () => {
    const minHeight = 60;

    it('계산된 높이가 최소 높이보다 크면 계산된 높이 반환', () => {
      // 1시간 = 120px > 60px
      expect(calculateBlockHeight(540, 600, config, minHeight)).toBe(120);
    });

    it('계산된 높이가 최소 높이보다 작으면 최소 높이 반환', () => {
      // 20분 = 40px < 60px
      expect(calculateBlockHeight(540, 560, config, minHeight)).toBe(60);
    });

    it('계산된 높이가 최소 높이와 같으면 그대로 반환', () => {
      // 30분 = 60px = 60px
      expect(calculateBlockHeight(540, 570, config, minHeight)).toBe(60);
    });

    it('매우 짧은 일정도 최소 높이 보장', () => {
      // 5분 = 10px < 60px
      expect(calculateBlockHeight(540, 545, config, minHeight)).toBe(60);
    });

    it('최소 높이가 0이면 계산된 높이 그대로 반환', () => {
      // 20분 = 40px, 최소 높이 0
      expect(calculateBlockHeight(540, 560, config, 0)).toBe(40);
    });
  });

  describe('경계값 테스트', () => {
    it('음수 분은 음수 픽셀로 변환', () => {
      expect(timeToPixel(-10, config)).toBe(-20);
    });

    it('매우 큰 값도 올바르게 변환', () => {
      expect(timeToPixel(10000, config)).toBe(20000);
    });
  });

  describe('일관성 테스트', () => {
    it('timeToPixel과 pixelToTime은 역함수 관계', () => {
      const minutes = 540;
      const pixels = timeToPixel(minutes, config);
      const backToMinutes = pixelToTime(pixels, config);
      expect(backToMinutes).toBe(minutes);
    });

    it('여러 값에 대해 역함수 관계 유지', () => {
      const testCases = [0, 60, 120, 360, 540, 720, 1020, 1439];
      
      for (const minutes of testCases) {
        const pixels = timeToPixel(minutes, config);
        const backToMinutes = pixelToTime(pixels, config);
        expect(backToMinutes).toBe(minutes);
      }
    });
  });
});

