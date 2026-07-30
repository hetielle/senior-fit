type Props = { isActive: boolean };

export function StudentActiveBadge({ isActive }: Props) {
  return (
    <span className={`student-active-badge ${isActive ? "student-active-badge--active" : "student-active-badge--inactive"}`}>
      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
}
