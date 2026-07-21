import { HeaderSkeleton } from "../../../_components/HeaderSkeleton";
import "./page.css";

export default function Loading() {
  return (
    <div className="student-detail-wrapper">
      <HeaderSkeleton />

      <main className="student-detail-main">
        <div className="student-info-card">
          <div className="skeleton mb-1 h-7 w-48" />
          <div className="skeleton mb-4 h-4 w-56" />
          <div className="student-profile-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="profile-field">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton mt-1 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        <div className="plan-section">
          <div className="skeleton mb-4 h-6 w-36" />
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
