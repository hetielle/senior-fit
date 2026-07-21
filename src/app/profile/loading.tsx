import { HeaderSkeleton } from "../_components/HeaderSkeleton";
import "./page.css";

export default function Loading() {
  return (
    <div className="profile-wrapper">
      <HeaderSkeleton />

      <main className="profile-main">
        <div className="skeleton mb-8 h-9 w-40" />

        {[...Array(3)].map((_, i) => (
          <section key={i} className="profile-section">
            <div className="skeleton mb-4 h-4 w-36" />
            <div className="fields-grid">
              <div className="field-group">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton mt-1.5 h-10 w-full" />
              </div>
              <div className="field-group">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton mt-1.5 h-10 w-full" />
              </div>
            </div>
          </section>
        ))}

        <div className="skeleton h-10 w-full rounded-lg" />

        <section className="profile-section weight-section mt-6">
          <div className="skeleton mb-4 h-4 w-40" />
          <div className="flex gap-2">
            <div className="skeleton h-10 flex-1" />
            <div className="skeleton h-10 w-24" />
          </div>
        </section>
      </main>
    </div>
  );
}
