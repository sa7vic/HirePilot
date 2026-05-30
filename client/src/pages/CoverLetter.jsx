import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";

export default function CoverLetter() {
  const [form, setForm] = useState({
    company: "",
    role: "",
    jobDescription: "",
  });
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post("/ai/cover-letter", form);
      setLetter(data.coverLetter);
      toast.success("Cover letter generated");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to generate cover letter."
      );
      toast.error("Cover letter generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    toast.success("Copied to clipboard");
  };

  const wordCount = useMemo(() => {
    if (!letter) return 0;
    return letter.trim().split(/\s+/).length;
  }, [letter]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Generate a tailored cover letter
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Provide the company, role, and job description.
        </p>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Company name"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
          />
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Role title"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
          />
          <textarea
            rows="6"
            name="jobDescription"
            value={form.jobDescription}
            onChange={handleChange}
            placeholder="Paste job description"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
          />
          {loading ? <Loader label="Writing cover letter..." /> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Writing..." : "Generate letter"}
          </button>
          {message ? (
            <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {message}
            </div>
          ) : null}
        </form>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-slate-100">
            Your cover letter
          </h3>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!letter}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {letter ? `${wordCount} words` : "Generated letters stay under 350 words."}
        </p>
        <div className="mt-4 min-h-[240px] whitespace-pre-wrap rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">
          {letter || "Generate a letter to see it here."}
        </div>
      </div>
    </div>
  );
}
