"use client";

import { useMousePosition } from "@/lib/mouse-position";
import { FC, JSX, useEffect, useRef } from "react";

export const BackgroundBeams: FC = (): JSX.Element => {
  const mousePosition = useMousePosition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const beams = containerRef.current.querySelectorAll<HTMLElement>(".beam");
    beams.forEach((beam) => {
      const rect = beam.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = Math.abs(mousePosition.x - centerX);
      const distanceY = Math.abs(mousePosition.y - centerY);
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      const maxDistance = Math.sqrt(
        (window.innerWidth / 2) ** 2 + (window.innerHeight / 2) ** 2,
      );
      const intensity = 1 - distance / maxDistance;

      beam.style.opacity = Math.max(0.1, intensity).toString();
    });
  }, [mousePosition]);

  return (
    <div ref={containerRef} className="beams-container">
      <div className="beam beam-1"></div>
      <div className="beam beam-2"></div>
      <div className="beam beam-3"></div>
      <div className="beam beam-4"></div>
      <style jsx>{`
        .beams-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 80%
          );
        }
        .beam {
          position: absolute;
          width: 100vmax;
          height: 100vmax;
          border-radius: 50%;
          opacity: 0.1;
          transition: opacity 0.3s ease;
        }
        .beam-1 {
          background: radial-gradient(
            circle at center,
            rgba(76, 0, 255, 0.1) 0%,
            transparent 70%
          );
          top: -50%;
          left: -50%;
        }
        .beam-2 {
          background: radial-gradient(
            circle at center,
            rgba(0, 255, 117, 0.1) 0%,
            transparent 70%
          );
          bottom: -50%;
          right: -50%;
        }
        .beam-3 {
          background: radial-gradient(
            circle at center,
            rgba(255, 0, 115, 0.1) 0%,
            transparent 70%
          );
          bottom: -50%;
          left: -50%;
        }
        .beam-4 {
          background: radial-gradient(
            circle at center,
            rgba(255, 213, 0, 0.1) 0%,
            transparent 70%
          );
          top: -50%;
          right: -50%;
        }
      `}</style>
    </div>
  );
};
