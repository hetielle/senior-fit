"use client";

import { useState } from "react";

type Completion = {
  id: string;
  studentWorkoutItem: {
    exercise: { name: string };
    studentWorkout: { title: string };
  };
};

type Props = {
  completionsByDate: Record<string, Completion[]>;
  completionDates: string[];
};

const PAGE_SIZE = 5;

export function ActivityHistory({ completionsByDate, completionDates }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (completionDates.length === 0) {
    return <p className="activity-empty">Nenhum treino realizado ainda.</p>;
  }

  const shown = completionDates.slice(0, visible);
  const hasMore = visible < completionDates.length;

  return (
    <>
      <ul className="activity-list">
        {shown.map((dateKey) => {
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
      {hasMore && (
        <button
          className="activity-show-more"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Ver mais ({completionDates.length - visible} dias restantes)
        </button>
      )}
    </>
  );
}
