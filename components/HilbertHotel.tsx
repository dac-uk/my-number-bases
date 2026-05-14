"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Guest {
  id: string;
  label: string;
  tint: string;
}

const VISIBLE = 8;
const TINTS = ["#7df9ff", "#b388ff", "#ff5fa2", "#f5c76a", "#7affc6"];

function makeGuest(prefix: string, idx: number): Guest {
  return {
    id: `${prefix}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
    label: `${prefix}${idx + 1}`,
    tint: TINTS[idx % TINTS.length],
  };
}

function initialGuests(): Guest[] {
  return Array.from({ length: VISIBLE }, (_, i) => makeGuest("G", i));
}

export function HilbertHotel() {
  const [rooms, setRooms] = useState<(Guest | null)[]>(initialGuests());
  const newCounter = useRef(0);

  const shiftByOne = () => {
    const next: (Guest | null)[] = [null, ...rooms];
    newCounter.current += 1;
    next[0] = makeGuest("N", newCounter.current - 1);
    setRooms(next.slice(0, 32));
  };

  const doubleRooms = () => {
    const next: (Guest | null)[] = Array.from({ length: rooms.length * 2 }, () => null);
    rooms.forEach((g, i) => {
      if (g) next[2 * i + 1] = g; // old room n → new room 2n  (1-indexed)
    });
    for (let i = 0; i < next.length; i += 2) {
      newCounter.current += 1;
      next[i] = makeGuest("∞", newCounter.current - 1);
    }
    setRooms(next.slice(0, 32));
  };

  const reset = () => {
    newCounter.current = 0;
    setRooms(initialGuests());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={shiftByOne} className="btn-ghost text-sm">
          + 1 new guest arrives
        </button>
        <button onClick={doubleRooms} className="btn-ghost text-sm">
          + infinite guests arrive
        </button>
        <button
          onClick={reset}
          className="rounded-full border border-white/8 px-4 py-2 text-sm text-white/55 hover:border-white/30 hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex items-end gap-2 pb-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {rooms.slice(0, 14).map((guest, i) => {
              const roomNumber = i + 1;
              return (
                <motion.div
                  key={`r${roomNumber}`}
                  layout
                  className="flex w-[80px] shrink-0 flex-col items-center gap-1"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    room {roomNumber}
                  </span>
                  <div className="relative grid h-[100px] w-[72px] place-items-center rounded-xl border border-white/10 bg-ink-900/60">
                    <AnimatePresence mode="popLayout">
                      {guest && (
                        <motion.div
                          key={guest.id}
                          layoutId={guest.id}
                          initial={{ opacity: 0, y: -20, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.85 }}
                          transition={{
                            type: "spring",
                            stiffness: 280,
                            damping: 28,
                          }}
                          className="grid h-[68px] w-[56px] place-items-center rounded-lg font-mono text-xs"
                          style={{
                            background: `${guest.tint}25`,
                            border: `1px solid ${guest.tint}55`,
                            color: guest.tint,
                            boxShadow: `0 0 22px -8px ${guest.tint}`,
                          }}
                        >
                          {guest.label}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div className="ml-2 grid h-[100px] w-[64px] place-items-center font-mono text-3xl text-white/30">
            …
          </div>
        </div>
      </div>

      <p className="text-sm text-white/55">
        New arrivals never overflow. Press <b>+1 new guest</b>: everyone shifts
        one room over. Press <b>+ infinite guests</b>: every old guest moves to
        room 2n, freeing all odd rooms for a busload of new arrivals.
      </p>
    </div>
  );
}
