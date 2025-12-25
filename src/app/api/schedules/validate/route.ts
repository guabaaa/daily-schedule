/**
 * Schedule 유효성 검증 API
 * POST: 일정 추가 전 검증
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  validateScheduleData,
  validateOverlapCount,
  SCHEDULE_CONSTRAINTS,
} from '@/lib/validation/scheduleValidation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTimeMinutes, endTimeMinutes, title, description } = body;

    // 기본 유효성 검증
    const validationErrors = validateScheduleData({
      title,
      startTimeMinutes,
      endTimeMinutes,
      description,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // 해당 날짜의 기존 일정 조회
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingSchedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      select: {
        id: true,
        startTimeMinutes: true,
        endTimeMinutes: true,
      },
    });

    // 겹침 수 검증
    const overlapValidation = validateOverlapCount(
      { startTimeMinutes, endTimeMinutes },
      existingSchedules
    );

    if (!overlapValidation.valid) {
      return NextResponse.json(
        {
          valid: false,
          errors: [
            {
              field: 'overlap',
              message: overlapValidation.error,
            },
          ],
          overlapCount: overlapValidation.overlapCount,
        },
        { status: 400 }
      );
    }

    // 모든 검증 통과
    return NextResponse.json({
      valid: true,
      overlapCount: overlapValidation.overlapCount,
    });
  } catch (error) {
    console.error('Failed to validate schedule:', error);
    return NextResponse.json(
      { error: 'Failed to validate schedule' },
      { status: 500 }
    );
  }
}

