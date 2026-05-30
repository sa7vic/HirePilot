import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import JobMatcher from "./pages/JobMatcher.jsx";
import JobSources from "./pages/JobSources.jsx";
import CoverLetter from "./pages/CoverLetter.jsx";
import Applications from "./pages/Applications.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="resume" element={<ResumeAnalyzer />} />
        <Route path="matcher" element={<JobMatcher />} />
        <Route path="sources" element={<JobSources />} />
        <Route path="cover-letter" element={<CoverLetter />} />
        <Route path="applications" element={<Applications />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
