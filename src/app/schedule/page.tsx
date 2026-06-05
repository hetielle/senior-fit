import Image from "next/image";
import { db } from "pnpm/server/db";
import { requireStudent } from "pnpm/server/better-auth/guards";
import logo from "../imgs/logo.png";
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

export default async function Schedule() {
  const session = await requireStudent();

  const studentWorkouts = await db.studentWorkout.findMany({
    where: { studentId: session.user.id },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  });

  const workoutByDay = Object.fromEntries(
    studentWorkouts.map((w) => [w.dayOfWeek, w]),
  );

  const todayDow = new Date().getDay();

  return (
    <div className="schedule-wrapper">
      <header className="schedule-header">
        <Image src={logo} alt="Logo" className="schedule-logo" />
        <nav className="header-nav">
          <a href="/workouts" className="nav-link">
            Hoje
          </a>
          <a href="/schedule" className="nav-link nav-link-active">
            Semana
          </a>
          <a href="/profile" className="nav-link">
            Perfil
          </a>
        </nav>
      </header>

      <main className="schedule-main">
        <h1 className="schedule-title">Treinos da Semana</h1>

        <div className="week-list">
          {WEEK.map(({ dayOfWeek, label }) => {
            const workout = workoutByDay[dayOfWeek] ?? null;
            const isToday = dayOfWeek === todayDow;

            return (
              <div
                key={dayOfWeek}
                className={`day-card ${isToday ? "day-card-today" : ""}`}
              >
                <div className="day-card-header">
                  <div className="day-label-row">
                    <span className="day-label">{label}</span>
                    {isToday && <span className="today-badge">Hoje</span>}
                  </div>
                  {workout ? (
                    <span className="day-workout-title">{workout.title}</span>
                  ) : (
                    <span className="day-rest">Sem treino</span>
                  )}
                </div>

                {workout && (
                  <ul className="day-exercise-list">
                    {workout.items.map((item) => (
                      <li key={item.id} className="day-exercise-item">
                        <div className="day-exercise-name">
                          {item.exercise.name}
                          <span className="day-exercise-muscle">
                            {item.exercise.muscleGroup}
                          </span>
                        </div>
                        <span className="day-exercise-volume">
                          {item.durationSecs
                            ? `${item.sets}× ${item.durationSecs}s`
                            : `${item.sets}×${item.reps}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
