/**
 * Schedule API 라우트 (개별)
 * GET: 일정 상세 조회
 * PATCH: 일정 수정
 * DELETE: 일정 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  validateScheduleData,
  validateOverlapCount,
} from '@/lib/validation/scheduleValidation';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET: 일정 상세 조회
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        category: true,
        plan: true,
        executions: true,
      },
    });
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// PATCH: 일정 수정
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
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
      completed,
    } = body;
    
    // 기존 일정 조회
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
      select: {
        date: true,
        startTimeMinutes: true,
        endTimeMinutes: true,
      },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // 시간이 변경되는 경우 유효성 검증
    if (
      (startTimeMinutes !== undefined || endTimeMinutes !== undefined) &&
      (title !== undefined || startTimeMinutes !== undefined || endTimeMinutes !== undefined)
    ) {
      const newStartTime = startTimeMinutes ?? existingSchedule.startTimeMinutes;
      const newEndTime = endTimeMinutes ?? existingSchedule.endTimeMinutes;
      const newDate = date ? new Date(date) : existingSchedule.date;

      // 기본 유효성 검증
      if (title !== undefined || startTimeMinutes !== undefined || endTimeMinutes !== undefined) {
        const validationErrors = validateScheduleData({
          title: title ?? '',
          startTimeMinutes: newStartTime,
          endTimeMinutes: newEndTime,
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
      }

      // 시간이 변경되는 경우 겹침 검증
      if (startTimeMinutes !== undefined || endTimeMinutes !== undefined) {
        newDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(newDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingSchedules = await prisma.schedule.findMany({
          where: {
            date: {
              gte: newDate,
              lt: nextDay,
            },
          },
          select: {
            id: true,
            startTimeMinutes: true,
            endTimeMinutes: true,
          },
        });

        const overlapValidation = validateOverlapCount(
          { startTimeMinutes: newStartTime, endTimeMinutes: newEndTime },
          existingSchedules,
          id // 자기 자신은 제외
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
      }
    }
    
    const updateData: any = {};
    
    if (date !== undefined) updateData.date = new Date(date);
    if (startTimeMinutes !== undefined) updateData.startTimeMinutes = startTimeMinutes;
    if (endTimeMinutes !== undefined) updateData.endTimeMinutes = endTimeMinutes;
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (customColor !== undefined) updateData.customColor = customColor;
    if (layer !== undefined) updateData.layer = layer;
    if (zIndex !== undefined) updateData.zIndex = zIndex;
    if (completed !== undefined) updateData.completed = completed;
    
    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
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
        createdAt: true,
        updatedAt: true,
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
    });
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE: 일정 삭제
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
    await prisma.schedule.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}

