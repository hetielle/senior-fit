"use client";

import { useState } from "react";
import { api } from "pnpm/trpc/react";
import { ExerciseSvg } from "./ExerciseSvg";

type Exercise = {
  name: string;
  muscleGroup: string;
  description: string | null;
};

type Item = {
  id: string;
  sets: number | null;
  reps: number | null;
  durationSecs: number | null;
  exercise: Exercise;
  completions: { id: string }[];
};

export function ExerciseList({ items }: { items: Item[] }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () =>
      new Set(
        items
          .filter((item) => item.completions.length > 0)
          .map((item) => item.id),
      ),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const toggle = api.studentWorkout.toggleCompletion.useMutation({
    onMutate: ({ studentWorkoutItemId }) => {
      setPendingId(studentWorkoutItemId);
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(studentWorkoutItemId)) {
          next.delete(studentWorkoutItemId);
        } else {
          next.add(studentWorkoutItemId);
        }
        return next;
      });
    },
    onSettled: () => setPendingId(null),
    onError: (_err, { studentWorkoutItemId }) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(studentWorkoutItemId)) {
          next.delete(studentWorkoutItemId);
        } else {
          next.add(studentWorkoutItemId);
        }
        return next;
      });
    },
  });

  const allDone = items.length > 0 && completedIds.size === items.length;

  return (
    <div className="exercise-list">
      <div className="exercise-progress">
        <span className="exercise-progress-text">
          {completedIds.size} / {items.length} concluídos
        </span>
        <div className="exercise-progress-bar">
          <div
            className="exercise-progress-fill"
            style={{ width: `${items.length === 0 ? 0 : (completedIds.size / items.length) * 100}%` }}
          />
        </div>
      </div>

      {allDone && (
        <div className="workout-complete-banner">
          <span className="workout-complete-icon">🎉</span>
          <div>
            <p className="workout-complete-title">Treino concluído!</p>
            <p className="workout-complete-subtitle">Parabéns! Você completou todos os exercícios de hoje.</p>
          </div>
        </div>
      )}

      {items.map((item) => {
        const done = completedIds.has(item.id);
        const loading = pendingId === item.id;
        return (
          <div
            key={item.id}
            className={`exercise-card ${done ? "exercise-card-done" : ""}`}
          >
            <ExerciseSvg exerciseName={item.exercise.name} />
            <div className="exercise-card-top">
              <div>
                <h3 className="exercise-name">{item.exercise.name}</h3>
                <span className="exercise-muscle">
                  {item.exercise.muscleGroup}
                </span>
              </div>
              <div className="exercise-card-right">
                <div className="exercise-volume">
                  {item.durationSecs ? (
                    <>
                      <span className="volume-number">{item.sets}×</span>
                      <span className="volume-label">{item.durationSecs}s</span>
                    </>
                  ) : (
                    <>
                      <span className="volume-number">
                        {item.reps ? `${item.sets}×${item.reps}` : `${item.sets} séries`}
                      </span>
                      <span className="volume-label">séries × reps</span>
                    </>
                  )}
                </div>
                <button
                  className={`check-btn ${done ? "check-btn-done" : ""} ${loading ? "check-btn-loading" : ""}`}
                  onClick={() => toggle.mutate({ studentWorkoutItemId: item.id, date: today })}
                  disabled={loading}
                  aria-label={done ? "Desmarcar exercício" : "Marcar exercício como feito"}
                >
                  {loading ? "·" : done ? "✓" : "Feito?"}
                </button>
              </div>
            </div>
            {item.exercise.description && (
              <p className="exercise-description">{item.exercise.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
