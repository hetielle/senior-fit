import { notFound } from "next/navigation";
import { db } from "pnpm/server/db";
import { requireInstructor } from "pnpm/server/better-auth/guards";
import { WorkoutPlanEditor } from "../../../_components/WorkoutPlanEditor";
import { AppHeader } from "../../../_components/AppHeader";
import "./page.css";

type Props = { params: Promise<{ studentId: string }> };

function getWeightDiffClass(diff: number, objective: string | null): string {
  if (diff === 0) return "weight-diff-neutral";
  if (objective === "Manter peso") return "weight-diff-neutral";
  if (objective === "Ganhar massa muscular") {
    return diff > 0 ? "weight-diff-positive" : "weight-diff-negative";
  }
  return diff < 0 ? "weight-diff-positive" : "weight-diff-negative";
}

function getDiffLabel(diff: number, objective: string | null): string {
  if (objective === "Manter peso") return diff === 0 ? " ✓" : "";
  if (objective === "Ganhar massa muscular") return diff > 0 ? " ↑" : diff < 0 ? " ↓" : "";
  return diff < 0 ? " ↓" : diff > 0 ? " ↑" : "";
}

export default async function StudentDetail({ params }: Props) {
  await requireInstructor();
  const { studentId } = await params;

  const [student, studentWorkouts, allExercises, completions] = await Promise.all([
    db.user.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        weightEntries: { orderBy: { date: "desc" }, take: 10 },
      },
    }),
    db.studentWorkout.findMany({
      where: { studentId },
      include: {
        items: { orderBy: { order: "asc" }, include: { exercise: true } },
      },
    }),
    db.exercise.findMany({ orderBy: { name: "asc" } }),
    db.exerciseCompletion.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 30,
      include: { studentWorkoutItem: { include: { exercise: true, studentWorkout: true } } },
    }),
  ]);

  if (!student) notFound();

  // Group completions by date for the activity log
  const completionsByDate = completions.reduce<
    Record<string, typeof completions>
  >((acc, c) => {
    const key = c.date.toISOString().split("T")[0]!;
    (acc[key] ??= []).push(c);
    return acc;
  }, {});
  const completionDates = Object.keys(completionsByDate).sort().reverse();

  const initialPlan = Object.fromEntries(
    studentWorkouts.map((w) => [w.dayOfWeek, w]),
  ) as Record<number, (typeof studentWorkouts)[0] | null>;

  for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
    if (!(dow in initialPlan)) initialPlan[dow] = null;
  }

  return (
    <div className="student-detail-wrapper">
      <AppHeader activePath="/instructor/students" />

      <main className="student-detail-main">
        {/* Student info */}
        <div className="student-info-card">
          <h1 className="student-detail-name">{student.name}</h1>
          <p className="student-detail-email">{student.email}</p>

          <div className="student-profile-grid">
            {student.profile?.age && (
              <div className="profile-field">
                <span className="profile-field-label">Idade</span>
                <span className="profile-field-value">{student.profile.age} anos</span>
              </div>
            )}
            {student.profile?.phone && (
              <div className="profile-field">
                <span className="profile-field-label">Telefone</span>
                <span className="profile-field-value">{student.profile.phone}</span>
              </div>
            )}
            {student.profile?.objective && (
              <div className="profile-field">
                <span className="profile-field-label">Objetivo</span>
                <span className="profile-field-value">{student.profile.objective}</span>
              </div>
            )}
            {!student.profile?.age && !student.profile?.phone && !student.profile?.objective && (
              <p className="profile-empty">Perfil não preenchido pelo aluno.</p>
            )}
            <div className="profile-field">
              <span className="profile-field-label">Membro desde</span>
              <span className="profile-field-value">
                {student.createdAt.toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>

          {/* Body composition */}
          <div className="body-comp">
            <h2 className="body-comp-title">Composição Corporal</h2>
            {student.profile?.height ?? student.profile?.weight ? (
              <div className="body-comp-grid">
                {student.profile?.height && (
                  <div className="body-comp-stat">
                    <span className="body-comp-value">{student.profile.height}</span>
                    <span className="body-comp-unit">cm</span>
                    <span className="body-comp-label">Altura</span>
                  </div>
                )}
                {student.profile?.weight && (
                  <div className="body-comp-stat">
                    <span className="body-comp-value">{student.profile.weight}</span>
                    <span className="body-comp-unit">kg</span>
                    <span className="body-comp-label">Peso</span>
                  </div>
                )}
                {student.profile?.height && student.profile?.weight && (() => {
                  const bmi = student.profile.weight / Math.pow(student.profile.height / 100, 2);
                  const category =
                    bmi < 18.5 ? "Abaixo do peso"
                    : bmi < 25 ? "Peso normal"
                    : bmi < 30 ? "Sobrepeso"
                    : "Obesidade";
                  const categoryClass =
                    bmi < 18.5 ? "bmi-low"
                    : bmi < 25 ? "bmi-normal"
                    : bmi < 30 ? "bmi-over"
                    : "bmi-obese";
                  return (
                    <div className="body-comp-stat">
                      <span className="body-comp-value">{bmi.toFixed(1)}</span>
                      <span className="body-comp-unit">IMC</span>
                      <span className={`body-comp-bmi-category ${categoryClass}`}>{category}</span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="profile-empty">Altura e peso não informados.</p>
            )}
          </div>

          {/* Weight progression */}
          <div className="weight-history">
            <h2 className="weight-history-title">Progressão de Peso</h2>
            {student.weightEntries.length > 0 ? (
              <ul className="weight-history-list">
                {student.weightEntries.map((entry, i) => {
                  const prev = student.weightEntries[i + 1];
                  const diff = prev ? entry.weight - prev.weight : null;
                  const diffClass = diff === null ? "" : getWeightDiffClass(diff, student.profile?.objective ?? null);
                  const diffLabel = diff === null ? "" : getDiffLabel(diff, student.profile?.objective ?? null);
                  return (
                    <li key={entry.id} className="weight-history-item">
                      <span className="weight-history-date">
                        {entry.date.toLocaleDateString("pt-BR")}
                      </span>
                      <div className="weight-history-right">
                        {diff !== null && (
                          <span className={`weight-diff ${diffClass}`}>
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
                            <span className="weight-diff-label">{diffLabel}</span>
                          </span>
                        )}
                        <span className="weight-history-value">{entry.weight} kg</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="profile-empty">Nenhum registro de peso ainda.</p>
            )}
          </div>
        </div>

        {/* Activity history */}
        <div className="student-info-card">
          <h2 className="weight-history-title" style={{ marginBottom: 0 }}>Histórico de Atividades</h2>
          {completionDates.length === 0 ? (
            <p className="activity-empty">Nenhum treino realizado ainda.</p>
          ) : (
            <ul className="activity-list">
              {completionDates.map((dateKey) => {
                const items = completionsByDate[dateKey]!;
                const date = new Date(dateKey + "T12:00:00");
                return (
                  <li key={dateKey} className="activity-day">
                    <span className="activity-date">
                      {date.toLocaleDateString("pt-BR")}
                    </span>
                    <ul className="activity-exercises">
                      {items.map((c) => (
                        <li key={c.id} className="activity-exercise">
                          <span className="activity-exercise-name">
                            {c.studentWorkoutItem.exercise.name}
                          </span>
                          <span className="activity-exercise-workout">
                            {c.studentWorkoutItem.studentWorkout.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Workout plan editor */}
        <div className="plan-section">
          <h2 className="plan-section-title">Plano de Treinos</h2>
          <WorkoutPlanEditor
            studentId={studentId}
            initialPlan={initialPlan}
            allExercises={allExercises}
          />
        </div>
      </main>
    </div>
  );
}
