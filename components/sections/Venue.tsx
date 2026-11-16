import { wedding } from '@/content/wedding';
import { Media } from '../Media';
import { Reveal } from '../Reveal';
import { ArchFrame } from './parts/ArchFrame';
import { MaskLines } from './parts/MaskLine';
import { FoilPill } from './parts/FoilPill';

export function Venue() {
  const { venue } = wedding;
  return (
    <section data-section="venue" aria-labelledby="venue-h" className="paper overflow-hidden px-6 py-28 pb-[calc(7rem+var(--safe-bottom))] pl-10 sm:py-40 sm:pb-[calc(10rem+var(--safe-bottom))] md:px-10">
      <div aria-hidden="true" className="jali-bg pointer-events-none absolute inset-0 -z-10 opacity-[0.05]" />
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="venue-h" className="font-serif text-[clamp(3.4rem,9vw,7rem)] font-normal leading-[0.95] tracking-tight">
          <MaskLines lines={venue.heading.split(' ').map((w, i, arr) => (i === 0 && arr.length > 1 ? <span key={w} className="italic text-accent">{w}</span> : <span key={w}>{w}</span>))} />
        </h2>
        <p className="mt-6 font-serif text-lg italic text-ink/70 dark:text-ivory/70 md:text-xl">{venue.kicker}</p>
        <Reveal delay={0.4}>
          <div className="mx-auto mt-8 flex max-w-[16rem] items-center gap-3" aria-hidden="true">
            <span className="gold-rule h-px flex-1" />
            <span className="h-1.5 w-1.5 rotate-45 border border-gold" />
            <span className="gold-rule h-px flex-1" />
          </div>
          <p className="mt-10 font-serif text-[clamp(2.2rem,7vw,3.8rem)] font-bold leading-[1.05] tracking-tight text-gold-deep dark:text-gold-light">
            {venue.name}
          </p>
          <p className="mt-3 font-serif text-2xl italic text-accent sm:text-3xl">{venue.locality}</p>
          {venue.photo && (
            <div className="mx-auto mt-10 w-full max-w-[20rem]">
              <ArchFrame aspect="4 / 3" className="text-gold" fillClassName="bg-sandstone">
                <Media media={venue.photo} aspect="auto" sizes="(min-width: 768px) 20rem, 90vw" className="h-full w-full" />
              </ArchFrame>
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <FoilPill href={venue.directionsUrl}>Get directions</FoilPill>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
