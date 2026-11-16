'use client';
import { useEffect, useRef, useState } from 'react';
import { useEntry } from './entry/context';

const DURATION_MS = 2400;
/** ease-in-out-sine: slow start, slow finish, no abrupt snap. */
const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Fixed bottom-right affordance: taps smooth-scroll to the next `[data-section]`
 *  block instead of making the guest scroll to discover it. Hides once the
 *  last section is reached so it never overlaps the closing page. */
export function NextSectionButton() {
  const { entered } = useEntry();
  const [visible, setVisible] = useState(true);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      setVisible(!nearBottom);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const goToNext = () => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    const next = sections.find((el) => el.getBoundingClientRect().top > window.innerHeight * 0.15);
    const target = next ?? sections[sections.length - 1];
    if (!target) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = window.scrollY;
    const to = from + target.getBoundingClientRect().top;
    if (reduce) {
      window.scrollTo(0, to);
      return;
    }

    if (raf.current) cancelAnimationFrame(raf.current);
    const cancel = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
    };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      window.scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) raf.current = requestAnimationFrame(step);
      else cancel();
    };
    raf.current = requestAnimationFrame(step);
  };

  return (
    <button
      type="button"
      onClick={goToNext}
      aria-label="Scroll to next section"
      className="group fixed z-40 flex h-12 w-12 items-center justify-center rounded-full border border-gold-light/80 bg-[rgb(27_20_12/0.55)] p-[3px] text-gold-light shadow-[0_0_24px_rgb(216_183_106/0.25)] backdrop-blur-md transition-[opacity,box-shadow] duration-[600ms] hover:shadow-[0_0_32px_rgb(216_183_106/0.45)]"
      style={{
        bottom: 'calc(var(--safe-bottom) + 14px)',
        right: 'max(14px, env(safe-area-inset-right, 0px))',
        opacity: entered && visible ? 1 : 0,
        pointerEvents: entered && visible ? 'auto' : 'none',
      }}
    >
      <span className="flex h-full w-full items-center justify-center rounded-full border border-gold-light/30">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="next-arrow"
        >
          <path d="M12 4v15" />
          <path d="M5 13l7 7 7-7" />
        </svg>
      </span>
      <style>{`
        @keyframes next-arrow-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
        .next-arrow { animation: next-arrow-bob 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .next-arrow { animation: none; } }
      `}</style>
    </button>
  );
}
