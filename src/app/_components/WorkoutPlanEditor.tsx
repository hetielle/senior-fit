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

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // New exercise form
  const [newTitle, setNewTitle] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState(allExercises[0]?.id ?? "");
  const [newSets, setNewSets] = useState("3");
  const [newReps, setNewReps] = useState("10");
  const [newDuration, setNewDuration] = useState("");
  const [addingExercise, setAddingExercise] = useState(false);

  // Per-item inline editing: itemId → draft values
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemSets, setItemSets] = useState("");
  const [itemReps, setItemReps] = useState("");
  const [itemDuration, setItemDuration] = useState("");

  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const upsert = api.studentWorkout.upsertStudentWorkout.useMutation({
    onSuccess: (data) => {
      setPlan((prev) => ({ ...prev, [data.dayOfWeek]: data }));
      setNewTitle("");
      setEditingTitle(false);
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

  const updateItem = api.studentWorkout.updateItem.useMutation({
    onSuccess: (updated) => {
      setPlan((prev) => {
        const day = prev[selectedDay];
        if (!day) return prev;
        return {
          ...prev,
          [selectedDay]: {
            ...day,
            items: day.items.map((i) =>
              i.id === updated.id
                ? { ...i, sets: updated.sets, reps: updated.reps, durationSecs: updated.durationSecs }
                : i,
            ),
          },
        };
      });
      setEditingItemId(null);
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

  function handleSelectDay(dow: number) {
    setSelectedDay(dow);
    setAddingExercise(false);
    setEditingTitle(false);
    setEditingItemId(null);
  }

  function handleCreateWorkout() {
    const title = newTitle.trim() || DAY_LABELS[selectedDay]!;
    upsert.mutate({ studentId, dayOfWeek: selectedDay, title });
  }

  function handleSaveTitle() {
    if (!dayPlan) return;
    const title = titleDraft.trim();
    if (!title || title === dayPlan.title) { setEditingTitle(false); return; }
    upsert.mutate({ studentId, dayOfWeek: selectedDay, title });
  }

  function handleAddExercise() {
    if (!dayPlan || !selectedExerciseId) return;
    const parsedDuration = newDuration && parseInt(newDuration) > 0 ? parseInt(newDuration) : null;
    addItem.mutate({
      studentWorkoutId: dayPlan.id,
      exerciseId: selectedExerciseId,
      sets: newSets ? parseInt(newSets) : null,
      reps: newReps && !parsedDuration ? parseInt(newReps) : null,
      durationSecs: parsedDuration,
    });
  }

  function handleStartEditItem(item: Item) {
    setEditingItemId(item.id);
    setItemSets(item.sets?.toString() ?? "");
    setItemReps(item.reps?.toString() ?? "");
    setItemDuration(item.durationSecs?.toString() ?? "");
  }

  function handleSaveItem() {
    if (!editingItemId) return;
    const parsedDuration = itemDuration && parseInt(itemDuration) > 0 ? parseInt(itemDuration) : null;
    updateItem.mutate({
      itemId: editingItemId,
      sets: itemSets ? parseInt(itemSets) : null,
      reps: itemReps && !parsedDuration ? parseInt(itemReps) : null,
      durationSecs: parsedDuration,
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
            onClick={() => handleSelectDay(dow)}
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
              {editingTitle ? (
                <div className="title-edit-row">
                  <input
                    autoFocus
                    className="editor-input title-input"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                  />
                  <button className="btn-save-title" onClick={handleSaveTitle} disabled={upsert.isPending}>
                    {upsert.isPending ? "..." : "Salvar"}
                  </button>
                  <button className="btn-cancel-title" onClick={() => setEditingTitle(false)}>Cancelar</button>
                </div>
              ) : (
                <button
                  className="day-panel-title day-panel-title-btn"
                  onClick={() => { setTitleDraft(dayPlan.title); setEditingTitle(true); }}
                  title="Clique para editar o nome"
                >
                  {dayPlan.title}
                  <span className="title-edit-icon">✎</span>
                </button>
              )}
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
                {dayPlan.items.map((item) =>
                  editingItemId === item.id ? (
                    <li key={item.id} className="editor-exercise-item editor-exercise-item-editing">
                      <span className="editor-exercise-name">{item.exercise.name}</span>
                      <div className="item-edit-row">
                        <input
                          type="number"
                          className="editor-input-sm"
                          placeholder="Séries"
                          value={itemSets}
                          onChange={(e) => setItemSets(e.target.value)}
                          min="1"
                        />
                        <input
                          type="number"
                          className="editor-input-sm"
                          placeholder="Reps"
                          value={itemReps}
                          onChange={(e) => setItemReps(e.target.value)}
                          min="1"
                        />
                        <input
                          type="number"
                          className="editor-input-sm"
                          placeholder="Duração (s)"
                          value={itemDuration}
                          onChange={(e) => setItemDuration(e.target.value)}
                          min="0"
                        />
                        <button
                          className="btn-save-title"
                          onClick={handleSaveItem}
                          disabled={updateItem.isPending}
                        >
                          {updateItem.isPending ? "..." : "Salvar"}
                        </button>
                        <button className="btn-cancel-title" onClick={() => setEditingItemId(null)}>✕</button>
                      </div>
                    </li>
                  ) : (
                    <li key={item.id} className="editor-exercise-item">
                      <div className="editor-exercise-info">
                        <span className="editor-exercise-name">{item.exercise.name}</span>
                        <span className="editor-exercise-muscle">{item.exercise.muscleGroup}</span>
                      </div>
                      <div className="editor-exercise-right">
                        <span className="editor-exercise-volume">
                          {item.durationSecs
                            ? `${item.sets}× ${item.durationSecs}s`
                            : item.reps
                            ? `${item.sets}×${item.reps}`
                            : `${item.sets} séries`}
                        </span>
                        <button
                          className="btn-edit-item"
                          onClick={() => handleStartEditItem(item)}
                          aria-label="Editar exercício"
                        >
                          ✎
                        </button>
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
                  )
                )}
              </ul>
            ) : (
              <p className="editor-empty">Nenhum exercício. Adicione abaixo.</p>
            )}

            {/* Add exercise row */}
            {addingExercise ? (
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
                  min="0"
                />
                <button
                  className="btn-add-exercise"
                  onClick={handleAddExercise}
                  disabled={addItem.isPending || !selectedExerciseId}
                >
                  {addItem.isPending ? "Adicionando..." : "Adicionar"}
                </button>
                <button
                  className="btn-done-exercise"
                  onClick={() => setAddingExercise(false)}
                >
                  Concluído
                </button>
              </div>
            ) : (
              <div className="add-exercise-row">
                <button
                  className="btn-add-exercise"
                  onClick={() => setAddingExercise(true)}
                >
                  + Adicionar exercício
                </button>
              </div>
            )}
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
