"use client";

import { api } from "pnpm/trpc/react";

type Props = { studentId: string };

function adherenceClass(v: number | null): string {
  if (v === null) return "metrics-value-neutral";
  if (v >= 80) return "metrics-value-good";
  if (v >= 50) return "metrics-value-warn";
  return "metrics-value-bad";
}

const TREND_LABEL = {
  up: "↑ Ganhando peso",
  down: "↓ Perdendo peso",
  stable: "→ Estável",
  insufficient_data: "",
} as const;

const TREND_CLASS = {
  up: "metrics-trend metrics-trend-up",
  down: "metrics-trend metrics-trend-down",
  stable: "metrics-trend metrics-trend-stable",
  insufficient_data: "",
} as const;

export function StudentMetrics({ studentId }: Props) {
  const { data, isLoading } = api.instructor.getStudentMetrics.useQuery({
    studentId,
  });

  const dash = "–";

  return (
    <div className="metrics-section">
      <h2 className="metrics-title">Métricas de Desempenho</h2>
      <div className="metrics-grid">
        <div className="metrics-tile">
          <span
            className={`metrics-value ${isLoading ? "metrics-loading" : adherenceClass(data?.adherence7d ?? null)}`}
          >
            {isLoading
              ? dash
              : data?.adherence7d != null
                ? `${data.adherence7d}%`
                : dash}
          </span>
          <span className="metrics-label">Aderência</span>
          <span className="metrics-sublabel">7 dias</span>
        </div>

        <div className="metrics-tile">
          <span
            className={`metrics-value ${isLoading ? "metrics-loading" : adherenceClass(data?.adherence30d ?? null)}`}
          >
            {isLoading
              ? dash
              : data?.adherence30d != null
                ? `${data.adherence30d}%`
                : dash}
          </span>
          <span className="metrics-label">Aderência</span>
          <span className="metrics-sublabel">30 dias</span>
        </div>

        <div className="metrics-tile">
          <span
            className={`metrics-value ${isLoading ? "metrics-loading" : "metrics-value-neutral"}`}
          >
            {isLoading ? dash : (data?.streak ?? 0)}
          </span>
          <span className="metrics-label">Sequência</span>
          <span className="metrics-sublabel">dias consecutivos</span>
        </div>

        <div className="metrics-tile">
          <span
            className={`metrics-value ${isLoading ? "metrics-loading" : "metrics-value-neutral"}`}
          >
            {isLoading ? dash : (data?.totalSessions30d ?? 0)}
          </span>
          <span className="metrics-label">Sessões</span>
          <span className="metrics-sublabel">últimos 30 dias</span>
        </div>

        <div className="metrics-tile metrics-tile--wide">
          <span
            className={`metrics-value metrics-muscle ${isLoading ? "metrics-loading" : "metrics-value-neutral"}`}
          >
            {isLoading ? dash : (data?.topMuscleGroup30d ?? dash)}
          </span>
          <span className="metrics-label">Grupo mais treinado</span>
          <span className="metrics-sublabel">últimos 30 dias</span>
        </div>
      </div>

      {!isLoading &&
        data &&
        data.weightTrend !== "insufficient_data" && (
          <p className={TREND_CLASS[data.weightTrend]}>
            Tendência de peso: {TREND_LABEL[data.weightTrend]}
          </p>
        )}
    </div>
  );
}
