/**
 * 중복된 일정 데이터 정리 스크립트
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
  console.log('🔍 중복 일정 검색 중...\n');

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

  // 시간대별로 그룹화하여 겹치는 일정 찾기
  const timeGroups = new Map<string, typeof schedules>();

  for (const schedule of schedules) {
    const key = `${schedule.startTimeMinutes}-${schedule.endTimeMinutes}`;
    if (!timeGroups.has(key)) {
      timeGroups.set(key, []);
    }
    timeGroups.get(key)!.push(schedule);
  }

  // 중복 찾기 (같은 시간대에 같은 제목)
  const duplicates: typeof schedules = [];
  const toKeep = new Set<string>();

  for (const [timeKey, group] of timeGroups.entries()) {
    if (group.length > 1) {
      console.log(`⚠️  시간대 ${timeKey}에 ${group.length}개 일정 발견:`);
      
      // 제목별로 그룹화
      const titleGroups = new Map<string, typeof schedules>();
      for (const schedule of group) {
        if (!titleGroups.has(schedule.title)) {
          titleGroups.set(schedule.title, []);
        }
        titleGroups.get(schedule.title)!.push(schedule);
      }

      for (const [title, titleGroup] of titleGroups.entries()) {
        if (titleGroup.length > 1) {
          console.log(`   - "${title}": ${titleGroup.length}개 중복`);
          
          // 첫 번째만 유지, 나머지는 삭제 대상
          toKeep.add(titleGroup[0].id);
          for (let i = 1; i < titleGroup.length; i++) {
            duplicates.push(titleGroup[i]);
          }
        } else {
          // 중복 아님
          toKeep.add(titleGroup[0].id);
        }
      }
    } else {
      // 단일 일정
      toKeep.add(group[0].id);
    }
  }

  console.log(`\n🗑️  삭제할 중복 일정: ${duplicates.length}개\n`);

  if (duplicates.length > 0) {
    for (const dup of duplicates) {
      console.log(`   - [${dup.id.slice(0, 8)}...] ${dup.title} (${dup.startTimeMinutes}~${dup.endTimeMinutes}분)`);
    }

    console.log('\n삭제 중...');
    
    const deleteResult = await prisma.schedule.deleteMany({
      where: {
        id: {
          in: duplicates.map(d => d.id),
        },
      },
    });

    console.log(`✅ ${deleteResult.count}개 일정 삭제 완료!\n`);
  } else {
    console.log('✅ 중복 일정이 없습니다!\n');
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

