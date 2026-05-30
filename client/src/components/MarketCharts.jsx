import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const PALETTE = ["#6ee7b7","#818cf8","#38bdf8","#fb923c","#f472b6","#a3e635","#e879f9"];
const PALETTE2 = ["#34d399","#a78bfa","#7dd3fc","#fdba74","#f9a8d4","#bef264","#f0abfc"];

const tooltipStyle = {
  background: "#0a0f1e",
  border: "1px solid rgba(148,163,184,0.12)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
  padding: "8px 12px",
};

const formatMoney = (v) =>
  v
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v)
    : "$0";

const tickStyle = { fill: "#64748b", fontSize: 11 };

function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5 ${className}`}>
      {children}
    </div>
  );
}

function PanelTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      {label && <p className="mb-1 text-xs font-medium text-slate-300">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color || "#6ee7b7" }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function Empty({ message = "No data available." }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-600">
      {message}
    </div>
  );
}

function TrendingSkillsChart({ data }) {
  if (!data?.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={data} margin={{ left: -10, right: 8 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6ee7b7" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
        <XAxis dataKey="skill" tick={tickStyle} interval={0} angle={-30} textAnchor="end" height={52} />
        <YAxis tick={tickStyle} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone" dataKey="demand" name="Demand"
          stroke="#6ee7b7" strokeWidth={2}
          fill="url(#trendGrad)"
          dot={{ r: 3, fill: "#6ee7b7", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CategoryDonut({ data }) {
  if (!data?.length) return <Empty />;
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name"
            outerRadius={88} innerRadius={48} paddingAngle={3} strokeWidth={0}>
            {data.map((e, i) => <Cell key={e.name} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((e, i) => (
          <span key={e.name} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {e.name}
            <span className="text-slate-600">({e.value})</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TopSkillsBar({ data }) {
  if (!data?.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 28 + 40, 280)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" horizontal={false} />
        <XAxis type="number" tick={tickStyle} allowDecimals={false} />
        <YAxis type="category" dataKey="skill" width={110} tick={{ ...tickStyle, fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Jobs" radius={[0, 8, 8, 0]}>
          {data.map((item, i) => <Cell key={item.skill} fill={PALETTE2[i % PALETTE2.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function GeoDemandBar({ data }) {
  if (!data?.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -10, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
        <XAxis dataKey="region" tick={tickStyle} />
        <YAxis tick={tickStyle} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="jobs" name="Jobs" radius={[8, 8, 0, 0]}>
          {data.map((item, i) => <Cell key={item.region} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SalaryCard({ insights }) {
  if (!insights) return null;
  const { averageMin, averageMax, sampleSize, isEstimated } = insights;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Avg. min</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-100">{formatMoney(averageMin)}</p>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Avg. max</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-100">{formatMoney(averageMax)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-emerald-400">Data points</p>
          <p className="mt-0.5 text-lg font-semibold text-emerald-200">{sampleSize.toLocaleString()}</p>
        </div>
        {isEstimated && (
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-300">
            Market estimate
          </span>
        )}
      </div>
      {isEstimated && (
        <p className="text-[11px] leading-relaxed text-slate-600">
          Live salary data unavailable for this category. Figures are industry benchmarks.
        </p>
      )}
    </div>
  );
}

function SkillPairings({ pairings }) {
  if (!pairings?.length) return <Empty message="No pairings detected yet." />;
  const max = pairings[0]?.count || 1;
  return (
    <div className="space-y-2">
      {pairings.map((pair) => (
        <div key={pair.pair}
          className="relative overflow-hidden rounded-xl border border-slate-800/50 bg-slate-950/30 px-4 py-2.5">
          <div
            className="absolute inset-y-0 left-0 rounded-xl bg-indigo-500/10"
            style={{ width: `${(pair.count / max) * 100}%` }}
          />
          <div className="relative flex items-center justify-between gap-2">
            <span className="text-xs leading-snug text-slate-300">{pair.pair}</span>
            <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
              {pair.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmergingTech({ items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">Emerging technologies</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((tech) => (
          <span key={tech}
            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-300">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MarketCharts({ analytics }) {
  if (!analytics) {
    return (
      <Panel>
        <p className="text-sm text-slate-500">Run market analytics to view demand intelligence.</p>
      </Panel>
    );
  }

  const trendingData  = analytics.trendingSkills.map((i) => ({ skill: i.skill, demand: i.count }));
  const categoryData  = analytics.jobCategories.map((i) => ({ name: i.category, value: i.count }));
  const topSkillsData = analytics.topSkills.map((i) => ({ skill: i.skill, count: i.count }));
  const geoData       = analytics.geoDemand.map((i) => ({ region: i.region, jobs: i.count }));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <PanelTitle title="Trending skills" subtitle="Most rapidly appearing technologies" />
        <TrendingSkillsChart data={trendingData} />
      </Panel>

      <Panel>
        <PanelTitle title="Job category mix" subtitle="Breakdown by engineering domain" />
        <CategoryDonut data={categoryData} />
      </Panel>

      <Panel>
        <PanelTitle title="Most requested technologies" subtitle="Top technologies employers are hiring for" />
        <TopSkillsBar data={topSkillsData} />
      </Panel>

      <Panel>
        <PanelTitle title="Geographic demand" subtitle="Regions with highest hiring volume" />
        <GeoDemandBar data={geoData} />
      </Panel>

      <Panel className="lg:col-span-2">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <PanelTitle title="Salary insights" subtitle="Compensation data for this category" />
            <SalaryCard insights={analytics.salaryInsights} />
            <EmergingTech items={analytics.emergingTechnologies} />
          </div>
          <div>
            <PanelTitle title="Skill pairings" subtitle="Technologies frequently appearing together" />
            <SkillPairings pairings={analytics.skillPairings} />
          </div>
        </div>
      </Panel>
    </div>
  );
}