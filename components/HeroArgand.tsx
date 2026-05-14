"use client";

import { useEffect, useRef } from "react";

// A slow, ambient Argand-plane visual.  Multiple orbiting "powers of i" trace
// rings around the origin, leaving a glowing trail.  No external libs; just
// canvas + requestAnimationFrame.
export function HeroArgand({ height = 520 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let mounted = true;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    const t0 = performance.now();

    const draw = (now: number) => {
      if (!mounted) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const t = (now - t0) / 1000;

      // soft trail by drawing a translucent rect each frame
      ctx.fillStyle = "rgba(5, 6, 10, 0.18)";
      ctx.fillRect(0, 0, w, h);

      // axes
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // concentric rings
      for (let r = 60; r < Math.max(w, h); r += 80) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.035)";
        ctx.stroke();
      }

      // orbiting power-of-i particles
      const layers = [
        { r: 90, speed: 0.6, hue: "#7df9ff", glow: 30 },
        { r: 150, speed: -0.35, hue: "#b388ff", glow: 40 },
        { r: 220, speed: 0.2, hue: "#ff5fa2", glow: 50 },
        { r: 290, speed: -0.12, hue: "#f5c76a", glow: 60 },
      ];
      for (const L of layers) {
        for (let k = 0; k < 4; k += 1) {
          const ang = L.speed * t + (k * Math.PI) / 2;
          const x = cx + L.r * Math.cos(ang);
          const y = cy + L.r * Math.sin(ang);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = L.hue;
          ctx.shadowColor = L.hue;
          ctx.shadowBlur = L.glow;
          ctx.fill();
          ctx.shadowBlur = 0;
          // faint vector
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.strokeStyle = "rgba(255,255,255,0.06)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // continuous i^k pointer
      const k = (t * 0.5) % 4;
      const ang = (Math.PI / 2) * k;
      const r = 360;
      const px = cx + r * Math.cos(ang);
      const py = cy + r * Math.sin(ang);
      const grad = ctx.createLinearGradient(cx, cy, px, py);
      grad.addColorStop(0, "rgba(125,249,255,0)");
      grad.addColorStop(1, "rgba(125,249,255,0.8)");
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-white/5 bg-ink-900/30"
      style={{ height }}
    >
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink-950/40 via-transparent to-ink-950/40" />
    </div>
  );
}
