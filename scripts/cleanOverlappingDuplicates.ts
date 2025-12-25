/**
 * 겹치는 시간대의 중복 제목 일정 정리 스크립트
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🔍 겹치는 시간대의 중복 제목 일정 검색 중...\n');

  // 2025년 9월 10일 데이터 조회
  const targetDate = new Date('2025-09-10');
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const schedules = await prisma.schedule.findMany({
    where: {
      date: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      category: true,
    },
    orderBy: [{ startTimeMinutes: 'asc' }],
  });

  console.log(`📊 총 ${schedules.length}개 일정 발견\n`);

  // 겹치는 시간대에서 같은 제목 찾기
  const duplicatesByTitle = new Map<string, typeof schedules>();

  for (let i = 0; i < schedules.length; i++) {
    const current = schedules[i];
    
    for (let j = i + 1; j < schedules.length; j++) {
      const other = schedules[j];
      
      // 같은 제목이고 시간이 겹치는 경우
      if (current.title === other.title) {
        const isOverlapping = 
          (current.startTimeMinutes < other.endTimeMinutes) &&
          (other.startTimeMinutes < current.endTimeMinutes);
        
        if (isOverlapping) {
          if (!duplicatesByTitle.has(current.title)) {
            duplicatesByTitle.set(current.title, []);
          }
          const group = duplicatesByTitle.get(current.title)!;
          if (!group.find(s => s.id === current.id)) {
            group.push(current);
          }
          if (!group.find(s => s.id === other.id)) {
            group.push(other);
          }
        }
      }
    }
  }

  console.log(`⚠️  중복 제목 그룹: ${duplicatesByTitle.size}개\n`);

  const toDelete: string[] = [];

  for (const [title, group] of duplicatesByTitle.entries()) {
    console.log(`📌 "${title}": ${group.length}개 일정`);
    
    // 시간 범위가 가장 긴 것을 유지
    const sorted = [...group].sort((a, b) => {
      const aDuration = a.endTimeMinutes - a.startTimeMinutes;
      const bDuration = b.endTimeMinutes - b.startTimeMinutes;
      return bDuration - aDuration; // 내림차순
    });
    
    const toKeep = sorted[0];
    const toRemove = sorted.slice(1);
    
    console.log(`   ✅ 유지: ${toKeep.startTimeMinutes}~${toKeep.endTimeMinutes}분 (${toKeep.endTimeMinutes - toKeep.startTimeMinutes}분)`);
    
    for (const remove of toRemove) {
      console.log(`   ❌ 삭제: ${remove.startTimeMinutes}~${remove.endTimeMinutes}분 (${remove.endTimeMinutes - remove.startTimeMinutes}분)`);
      toDelete.push(remove.id);
    }
    console.log();
  }

  if (toDelete.length > 0) {
    console.log(`🗑️  총 ${toDelete.length}개 일정 삭제 중...\n`);
    
    const deleteResult = await prisma.schedule.deleteMany({
      where: {
        id: {
          in: toDelete,
        },
      },
    });

    console.log(`✅ ${deleteResult.count}개 일정 삭제 완료!\n`);
  } else {
    console.log('✅ 삭제할 중복 일정이 없습니다!\n');
  }

  // 남은 일정 출력
  const remaining = await prisma.schedule.findMany({
    where: {
      date: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      category: true,
    },
    orderBy: [{ startTimeMinutes: 'asc' }],
  });

  console.log(`📋 남은 일정: ${remaining.length}개\n`);
  for (const schedule of remaining) {
    const startHour = Math.floor(schedule.startTimeMinutes / 60);
    const startMin = schedule.startTimeMinutes % 60;
    const endHour = Math.floor(schedule.endTimeMinutes / 60);
    const endMin = schedule.endTimeMinutes % 60;
    
    console.log(
      `   ${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')} ~ ` +
      `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')} - ` +
      `${schedule.title} (layer: ${schedule.layer})`
    );
  }
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

