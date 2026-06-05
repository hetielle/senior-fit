import { redirect } from "next/navigation";
import Image from "next/image";
import { db } from "pnpm/server/db";
import { requireStudent } from "pnpm/server/better-auth/guards";
import logo from "../imgs/logo.png";
import "./page.css";

const OBJECTIVES = [
  "Perder peso",
  "Ganhar massa muscular",
  "Manter peso",
  "Melhorar flexibilidade",
  "Saúde geral e bem-estar",
  "Reabilitação",
];

export default async function Profile() {
  const session = await requireStudent();

  const [profile, weightEntries] = await Promise.all([
    db.userProfile.findUnique({ where: { userId: session.user.id } }),
    db.weightEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  async function saveProfile(formData: FormData) {
    "use server";
    const s = await requireStudent();

    const name = (formData.get("name") as string)?.trim();
    const ageRaw = formData.get("age") as string;
    const heightRaw = formData.get("height") as string;
    const weightRaw = formData.get("weight") as string;

    if (name) {
      await db.user.update({ where: { id: s.user.id }, data: { name } });
    }

    await db.userProfile.upsert({
      where: { userId: s.user.id },
      update: {
        age: ageRaw ? parseInt(ageRaw) : null,
        phone: (formData.get("phone") as string) || null,
        objective: (formData.get("objective") as string) || null,
        height: heightRaw ? parseFloat(heightRaw) : null,
        weight: weightRaw ? parseFloat(weightRaw) : null,
      },
      create: {
        userId: s.user.id,
        age: ageRaw ? parseInt(ageRaw) : null,
        phone: (formData.get("phone") as string) || null,
        objective: (formData.get("objective") as string) || null,
        height: heightRaw ? parseFloat(heightRaw) : null,
        weight: weightRaw ? parseFloat(weightRaw) : null,
      },
    });

    redirect("/profile");
  }

  async function addWeight(formData: FormData) {
    "use server";
    const s = await requireStudent();

    const weight = parseFloat(formData.get("newWeight") as string);
    if (!isNaN(weight) && weight > 0) {
      await db.weightEntry.create({ data: { userId: s.user.id, weight } });
    }

    redirect("/profile");
  }

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <Image src={logo} alt="Logo" className="profile-logo" />
        <nav className="header-nav">
          <a href="/workouts" className="nav-link">
            Hoje
          </a>
          <a href="/schedule" className="nav-link">
            Semana
          </a>
          <a href="/profile" className="nav-link nav-link-active">
            Perfil
          </a>
        </nav>
      </header>

      <main className="profile-main">
        <h1 className="profile-title">Meu Perfil</h1>

        <form action={saveProfile}>
          <section className="profile-section">
            <h2 className="section-title">Informações Pessoais</h2>
            <div className="fields-grid">
              <div className="field-group">
                <label className="field-label">Nome</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={session.user.name ?? ""}
                  className="field-input"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Idade</label>
                <input
                  name="age"
                  type="number"
                  min="0"
                  max="120"
                  defaultValue={profile?.age ?? ""}
                  className="field-input"
                  placeholder="Ex: 65"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Telefone</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ""}
                  className="field-input"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2 className="section-title">Objetivo</h2>
            <div className="field-group">
              <label className="field-label">Objetivo na academia</label>
              <select
                name="objective"
                className="field-input"
                defaultValue={profile?.objective ?? ""}
              >
                <option value="">Selecione um objetivo</option>
                {OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="profile-section">
            <h2 className="section-title">Composição Corporal</h2>
            <div className="fields-grid">
              <div className="field-group">
                <label className="field-label">Altura (cm)</label>
                <input
                  name="height"
                  type="number"
                  min="50"
                  max="250"
                  step="0.1"
                  defaultValue={profile?.height ?? ""}
                  className="field-input"
                  placeholder="Ex: 170"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Peso atual (kg)</label>
                <input
                  name="weight"
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  defaultValue={profile?.weight ?? ""}
                  className="field-input"
                  placeholder="Ex: 70.5"
                />
              </div>
            </div>
          </section>

          <button type="submit" className="btn-save">
            Salvar perfil
          </button>
        </form>

        <section className="profile-section weight-section">
          <h2 className="section-title">Progressão de Peso</h2>

          <form action={addWeight} className="add-weight-form">
            <input
              name="newWeight"
              type="number"
              min="20"
              max="300"
              step="0.1"
              className="field-input"
              placeholder="Registrar novo peso (kg)"
              required
            />
            <button type="submit" className="btn-add-weight">
              Registrar
            </button>
          </form>

          {weightEntries.length > 0 ? (
            <ul className="weight-list">
              {weightEntries.map((entry, i) => {
                const prev = weightEntries[i + 1];
                const diff = prev ? entry.weight - prev.weight : null;
                return (
                  <li key={entry.id} className="weight-entry">
                    <span className="weight-date">
                      {entry.date.toLocaleDateString("pt-BR")}
                    </span>
                    <div className="weight-right">
                      {diff !== null && (
                        <span
                          className={`weight-diff ${diff > 0 ? "weight-diff-up" : "weight-diff-down"}`}
                        >
                          {diff > 0 ? "+" : ""}
                          {diff.toFixed(1)} kg
                        </span>
                      )}
                      <span className="weight-value">{entry.weight} kg</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="weight-empty">
              Nenhum registro ainda. Adicione seu peso acima!
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
