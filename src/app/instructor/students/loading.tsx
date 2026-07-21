import { HeaderSkeleton } from "../../_components/HeaderSkeleton";
import "./page.css";

export default function Loading() {
  return (
    <div className="instructor-wrapper">
      <HeaderSkeleton />

      <main className="instructor-main">
        <div className="skeleton mb-6 h-9 w-48" />

        <div className="students-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="student-card">
              <div className="student-card-info">
                <div className="skeleton h-4 w-36" />
                <div className="skeleton mt-1.5 h-3 w-48" />
              </div>
              <div className="skeleton h-4 w-4" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
