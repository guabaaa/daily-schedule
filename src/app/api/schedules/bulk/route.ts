/**
 * 대량 조회 API (성능 최적화)
 * GET: 날짜 범위로 일정 조회 (페이지네이션)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ScheduleType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') as ScheduleType | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const where: any = {
      date: {
        gte: start,
        lte: end,
      },
    };

    if (type) {
      where.type = type;
    }

    // 총 개수 조회 (페이지네이션용)
    const total = await prisma.schedule.count({ where });

    // 일정 조회 (필요한 필드만 선택)
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
      },
      orderBy: [
        { date: 'asc' },
        { startTimeMinutes: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

