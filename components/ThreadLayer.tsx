'use client';
/**
 * ThreadLayer: wraps Families -> Closing and draws ONE absolutely positioned SVG, the gold thread.
 *
 * CONVENTION FOR OTHER SECTIONS
 *  - The thread runs at the page centre on md+ and along the LEFT edge (x = 11px) below md.
 *    Keep >= 24px (px-6) side padding on mobile so content never touches it.
 *  - The SVG sits at z-index 0. Anything that should hide the thread (text blocks crossing the
 *    centre line, cards, captions) gets the class `thread-mask`. It paints --mask-bg behind the
 *    block, and ThreadLayer makes it `position: relative; z-index: 1` automatically.
 *      * On the default page background nothing else is needed.
 *      * In a section with an alt background, set the var on the section:
 *        style={{ ['--mask-bg' as string]: 'var(--surface-alt)' }}  (an RGB triplet, e.g. 230 217 188)
 *    Keep masked blocks tight (the text's own width, `inline-block`/`mx-auto w-fit` + padding), so the
 *    patch is not visible against gradients or photos. Media (images/video) hides the thread by itself
 *    if wrapped in `relative z-[1]`.
 *  - Section backgrounds must NOT be positioned with a z-index (they would cover the thread).
 *  - Closing places `<div data-thread-end />` just above the countdown; the thread ends there in a diamond.
 *  - Families exposes data-thread-from="bride|groom" and data-thread-join anchors (keep them outside
 *    transformed/animated wrappers so measurements are exact).
 * If measurement fails, nothing is rendered. Reduced motion: the thread is fully drawn.
 *
 * PERFORMANCE NOTE (Stage D1): the trunk/branches reveal via `scaleY`/`pathLength` transforms
 * (Trunk.tsx), not `strokeDashoffset` + a clip-path rect — those are paint-bound and forced a
 * full re-rasterization of a page-height SVG on every scroll frame. The glow is a second,
 * low-opacity stroke drawn underneath the main line (no `drop-shadow` filter). The tail overlay
 * (needed so the trunk stays visible above Closing's own positioned background) is now sized to
 * just that tail region instead of a second full-page-height duplicate. Scroll-linked motion
 * values are only driven while the wrapper is near the viewport (IntersectionObserver), and the
 * `load`-triggered re-measure is debounced and bails before `setGeo` when geometry is unchanged.
 */
import { m, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { measure, type ThreadGeometry } from './thread/geometry';
import { Trunk, strokeStyle, THREAD } from './thread/Trunk';
import { useLowPower } from './hooks/useLowPower';

const css = `.thread-mask:where(:not(.absolute):not(.fixed):not(.sticky)){position:relative}.thread-mask{z-index:1}`;

export function ThreadLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<ThreadGeometry | null>(null);
  const reduce = useReducedMotion();
  const lowPower = useLowPower();
  const progress = useMotionValue(reduce ? 1 : 0);
  const branchP = useMotionValue(reduce ? 1 : 0);
  const { scrollY } = useScroll();
  const pageTop = useRef(0);
  const geoRef = useRef<ThreadGeometry | null>(null);
  const inViewRef = useRef(true);

  const update = useCallback(() => {
    const g = geoRef.current;
    if (!g) return;
    if (reduce) {
      progress.set(1);
      branchP.set(1);
      return;
    }
    // Skip the per-frame scroll math entirely while the thread is nowhere near the viewport —
    // the values just hold their last position until it's back in (or near) view.
    if (!inViewRef.current) return;
    const len = g.trunk.y1 - g.trunk.y0;
    const headY = window.scrollY + window.innerHeight * 0.7 - pageTop.current;
    progress.set(Math.max(0, Math.min(1, (headY - g.trunk.y0) / len)));
    const { y0, y1 } = g.branchSpan;
    branchP.set(Math.max(0, Math.min(1, (headY - y0) / Math.max(1, y1 - y0))));
  }, [progress, branchP, reduce]);

  useMotionValueEvent(scrollY, 'change', update);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const run = () => {
      raf = 0;
      try {
        const g = measure(el);
        pageTop.current = el.getBoundingClientRect().top + window.scrollY;
        // Compare BEFORE touching state — skip setGeo (and the re-render it triggers) entirely
        // when nothing actually changed.
        const unchanged = geoRef.current && g && JSON.stringify(geoRef.current) === JSON.stringify(g);
        geoRef.current = g;
        if (!unchanged) setGeo(g);
        update();
      } catch {
        geoRef.current = null;
        setGeo(null);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };

    // Debounce the `load`-driven re-measures: an image/media-heavy section fires many `load`
    // events in quick succession, each of which previously scheduled its own measurement.
    let loadTimer = 0;
    const scheduleDebounced = () => {
      window.clearTimeout(loadTimer);
      loadTimer = window.setTimeout(schedule, 220);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    window.addEventListener('resize', schedule);
    el.addEventListener('load', scheduleDebounced, true); // images / media (capture)
    document.fonts?.ready.then(schedule).catch(() => {});
    const t1 = window.setTimeout(schedule, 700);
    const t2 = window.setTimeout(schedule, 2400);

    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((e) => e.isIntersecting);
        if (inViewRef.current) update();
      },
      { rootMargin: '100% 0px 100% 0px' },
    );
    io.observe(el);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(loadTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('resize', schedule);
      el.removeEventListener('load', scheduleDebounced, true);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [update]);

  const len = geo ? geo.trunk.y1 - geo.trunk.y0 : 0;

  return (
    <div ref={ref} className="relative">
      <style>{css}</style>
      {geo && (
        <svg
          aria-hidden="true"
          focusable="false"
          width={geo.width}
          height={geo.height}
          viewBox={`0 0 ${geo.width} ${geo.height}`}
          className="pointer-events-none absolute left-0 top-0 z-0"
        >
          {geo.branches.map((d, i) => (
            <m.path key={i} d={d} style={{ ...strokeStyle, pathLength: branchP }} />
          ))}
          <JoinBead geo={geo} p={branchP} />
          <Trunk geo={geo} len={len} progress={progress} showGlow={!lowPower} />
        </svg>
      )}
      {geo && geo.overlayFrom !== null && geo.overlayFrom < geo.height && (
        <svg
          aria-hidden="true"
          focusable="false"
          width={geo.width}
          height={geo.height - geo.overlayFrom}
          viewBox={`0 ${geo.overlayFrom} ${geo.width} ${geo.height - geo.overlayFrom}`}
          className="pointer-events-none absolute left-0 z-[2]"
          style={{ top: geo.overlayFrom, willChange: 'transform' }}
        >
          <Trunk geo={geo} len={len} progress={progress} showGlow={!lowPower} />
        </svg>
      )}
      {children}
    </div>
  );
}

/** A small knot where the two threads become one. */
function JoinBead({ geo, p }: { geo: ThreadGeometry; p: ReturnType<typeof useMotionValue<number>> }) {
  const o = useTransform(p, [0.92, 1], [0, 1]);
  if (geo.mobile) return null;
  const { x, y0 } = geo.trunk;
  return (
    <m.g style={{ opacity: o }} stroke={THREAD} strokeWidth={1} fill="none">
      <path d={`M${x} ${y0 - 6} l6 6 l-6 6 l-6 -6 z`} fill="rgb(248 244 232)" />
      <path d={`M${x} ${y0 - 2.4} l2.4 2.4 l-2.4 2.4 l-2.4 -2.4 z`} fill={THREAD} stroke="none" />
    </m.g>
  );
}
