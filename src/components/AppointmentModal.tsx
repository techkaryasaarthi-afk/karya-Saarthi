"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { X, Calendar, Clock, CheckCircle2, Send, Mail } from "lucide-react";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
}

export default function AppointmentModal({ isOpen, onClose, preselectedService }: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: preselectedService || "Website Development",
    date: "",
    timeSlot: "11:00 AM - 11:30 AM",
    meetingType: "Google Meet",
    budget: "₹30,000 - ₹85,000",
    notes: "",
  });

  const [minDate, setMinDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    setMinDate(now.toISOString().split("T")[0]);
    setFormData((prev) => ({
      ...prev,
      date: prev.date || tomorrow.toISOString().split("T")[0],
      service: preselectedService || prev.service,
    }));
  }, [preselectedService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedData(data.appointment);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        alert(data.error || "Failed to book appointment. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error booking appointment. Please try again or reach out directly on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppConfirmation = () => {
    const text = encodeURIComponent(
      `Hello Karya Saarthi, I just scheduled an appointment for "${formData.service}" on ${formData.date} at ${formData.timeSlot}. Name: ${formData.name}, Phone: ${formData.phone}`
    );
    window.open(`https://wa.me/919153780968?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 dark:bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/20 rounded-3xl max-w-2xl w-full p-5 sm:p-8 relative max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl text-slate-900 dark:text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedData ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#1BAC6E]/20 text-[#1BAC6E] border border-[#1BAC6E]/40 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-[#FF6B35] tracking-widest uppercase">
                Appointment Registered
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Consultation Confirmed!</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto mt-2 leading-relaxed">
                Thank you, <strong className="text-slate-900 dark:text-white">{submittedData.name}</strong>. An email notification has been dispatched to <strong className="text-[#FF6B35]">info@karyasaarthi.com</strong> and our team lead will connect with you.
              </p>
            </div>

            {/* Appointment Details Box */}
            <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-slate-200/80 dark:border-white/5 pb-2">
                <span className="text-slate-500 dark:text-zinc-400">Date &amp; Slot:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                  {submittedData.date} ({submittedData.timeSlot})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 dark:border-white/5 pb-2">
                <span className="text-slate-500 dark:text-zinc-400">Meeting Format:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{submittedData.meetingType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 dark:border-white/5 pb-2">
                <span className="text-slate-500 dark:text-zinc-400">Service:</span>
                <span className="font-semibold text-[#1BAC6E]">{submittedData.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Notification Email:</span>
                <span className="font-mono text-[#FF6B35]">info@karyasaarthi.com</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
              <button
                onClick={openWhatsAppConfirmation}
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Instant WhatsApp Confirmation (9153780968)</span>
              </button>
              <button
                onClick={() => {
                  setSubmittedData(null);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-semibold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Free 30-Min Strategy Call</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Book Your 1-on-1 Consultation</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Choose your preferred date and slot. All appointment details are directly delivered to <strong className="text-[#FF6B35]">info@karyasaarthi.com</strong>.
              </p>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Your Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Select Service</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors"
                >
                  <option value="Website Development">Website Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="AI & Machine Learning Solutions">AI &amp; ML Solutions</option>
                  <option value="Research & Academic Support">Research &amp; Academic Support</option>
                  <option value="Business Consulting">Business Consulting</option>
                </select>
              </div>
            </div>

            {/* Date & Slot Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>Preferred Date *</span>
                </label>
                <input
                  type="date"
                  required
                  min={minDate || undefined}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>Preferred Time Slot *</span>
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                  <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                  <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                  <option value="06:00 PM - 06:30 PM">06:00 PM - 06:30 PM</option>
                </select>
              </div>
            </div>

            {/* Meeting Type & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Meeting Type</label>
                <select
                  value={formData.meetingType}
                  onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Google Meet">Google Meet (Online Video)</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Office Visit">In-Person (Delhi Burari Office)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Target Budget</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="₹10,000 - ₹30,000">₹10,000 - ₹30,000</option>
                  <option value="₹30,000 - ₹85,000">₹30,000 - ₹85,000</option>
                  <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                  <option value="₹2,50,000+">₹2,50,000+</option>
                </select>
              </div>
            </div>

            {/* Project Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Project Brief or Goal</label>
              <textarea
                rows={2}
                placeholder="Give us a short overview of your vision, timeline, or key questions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
              />
            </div>

            {/* Notification confirmation banner */}
            <div className="p-3 rounded-xl bg-orange-50 border border-[#FF6B35]/20 dark:bg-[#FF6B35]/10 flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
              <Mail className="w-4 h-4 text-[#FF6B35] shrink-0" />
              <span>
                System update: Registration details automatically notified to <strong className="text-slate-900 dark:text-white">info@karyasaarthi.com</strong>.
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8855] hover:opacity-95 shadow-xl shadow-[#FF6B35]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Scheduling Appointment..." : "Confirm & Send Appointment Details"}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
