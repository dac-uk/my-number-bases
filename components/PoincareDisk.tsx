"use client";

import { useEffect, useRef, useState } from "react";

interface Pt {
  x: number; // -1..1
  y: number; // -1..1
}

// Compute the centre + radius of the unique circle that passes through two
// points inside the unit disk and is orthogonal to the unit circle (the
// hyperbolic geodesic). If the points are collinear with the origin, returns
// null — the geodesic is a diameter (straight line through 0).
function geodesic(p: Pt, q: Pt): { cx: number; cy: number; r: number } | null {
  // Inversion of p in the unit circle: p' = p / |p|^2.
  const p2 = p.x * p.x + p.y * p.y;
  if (p2 < 1e-9) return null;
  const px = p.x / p2;
  const py = p.y / p2;
  // p, q, p' all lie on the geodesic circle. Find its centre.
  const ax = q.x - p.x;
  const ay = q.y - p.y;
  const bx = px - p.x;
  const by = py - p.y;
  const d = 2 * (ax * by - ay * bx);
  if (Math.abs(d) < 1e-9) return null; // collinear with origin
  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  const ux = (by * a2 - ay * b2) / d;
  const uy = (ax * b2 - bx * a2) / d;
  const cx = p.x + ux;
  const cy = p.y + uy;
  const r = Math.hypot(cx - p.x, cy - p.y);
  return { cx, cy, r };
}

// Hyperbolic distance in the Poincaré disk.
function hypDist(p: Pt, q: Pt): number {
  const dx = p.x - q.x;
  const dy = p.y - q.y;
  const d2 = dx * dx + dy * dy;
  const pn = 1 - (p.x * p.x + p.y * p.y);
  const qn = 1 - (q.x * q.x + q.y * q.y);
  return Math.acosh(1 + (2 * d2) / Math.max(1e-9, pn * qn));
}

// Approximate the *interior* angle at vertex `at`, formed by the geodesics
// going to `p` and `q`. We do this numerically by sampling each geodesic at a
// short hyperbolic step from `at` and measuring the Euclidean angle between
// those tangent vectors (which equals the hyperbolic angle in the conformal
// Poincaré model).
function angleAt(at: Pt, p: Pt, q: Pt): number {
  const sample = (other: Pt): Pt => {
    const g = geodesic(at, other);
    if (!g) {
      // straight line through origin: tangent direction is just other - at.
      const dx = other.x - at.x;
      const dy = other.y - at.y;
      const n = Math.hypot(dx, dy) || 1;
      return { x: at.x + dx / n * 0.01, y: at.y + dy / n * 0.01 };
    }
    // perpendicular to (at - centre) is the tangent direction.
    const dx = -(at.y - g.cy);
    const dy = at.x - g.cx;
    const n = Math.hypot(dx, dy) || 1;
    // pick the direction that points *toward* `other`.
    const fx = dx / n;
    const fy = dy / n;
    const v1: Pt = { x: at.x + fx * 0.01, y: at.y + fy * 0.01 };
    const v2: Pt = { x: at.x - fx * 0.01, y: at.y - fy * 0.01 };
    const d1 = Math.hypot(v1.x - other.x, v1.y - other.y);
    const d2 = Math.hypot(v2.x - other.x, v2.y - other.y);
    return d1 < d2 ? v1 : v2;
  };
  const tp = sample(p);
  const tq = sample(q);
  const a1 = Math.atan2(tp.y - at.y, tp.x - at.x);
  const a2 = Math.atan2(tq.y - at.y, tq.x - at.x);
  let theta = Math.abs(a1 - a2);
  if (theta > Math.PI) theta = 2 * Math.PI - theta;
  return (theta * 180) / Math.PI;
}

export function PoincareDisk() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(420);
  const [tri, setTri] = useState<[Pt, Pt, Pt]>([
    { x: -0.45, y: -0.3 },
    { x: 0.5, y: -0.15 },
    { x: 0.05, y: 0.55 },
  ]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setSize(Math.min(520, Math.max(280, el.clientWidth)));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;
  const toScreen = (p: Pt) => ({ x: cx + p.x * R, y: cy + p.y * R });
  const fromScreen = (sx: number, sy: number): Pt => {
    let x = (sx - cx) / R;
    let y = (sy - cy) / R;
    const m = Math.hypot(x, y);
    if (m > 0.96) {
      x = (x / m) * 0.96;
      y = (y / m) * 0.96;
    }
    return { x, y };
  };

  const pickHandle = (sx: number, sy: number): number | null => {
    for (let i = 0; i < 3; i += 1) {
      const s = toScreen(tri[i]);
      if (Math.hypot(s.x - sx, s.y - sy) < 18) return i;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - r.left;
    const sy = e.clientY - r.top;
    const i = pickHandle(sx, sy);
    if (i != null) {
      setDragIdx(i);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIdx == null) return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = fromScreen(e.clientX - r.left, e.clientY - r.top);
    setTri((t) => t.map((q, i) => (i === dragIdx ? p : q)) as [Pt, Pt, Pt]);
  };
  const onPointerUp = () => setDragIdx(null);

  // Build the three geodesic edges as SVG path data.
  const edges: { d: string; a: Pt; b: Pt }[] = [];
  for (const [i, j] of [[0, 1], [1, 2], [2, 0]] as const) {
    const a = tri[i];
    const b = tri[j];
    const sa = toScreen(a);
    const sb = toScreen(b);
    const g = geodesic(a, b);
    if (!g) {
      edges.push({ d: `M ${sa.x} ${sa.y} L ${sb.x} ${sb.y}`, a, b });
      continue;
    }
    // SVG arc — sweep flag and large-arc both depend on geometry.
    const cs = { x: cx + g.cx * R, y: cy + g.cy * R };
    const rs = g.r * R;
    // Determine sweep direction so the arc bows toward the disk interior.
    // The geodesic is the shorter arc between the two points on the orthogonal
    // circle. Use atan2 to compute the signed angle.
    const a1 = Math.atan2(sa.y - cs.y, sa.x - cs.x);
    const a2 = Math.atan2(sb.y - cs.y, sb.x - cs.x);
    let delta = a2 - a1;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    const sweep = delta > 0 ? 1 : 0;
    edges.push({
      d: `M ${sa.x} ${sa.y} A ${rs} ${rs} 0 0 ${sweep} ${sb.x} ${sb.y}`,
      a, b,
    });
  }

  const angles = [
    angleAt(tri[0], tri[1], tri[2]),
    angleAt(tri[1], tri[0], tri[2]),
    angleAt(tri[2], tri[0], tri[1]),
  ];
  const sum = angles.reduce((a, b) => a + b, 0);
  const sides = [
    hypDist(tri[0], tri[1]),
    hypDist(tri[1], tri[2]),
    hypDist(tri[2], tri[0]),
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div ref={wrapRef} className="grid place-items-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-2xl border border-white/8 bg-ink-900/60 touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* boundary */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.2} />
          {/* a few faint background geodesics for atmosphere */}
          {[0.25, 0.5, 0.75].map((t, i) => (
            <circle
              key={i}
              cx={cx + t * R}
              cy={cy}
              r={Math.sqrt(Math.max(0, (1 + t * t) / (2 * t) * (1 + t * t) / (2 * t) - 1)) * R}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
            />
          ))}
          {/* triangle */}
          {edges.map((edge, i) => (
            <path
              key={i}
              d={edge.d}
              fill="none"
              stroke="#ff5fa2"
              strokeWidth={1.8}
              style={{ filter: "drop-shadow(0 0 6px rgba(255,95,162,0.6))" }}
            />
          ))}
          {/* vertices */}
          {tri.map((p, i) => {
            const s = toScreen(p);
            return (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r={9} fill="rgba(255,95,162,0.15)" />
                <circle cx={s.x} cy={s.y} r={4} fill="#ff5fa2" style={{ filter: "drop-shadow(0 0 6px #ff5fa2)" }} />
                <text x={s.x + 8} y={s.y - 8} fill="rgba(255,255,255,0.85)" fontFamily="ui-monospace" fontSize="12">
                  {angles[i].toFixed(0)}°
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <aside className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            this triangle
          </p>
          <p className="mt-3 font-mono text-sm text-white/85">
            angles ≈ {angles.map((a) => a.toFixed(1)).join("° + ")}°
          </p>
          <p className="mt-1 font-mono text-2xl text-neon-magenta">
            Σ = {sum.toFixed(1)}°
          </p>
          <p className="mt-1 text-xs text-white/55">
            in flat Euclidean geometry this number is always 180°
          </p>
          <p className="mt-3 font-mono text-xs text-white/55">
            sides (hyperbolic distance) ≈{" "}
            <span className="text-white/85">{sides.map((s) => s.toFixed(2)).join(", ")}</span>
          </p>
        </div>
        <div className="glass rounded-2xl p-5 text-sm text-white/65">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-magenta">
            how to read this
          </p>
          <p className="mt-3">
            We're inside the Poincaré disk: the whole infinite hyperbolic plane
            squeezed into a unit circle. Straight lines are arcs of circles
            that meet the boundary at 90°. Lengths look small near the edge
            but are, in the hyperbolic sense, infinite.
          </p>
          <p className="mt-3 text-white/55">
            Drag any of the three glowing vertices.  Watch the angle sum shrink
            as you push the triangle outward — in hyperbolic geometry the
            larger the triangle, the smaller its angle sum.
          </p>
        </div>
      </aside>
    </div>
  );
}
