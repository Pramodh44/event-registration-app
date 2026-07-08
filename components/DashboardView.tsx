// components/DashboardView.tsx
"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export default function DashboardView() {
  const [data, setData] = useState<any>(null);
  const [analyticsLogs, setAnalyticsLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "logs">("stats");

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const resStats = await fetch("/api/dashboard");
      const resultStats = await resStats.json();

      // Fetch analytics logs
      const resLogs = await fetch("/api/analytics");
      const resultLogs = await resLogs.json();

      if (resultStats.success) {
        setData(resultStats.data);
      }
      if (resultLogs.success) {
        setAnalyticsLogs(resultLogs.data);
      }
    } catch (err) {
      console.error("Error loading dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    trackEvent("dashboard_viewed", { section: "overview" });
  }, []);

  const handleExportCSV = (eventId?: string, eventName?: string) => {
    const url = eventId 
      ? `/api/registrations/export?eventId=${eventId}`
      : "/api/registrations/export";

    // Track export action
    trackEvent("csv_exported", { eventId: eventId || "all", eventName: eventName || "all" });

    // Force browser trigger download
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-600 animate-spin" />
        <p className="text-zinc-500 font-mono text-sm">Aggregating analytics data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-panel rounded-2xl py-20 text-center border border-white/5">
        <span className="text-3xl block mb-2">⚠️</span>
        <h3 className="text-lg font-bold text-white">Metrics unavailable</h3>
        <p className="text-zinc-500 text-sm mt-1">Failed to query dashboard database aggregator.</p>
        <button
          onClick={fetchDashboardData}
          className="mt-6 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Subheader Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Operations Dashboard</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Real-time visual monitoring of registrations and analytics logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab("stats")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === "stats"
                  ? "bg-violet-600/20 text-violet-400 border border-violet-500/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Aggregated Metrics
            </button>
            <button
              onClick={() => {
                setActiveSubTab("logs");
                trackEvent("analytics_logs_tab_viewed");
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === "logs"
                  ? "bg-violet-600/20 text-violet-400 border border-violet-500/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              DB Action Tracking Log
            </button>
          </div>

          <button
            onClick={() => handleExportCSV()}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-violet-600/10 flex items-center gap-2"
          >
            📥 Export All (CSV)
          </button>
        </div>
      </div>

      {activeSubTab === "stats" ? (
        <>
          {/* Card stats Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Events */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
              <span className="absolute right-4 top-4 text-2xl opacity-20">📅</span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                Total Events
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{data.totalEvents}</h3>
              <p className="text-zinc-500 text-[10px] mt-1">Active scheduled schedules</p>
            </div>

            {/* Total Registrations */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
              <span className="absolute right-4 top-4 text-2xl opacity-20">👥</span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                Registrations
              </p>
              <h3 className="text-3xl font-extrabold text-violet-400 mt-2">
                {data.totalRegistrations}
              </h3>
              <p className="text-zinc-500 text-[10px] mt-1">Confirmed attendee check-ins</p>
            </div>

            {/* Average Registrations */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
              <span className="absolute right-4 top-4 text-2xl opacity-20">📊</span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                Avg Registrations
              </p>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-2">
                {data.avgRegistrations}
              </h3>
              <p className="text-zinc-500 text-[10px] mt-1">Attendee ratio per event listing</p>
            </div>

            {/* Seat Occupancy Rate */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
              <span className="absolute right-4 top-4 text-2xl opacity-20">📈</span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                Seat Occupancy
              </p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                {data.seatOccupancyRate}%
              </h3>
              <p className="text-zinc-500 text-[10px] mt-1">
                {data.totalRegisteredCount} / {data.totalCapacity} total capacity
              </p>
            </div>
          </div>

          {/* Aggregation Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Referral Source Breakdown */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
              <h3 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-3">
                Registration Referral Channels
              </h3>
              {data.sourceBreakdown.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center py-6 font-mono">No referrals recorded</p>
              ) : (
                <div className="space-y-4">
                  {data.sourceBreakdown.map((item: any, idx: number) => {
                    const sourceColors = [
                      "from-violet-600 to-indigo-600",
                      "from-blue-600 to-sky-600",
                      "from-pink-600 to-rose-600",
                      "from-amber-600 to-yellow-600",
                      "from-teal-600 to-emerald-600",
                    ];
                    const gradient = sourceColors[idx % sourceColors.length];

                    return (
                      <div key={item.source} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-300 font-medium">{item.source}</span>
                          <span className="text-zinc-500">
                            {item.count} check-ins ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-white/5">
                          <div
                            style={{ width: `${item.percentage}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
              <h3 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-3">
                Registrations by Category
              </h3>
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center py-6 font-mono">No category stats</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {data.categoryBreakdown.map((item: any) => (
                    <div
                      key={item.category}
                      className="bg-zinc-900/60 rounded-xl p-4 border border-white/5 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                          {item.category}
                        </span>
                        <h4 className="text-xl font-bold text-white mt-1">
                          {item.registrationCount}
                        </h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono mt-3">
                        Across {item.eventCount} {item.eventCount === 1 ? "event" : "events"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Event Occupancy Table */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Active Event Occupancy Rates
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Click file icon to download specific attendee lists
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 text-[10px] uppercase font-mono tracking-widest">
                    <th className="pb-3 pr-4">Event Name</th>
                    <th className="pb-3 px-4">Category</th>
                    <th className="pb-3 px-4">Casing Mode</th>
                    <th className="pb-3 px-4">Seat Ratio</th>
                    <th className="pb-3 px-4">Fill Percentage</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300 font-mono">
                  {data.events.map((event: any) => {
                    const ratio = event.totalSeats > 0 ? (event.registeredCount / event.totalSeats) * 100 : 0;
                    const fillPercentage = Math.min(100, Math.round(ratio));
                    return (
                      <tr key={event._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 pr-4 text-white font-sans font-semibold max-w-[240px] truncate">
                          {event.name}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-sans">
                          <span className="bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-white/5">
                            {event.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-sans">
                          <span className="bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-white/5">
                            {event.mode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {event.registeredCount} / {event.totalSeats}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div
                                style={{ width: `${fillPercentage}%` }}
                                className={`h-full rounded-full ${
                                  fillPercentage >= 100
                                    ? "bg-rose-500"
                                    : fillPercentage > 80
                                    ? "bg-amber-500"
                                    : "bg-violet-600"
                                }`}
                              />
                            </div>
                            <span>{fillPercentage}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            onClick={() => handleExportCSV(event._id, event.name)}
                            className="text-xs bg-zinc-900 border border-white/5 group-hover:border-violet-500/30 text-zinc-400 group-hover:text-violet-400 py-1.5 px-2.5 rounded-lg transition-all"
                            title="Download CSV"
                          >
                            📄 CSV
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Registrations Log */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-3">
              Recent Registrations (Latest 10)
            </h3>
            {data.recentRegistrations.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-6 font-mono">No registrations found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-[10px] uppercase font-mono tracking-widest">
                      <th className="pb-3 pr-4">Attendee Name</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 px-4">Phone</th>
                      <th className="pb-3 px-4">Org / School</th>
                      <th className="pb-3 px-4">Referral Source</th>
                      <th className="pb-3 pl-4">Target Event</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300 font-mono text-xs">
                    {data.recentRegistrations.map((reg: any) => (
                      <tr key={reg._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4 text-white font-sans font-semibold">
                          {reg.name}
                        </td>
                        <td className="py-3 px-4">{reg.email}</td>
                        <td className="py-3 px-4">{reg.phone}</td>
                        <td className="py-3 px-4 max-w-[120px] truncate font-sans">
                          {reg.company || <span className="text-zinc-600">-</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-[10px]">
                            {reg.source}
                          </span>
                        </td>
                        <td className="py-3 pl-4 font-sans font-medium text-zinc-400 max-w-[200px] truncate">
                          {reg.eventId?.name || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Real-time Tracking Log Panel */
        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Live Database Actions Log Feed
            </h3>
            <button
              onClick={fetchDashboardData}
              className="text-xs text-violet-400 hover:text-violet-300 font-mono"
            >
              🔄 Refresh Logs
            </button>
          </div>

          <div className="bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-xs max-h-[500px] overflow-y-auto space-y-2 pr-2">
            {analyticsLogs.length === 0 ? (
              <p className="text-zinc-600 text-center py-10">No tracking logs recorded in MongoDB</p>
            ) : (
              analyticsLogs.map((log) => {
                let badgeClass = "bg-zinc-800 text-zinc-400 border-zinc-700/50";
                if (log.action.includes("success")) {
                  badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                } else if (log.action.includes("failed")) {
                  badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                } else if (log.action.includes("click")) {
                  badgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                }

                return (
                  <div
                    key={log._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-2 border-b border-white/5 last:border-b-0 hover:bg-white/[0.01]"
                  >
                    <span className="text-[10px] text-zinc-500">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded border ${badgeClass}`}
                    >
                      {log.action}
                    </span>
                    <span className="text-zinc-400 overflow-x-auto truncate max-w-full sm:max-w-xl">
                      {JSON.stringify(log.payload)}
                    </span>
                    <span className="hidden lg:inline text-[9px] text-zinc-600 ml-auto">
                      IP: {log.ip}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
