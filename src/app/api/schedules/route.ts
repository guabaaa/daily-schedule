/**
 * Schedule API 라우트
 * GET: 일정 목록 조회
 * POST: 일정 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ScheduleType } from '@prisma/client';
import {
  validateScheduleData,
  validateOverlapCount,
} from '@/lib/validation/scheduleValidation';

// GET: 일정 목록 조회 (최적화)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const type = searchParams.get('type') as ScheduleType | null;
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '200');
    
    const where: any = {};
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.date = {
        gte: targetDate,
        lt: nextDay,
      };
    }
    
    if (type) {
      where.type = type;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // 필요한 필드만 선택 (성능 최적화)
    const schedules = await prisma.schedule.findMany({
      where,
      select: {
        id: true,
        date: true,
        startTimeMinutes: true,
        endTimeMinutes: true,
        type: true,
        title: true,
        description: true,
        categoryId: true,
        customColor: true,
        layer: true,
        zIndex: true,
        planId: true,
        completed: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        plan: {
          select: {
            id: true,
            title: true,
          },
        },
        executions: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTimeMinutes: 'asc' },
        { layer: 'asc' },
      ],
      take: limit,
    });
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST: 일정 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      date,
      startTimeMinutes,
      endTimeMinutes,
      type,
      title,
      description,
      categoryId,
      customColor,
      layer,
      zIndex,
      planId,
    } = body;
    
    // 필수 필드 검증
    if (!date || startTimeMinutes === undefined || endTimeMinutes === undefined || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
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
          error: 'Validation failed',
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // 해당 날짜의 기존 일정 조회 (겹침 검증용)
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
          error: overlapValidation.error,
          overlapCount: overlapValidation.overlapCount,
        },
        { status: 400 }
      );
    }
    
    // 일정 생성
    const schedule = await prisma.schedule.create({
      data: {
        date: targetDate,
        startTimeMinutes,
        endTimeMinutes,
        type,
        title: title.trim(),
        description: description?.trim() || null,
        categoryId,
        customColor,
        layer: layer ?? 0,
        zIndex: zIndex ?? 0,
        planId,
      },
      include: {
        category: true,
        plan: true,
        executions: true,
      },
    });
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

