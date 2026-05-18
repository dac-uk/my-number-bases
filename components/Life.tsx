"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const COLS = 60;
const ROWS = 40;

type Grid = Uint8Array;

function emptyGrid(): Grid {
  return new Uint8Array(COLS * ROWS);
}

function idx(x: number, y: number): number {
  return ((y + ROWS) % ROWS) * COLS + ((x + COLS) % COLS);
}

function step(g: Grid): Grid {
  const next = new Uint8Array(g.length);
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          n += g[idx(x + dx, y + dy)];
        }
      }
      const alive = g[idx(x, y)] === 1;
      next[idx(x, y)] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  return next;
}

function plant(g: Grid, cells: [number, number][], ox = 10, oy = 10): Grid {
  const next = new Uint8Array(g);
  for (const [x, y] of cells) next[idx(x + ox, y + oy)] = 1;
  return next;
}

const PRESETS: Record<string, [number, number][]> = {
  glider: [
    [1, 0], [2, 1], [0, 2], [1, 2], [2, 2],
  ],
  blinker: [[0, 0], [1, 0], [2, 0]],
  pulsar: [
    [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
    [0, 2], [5, 2], [7, 2], [12, 2],
    [0, 3], [5, 3], [7, 3], [12, 3],
    [0, 4], [5, 4], [7, 4], [12, 4],
    [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
    [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
    [0, 8], [5, 8], [7, 8], [12, 8],
    [0, 9], [5, 9], [7, 9], [12, 9],
    [0, 10], [5, 10], [7, 10], [12, 10],
    [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12],
  ],
  rPentomino: [
    [1, 0], [2, 0], [0, 1], [1, 1], [1, 2],
  ],
  acorn: [
    [1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2],
  ],
  diehard: [
    [6, 0], [0, 1], [1, 1], [1, 2], [5, 2], [6, 2], [7, 2],
  ],
};

export function Life() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(8); // ticks per second
  const [generation, setGeneration] = useState(0);

  const alive = useMemo(() => {
    let n = 0;
    for (let i = 0; i < grid.length; i += 1) if (grid[i]) n += 1;
    return n;
  }, [grid]);

  // Tick loop.
  useEffect(() => {
    if (!playing) return;
    const interval = 1000 / speed;
    const id = window.setInterval(() => {
      setGrid((g) => step(g));
      setGeneration((n) => n + 1);
    }, interval);
    return () => window.clearInterval(id);
  }, [playing, speed]);

  // Drawing.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cw = w / COLS;
      const ch = h / ROWS;

      ctx.fillStyle = "#0a0c14";
      ctx.fillRect(0, 0, w, h);

      // gridlines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x += 1) {
        ctx.beginPath();
        ctx.moveTo(x * cw, 0);
        ctx.lineTo(x * cw, h);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y * ch);
        ctx.lineTo(w, y * ch);
        ctx.stroke();
      }

      // cells
      for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          if (grid[idx(x, y)]) {
            ctx.fillStyle = "#7df9ff";
            ctx.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
          }
        }
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [grid]);

  const pointerToCell = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const c = canvasRef.current;
      if (!c) return null;
      const r = c.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * COLS);
      const y = Math.floor(((e.clientY - r.top) / r.height) * ROWS);
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return null;
      return { x, y };
    },
    [],
  );

  const dragModeRef = useRef<0 | 1 | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cell = pointerToCell(e);
    if (!cell) return;
    setGrid((g) => {
      const next = new Uint8Array(g);
      const i = idx(cell.x, cell.y);
      next[i] = next[i] ? 0 : 1;
      dragModeRef.current = next[i] as 0 | 1;
      return next;
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragModeRef.current === null) return;
    const cell = pointerToCell(e);
    if (!cell) return;
    setGrid((g) => {
      const i = idx(cell.x, cell.y);
      if (g[i] === dragModeRef.current) return g;
      const next = new Uint8Array(g);
      next[i] = dragModeRef.current!;
      return next;
    });
  };

  const onPointerUp = () => {
    dragModeRef.current = null;
  };

  const clear = () => {
    setGrid(emptyGrid());
    setGeneration(0);
    setPlaying(false);
  };

  const random = () => {
    const g = emptyGrid();
    for (let i = 0; i < g.length; i += 1) g[i] = Math.random() < 0.28 ? 1 : 0;
    setGrid(g);
    setGeneration(0);
  };

  const loadPreset = (name: keyof typeof PRESETS) => {
    setGrid((g) => plant(emptyGrid(), PRESETS[name], Math.floor(COLS / 2) - 6, Math.floor(ROWS / 2) - 4));
    setGeneration(0);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-3">
        <canvas
          ref={canvasRef}
          className="aspect-[3/2] w-full touch-none rounded-2xl border border-white/8 bg-ink-900/60"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => setPlaying((p) => !p)}
            className={playing ? "btn-ghost" : "btn-primary"}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              setGrid((g) => step(g));
              setGeneration((n) => n + 1);
            }}
            className="btn-ghost"
          >
            Step
          </button>
          <button onClick={clear} className="btn-ghost">Clear</button>
          <button onClick={random} className="btn-ghost">Random</button>
          <span className="ml-auto font-mono text-xs text-white/55">
            gen {generation} · alive {alive}
          </span>
        </div>
        <label className="block text-sm">
          <span className="text-xs text-white/55">speed (ticks/sec)</span>
          <input
            type="range"
            min={1}
            max={30}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-2 w-full accent-neon-cyan"
          />
        </label>
      </div>

      <aside className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Presets
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <button onClick={() => loadPreset("glider")} className="btn-ghost !px-3">Glider</button>
            <button onClick={() => loadPreset("blinker")} className="btn-ghost !px-3">Blinker</button>
            <button onClick={() => loadPreset("pulsar")} className="btn-ghost !px-3">Pulsar</button>
            <button onClick={() => loadPreset("rPentomino")} className="btn-ghost !px-3">R-pent.</button>
            <button onClick={() => loadPreset("acorn")} className="btn-ghost !px-3">Acorn</button>
            <button onClick={() => loadPreset("diehard")} className="btn-ghost !px-3">Diehard</button>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 text-xs text-white/65">
          <p className="font-mono uppercase tracking-[0.18em] text-neon-cyan">
            the four rules
          </p>
          <ul className="mt-3 space-y-1.5">
            <li>· live cell with &lt; 2 neighbours dies (loneliness)</li>
            <li>· live cell with 2 or 3 neighbours survives</li>
            <li>· live cell with &gt; 3 neighbours dies (overcrowding)</li>
            <li>· dead cell with exactly 3 neighbours is born</li>
          </ul>
          <p className="mt-4 text-white/55">
            Click any cell or drag to paint a pattern. Try the R-pentomino — five
            cells produce 1103 generations of chaos before stabilising.
          </p>
        </div>
      </aside>
    </div>
  );
}
