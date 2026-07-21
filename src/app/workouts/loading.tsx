import { HeaderSkeleton } from "../_components/HeaderSkeleton";
import "./page.css";

export default function Loading() {
  return (
    <div className="workouts-wrapper">
      <HeaderSkeleton />

      <main className="workouts-main">
        <div className="workouts-greeting">
          <div className="skeleton h-4 w-44" />
          <div className="skeleton mt-1.5 h-6 w-36" />
        </div>

        <div className="workout-header mt-6">
          <div className="skeleton h-5 w-28 rounded-full" />
          <div className="skeleton mt-3 h-8 w-56" />
          <div className="skeleton mt-2 h-4 w-24" />
        </div>

        <div className="exercise-list mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="exercise-card">
              <div className="exercise-card-top">
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-4 w-36" />
                  <div className="skeleton h-3 w-20" />
                </div>
                <div className="exercise-card-right">
                  <div className="skeleton h-10 w-10" />
                  <div className="skeleton h-7 w-7 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
