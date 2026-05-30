import { useEffect, useState } from "react";

import api from "../services/api.js";

import Charts from "../components/Charts.jsx";
import MarketCharts from "../components/MarketCharts.jsx";

const categories = [
  "frontend",
  "backend",
  "fullstack",
  "devops",
  "ai-ml",
  "data-science",
  "cybersecurity",
  "mobile",
];

export default function Analytics() {
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState(null);

  const [marketLoading, setMarketLoading] =
    useState(false);

  const [marketError, setMarketError] =
    useState("");

  const [category, setCategory] =
    useState("frontend");

  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(
          "/applications"
        );

        setApplications(
          data.applications || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  const analyzeMarket = async () => {
    try {
      setMarketLoading(true);

      setMarketError("");

      setAnalytics(null);

      const { data } = await api.post(
        "/analytics/market",
        {
          category,
          limit: 100,
        }
      );

      setAnalytics(data.analytics);
    } catch (error) {
      console.error(error);

      setMarketError(
        error?.response?.data?.message ||
          "Failed to generate analytics"
      );
    } finally {
      setMarketLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Analytics overview
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Visualize application momentum and
          live market demand.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel rounded-3xl p-6 text-slate-500">
          Loading analytics...
        </div>
      ) : (
        <Charts applications={applications} />
      )}

      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
          >
            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <button
            onClick={analyzeMarket}
            disabled={marketLoading}
            className="rounded-full bg-emerald-400/20 px-5 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {marketLoading
              ? "Generating analytics..."
              : "Analyze market"}
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Discover trending technologies,
          salaries, geographic demand,
          hiring trends, and skill pairings.
        </p>

        {marketLoading && (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-sm text-emerald-100">
            Fetching live jobs from multiple
            providers and generating market
            analytics...
          </div>
        )}

        {marketError && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
            {marketError}
          </div>
        )}
      </div>

      {analytics && (
        <MarketCharts
          analytics={analytics}
        />
      )}
    </div>
  );
}