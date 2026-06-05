import Image from "next/image";
import { db } from "pnpm/server/db";
import { requireInstructor } from "pnpm/server/better-auth/guards";
import logo from "../../imgs/logo.png";
import "./page.css";

export default async function InstructorStudents() {
  await requireInstructor();

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    include: { profile: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="instructor-wrapper">
      <header className="instructor-header">
        <Image src={logo} alt="Logo" className="instructor-logo" />
        <nav className="header-nav">
          <a href="/instructor/students" className="nav-link nav-link-active">
            Meus Alunos
          </a>
        </nav>
      </header>

      <main className="instructor-main">
        <h1 className="instructor-title">Meus Alunos</h1>

        {students.length === 0 ? (
          <div className="students-empty">
            <p>Nenhum aluno cadastrado ainda.</p>
          </div>
        ) : (
          <div className="students-list">
            {students.map((student) => (
              <a
                key={student.id}
                href={`/instructor/students/${student.id}`}
                className="student-card"
              >
                <div className="student-card-info">
                  <span className="student-name">{student.name}</span>
                  <span className="student-email">{student.email}</span>
                  {student.profile?.objective && (
                    <span className="student-objective">
                      {student.profile.objective}
                    </span>
                  )}
                </div>
                <span className="student-card-arrow">→</span>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
