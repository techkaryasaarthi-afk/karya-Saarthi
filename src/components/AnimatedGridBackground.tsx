"use client";

import React from "react";

export default function AnimatedGridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Smooth Animated Grid of Small Squares (32px x 32px) */}
      <div className="absolute inset-0 animated-grid-pattern opacity-60" />

      {/* Subtle Ambient Radial Glow Drift (Soft Logo Colors: Saffron Orange & Royal Blue) */}
      <div className="absolute -inset-[25%] animated-grid-glow pointer-events-none opacity-45 mix-blend-multiply dark:mix-blend-screen">
        <div className="w-full h-full bg-[radial-gradient(circle_800px_at_50%_35%,rgba(255,122,0,0.06),rgba(0,78,137,0.06),transparent_70%)]" />
      </div>

      {/* Edge Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_50%,transparent_45%,rgba(248,250,252,0.85)_98%)] dark:bg-[radial-gradient(ellipse_90%_80%_at_50%_50%,transparent_45%,#0E0E11_98%)] pointer-events-none opacity-80" />
    </div>
  );
}
