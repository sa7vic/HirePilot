import { useEffect, useMemo, useState } from "react";

const parseNumber = (value) => {
  if (typeof value === "number") return { number: value, suffix: "" };
  const match = String(value).match(/(\d+)(.*)/);
  if (!match) return { number: 0, suffix: String(value) };
  return { number: Number(match[1]), suffix: match[2] || "" };
};

export default function StatCard({ label, value, helper }) {
  const { number, suffix } = useMemo(() => parseNumber(value), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 600;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const next = Math.round(start + (number - start) * progress);
      setDisplay(next);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [number]);

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-card transition hover:-translate-y-1 hover:shadow-glow">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between">
        <h3 className="font-heading text-3xl font-semibold text-slate-100">
          {display}
          {suffix}
        </h3>
        <span className="text-xs text-slate-500">{helper}</span>
      </div>
    </div>
  );
}
