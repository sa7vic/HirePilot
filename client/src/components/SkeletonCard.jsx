export default function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`glass-panel rounded-3xl p-5 shadow-card animate-pulse ${className}`}
    >
      <div className="h-3 w-24 rounded-full bg-slate-700/60" />
      <div className="mt-4 h-8 w-20 rounded-full bg-slate-700/60" />
      <div className="mt-4 h-3 w-full rounded-full bg-slate-700/40" />
    </div>
  );
}
