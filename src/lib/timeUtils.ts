/**
 * 시간 관리 유틸리티 함수
 * 분 단위로 시간을 관리하고 24시간제를 지원합니다.
 */

/**
 * HH:MM 형식의 시간 문자열을 분 단위로 변환
 * @param timeString - "09:00", "17:30" 등의 형식
 * @returns 0~1439 사이의 분 값
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time string: ${timeString}`);
  }

  return hours * 60 + minutes;
}

/**
 * 분 단위를 HH:MM 형식의 문자열로 변환
 * @param minutes - 0~1439 사이의 분 값
 * @returns "09:00", "17:30" 등의 형식
 */
export function minutesToTimeString(minutes: number): string {
  if (minutes < 0 || minutes > 1439) {
    throw new Error(`Invalid minutes: ${minutes}. Must be between 0 and 1439`);
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * 시간대 겹침 체크
 * @param start1 - 첫 번째 일정 시작 시간 (분)
 * @param end1 - 첫 번째 일정 종료 시간 (분)
 * @param start2 - 두 번째 일정 시작 시간 (분)
 * @param end2 - 두 번째 일정 종료 시간 (분)
 * @returns 겹치면 true, 아니면 false
 */
export function isTimeOverlapping(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * 시간대 범위 유효성 검사
 * @param startMinutes - 시작 시간 (분)
 * @param endMinutes - 종료 시간 (분)
 * @returns 유효하면 true, 아니면 false
 */
export function isValidTimeRange(
  startMinutes: number,
  endMinutes: number
): boolean {
  if (startMinutes < 0 || startMinutes > 1439) return false;
  if (endMinutes < 0 || endMinutes > 1439) return false;
  if (startMinutes >= endMinutes) return false;

  return true;
}

/**
 * 정오(12:00) 기준으로 오전/오후 판단
 * @param minutes - 분 단위 시간
 * @returns 'AM' | 'PM'
 */
export function getAmPm(minutes: number): "AM" | "PM" {
  const hours = Math.floor(minutes / 60);
  return hours < 12 ? "AM" : "PM";
}

/**
 * 12시간제로 변환
 * @param minutes - 분 단위 시간
 * @returns 12시간제 시간과 AM/PM
 */
export function to12HourFormat(minutes: number): {
  time: string;
  period: "AM" | "PM";
} {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours24 < 12 ? "AM" : "PM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12; // 0시 -> 12AM, 12시 -> 12PM

  return {
    time: `${hours12}:${mins.toString().padStart(2, "0")}`,
    period,
  };
}

/**
 * 일정 기간(분)을 시간과 분으로 계산
 * @param startMinutes - 시작 시간 (분)
 * @param endMinutes - 종료 시간 (분)
 * @returns { hours, minutes, totalMinutes }
 */
export function calculateDuration(
  startMinutes: number,
  endMinutes: number
): { hours: number; minutes: number; totalMinutes: number } {
  const totalMinutes = endMinutes - startMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes };
}

/**
 * 그리드용 시간 배열 생성 (분 단위)
 * @param intervalMinutes - 간격 (기본: 15분)
 * @returns 시간 배열 (분 단위)
 */
export function generateTimeGrid(intervalMinutes: number = 15): number[] {
  const grid: number[] = [];

  for (let minutes = 0; minutes < 1440; minutes += intervalMinutes) {
    grid.push(minutes);
  }

  return grid;
}

/**
 * 날짜 문자열을 Date 객체로 변환 (시간 제거)
 * @param dateString - "YYYY-MM-DD" 형식
 * @returns Date 객체
 */
export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Date 객체를 "YYYY-MM-DD" 형식으로 변환
 * @param date - Date 객체
 * @returns "YYYY-MM-DD" 형식 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 자정(00:00)인지 체크
 * @param minutes - 분 단위 시간
 * @returns 자정이면 true
 */
export function isMidnight(minutes: number): boolean {
  return minutes === 0 || minutes === 1440;
}

/**
 * 정오(12:00)인지 체크
 * @param minutes - 분 단위 시간
 * @returns 정오면 true
 */
export function isNoon(minutes: number): boolean {
  return minutes === 720;
}
