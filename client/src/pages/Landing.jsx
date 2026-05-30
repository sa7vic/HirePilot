import { Link } from "react-router-dom";

const features = [
  {
    title: "AI resume intelligence",
    text: "Upload once, get skills, strengths, and missing keywords in seconds.",
  },
  {
    title: "Job match scoring",
    text: "Paste any job description and instantly see your fit score.",
  },
  {
    title: "Cover letters on demand",
    text: "Generate tailored letters with company-ready tone and structure.",
  },
  {
    title: "Visual application tracker",
    text: "Move applications across stages with a clean Kanban board.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            HirePilot AI
          </p>
          <h1 className="font-heading text-2xl font-semibold text-slate-100">
            HirePilot AI
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-emerald-400/20 px-5 py-2 text-sm font-semibold text-emerald-100"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Built for students and freshers
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-slate-100 md:text-5xl">
              Track every application, match smarter, and stay ready to apply.
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              HirePilot AI keeps your resume, skills, and applications in one
              focused workspace. Discover gaps, generate cover letters, and
              move fast without automation risk.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="rounded-full bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100 shadow-glow"
              >
                Start your AI workspace
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300"
              >
                I already have an account
              </Link>
            </div>
          </div>
          <div className="glass-panel animate-fade-up-delayed rounded-3xl p-6 shadow-card">
            <div className="rounded-2xl bg-slate-950/80 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Live match snapshot
              </p>
              <h3 className="mt-3 font-heading text-3xl font-semibold">
                Match your resume to every role
              </h3>
              <p className="mt-3 text-sm text-slate-300">
                Paste a job description, get instant scoring, and see exactly
                what to improve.
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
                <span className="text-sm font-semibold text-slate-200">
                  Resume Analyzer
                </span>
                <span className="text-xs text-emerald-200">Ready</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
                <span className="text-sm font-semibold text-slate-200">
                  Cover Letter Studio
                </span>
                <span className="text-xs text-amber-200">Instant</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
                <span className="text-sm font-semibold text-slate-200">
                  Application Kanban
                </span>
                <span className="text-xs text-slate-400">Organized</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="grid gap-6 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-panel rounded-3xl p-5 shadow-card"
              >
                <h3 className="font-heading text-lg font-semibold text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-8 rounded-3xl bg-slate-950/80 px-8 py-10 text-white lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h3 className="font-heading text-3xl font-semibold">
              Built for fast, legal-safe job searches.
            </h3>
            <p className="mt-3 text-slate-300">
              HirePilot AI focuses on insight and organization. No auto apply
              bots. No risky scraping. Just smart guidance and a clean workflow.
            </p>
          </div>
          <div className="flex items-center">
            <Link
              to="/register"
              className="rounded-full bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100"
            >
              Launch the dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
