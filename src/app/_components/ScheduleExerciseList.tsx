"use client";

import { useState } from "react";
import { ExerciseSvg } from "./ExerciseSvg";

type Item = {
  id: string;
  sets: number | null;
  reps: number | null;
  durationSecs: number | null;
  exercise: { name: string; muscleGroup: string };
};

export function ScheduleExerciseList({
  items,
  completedIds,
}: {
  items: Item[];
  completedIds: Set<string>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ul className="day-exercise-list">
      {items.map((item) => {
        const done = completedIds.has(item.id);
        const expanded = expandedId === item.id;
        return (
          <li
            key={item.id}
            className={`day-exercise-item ${done ? "day-exercise-done" : ""}`}
          >
            <div className="day-exercise-item-row">
              <div className="day-exercise-name">
                {item.exercise.name}
                <span className="day-exercise-muscle">
                  {item.exercise.muscleGroup}
                </span>
              </div>
              <div className="day-exercise-right">
                {done && <span className="day-exercise-check">✓</span>}
                <span className="day-exercise-volume">
                  {item.durationSecs
                    ? `${item.sets}× ${item.durationSecs}s`
                    : item.reps
                    ? `${item.sets}×${item.reps}`
                    : `${item.sets} séries`}
                </span>
                <button
                  className="day-exercise-expand-btn"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  aria-expanded={expanded}
                >
                  {expanded ? "Recolher ▲" : "Ver exercício ▼"}
                </button>
              </div>
            </div>
            {expanded && <ExerciseSvg exerciseName={item.exercise.name} />}
          </li>
        );
      })}
    </ul>
  );
}
