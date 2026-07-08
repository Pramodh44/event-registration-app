// components/EventList.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import EventModal from "./EventModal";
import { trackEvent } from "../lib/analytics";

interface EventListProps {
  onRegistrationSuccess: () => void;
}

export default function EventList({ onRegistrationSuccess }: EventListProps) {
  // State for all events fetched (for client-side filtering)
  const [allEvents, setAllEvents] = useState<any[]>([]);
  // State for displayed events
  const [displayedEvents, setDisplayedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");
  const [filterMode, setFilterMode] = useState<"client" | "server">("client");

  // Event Modal Details
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Ref for debouncing search analytics and api queries
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all events on mount (needed for client-side filtering)
  const fetchAllEventsOnce = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const result = await res.json();
      if (result.success) {
        setAllEvents(result.data);
        // If client-side mode, update display immediately
        if (filterMode === "client") {
          setDisplayedEvents(result.data);
        }
      }
    } catch (err) {
      console.error("Error fetching all events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run client-side filtering locally
  const runClientSideFilter = () => {
    let temp = [...allEvents];

    if (search.trim()) {
      const query = search.toLowerCase();
      temp = temp.filter(
        (ev) =>
          ev.name.toLowerCase().includes(query) ||
          ev.description?.toLowerCase().includes(query)
      );
    }

    if (category !== "All") {
      temp = temp.filter(
        (ev) => ev.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (mode !== "All") {
      temp = temp.filter((ev) => ev.mode?.toLowerCase() === mode.toLowerCase());
    }

    setDisplayedEvents(temp);
  };

  // Run server-side filtering via API call
  const runServerSideFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search);
      if (category !== "All") params.append("category", category);
      if (mode !== "All") params.append("mode", mode);

      const res = await fetch(`/api/events?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setDisplayedEvents(result.data);
      }
    } catch (err) {
      console.error("Error running API-side filter:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle switching filter modes
  const handleFilterModeToggle = (mode: "client" | "server") => {
    setFilterMode(mode);
    trackEvent("filter_mode_toggled", { to: mode });
  };

  // Trigger search and filter logic
  useEffect(() => {
    if (filterMode === "client") {
      runClientSideFilter();
    } else {
      // Debounce server requests to prevent spamming
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runServerSideFilter();
      }, 300);
    }

    // Debounce analytics logging for searches
    if (search.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        trackEvent("event_search_performed", { query: search, mode: filterMode });
      }, 500);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, category, mode, filterMode]);

  // Load everything on mount
  useEffect(() => {
    fetchAllEventsOnce();
  }, []);

  // Track filter changes immediately
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    trackEvent("event_filter_applied", { type: "category", value: val, mode: filterMode });
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setMode(val);
    trackEvent("event_filter_applied", { type: "mode", value: val, mode: filterMode });
  };

  const handleCardClicked = (eventId: string, eventName: string, eventCat: string) => {
    setSelectedEventId(eventId);
    trackEvent("event_card_clicked", { eventId, eventName, category: eventCat });
  };

  // Refresh display events locally after successful registration (to update seat counts)
  const handleRegistrationCompleted = () => {
    // Refresh header stats
    onRegistrationSuccess();
    // Refresh list data
    fetchAllEventsOnce();
  };

  return (
    <div className="space-y-8">
      {/* Filtering Header Section */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between border border-white/5 shadow-xl">
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search event names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          {/* Category Select */}
          <div>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
            >
              <option value="All">All Categories</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Webinar">Webinar</option>
            </select>
          </div>

          {/* Mode Select */}
          <div>
            <select
              value={mode}
              onChange={handleModeChange}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online</option>
              <option value="Noida">Noida</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Client-Side vs Server-Side Toggle */}
        <div className="flex flex-col items-center sm:items-end gap-1.5 w-full md:w-auto">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            Filter Strategy
          </span>
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => handleFilterModeToggle("client")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                filterMode === "client"
                  ? "bg-violet-600/20 text-violet-400 border border-violet-500/20 shadow"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              Client State
            </button>
            <button
              onClick={() => handleFilterModeToggle("server")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                filterMode === "server"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              API Query
            </button>
          </div>
        </div>
      </div>

      {/* active filter state logs */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-2 font-mono">
        <div>
          Showing {displayedEvents.length} events{" "}
          {filterMode === "server" ? "(API Filtered)" : "(Local State Filtered)"}
        </div>
        <div className="hidden sm:block text-right">
          Active filters:{" "}
          <span className="text-zinc-400">
            [Search: &quot;{search || "none"}&quot;, Category: {category}, Mode: {mode}]
          </span>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-600 animate-spin" />
          <p className="text-zinc-500 font-mono text-sm">Querying databases...</p>
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="glass-panel rounded-2xl py-20 text-center border border-white/5">
          <span className="text-4xl block mb-4">📭</span>
          <h3 className="text-lg font-bold text-zinc-300">No events found</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-md mx-auto">
            Try adjusting your search keywords, category pills, or mode filters to find upcoming listings.
          </p>
        </div>
      ) : (
        /* Event Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event) => {
            const seatsRemaining = Math.max(0, event.totalSeats - event.registeredCount);
            const isFull = seatsRemaining === 0;
            const occupancyPercentage = Math.min(
              100,
              Math.round((event.registeredCount / event.totalSeats) * 100)
            );

            // Determine badge colors based on category
            const categoryColors: Record<string, string> = {
              workshop: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              seminar: "bg-blue-500/10 text-blue-400 border-blue-500/20",
              hackathon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              webinar: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            };
            const catClass =
              categoryColors[event.category?.toLowerCase()] ||
              "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

            // Determine mode colors
            const modeColors: Record<string, string> = {
              online: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
              noida: "bg-rose-500/10 text-rose-400 border-rose-500/20",
              hybrid: "bg-teal-500/10 text-teal-400 border-teal-500/20",
            };
            const modeClass =
              modeColors[event.mode?.toLowerCase()] ||
              "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

            return (
              <div
                key={event._id}
                className="glass-panel glass-card-hover rounded-2xl p-6 flex flex-col justify-between border border-white/5 shadow-lg group relative overflow-hidden"
              >
                {/* Visual gradient highlight */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-600 to-blue-600 opacity-70 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Category & Mode Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${catClass}`}
                    >
                      {event.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${modeClass}`}
                    >
                      {event.mode}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-zinc-500 text-xs font-mono mt-1">
                    📅 {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-zinc-400 text-sm mt-3.5 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Bottom stats and button */}
                <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                  {/* Seat Tracker Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1.5">
                      <span>Occupancy</span>
                      <span>
                        {event.registeredCount}/{event.totalSeats} seats ({occupancyPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        style={{ width: `${occupancyPercentage}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? "bg-rose-500"
                            : occupancyPercentage > 80
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-violet-600 to-blue-600"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Details / Register trigger button */}
                  <button
                    onClick={() => handleCardClicked(event._id, event.name, event.category)}
                    className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      isFull
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                        : "bg-zinc-900 text-white hover:bg-zinc-800 border border-white/10 hover:border-violet-500/30"
                    }`}
                  >
                    {isFull ? "Fully Booked (Sold Out)" : "View Details & Register"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details and Registration Modal */}
      {selectedEventId && (
        <EventModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onRegistrationSuccess={handleRegistrationCompleted}
        />
      )}
    </div>
  );
}
