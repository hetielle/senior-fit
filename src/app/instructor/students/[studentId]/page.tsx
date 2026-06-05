import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "pnpm/server/db";
import { requireInstructor } from "pnpm/server/better-auth/guards";
import logo from "../../../imgs/logo.png";
import { WorkoutPlanEditor } from "../../../_components/WorkoutPlanEditor";
import "./page.css";

type Props = { params: Promise<{ studentId: string }> };

export default async function StudentDetail({ params }: Props) {
  await requireInstructor();
  const { studentId } = await params;

  const [student, studentWorkouts, allExercises] = await Promise.all([
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
  ]);

  if (!student) notFound();

  const initialPlan = Object.fromEntries(
    studentWorkouts.map((w) => [w.dayOfWeek, w]),
  ) as Record<number, (typeof studentWorkouts)[0] | null>;

  for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
    if (!(dow in initialPlan)) initialPlan[dow] = null;
  }

  return (
    <div className="student-detail-wrapper">
      <header className="student-detail-header">
        <Image src={logo} alt="Logo" className="student-detail-logo" />
        <nav className="header-nav">
          <a href="/instructor/students" className="nav-link">
            ← Alunos
          </a>
        </nav>
      </header>

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
            {student.profile?.height && (
              <div className="profile-field">
                <span className="profile-field-label">Altura</span>
                <span className="profile-field-value">{student.profile.height} cm</span>
              </div>
            )}
            {student.profile?.weight && (
              <div className="profile-field">
                <span className="profile-field-label">Peso</span>
                <span className="profile-field-value">{student.profile.weight} kg</span>
              </div>
            )}
          </div>

          {/* Weight progression */}
          {student.weightEntries.length > 0 && (
            <div className="weight-history">
              <h2 className="weight-history-title">Progressão de Peso</h2>
              <ul className="weight-history-list">
                {student.weightEntries.map((entry, i) => {
                  const prev = student.weightEntries[i + 1];
                  const diff = prev ? entry.weight - prev.weight : null;
                  return (
                    <li key={entry.id} className="weight-history-item">
                      <span className="weight-history-date">
                        {entry.date.toLocaleDateString("pt-BR")}
                      </span>
                      <div className="weight-history-right">
                        {diff !== null && (
                          <span
                            className={`weight-diff ${diff > 0 ? "weight-diff-up" : "weight-diff-down"}`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(1)} kg
                          </span>
                        )}
                        <span className="weight-history-value">{entry.weight} kg</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
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
