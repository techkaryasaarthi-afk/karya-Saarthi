"use client";

import React from "react";

interface Dodecahedron3DProps {
  className?: string;
  reverse?: boolean;
  speed?: "fast" | "medium" | "normal";
  variant?: "brand" | "white";
  scale?: number;
}

export default function Dodecahedron3D({
  className = "",
  reverse = false,
  speed = "fast",
  variant = "brand",
  scale = 1,
}: Dodecahedron3DProps) {
  const rotationClass = reverse
    ? speed === "fast"
      ? "dodeca-rotate-reverse-fast"
      : "dodeca-rotate-reverse"
    : speed === "fast"
    ? "dodeca-rotate-fast"
    : "dodeca-rotate-normal";

  return (
    <div
      className={`dodeca-scene ${variant === "brand" ? "dodeca-brand" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
      aria-hidden="true"
    >
      <div className={`dodeca-object ${rotationClass}`}>
        {Array.from({ length: 12 }).map((_, pIdx) => (
          <div key={pIdx} className="dodeca-pentagon">
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        ))}
      </div>
    </div>
  );
}
