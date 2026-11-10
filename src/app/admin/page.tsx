"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  Lock,
  ArrowLeft,
  ExternalLink,
  Shield,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  timeSlot: string;
  meetingType: string;
  budget: string;
  notes: string;
  status: "New" | "Confirmed" | "Completed" | "Cancelled";
  notificationSentTo: string;
  createdAt: string;
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Default notification email as requested
  const adminNotificationEmail = "info@karyasaarthi.com";
  const whatsappNumber = "9153780968";
  const contactNumber = "9153780969";

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: admin123 or info@karyasaarthi.com or empty for demo
    if (pin.trim() === "admin123" || pin.trim().toLowerCase() === "info@karyasaarthi.com" || pin === "") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect PIN/Password. Use 'admin123' to enter.");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
        );
        if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment({ ...selectedAppointment, status: newStatus as any });
        }
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        if (selectedAppointment?.id === id) setSelectedAppointment(null);
      }
    } catch (err) {
      alert("Failed to delete appointment");
    }
  };

  const exportCSV = () => {
    const headers = ["ID,Name,Email,Phone,Service,Date,TimeSlot,MeetingType,Budget,Status,NotificationSentTo,CreatedAt"];
    const rows = appointments.map((a) =>
      `"${a.id}","${a.name}","${a.email}","${a.phone}","${a.service}","${a.date}","${a.timeSlot}","${a.meetingType}","${a.budget}","${a.status}","${a.notificationSentTo}","${a.createdAt}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Karya_Saarthi_Appointments_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.service.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countNew = appointments.filter((a) => a.status === "New").length;
  const countConfirmed = appointments.filter((a) => a.status === "Confirmed").length;
  const countCompleted = appointments.filter((a) => a.status === "Completed").length;

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E0E11] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#FF6B35] mx-auto bg-white p-0.5 shadow-xl">
              <Image src="/logo.jpg" alt="Logo" fill className="object-contain rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Admin Management Portal</h1>
              <p className="text-xs text-[#FF6B35] font-bold tracking-widest uppercase mt-0.5">
                Karya Saarthi • Operations
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage appointments, client registrations, and verified notification records dispatched to{" "}
              <strong className="text-slate-900 dark:text-white">{adminNotificationEmail}</strong>.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Admin Password / PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter PIN (Default: admin123)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-3.5 top-3.5" />
              </div>
              {authError && <p className="text-xs text-red-500 font-medium">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8855] text-white font-bold text-sm shadow-xl shadow-[#FF6B35]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Unlock Admin Portal</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-zinc-500">
            <Link href="/" className="hover:text-[#FF6B35] transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E0E11] text-slate-900 dark:text-white selection:bg-[#FF6B35] selection:text-white pb-20 transition-colors">
      
      {/* Top Admin Navbar */}
      <header className="bg-white/90 dark:bg-[#141419]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF6B35] bg-white p-0.5 shrink-0 shadow-md">
                <Image src="/logo.jpg" alt="Logo" fill className="object-contain rounded-full" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  KARYA <span className="text-[#FF6B35]">SAARTHI</span>
                  <span className="text-[10px] bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    ADMIN
                  </span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Appointment Management &amp; Leads</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs">
              <Mail className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span className="text-slate-500 dark:text-zinc-400">Notification Dispatch:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-white">{adminNotificationEmail}</span>
            </div>

            <Link
              href="/"
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-zinc-300 border border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total Registered</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{appointments.length}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">All registered consultations</p>
          </div>

          <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">New / Pending</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">{countNew}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Requires follow-up call/meet</p>
          </div>

          <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-[#1BAC6E]">Confirmed</span>
            <div className="text-2xl sm:text-3xl font-black text-[#1BAC6E]">{countConfirmed}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Slot locked &amp; verified</p>
          </div>

          <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-blue-500 dark:text-blue-400">Completed</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-500 dark:text-blue-400">{countCompleted}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Project pitch concluded</p>
          </div>
        </div>

        {/* Quick Operations Strip */}
        <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search name, phone, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-3" />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
              {["All", "New", "Confirmed", "Completed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === st
                      ? "bg-[#FF6B35] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={fetchAppointments}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-zinc-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              title="Refresh Appointments"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white text-xs font-bold border border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Client Appointments &amp; Registrations</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                All records trigger live email updates to <span className="text-[#FF6B35] font-mono">{adminNotificationEmail}</span>
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 w-fit">
              {filteredAppointments.length} Record(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Client Details</th>
                  <th className="py-3 px-4">Service & Budget</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Meeting Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Dispatched To</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                      No appointments found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      {/* Client info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                        <div className="text-slate-500 dark:text-zinc-400 font-mono text-[11px]">{item.phone}</div>
                        <div className="text-slate-400 dark:text-zinc-500 text-[11px]">{item.email}</div>
                      </td>

                      {/* Service & Budget */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 block">{item.service}</span>
                        <span className="text-[#FF6B35] font-mono text-[11px] font-bold">{item.budget}</span>
                      </td>

                      {/* Date & Slot */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                          <span>{item.date}</span>
                        </div>
                        <div className="text-slate-500 dark:text-zinc-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{item.timeSlot}</span>
                        </div>
                      </td>

                      {/* Meeting Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-white/5 font-semibold">
                          {item.meetingType}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none bg-slate-50 dark:bg-zinc-900 ${
                            item.status === "Confirmed"
                              ? "text-[#1BAC6E] border-[#1BAC6E]/40"
                              : item.status === "Completed"
                              ? "text-blue-500 dark:text-blue-400 border-blue-400/40"
                              : item.status === "Cancelled"
                              ? "text-red-500 dark:text-red-400 border-red-400/40"
                              : "text-amber-500 dark:text-amber-400 border-amber-400/40"
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Notification Recipient */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="text-[#1BAC6E] font-semibold">✓ {adminNotificationEmail}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Client */}
                          <a
                            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(item.name)},%20this%20is%20Karya%20Saarthi%20team%20regarding%20your%20appointment%20for%20${encodeURIComponent(item.service)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${item.phone}`}
                            className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white transition-all"
                            title="Call Client"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete */}
                          <button
                            onClick={() => deleteAppointment(item.id)}
                            className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
