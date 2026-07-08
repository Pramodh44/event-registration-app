// components/EventModal.tsx
"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "../lib/analytics";

interface EventModalProps {
  eventId: string;
  onClose: () => void;
  onRegistrationSuccess: () => void;
}

export default function EventModal({ eventId, onClose, onRegistrationSuccess }: EventModalProps) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Direct",
  });

  // Errors & Status
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  // Fetch detailed event details on load
  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      const result = await res.json();
      if (result.success) {
        setEvent(result.data);
      } else {
        setServerError(result.error || "Failed to load event details.");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setServerError("Network error loading event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name] : "" }));
    }
  };

  // Perform Client-side validations
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (minimum 7 digits).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      trackEvent("registration_validation_failed", {
        eventId,
        errors: Object.keys(errors),
      });
      return;
    }

    // Submit log
    trackEvent("registration_submitted", {
      eventId,
      eventName: event?.name,
      email: formData.email,
    });

    setSubmitLoading(true);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess(true);
        trackEvent("registration_success", {
          eventId,
          eventName: event?.name,
          email: formData.email,
          name: formData.name,
        });

        // Trigger parent component state updates
        setTimeout(() => {
          onRegistrationSuccess();
        }, 1500);
      } else {
        setServerError(result.error || "Registration failed.");
        trackEvent("registration_failed", {
          eventId,
          eventName: event?.name,
          email: formData.email,
          error: result.error || "Server validation error",
        });
      }
    } catch (err: any) {
      setServerError("Connection failed. Please check your internet and try again.");
      trackEvent("registration_failed", {
        eventId,
        eventName: event?.name,
        email: formData.email,
        error: err.message || "Network exception",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-xl rounded-3xl p-8 border border-white/5 flex flex-col items-center py-16">
          <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-mono text-sm">Opening details...</p>
        </div>
      </div>
    );
  }

  // Handle missing event
  if (!event && serverError) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-white/5 text-center">
          <span className="text-3xl block mb-2">❌</span>
          <h3 className="text-lg font-bold text-white">Error loading event</h3>
          <p className="text-zinc-400 text-sm mt-2">{serverError}</p>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl"
          >
            Close Dialog
          </button>
        </div>
      </div>
    );
  }

  const seatsRemaining = Math.max(0, event.totalSeats - event.registeredCount);
  const isFull = seatsRemaining === 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl relative my-8 animate-fade-in flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Event Details */}
        <div className="flex-1 p-6 md:p-8 bg-zinc-950/40 border-b md:border-b-0 md:border-r border-white/5">
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            ✕
          </button>

          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-violet-600/10 text-violet-400 border border-violet-500/20">
              {event.category}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-4 leading-tight">
              {event.name}
            </h2>

            <div className="space-y-3.5 mt-6">
              <div className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="text-zinc-500 font-mono mt-0.5">📅</span>
                <div>
                  <p className="font-semibold">Event Date</p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="text-zinc-500 font-mono mt-0.5">📍</span>
                <div>
                  <p className="font-semibold">Location / Mode</p>
                  <p className="text-xs text-zinc-400 font-mono">{event.mode}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="text-zinc-500 font-mono mt-0.5">🎟️</span>
                <div>
                  <p className="font-semibold">Seats Status</p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {isFull ? (
                      <span className="text-rose-400 font-semibold">Fully Booked</span>
                    ) : (
                      <span>
                        {seatsRemaining} available out of {event.totalSeats}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">
                Description
              </h4>
              <p className="text-sm text-zinc-300 mt-2 leading-relaxed max-h-[160px] overflow-y-auto pr-2">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
          {/* Close button for desktop */}
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-white/5 items-center justify-center text-zinc-400 hover:text-white transition-all hover:border-white/20"
          >
            ✕
          </button>

          {success ? (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-lg shadow-emerald-500/10">
                ✓
              </div>
              <h3 className="text-xl font-bold text-white">Registered Successfully!</h3>
              <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                Your seat has been reserved. You will receive details on your email shortly.
              </p>
            </div>
          ) : isFull ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-3xl mx-auto">
                🚫
              </div>
              <h3 className="text-xl font-bold text-white">Registration Closed</h3>
              <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                Unfortunately, all seats for this event are fully booked. Keep an eye out for future slots!
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-white transition-all w-full"
              >
                Go Back
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-white">Register for this Event</h3>

              {serverError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs leading-relaxed">
                  ⚠️ {serverError}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`w-full bg-zinc-950 border rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all ${
                    errors.name ? "border-rose-500" : "border-white/5 focus:border-violet-500"
                  }`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className={`w-full bg-zinc-950 border rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all ${
                    errors.email ? "border-rose-500" : "border-white/5 focus:border-violet-500"
                  }`}
                />
                {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 9999999999"
                  className={`w-full bg-zinc-950 border rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all ${
                    errors.phone ? "border-rose-500" : "border-white/5 focus:border-violet-500"
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-rose-500 mt-1">{errors.phone}</p>}
              </div>

              {/* College/Company */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                  College or Company <span className="text-zinc-600">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Vandelay Industries"
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>

              {/* Source Referral */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono mb-1">
                  Where did you hear about this?
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
                >
                  <option value="Direct">Direct</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Email">Email Campaigns</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full mt-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-55 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing registration...</span>
                  </>
                ) : (
                  <span>Claim My Seat</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
