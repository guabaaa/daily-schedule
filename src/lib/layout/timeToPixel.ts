/**
 * 시간(분) -> Y 좌표(픽셀) 변환 순수 함수
 */

export interface TimeToPixelConfig {
  pixelsPerMinute: number;
}

/**
 * 시간(분)을 Y 좌표(픽셀)로 변환
 * @param minutes - 시간 (0~1439)
 * @param config - 변환 설정
 * @returns Y 좌표 (픽셀)
 */
export function timeToPixel(
  minutes: number,
  config: TimeToPixelConfig
): number {
  return minutes * config.pixelsPerMinute;
}

/**
 * Y 좌표(픽셀)를 시간(분)으로 역변환
 * @param pixels - Y 좌표 (픽셀)
 * @param config - 변환 설정
 * @returns 시간 (분)
 */
export function pixelToTime(
  pixels: number,
  config: TimeToPixelConfig
): number {
  return Math.round(pixels / config.pixelsPerMinute);
}

/**
 * 시간 범위를 높이(픽셀)로 변환
 * @param startMinutes - 시작 시간 (분)
 * @param endMinutes - 종료 시간 (분)
 * @param config - 변환 설정
 * @returns 높이 (픽셀)
 */
export function timeDurationToHeight(
  startMinutes: number,
  endMinutes: number,
  config: TimeToPixelConfig
): number {
  const duration = endMinutes - startMinutes;
  return duration * config.pixelsPerMinute;
}

/**
 * 최소 높이를 적용한 블록 높이 계산
 * @param startMinutes - 시작 시간 (분)
 * @param endMinutes - 종료 시간 (분)
 * @param config - 변환 설정
 * @param minHeight - 최소 높이 (픽셀)
 * @returns 높이 (픽셀)
 */
export function calculateBlockHeight(
  startMinutes: number,
  endMinutes: number,
  config: TimeToPixelConfig,
  minHeight: number
): number {
  const calculatedHeight = timeDurationToHeight(
    startMinutes,
    endMinutes,
    config
  );
  return Math.max(calculatedHeight, minHeight);
}

