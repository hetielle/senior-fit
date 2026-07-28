import { db } from "pnpm/server/db";
import { requireStudent } from "pnpm/server/better-auth/guards";
import { AppHeader } from "../_components/AppHeader";
import { ScheduleExerciseList } from "../_components/ScheduleExerciseList";
import "./page.css";

const WEEK: { dayOfWeek: number; label: string }[] = [
  { dayOfWeek: 1, label: "Segunda-feira" },
  { dayOfWeek: 2, label: "Terça-feira" },
  { dayOfWeek: 3, label: "Quarta-feira" },
  { dayOfWeek: 4, label: "Quinta-feira" },
  { dayOfWeek: 5, label: "Sexta-feira" },
  { dayOfWeek: 6, label: "Sábado" },
  { dayOfWeek: 0, label: "Domingo" },
];

function getWeekDateFor(targetDow: number, todayDow: number, now: Date): Date {
  const diff = targetDow - todayDow;
  const d = new Date(now);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function Schedule() {
  const session = await requireStudent();

  const now = new Date();
  const todayDow = now.getDay();

  // Week range (Monday–Sunday)
  const mondayOffset = todayDow === 0 ? -6 : 1 - todayDow;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const [studentWorkouts, weekCompletions] = await Promise.all([
    db.studentWorkout.findMany({
      where: { studentId: session.user.id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: { exercise: true },
        },
      },
    }),
    db.exerciseCompletion.findMany({
      where: {
        studentId: session.user.id,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: { studentWorkoutItemId: true, date: true },
    }),
  ]);

  const workoutByDay = Object.fromEntries(
    studentWorkouts.map((w) => [w.dayOfWeek, w]),
  );

  return (
    <div className="schedule-wrapper">
      <AppHeader activePath="/schedule" />

      <main className="schedule-main">
        <h1 className="schedule-title">Treinos da Semana</h1>

        <div className="week-list">
          {WEEK.map(({ dayOfWeek, label }) => {
            const workout = workoutByDay[dayOfWeek] ?? null;
            const isToday = dayOfWeek === todayDow;

            const dayDate = getWeekDateFor(dayOfWeek, todayDow, now);
            const isPast = dayDate < now && !isToday;
            const isFuture = dayDate > now && !isToday;

            const dayCompletions = weekCompletions.filter(
              (c) =>
                c.date.toISOString().split("T")[0] ===
                dayDate.toISOString().split("T")[0],
            );
            const completedCount = dayCompletions.length;
            const totalCount = workout?.items.length ?? 0;
            const allDone = totalCount > 0 && completedCount >= totalCount;
            const someDone = completedCount > 0 && !allDone;

            let statusClass = "";
            if (workout && (isToday || isPast)) {
              if (allDone) statusClass = "day-card-done";
              else if (someDone) statusClass = "day-card-partial";
              else if (isPast) statusClass = "day-card-missed";
            }
            if (!workout && !isFuture) statusClass = "day-card-rest";

            return (
              <div
                key={dayOfWeek}
                className={`day-card ${isToday ? "day-card-today" : ""} ${statusClass}`}
              >
                <div className="day-card-header">
                  <div className="day-label-row">
                    <span className="day-label">{label}</span>
                    {isToday && <span className="today-badge">Hoje</span>}
                    {workout && (isToday || isPast) && (
                      <span className={`day-completion-badge ${allDone ? "badge-done" : someDone ? "badge-partial" : isPast ? "badge-missed" : ""}`}>
                        {allDone ? "✓ Concluído" : someDone ? `${completedCount}/${totalCount}` : isPast ? "Não realizado" : ""}
                      </span>
                    )}
                  </div>
                  {workout ? (
                    <span className="day-workout-title">{workout.title}</span>
                  ) : (
                    <span className="day-rest">Descanso</span>
                  )}
                </div>

                {workout && (
                  <ScheduleExerciseList
                    items={workout.items}
                    completedIds={new Set(dayCompletions.map((c) => c.studentWorkoutItemId))}
                  />
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
