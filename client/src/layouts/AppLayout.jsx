import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

export default function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-hero">
      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          />
        ) : null}
        <main className="flex-1">
          <Navbar onMenu={() => setSidebarOpen(true)} />
          <div className="mt-6 animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
