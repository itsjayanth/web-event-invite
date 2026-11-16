'use client';
import { m, useReducedMotion } from 'framer-motion';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { wedding } from '@/content/wedding';
import { Elephant, Palace } from './ornaments/Elephant';
import { useLowPower } from './hooks/useLowPower';

/** Deterministic pseudo-random so server and client markup match exactly. */
function seeded(n: number, seed = 7) {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(s / 233280);
  }
  return out;
}
const STARS = (() => {
  const r = seeded(40, 11);
  return Array.from({ length: 12 }, (_, i) => ({
    x: (r[i * 3] * 100).toFixed(2),
    y: (r[i * 3 + 1] * 56).toFixed(2),
    s: r[i * 3 + 2] > 0.8 ? 2 : 1,
    d: (r[i * 3 + 2] * 6).toFixed(2),
    t: (3 + r[i * 3 + 1] * 4).toFixed(2),
  }));
})();
const MOTES = (() => {
  const r = seeded(20, 29);
  return Array.from({ length: 6 }, (_, i) => ({
    x: (4 + r[i * 3] * 92).toFixed(2),
    y: (40 + r[i * 3 + 1] * 55).toFixed(2),
    d: (-r[i * 3 + 2] * 14).toFixed(2),
    t: (11 + r[i * 3] * 8).toFixed(2),
    s: r[i * 3 + 1] > 0.6 ? 3 : 2,
  }));
})();

const CSS = `
.psg-star{position:absolute;border-radius:9999px;background:rgb(243 224 162);opacity:.2;animation:psg-twinkle var(--t) ease-in-out var(--d) infinite}
.psg-mote{position:absolute;border-radius:9999px;background:rgb(216 183 106);opacity:0;animation:psg-drift var(--t) linear var(--d) infinite}
@keyframes psg-twinkle{0%,100%{opacity:.12}50%{opacity:.85}}
@keyframes psg-drift{0%{opacity:0;transform:translate3d(0,0,0)}15%{opacity:.7}85%{opacity:.45}100%{opacity:0;transform:translate3d(14px,-90px,0)}}
@media (prefers-reduced-motion:reduce){.psg-star,.psg-mote{animation:none}}
`;

const EASE = [0.22, 0.61, 0.36, 1] as const;
const nightVar = { ['--el-bg' as string]: 'rgb(27 20 12)' } as CSSProperties;

/**
 * The opening scene: a palace gate at night and the golden ambari arriving.
 * Plays once on load, then the page simply continues — no button, no gate to pass.
 */
export function EntryGate({ children }: { children: ReactNode }) {
  const [arrived, setArrived] = useState(false);
  const reduce = useReducedMotion();
  const lowPower = useLowPower();

  const show = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay: reduce ? 0 : delay, ease: EASE },
  } as const);

  return (
    <>
      <section
        aria-label={wedding.site.title}
        className="bg-night relative flex min-h-[100svh] flex-col items-center overflow-hidden text-ivory"
      >
        <style>{CSS}</style>

        {/* stars and drifting gold dust */}
        <div aria-hidden className="absolute inset-0">
          {!lowPower &&
            STARS.map((s, i) => (
              <span
                key={i}
                className="psg-star"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, ['--d' as string]: `${s.d}s`, ['--t' as string]: `${s.t}s` }}
              />
            ))}
          {!lowPower &&
            MOTES.map((mo, i) => (
              <span
                key={i}
                className="psg-mote"
                style={{ left: `${mo.x}%`, top: `${mo.y}%`, width: mo.s, height: mo.s, ['--d' as string]: `${mo.d}s`, ['--t' as string]: `${mo.t}s` }}
              />
            ))}
          {/* warm horizon behind the palace */}
          <div
            className="absolute inset-x-0 bottom-0 h-[62%]"
            style={{ background: 'radial-gradient(70% 70% at 50% 100%, rgb(216 183 106 / 0.2), transparent 72%)' }}
          />
        </div>

        {/* names, title and caption */}
        <m.div
          className="relative z-10 flex flex-col items-center px-6 pt-[max(9svh,calc(var(--safe-top)+2rem))] text-center"
        >
          <m.p
            {...show(0.3)}
            className="font-serif text-xs uppercase tracking-[0.5em] text-gold-light/80 sm:text-sm"
          >
            The Wedding of
          </m.p>
          <m.h1
            className="font-script foil-text py-2 text-[clamp(3.8rem,17vw,5.6rem)] leading-[1.02] sm:text-[clamp(5rem,9.5vw,10rem)]"
            {...show(0.6)}
          >
            <span className="block px-[0.16em] sm:inline-block">{wedding.couple.groom.short}</span>
            <span className="mx-[0.25em] inline-block text-[0.7em]">&amp;</span>
            <span className="block px-[0.16em] sm:inline-block">{wedding.couple.bride.short}</span>
          </m.h1>
          <m.p
            className="mt-2 font-serif text-lg italic text-sandstone sm:text-2xl"
            {...show(1)}
          >
            {wedding.entry.caption}
          </m.p>
        </m.div>

        {/* palace, with the elephant crossing in front of the gateway */}
        <div className="relative mt-auto w-[min(300vw,170svh)] -translate-x-0 self-center lg:w-[min(100vw,180svh)]">
          <Palace className="block h-auto w-full text-gold/80" lit={arrived} open />
          <div className="absolute bottom-0 left-1/2 w-[27%] -translate-x-1/2 lg:w-[35%]">
            <div className="translate-y-[5%]">
              <m.div
                initial={reduce ? false : { x: '-95vw' }}
                animate={{ x: 0 }}
                transition={{ duration: 2.4, ease: [0.3, 0.68, 0.3, 1], delay: reduce ? 0 : 0.5 }}
                onAnimationComplete={() => setArrived(true)}
              >
                <Elephant className="block h-auto w-full text-gold-light" style={nightVar} animated walking={!arrived} lit={arrived} />
              </m.div>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <m.div
          aria-hidden
          className="relative z-10 flex flex-col items-center pb-safe pt-4"
          {...show(2.2)}
        >
          <span className="font-serif text-sm italic text-gold-light/90">{wedding.hero.scroll}</span>
          <span className="relative mb-4 mt-2 block h-12 w-px overflow-hidden bg-gold-light/25">
            <m.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-gold-light"
              animate={reduce ? undefined : { y: ['-100%', '200%'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </m.div>
      </section>

      {children}
    </>
  );
}
