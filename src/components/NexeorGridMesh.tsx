"use client";

import React from "react";

interface NexeorGridMeshProps {
  size?: number; // size in px
  variant?: "small" | "large";
  reverse?: boolean;
  className?: string;
  speed?: "fast" | "normal";
}

export default function NexeorGridMesh({
  size = 350,
  variant = "large",
  reverse = false,
  className = "",
  speed = "fast",
}: NexeorGridMeshProps) {
  const duration = speed === "fast" ? (reverse ? "9s" : "7.5s") : (reverse ? "16s" : "14s");

  return (
    <div
      className={`relative pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      <div className="w-full h-full relative">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_0_14px_rgba(255,122,0,0.3)]"
        >
          {/* Subtle Ambient Radial Backlight in Warm Amber + Deep Navy */}
          <circle
            cx="200"
            cy="200"
            r="160"
            fill="url(#meshBacklight)"
            opacity="0.22"
          />

          <defs>
            <radialGradient id="meshBacklight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.45" />
              <stop offset="45%" stopColor="#004E89" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Amber / Golden Saffron Gradient for Core Geometry */}
            <linearGradient id="amberGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC107" />
              <stop offset="50%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FF5722" />
            </linearGradient>

            {/* Steel Cyan / White Gradient for Outer Wireframe Lines */}
            <linearGradient id="outerMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.6" />
            </linearGradient>

            {/* Soft Cyan Accent */}
            <linearGradient id="cyanLineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* 1. OUTER POLYHEDRAL RIM - STEEL BLUE / WHITE WIREFRAME */}
          <polygon
            points="200,20 345,95 380,250 270,370 130,370 20,250 55,95"
            stroke="url(#outerMeshGrad)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* 2. INNER FACETS & DIAGONALS - SOFT CYAN / WHITE DASHED */}
          <polygon
            points="200,75 310,130 335,245 255,335 145,335 65,245 90,130"
            stroke="url(#cyanLineGrad)"
            strokeWidth="1.3"
            strokeDasharray="5 3"
            strokeLinejoin="round"
          />

          {/* 3. CORE STAR PENTAGON MESH - WARM GLOWING AMBER / SAFFRON ORANGE */}
          <polygon
            points="200,120 280,165 250,260 150,260 120,165"
            stroke="url(#amberGoldGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* 4. 3D STRUTS CONNECTING OUTER TO INNER VERTICES */}
          <line x1="200" y1="20" x2="200" y2="75" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.4" />
          <line x1="345" y1="95" x2="310" y2="130" stroke="#38BDF8" strokeOpacity="0.7" strokeWidth="1.4" />
          <line x1="380" y1="250" x2="335" y2="245" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.4" />
          <line x1="270" y1="370" x2="255" y2="335" stroke="#FF7A00" strokeOpacity="0.75" strokeWidth="1.4" />
          <line x1="130" y1="370" x2="145" y2="335" stroke="#FF7A00" strokeOpacity="0.75" strokeWidth="1.4" />
          <line x1="20" y1="250" x2="65" y2="245" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.4" />
          <line x1="55" y1="95" x2="90" y2="130" stroke="#38BDF8" strokeOpacity="0.7" strokeWidth="1.4" />

          {/* 5. CROSS-FACET INTERSECTING CHORDS */}
          <line x1="200" y1="75" x2="250" y2="260" stroke="#FF9E40" strokeOpacity="0.6" strokeWidth="1.3" />
          <line x1="200" y1="75" x2="150" y2="260" stroke="#FF9E40" strokeOpacity="0.6" strokeWidth="1.3" />
          <line x1="310" y1="130" x2="120" y2="165" stroke="#38BDF8" strokeOpacity="0.6" strokeWidth="1.3" />
          <line x1="90" y1="130" x2="280" y2="165" stroke="#38BDF8" strokeOpacity="0.6" strokeWidth="1.3" />
          <line x1="335" y1="245" x2="145" y2="335" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.2" />
          <line x1="65" y1="245" x2="255" y2="335" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.2" />

          {/* 6. INNER HUB SPOKES (ORANGE & CYAN) */}
          <line x1="200" y1="120" x2="200" y2="200" stroke="#FF7A00" strokeWidth="1.8" />
          <line x1="280" y1="165" x2="200" y2="200" stroke="#FFB347" strokeWidth="1.5" />
          <line x1="250" y1="260" x2="200" y2="200" stroke="#38BDF8" strokeWidth="1.6" />
          <line x1="150" y1="260" x2="200" y2="200" stroke="#0D9488" strokeWidth="1.6" />
          <line x1="120" y1="165" x2="200" y2="200" stroke="#FFB347" strokeWidth="1.5" />

          {/* 7. LUMINESCENT VERTEX NODES */}
          {/* Outer Ring Nodes */}
          <circle cx="200" cy="20" r="3.5" fill="#FFFFFF" />
          <circle cx="345" cy="95" r="3.5" fill="#38BDF8" />
          <circle cx="380" cy="250" r="3.5" fill="#FFFFFF" />
          <circle cx="270" cy="370" r="3.5" fill="#FF7A00" />
          <circle cx="130" cy="370" r="3.5" fill="#FF7A00" />
          <circle cx="20" cy="250" r="3.5" fill="#FFFFFF" />
          <circle cx="55" cy="95" r="3.5" fill="#38BDF8" />

          {/* Intermediate Nodes */}
          <circle cx="200" cy="75" r="3" fill="#FFFFFF" />
          <circle cx="310" cy="130" r="3" fill="#38BDF8" />
          <circle cx="335" cy="245" r="3.2" fill="#FF9E40" />
          <circle cx="255" cy="335" r="3" fill="#FFFFFF" />
          <circle cx="145" cy="335" r="3" fill="#FFFFFF" />
          <circle cx="65" cy="245" r="3.2" fill="#38BDF8" />
          <circle cx="90" cy="130" r="3" fill="#FFFFFF" />

          {/* Core Star Amber Nodes */}
          <circle cx="200" cy="120" r="3.8" fill="#FF7A00" />
          <circle cx="280" cy="165" r="3.8" fill="#FF9E40" />
          <circle cx="250" cy="260" r="3.8" fill="#FF7A00" />
          <circle cx="150" cy="260" r="3.8" fill="#FF7A00" />
          <circle cx="120" cy="165" r="3.8" fill="#FF9E40" />

          {/* Center Hub Node in Glowing Amber */}
          <circle cx="200" cy="200" r="4.5" fill="#FF7A00" />
          <circle cx="200" cy="200" r="9" stroke="#FF7A00" strokeWidth="1.3" strokeOpacity="0.7" />
        </svg>
      </div>
    </div>
  );
}
