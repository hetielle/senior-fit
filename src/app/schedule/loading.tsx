import { HeaderSkeleton } from "../_components/HeaderSkeleton";
import "./page.css";

export default function Loading() {
  return (
    <div className="schedule-wrapper">
      <HeaderSkeleton />

      <main className="schedule-main">
        <div className="skeleton mb-6 h-8 w-52" />

        <div className="week-list">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="day-card">
              <div className="day-card-header">
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-3 w-20" />
                </div>
                <div className="skeleton h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
