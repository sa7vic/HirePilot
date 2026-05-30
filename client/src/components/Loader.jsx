const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export default function Loader({ label, size = "md" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span
        className={`animate-spin rounded-full border-slate-500 border-t-emerald-400 ${
          sizeMap[size] || sizeMap.md
        }`}
      />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
