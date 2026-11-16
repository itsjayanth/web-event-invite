'use client';
import { m, useTransform, type MotionValue } from 'framer-motion';
import type { ThreadGeometry } from './geometry';

export const THREAD = 'rgb(var(--gold-light))';
export const strokeStyle = { stroke: THREAD, strokeOpacity: 0.95, fill: 'none', strokeWidth: 1.15 } as const;
/** Glow stroke drawn underneath the main line — a second, wider, low-opacity stroke instead of a
 * `drop-shadow` filter. Reads as a soft glow at a fraction of the paint cost (no blur rasterization). */
const glowStyle = { stroke: THREAD, strokeOpacity: 0.22, fill: 'none', strokeWidth: 3.4 } as const;
const BEAD_GAP = 190;

/** Tiny closed lotus bud, drawn around (0,0), pointing up. */
function Bud() {
  return (
    <g stroke={THREAD} strokeWidth={1} fill="rgb(27 20 12 / 0.0)" strokeLinejoin="round" strokeLinecap="round">
      <circle r={9} stroke="none" fill="rgb(216 183 106 / 0.22)" />
      <path d="M0 6C-5 2-5-4 0-10C5-4 5 2 0 6z" fill="rgb(243 224 162 / 0.9)" />
      <path d="M0 6C-8 4-9-3-6-6C-4-3-2-1 0 0M0 6C8 4 9-3 6-6C4-3 2-1 0 0" />
    </g>
  );
}

/** One bead's reveal: a cheap opacity cross-fade keyed to its own fraction along the trunk,
 * instead of a `<clipPath>` rect whose height animated every frame. */
function Bead({ x, y, frac, progress }: { x: number; y: number; frac: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [Math.max(0, frac - 0.015), frac], [0, 0.95]);
  return <m.path d={`M${x} ${y - 4.5} l3.6 4.5 l-3.6 4.5 l-3.6 -4.5 z`} fill={THREAD} stroke="none" style={{ opacity }} />;
}

/**
 * The scroll-drawn trunk: a glowing line, diamond beads revealed behind the tip, and a lotus bud
 * at the tip. Reveal is `scaleY` from a fixed `transform-origin` (compositor-friendly transform)
 * instead of `strokeDashoffset` + a clip-path rect (both paint-bound).
 */
export function Trunk({
  geo,
  len,
  progress,
  showGlow = true,
}: {
  geo: ThreadGeometry;
  len: number;
  progress: MotionValue<number>;
  showGlow?: boolean;
}) {
  const { x, y0, y1 } = geo.trunk;
  const scaleY = useTransform(progress, (v) => Math.max(0.0001, v));
  const diamondOpacity = useTransform(progress, [0.97, 1], [0, 1]);
  const tipY = useTransform(progress, (v) => v * len);
  const budOpacity = useTransform(progress, [0, 0.02, 0.95, 0.99], [0, 1, 1, 0]);
  const beads: number[] = [];
  for (let y = y0 + BEAD_GAP * 0.6; y < y1 - 40; y += BEAD_GAP) beads.push(y);
  return (
    <>
      {showGlow && (
        <m.line
          x1={x}
          y1={y0}
          x2={x}
          y2={y1}
          style={{ ...glowStyle, scaleY, transformOrigin: `${x}px ${y0}px` }}
        />
      )}
      <m.line
        x1={x}
        y1={y0}
        x2={x}
        y2={y1}
        style={{ ...strokeStyle, scaleY, transformOrigin: `${x}px ${y0}px` }}
      />
      {beads.map((y) => (
        <Bead key={y} x={x} y={y} frac={(y - y0) / len} progress={progress} />
      ))}
      <g transform={`translate(${x} ${y0})`}>
        <m.g style={{ y: tipY, opacity: budOpacity }}>
          <Bud />
        </m.g>
      </g>
      <m.path d={`M${x} ${y1 - 7} l7 7 l-7 7 l-7 -7 z`} style={{ ...strokeStyle, opacity: diamondOpacity }} />
    </>
  );
}
