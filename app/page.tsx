// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import EventList from "../components/EventList";
import DashboardView from "../components/DashboardView";
import { trackEvent } from "../lib/analytics";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"events" | "dashboard">("events");
  const [stats, setStats] = useState({ events: 0, registrations: 0 });

  // Load quick header stats
  const fetchHeaderStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const result = await res.json();
      if (result.success) {
        setStats({
          events: result.data.totalEvents,
          registrations: result.data.totalRegistrations,
        });
      }
    } catch (err) {
      console.error("Failed to load header statistics:", err);
    }
  };

  useEffect(() => {
    fetchHeaderStats();
    // Track initial page view
    trackEvent("event_list_viewed", { path: "/", defaultTab: "events" });
  }, []);

  const handleTabChange = (tab: "events" | "dashboard") => {
    setActiveTab(tab);
    trackEvent(tab === "events" ? "event_list_viewed" : "dashboard_viewed", {
      tab,
    });
    if (tab === "dashboard") {
      // Refresh header stats when switching to dashboard
      fetchHeaderStats();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-white/5 py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/25">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              EventSphere
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              Full-Stack Registration Portal
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => handleTabChange("events")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "events"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Events Portal
          </button>
          <button
            onClick={() => handleTabChange("dashboard")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Organizer Dashboard
          </button>
        </nav>

        {/* Quick Stats Header */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">
              Active Events
            </span>
            <span className="text-lg font-bold text-violet-400">
              {stats.events}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">
              Seats Occupied
            </span>
            <span className="text-lg font-bold text-blue-400">
              {stats.registrations}
            </span>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 animate-fade-in">
        {activeTab === "events" ? (
          <EventList onRegistrationSuccess={fetchHeaderStats} />
        ) : (
          <DashboardView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-zinc-500 font-mono">
        &copy; {new Date().getFullYear()} EventSphere Inc. Powered by Next.js 16 & MongoDB.
      </footer>
    </div>
  );
}
