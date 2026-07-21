import { db } from "pnpm/server/db";
import { requireStudent } from "pnpm/server/better-auth/guards";
import { ExerciseList } from "../_components/ExerciseList";
import { AppHeader } from "../_components/AppHeader";
import "./page.css";

const DAYS_PT = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export default async function Workouts() {
  const session = await requireStudent();

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = now.getDay();

  const workout = await db.studentWorkout.findUnique({
    where: {
      studentId_dayOfWeek: {
        studentId: session.user.id,
        dayOfWeek,
      },
    },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          completions: {
            where: { studentId: session.user.id, date: today },
          },
        },
      },
    },
  });

  const dateLabel = `${DAYS_PT[dayOfWeek]}, ${now.getDate()} de ${MONTHS_PT[now.getMonth()]}`;
  const firstName = session.user.name?.split(" ")[0] ?? "você";

  return (
    <div className="workouts-wrapper">
      <AppHeader activePath="/workouts" />

      <main className="workouts-main">
        <div className="workouts-greeting">
          <p className="greeting-date">{dateLabel}</p>
          <h2 className="greeting-name">Olá, {firstName}!</h2>
        </div>
        {workout ? (
          <>
            <div className="workout-header">
              <span className="workout-badge">Treino de hoje</span>
              <h2 className="workout-title">{workout.title}</h2>
              <p className="workout-count">{workout.items.length} exercícios</p>
            </div>
            <ExerciseList items={workout.items} />
          </>
        ) : (
          <div className="rest-day">
            <span className="rest-day-icon">🌿</span>
            <h2 className="rest-day-title">Sem treino hoje</h2>
            <p className="rest-day-subtitle">
              Nenhum treino foi atribuído para hoje. Aproveite para descansar!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
