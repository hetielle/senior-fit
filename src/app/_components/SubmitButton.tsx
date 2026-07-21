"use client";

import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  loadingLabel: string;
  className: string;
};

export function SubmitButton({ label, loadingLabel, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? loadingLabel : label}
    </button>
  );
}
