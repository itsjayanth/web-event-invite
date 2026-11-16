'use client';
import { LazyMotion } from 'framer-motion';
import type { Version } from '@/content/wedding';

// Loaded as a dynamic import, not a static one, so domAnimation's code
// (gestures, animation controls) ships as its own async chunk instead of
// being folded into the route's synchronous First Load JS.
const loadFeatures = () => import('framer-motion').then((mod) => mod.domAnimation);
import { EntryGate } from './EntryGate';
import { Hero } from './Hero';
import { MusicToggle } from './MusicToggle';
import { NextSectionButton } from './NextSectionButton';
import { ThreadLayer } from './ThreadLayer';
import { ScrollProgress } from './thread/ScrollProgress';
import { Beginning } from './sections/Beginning';
import { Blessings } from './sections/Blessings';
import { Celebrations } from './sections/Celebrations';
import { Closing } from './sections/Closing';
import { Families } from './sections/Families';
import { Moments } from './sections/Moments';
import { Venue } from './sections/Venue';

/** One design, one content file. `version` toggles only the differences described in the brief. */
export function Invitation({ version }: { version: Version }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <EntryGate>
        <ScrollProgress />
        <MusicToggle />
        <NextSectionButton />
        <main>
          <Hero />
          <ThreadLayer>
            <Families version={version} />
            <Beginning />
            <Moments version={version} />
            <Blessings version={version} />
            <Celebrations version={version} />
            <Venue />
            <Closing version={version} />
          </ThreadLayer>
        </main>
      </EntryGate>
    </LazyMotion>
  );
}
