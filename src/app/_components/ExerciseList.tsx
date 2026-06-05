"use client";

import { useState } from "react";
import { api } from "pnpm/trpc/react";

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
  const today = new Date().toISOString().split("T")[0]!;

  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () =>
      new Set(
        items
          .filter((item) => item.completions.length > 0)
          .map((item) => item.id),
      ),
  );

  const toggle = api.studentWorkout.toggleCompletion.useMutation({
    onMutate: ({ studentWorkoutItemId }) => {
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
    onError: (_err, { studentWorkoutItemId }) => {
      // revert on error
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

  return (
    <div className="exercise-list">
      {items.map((item) => {
        const done = completedIds.has(item.id);
        return (
          <div
            key={item.id}
            className={`exercise-card ${done ? "exercise-card-done" : ""}`}
          >
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
                        {item.sets}×{item.reps}
                      </span>
                      <span className="volume-label">séries × reps</span>
                    </>
                  )}
                </div>
                <button
                  className={`check-btn ${done ? "check-btn-done" : ""}`}
                  onClick={() =>
                    toggle.mutate({
                      studentWorkoutItemId: item.id,
                      date: today,
                    })
                  }
                  aria-label={done ? "Desmarcar" : "Marcar como feito"}
                >
                  {done ? "✓" : "○"}
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
