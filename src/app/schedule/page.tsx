import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "pnpm/server/better-auth/server";
import { db } from "pnpm/server/db";
import logo from "../imgs/logo.png";
import "./page.css";

const WEEK: { dayOfWeek: number; label: string; dayType: string | null }[] = [
  { dayOfWeek: 1, label: "Segunda-feira", dayType: "upper" },
  { dayOfWeek: 2, label: "Terça-feira", dayType: "lower" },
  { dayOfWeek: 3, label: "Quarta-feira", dayType: "core" },
  { dayOfWeek: 4, label: "Quinta-feira", dayType: "upper" },
  { dayOfWeek: 5, label: "Sexta-feira", dayType: "full" },
  { dayOfWeek: 6, label: "Sábado", dayType: "stretch" },
  { dayOfWeek: 0, label: "Domingo", dayType: null },
];

export default async function Schedule() {
  const session = await getSession();
  if (!session) redirect("/");

  const workouts = await db.workout.findMany({
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  });

  const workoutByType = Object.fromEntries(
    workouts.map((w) => [w.dayType, w]),
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
          {WEEK.map(({ dayOfWeek, label, dayType }) => {
            const workout = dayType ? workoutByType[dayType] : null;
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
                    <span className="day-rest">Descanso</span>
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
