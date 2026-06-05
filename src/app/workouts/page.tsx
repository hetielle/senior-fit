import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "pnpm/server/better-auth/server";
import { db } from "pnpm/server/db";
import logo from "../imgs/logo.png";
import "./page.css";

const DAY_TO_TYPE: Record<number, string | null> = {
  0: null,
  1: "upper",
  2: "lower",
  3: "core",
  4: "upper",
  5: "full",
  6: "stretch",
};

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
  const session = await getSession();
  if (!session) redirect("/");

  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayType = DAY_TO_TYPE[dayOfWeek];

  const workout = dayType
    ? await db.workout.findUnique({
        where: { dayType },
        include: {
          items: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      })
    : null;

  const dateLabel = `${DAYS_PT[dayOfWeek]}, ${now.getDate()} de ${MONTHS_PT[now.getMonth()]}`;
  const firstName = session.user.name?.split(" ")[0] ?? "você";

  return (
    <div className="workouts-wrapper">
      <header className="workouts-header">
        <Image src={logo} alt="Logo" className="workouts-logo" />
        <div className="workouts-greeting">
          <p className="greeting-date">{dateLabel}</p>
          <h1 className="greeting-name">Olá, {firstName}!</h1>
        </div>
      </header>

      <main className="workouts-main">
        {workout ? (
          <>
            <div className="workout-header">
              <span className="workout-badge">Treino de hoje</span>
              <h2 className="workout-title">{workout.title}</h2>
              <p className="workout-count">{workout.items.length} exercícios</p>
            </div>

            <div className="exercise-list">
              {workout.items.map((item) => (
                <div key={item.id} className="exercise-card">
                  <div className="exercise-card-top">
                    <div>
                      <h3 className="exercise-name">{item.exercise.name}</h3>
                      <span className="exercise-muscle">
                        {item.exercise.muscleGroup}
                      </span>
                    </div>
                    <div className="exercise-volume">
                      {item.durationSecs ? (
                        <>
                          <span className="volume-number">{item.sets}×</span>
                          <span className="volume-label">
                            {item.durationSecs}s
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="volume-number">
                            {item.sets}×{item.reps}
                          </span>
                          <span className="volume-label">séries × reps</span>
                        </>
                      )}
                    </div>
                  </div>
                  {item.exercise.description && (
                    <p className="exercise-description">
                      {item.exercise.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rest-day">
            <span className="rest-day-icon">🌿</span>
            <h2 className="rest-day-title">Dia de descanso</h2>
            <p className="rest-day-subtitle">
              Aproveite para recuperar as energias. Você volta amanhã!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
