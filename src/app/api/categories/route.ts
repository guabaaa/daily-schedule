/**
 * Category API 라우트
 * GET: 카테고리 목록 조회
 * POST: 카테고리 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 카테고리 목록 조회
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        schedules: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST: 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color } = body;
    
    if (!name || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: name, color' },
        { status: 400 }
      );
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        color,
      },
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

