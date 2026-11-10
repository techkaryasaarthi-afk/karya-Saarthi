"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShieldCheck, X, Lock, ExternalLink, ArrowRight, GripVertical } from "lucide-react";

export default function AdminFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Position state (shifted up by default: left 28px, 200px from bottom)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    isDragging: boolean;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    isDragging: false,
    hasMoved: false,
  });

  // Shifted up on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const defaultY = Math.max(140, window.innerHeight - 240); // Shifted nicely upwards
      setPosition({ x: 28, y: defaultY });
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with left click or touch
    if (e.button !== 0) return;

    if (!position) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      isDragging: true,
      hasMoved: false,
    };

    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // Movement threshold to distinguish click from drag
    if (Math.hypot(dx, dy) > 5) {
      dragRef.current.hasMoved = true;
    }

    if (typeof window !== "undefined") {
      const maxX = Math.max(10, window.innerWidth - 76);
      const maxY = Math.max(70, window.innerHeight - 76);

      const nextX = Math.min(Math.max(12, dragRef.current.initialX + dx), maxX);
      const nextY = Math.min(Math.max(70, dragRef.current.initialY + dy), maxY);

      setPosition({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignored if capture already lost
    }

    const hadMoved = dragRef.current.hasMoved;
    dragRef.current.isDragging = false;
    setIsDragging(false);

    // If it was just a tap/click without dragging, toggle popup
    if (!hadMoved) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleQuickUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      enteredPin.trim() === "admin123" ||
      enteredPin.trim().toLowerCase() === "info@karyasaarthi.com" ||
      enteredPin === ""
    ) {
      window.location.href = "/admin";
    } else {
      setErrorMsg("Incorrect PIN. Default is 'admin123'");
    }
  };

  if (!position) return null;

  // Adaptive positioning of modal depending on screen quadrant
  const isNearBottom = typeof window !== "undefined" && position.y > window.innerHeight / 2;
  const isNearRight = typeof window !== "undefined" && position.x > window.innerWidth / 2;

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
        zIndex: 55,
      }}
      className="select-none"
    >
      {/* Quick Admin Access Popup Modal Card */}
      {isOpen && (
        <div
          className={`absolute max-w-[calc(100vw-2rem)] w-72 sm:w-80 rounded-2xl bg-white/95 dark:bg-[#141419]/95 backdrop-blur-2xl border-2 border-slate-300 dark:border-[#004E89]/60 shadow-2xl overflow-hidden text-slate-900 dark:text-white animate-fadeIn ${
            isNearBottom ? "bottom-20" : "top-20"
          } ${isNearRight ? "right-0" : "left-0"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header styled with Karya Saarthi Logo Theme (Navy Blue + Saffron Orange + Teal) */}
          <div className="bg-gradient-to-r from-[#004E89] via-[#0B2545] to-[#FF7A00] p-3.5 flex items-center justify-between text-white border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 p-1 flex items-center justify-center border border-white/25 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-[#FF9E00]" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide leading-tight text-white">Admin Portal</h4>
                <p className="text-[10px] text-zinc-300 font-mono">Karya Saarthi Operations</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Close Admin Quick Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 bg-slate-50 dark:bg-[#16161B]">
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Manage client appointments and live notification updates dispatched to{" "}
              <strong className="text-[#FF7A00]">info@karyasaarthi.com</strong>.
            </p>

            {/* Quick Login Form */}
            <form onSubmit={handleQuickUnlock} className="space-y-2.5">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter PIN (Default: admin123)"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF7A00] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-3 top-2.5" />
              </div>

              {errorMsg && <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9E00] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#FF7A00]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Unlock &amp; Open Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
                <span>Move icon by dragging</span>
              </span>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="text-[#FF7A00] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Full /admin</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Circular Action Button */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative group ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {/* Pulsing Aura in Logo Colors (Saffron Orange + Royal Navy Blue) */}
        <div
          className={`absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#FF7A00]/40 to-[#004E89]/40 blur-md pointer-events-none transition-all duration-300 ${
            isDragging ? "scale-125 opacity-90 blur-lg" : "animate-pulse opacity-70 group-hover:opacity-100"
          }`}
        />

        {/* Floating Tooltip (Visible on hover when closed and not dragging) */}
        {!isOpen && !isDragging && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 hidden sm:flex items-center whitespace-nowrap bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-[#FF7A00]/40 px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold text-slate-800 dark:text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 ${
              isNearRight ? "right-20" : "left-20"
            }`}
          >
            {!isNearRight && (
              <div className="w-2 h-2 bg-white dark:bg-zinc-900 border-l border-b border-slate-200 dark:border-[#FF7A00]/40 rotate-45 -ml-1 mr-1.5" />
            )}
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Admin Portal • Drag to Move (PIN: admin123)</span>
            </span>
            {isNearRight && (
              <div className="w-2 h-2 bg-white dark:bg-zinc-900 border-r border-t border-slate-200 dark:border-[#FF7A00]/40 rotate-45 -mr-1 ml-1.5" />
            )}
          </div>
        )}

        {/* Main Movable Button Circle */}
        <div
          className={`relative w-16 h-16 rounded-full bg-white dark:bg-[#121216] border-2 border-[#004E89] text-slate-800 dark:text-white flex flex-col items-center justify-center shadow-xl shadow-[#FF7A00]/20 transition-transform duration-150 ${
            isDragging ? "scale-110 ring-4 ring-[#FF7A00]/40 shadow-[#FF7A00]/50" : "hover:scale-105"
          }`}
          style={{
            boxShadow: isDragging
              ? "0 0 25px rgba(255, 122, 0, 0.5), 0 0 40px rgba(0, 78, 137, 0.4)"
              : "0 0 15px rgba(255, 122, 0, 0.25), 0 0 25px rgba(0, 78, 137, 0.25)",
          }}
        >
          {/* Subtle Outer Logo Ring Accent */}
          <div className="absolute inset-0 rounded-full border border-[#FF7A00]/50 pointer-events-none" />

          {isOpen ? (
            <X className="w-6 h-6 text-[#FF7A00]" />
          ) : (
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <ShieldCheck className="w-6 h-6 text-[#FF7A00] group-hover:rotate-6 transition-transform duration-300" />
              <span className="text-[10px] font-black tracking-widest text-slate-800 dark:text-white uppercase mt-0.5 leading-none">
                ADMIN
              </span>
            </div>
          )}

          {/* Tiny Drag Dots Indicator at Bottom */}
          {!isOpen && (
            <div className="absolute -bottom-1 flex items-center justify-center gap-0.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 px-1 py-0.5 rounded-full pointer-events-none">
              <span className="w-1 h-1 rounded-full bg-[#FF7A00]" />
              <span className="w-1 h-1 rounded-full bg-[#004E89]" />
              <span className="w-1 h-1 rounded-full bg-[#0D9488]" />
            </div>
          )}

          {/* Glowing pulse indicator dot (Teal green from logo) */}
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#0D9488] border-2 border-white dark:border-[#121216] animate-ping opacity-75 pointer-events-none" />
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#0D9488] border-2 border-white dark:border-[#121216] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
