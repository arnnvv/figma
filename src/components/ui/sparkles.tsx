"use client";

import { useRef, useEffect, type JSX } from "react";
import { useTheme } from "next-themes";

export const SparklesCore = ({
  id = "tsparticles",
  className = "",
  background = "#000",
  minSize = 0.6,
  maxSize = 1.4,
  particleDensity = 100,
  particleColor = "#fff",
  particleSpeed = 2,
}: {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  particleSpeed?: number;
}): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    let animationFrameId: number;
    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor(
        private canvas: HTMLCanvasElement,
        private ctx: CanvasRenderingContext2D,
      ) {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * (maxSize - minSize) + minSize;
        this.speedX = Math.random() * particleSpeed - particleSpeed / 2;
        this.speedY = Math.random() * particleSpeed - particleSpeed / 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > this.canvas.width) this.x = 0;
        else if (this.x < 0) this.x = this.canvas.width;

        if (this.y > this.canvas.height) this.y = 0;
        else if (this.y < 0) this.y = this.canvas.height;
      }

      draw() {
        this.ctx.fillStyle = particleColor;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < particleDensity; i++) {
        particles.push(new Particle(canvas, ctx));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [
    background,
    maxSize,
    minSize,
    particleColor,
    particleDensity,
    particleSpeed,
    theme,
  ]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{
        background,
        display: "block",
      }}
    />
  );
};
