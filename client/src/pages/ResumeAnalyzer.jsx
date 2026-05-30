import { useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";

export default function ResumeAnalyzer() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please upload a PDF resume.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await api.post("/ai/resume-analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        },
      });
      setAnalysis(data.analysis);
      toast.success("Resume analyzed");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Unable to analyze resume.";
      setMessage(errorMessage);
      toast.error("Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (selected) => {
    if (!selected) return;
    setFile(selected);
    setMessage(null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      handleFileChange(dropped);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Upload your resume
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          We deliver ATS scoring, skill gaps, and recruiter feedback.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-8 text-center text-sm transition ${
              dragActive
                ? "border-emerald-400/70 bg-emerald-400/10"
                : "border-slate-700 bg-slate-900/40"
            }`}
          >
            <p className="text-slate-300">
              Drag and drop your resume PDF here
            </p>
            <span className="text-xs text-slate-500">or click to browse</span>
            {file ? (
              <p className="text-xs text-emerald-200">{file.name}</p>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] || null)
            }
            className="hidden"
          />
          {loading ? (
            <div className="space-y-2">
              <Loader label="Analyzing resume..." />
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze resume"}
          </button>
          {message ? (
            <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {message}
            </div>
          ) : null}
        </form>
      </div>

      {analysis ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-panel rounded-3xl p-6 shadow-card lg:col-span-2">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Recruiter summary
            </h4>
            <p className="mt-3 text-sm text-slate-300">
              {analysis.resume_summary ||
                analysis.summary ||
                "Resume summary will appear here."}
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              ATS score
            </h4>
            <p className="mt-3 text-4xl font-semibold text-emerald-200">
              {analysis.ats_score ?? 0}%
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Experience level: {analysis.experience_level || "-"}
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Top skills
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {(analysis.top_skills || analysis.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Missing skills
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {(analysis.missing_skills || analysis.missingKeywords || []).map(
                (item) => (
                <span
                  key={item}
                  className="rounded-full bg-rose-400/20 px-3 py-1 text-xs font-semibold text-rose-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Strengths
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(analysis.strengths || []).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Weaknesses
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(analysis.weaknesses || []).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card lg:col-span-3">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Recommended roles
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {(analysis.recommended_roles || []).map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
