"use client";

import { useState } from "react";
import { api } from "pnpm/trpc/react";

type Exercise = { id: string; name: string; muscleGroup: string };

type Item = {
  id: string;
  order: number;
  sets: number | null;
  reps: number | null;
  durationSecs: number | null;
  exercise: Exercise;
};

type DayPlan = { id: string; title: string; items: Item[] };

type Props = {
  studentId: string;
  initialPlan: Record<number, DayPlan | null>;
  allExercises: Exercise[];
};

const DAY_LABELS: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
  0: "Dom",
};
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function WorkoutPlanEditor({ studentId, initialPlan, allExercises }: Props) {
  const [plan, setPlan] = useState<Record<number, DayPlan | null>>(initialPlan);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [newTitle, setNewTitle] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState(allExercises[0]?.id ?? "");
  const [newSets, setNewSets] = useState("3");
  const [newReps, setNewReps] = useState("10");
  const [newDuration, setNewDuration] = useState("");
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const upsert = api.studentWorkout.upsertStudentWorkout.useMutation({
    onSuccess: (data) => {
      setPlan((prev) => ({ ...prev, [data.dayOfWeek]: data }));
      setNewTitle("");
    },
  });

  const addItem = api.studentWorkout.addItem.useMutation({
    onSuccess: (item) => {
      setPlan((prev) => {
        const day = prev[selectedDay];
        if (!day) return prev;
        return { ...prev, [selectedDay]: { ...day, items: [...day.items, item] } };
      });
    },
  });

  const removeItem = api.studentWorkout.removeItem.useMutation({
    onMutate: ({ itemId }) => setRemovingItemId(itemId),
    onSettled: () => setRemovingItemId(null),
    onSuccess: (_data, { itemId }) => {
      setPlan((prev) => {
        const day = prev[selectedDay];
        if (!day) return prev;
        return {
          ...prev,
          [selectedDay]: { ...day, items: day.items.filter((i) => i.id !== itemId) },
        };
      });
    },
  });

  const deleteWorkout = api.studentWorkout.deleteStudentWorkout.useMutation({
    onSuccess: () => {
      setPlan((prev) => ({ ...prev, [selectedDay]: null }));
    },
  });

  const dayPlan = plan[selectedDay] ?? null;

  function handleCreateWorkout() {
    const title = newTitle.trim() || DAY_LABELS[selectedDay]!;
    upsert.mutate({ studentId, dayOfWeek: selectedDay, title });
  }

  function handleAddExercise() {
    if (!dayPlan || !selectedExerciseId) return;
    addItem.mutate({
      studentWorkoutId: dayPlan.id,
      exerciseId: selectedExerciseId,
      sets: newSets ? parseInt(newSets) : null,
      reps: newReps && !newDuration ? parseInt(newReps) : null,
      durationSecs: newDuration ? parseInt(newDuration) : null,
    });
  }

  function handleDeleteWorkout() {
    if (!dayPlan) return;
    if (!confirm("Excluir o treino deste dia?")) return;
    deleteWorkout.mutate({ studentWorkoutId: dayPlan.id });
  }

  return (
    <div className="plan-editor">
      {/* Day tabs */}
      <div className="day-tabs">
        {DAY_ORDER.map((dow) => (
          <button
            key={dow}
            className={`day-tab ${selectedDay === dow ? "day-tab-active" : ""} ${plan[dow] ? "day-tab-has-workout" : ""}`}
            onClick={() => setSelectedDay(dow)}
          >
            {DAY_LABELS[dow]}
          </button>
        ))}
      </div>

      {/* Day panel */}
      <div className="day-panel">
        {dayPlan ? (
          <>
            <div className="day-panel-header">
              <h3 className="day-panel-title">{dayPlan.title}</h3>
              <button
                className="btn-delete-day"
                onClick={handleDeleteWorkout}
                disabled={deleteWorkout.isPending}
              >
                {deleteWorkout.isPending ? "Excluindo..." : "Excluir dia"}
              </button>
            </div>

            {/* Exercise list */}
            {dayPlan.items.length > 0 ? (
              <ul className="editor-exercise-list">
                {dayPlan.items.map((item) => (
                  <li key={item.id} className="editor-exercise-item">
                    <div className="editor-exercise-info">
                      <span className="editor-exercise-name">{item.exercise.name}</span>
                      <span className="editor-exercise-muscle">{item.exercise.muscleGroup}</span>
                    </div>
                    <div className="editor-exercise-right">
                      <span className="editor-exercise-volume">
                        {item.durationSecs
                          ? `${item.sets}× ${item.durationSecs}s`
                          : `${item.sets}×${item.reps}`}
                      </span>
                      <button
                        className="btn-remove-item"
                        onClick={() => removeItem.mutate({ itemId: item.id })}
                        disabled={removingItemId === item.id}
                        aria-label="Remover exercício"
                      >
                        {removingItemId === item.id ? "·" : "×"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="editor-empty">Nenhum exercício. Adicione abaixo.</p>
            )}

            {/* Add exercise row */}
            <div className="add-exercise-row">
              <select
                className="editor-select"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
              >
                {allExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} — {ex.muscleGroup}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="editor-input-sm"
                placeholder="Séries"
                value={newSets}
                onChange={(e) => setNewSets(e.target.value)}
                min="1"
              />
              <input
                type="number"
                className="editor-input-sm"
                placeholder="Reps"
                value={newReps}
                onChange={(e) => setNewReps(e.target.value)}
                min="1"
              />
              <input
                type="number"
                className="editor-input-sm"
                placeholder="Duração (s)"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                min="1"
              />
              <button
                className="btn-add-exercise"
                onClick={handleAddExercise}
                disabled={addItem.isPending || !selectedExerciseId}
              >
                {addItem.isPending ? "Adicionando..." : "Adicionar"}
              </button>
            </div>
          </>
        ) : (
          <div className="no-workout-panel">
            <p className="no-workout-text">Nenhum treino para este dia.</p>
            <div className="create-workout-row">
              <input
                type="text"
                className="editor-input"
                placeholder={`Ex: ${DAY_LABELS[selectedDay]} — Membros Superiores`}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <button
                className="btn-create-workout"
                onClick={handleCreateWorkout}
                disabled={upsert.isPending}
              >
                {upsert.isPending ? "Criando..." : "Criar treino"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
