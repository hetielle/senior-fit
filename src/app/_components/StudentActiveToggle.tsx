"use client";

import { useState } from "react";
import { api } from "pnpm/trpc/react";

type Props = {
  studentId: string;
  initialIsActive: boolean;
};

export function StudentActiveToggle({ studentId, initialIsActive }: Props) {
  const [isActive, setIsActive] = useState(initialIsActive);

  const toggle = api.instructor.toggleStudentActive.useMutation({
    onSuccess: (data) => setIsActive(data.isActive),
  });

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    toggle.mutate({ studentId, isActive: !isActive });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      className={`student-active-toggle ${isActive ? "student-active-toggle--active" : "student-active-toggle--inactive"}`}
      aria-label={isActive ? "Desativar aluno" : "Ativar aluno"}
    >
      {isActive ? "Ativo" : "Inativo"}
    </button>
  );
}
