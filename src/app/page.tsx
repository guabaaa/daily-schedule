import { ScheduleViewerWithModals } from "./ScheduleViewerWithModals";
import { DatePicker } from "@/components/DatePicker";
import prisma from "@/lib/prisma";
import styles from "./page.module.css";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  // URL 파라미터에서 날짜 가져오기 (없으면 2025-09-10 기본값)
  const dateParam = params.date || "2025-09-10";
  const targetDate = new Date(dateParam);
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
      category: true,
      plan: true,
      executions: true,
    },
    orderBy: [{ startTimeMinutes: "asc" }, { layer: "asc" }],
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>하루 계획표</h1>
      </header>

      <DatePicker currentDate={targetDate} />

      <div className={styles.gridContainer}>
        <ScheduleViewerWithModals schedules={schedules} date={targetDate} />
      </div>
    </div>
  );
}
