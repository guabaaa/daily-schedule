/**
 * 데이터베이스 시드 데이터
 * 테스트용 샘플 데이터 생성
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import 'dotenv/config';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

// timeStringToMinutes 함수를 여기에 정의
function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time string: ${timeString}`);
  }
  
  return hours * 60 + minutes;
}

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 기존 데이터 삭제
  await prisma.schedule.deleteMany();
  await prisma.category.deleteMany();

  // 카테고리 생성
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '영어',
        color: '#FFE066', // 노란색
      },
    }),
    prisma.category.create({
      data: {
        name: '수학',
        color: '#74C0FC', // 파란색
      },
    }),
    prisma.category.create({
      data: {
        name: '국어',
        color: '#FFA8A8', // 분홍색
      },
    }),
    prisma.category.create({
      data: {
        name: '과학',
        color: '#B2F2BB', // 초록색
      },
    }),
    prisma.category.create({
      data: {
        name: '사회',
        color: '#D0BFFF', // 보라색
      },
    }),
  ]);

  console.log(`✅ ${categories.length}개 카테고리 생성됨`);

  // 2025년 9월 10일 일정 생성
  const targetDate = new Date('2025-09-10');
  targetDate.setHours(0, 0, 0, 0);

  // 계획 1: 영어 공부
  const englishPlan = await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('17:00'),
      endTimeMinutes: timeStringToMinutes('18:00'),
      type: 'PLAN',
      title: '영어',
      description: '경식씩 수능 영단어 Day31~32',
      categoryId: categories[0].id,
      layer: 0,
      zIndex: 0,
    },
  });

  // 실행 1: 영어 공부 (실제 수행)
  await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('17:00'),
      endTimeMinutes: timeStringToMinutes('18:15'), // 15분 더 함
      type: 'EXECUTION',
      title: '영어',
      description: '경식씩 수능 영단어 Day31~32',
      categoryId: categories[0].id,
      planId: englishPlan.id,
      layer: 1,
      zIndex: 1,
      completed: true,
    },
  });

  // 계획 2: 수학 공부
  const mathPlan = await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('18:00'),
      endTimeMinutes: timeStringToMinutes('19:45'),
      type: 'PLAN',
      title: '공통수학1',
      description: '쎈 공통수학1 20~28',
      categoryId: categories[1].id,
      layer: 0,
      zIndex: 0,
    },
  });

  // 실행 2: 수학 공부 (일부만 수행)
  await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('18:00'),
      endTimeMinutes: timeStringToMinutes('19:00'), // 45분 덜 함
      type: 'EXECUTION',
      title: '공통수학1',
      description: '쎈 공통수학1 20~28',
      categoryId: categories[1].id,
      planId: mathPlan.id,
      layer: 1,
      zIndex: 1,
      completed: false,
    },
  });

  // 계획 3: 국어 공부
  const koreanPlan = await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('18:00'),
      endTimeMinutes: timeStringToMinutes('19:00'),
      type: 'PLAN',
      title: '국어',
      description: '수능특강 문학 6~8 강',
      categoryId: categories[2].id,
      layer: 0,
      zIndex: 0,
    },
  });

  // 실행 3: 국어 공부 (겹치는 시간대)
  await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('18:00'),
      endTimeMinutes: timeStringToMinutes('18:50'),
      type: 'EXECUTION',
      title: '국어',
      description: '수능특강 문학 6~8 강',
      categoryId: categories[2].id,
      planId: koreanPlan.id,
      layer: 2,
      zIndex: 2,
      completed: true,
    },
  });

  // 계획 4: 과학 공부 (오전)
  const sciencePlan = await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('09:00'),
      endTimeMinutes: timeStringToMinutes('10:30'),
      type: 'PLAN',
      title: '사회문화 수행',
      description: '평가 준비',
      categoryId: categories[3].id,
      layer: 0,
      zIndex: 0,
    },
  });

  // 실행 4: 과학 공부
  await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('09:05'),
      endTimeMinutes: timeStringToMinutes('10:35'),
      type: 'EXECUTION',
      title: '사회문화 수행',
      description: '평가 준비',
      categoryId: categories[3].id,
      planId: sciencePlan.id,
      layer: 1,
      zIndex: 1,
      completed: true,
    },
  });

  // 실행만 있는 일정 (계획 없이 실행)
  await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('17:00'),
      endTimeMinutes: timeStringToMinutes('18:00'),
      type: 'EXECUTION',
      title: '저녁먹고 올리브영 다녀오기',
      categoryId: categories[4].id,
      layer: 3,
      zIndex: 3,
      completed: true,
    },
  });

  // 화학 계획 (오전)
  await prisma.schedule.create({
    data: {
      date: targetDate,
      startTimeMinutes: timeStringToMinutes('08:00'),
      endTimeMinutes: timeStringToMinutes('09:00'),
      type: 'PLAN',
      title: '화학',
      description: '올Pick 화학 1 32~38',
      categoryId: categories[3].id,
      customColor: '#FF6B9D', // 핑크
      layer: 0,
      zIndex: 0,
    },
  });

  console.log('✅ 샘플 일정 생성됨');
  console.log('📅 날짜: 2025년 9월 10일');
  console.log('');
  console.log('다음 명령으로 데이터를 확인하세요:');
  console.log('npx prisma studio');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

