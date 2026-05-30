export default function JobCard({ title, subtitle, badge }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-card transition hover:-translate-y-0.5 hover:border-slate-600/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-heading text-base font-semibold text-slate-100">
            {title}
          </h4>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
