import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#6366f1"];

export default function Charts({ applications }) {
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  if (data.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6 text-slate-400">
        No application data yet. Add applications to unlock analytics.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Pipeline volume
        </h3>
        <div className="mt-4 h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="status" tick={{ fill: "#94a3b8" }} />
              <YAxis allowDecimals={false} tick={{ fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Status mix
        </h3>
        <div className="mt-4 h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="status" outerRadius={90}>
                {data.map((entry, index) => (
                  <Cell key={entry.status} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#e2e8f0",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
