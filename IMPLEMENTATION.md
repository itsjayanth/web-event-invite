# Implementation plan — Prajwal & Supraja

Written 3 Nov 2026. **Muhurtham is 22 Nov 2026 — 19 days out.**

Scope: mobile-first redesign, UI/UX pass, animation rebuild, performance rebuild.
Audience: guests on mid/low-end Android, 3G/slow-4G, data-saver.

---

## 0. Decisions taken

| # | Decision |
|---|---|
| Names | `Prajwal M Palegar` / `Supraja K.S.` — unchanged |
| Venue | Spectra Convention Centre, Hinkal, Mysore — **both** events |
| Venue photo | `images/v1.jpeg` (blue-lit dome) may be dropped if it fights the palette — see §4.3 |
| Language | **English + Kannada in selected places** (reverses `DESIGN.md:4`) |
| Closing | A plain "join us" line. No contact link, no RSVP. |
| Maps | Keep both `FoilPill` buttons in `Venue` |
| Motifs | Elephant is the signature; kolam + lotus as accents; jali texture and full palace gate retired |
| Motion | Keep the choreography. Elephant walk stays — lighter, smoother, faster. |
| Music | Soothing Krishna-flute (bansuri) instrumental loop in the background — see §4.7 |
| Everything else | Author's discretion |

### Already done (this session)
WhatsApp/RSVP block fully removed: `components/sections/Rsvp.tsx` deleted; import + JSX
dropped from `components/Invitation.tsx`; `rsvp:` block removed from `content/wedding.ts`;
two `wa.me` assertions removed from `tests/smoke.spec.ts` (the `form,input,textarea,select → 0`
guard kept as the regression test); `README.md` section removed.
`grep -rniE "rsvp|whatsapp|wa\.me"` is clean. **Not yet compiled** — `node_modules` is absent.

---

## 1. Strategy: ship-safe staging

19 days is not enough room for a big-bang rewrite. Work in the order below so the site is
**sendable from end of Stage B onward**, and every later stage is additive polish.

| Stage | Days | Outcome |
|---|---|---|
| **A. Make it correct** | 1–3 | Real photos, real copy, no placeholders, builds green |
| **B. Make it fast** | 4–7 | Performance budget met. **Site is sendable here.** |
| **C. Make it beautiful** | 8–13 | Palette, type, layout, bilingual pass |
| **D. Make it move** | 14–17 | Animation rebuild |
| **E. Harden** | 18–19 | Real-device testing, freeze |

If time runs short, cut from D, never from A or B.

---

## 2. Stage A — correctness

### A1. Install and establish a baseline — DONE (3 Nov 2026)
```
npm ci && npm run lint && npm run typecheck && npm run build
```
Lint clean, typecheck clean, build green. RSVP removal confirmed compiling.

**Measured baseline (not an estimate):**
```
Route          First Load JS
/              184 kB
/family        184 kB
shared         103 kB  (chunks: 46.6 kB + 54.2 kB + 1.92 kB)
```
This is pre-LazyMotion, pre-image-pipeline, pre-font-subsetting — i.e. before any of
Stage B's work. 184 kB JS alone already eats most of the 271 kB first-view budget in
§B1, which is estimated against CSS+fonts+hero image on top of it. Stage B's framer-motion
and font work is the only way to close that gap; track against this number, not the
original estimate table.

### A2. Wire up the real photos
Today `content/wedding.ts` references 19 `/media/*` files, **none of which exist**, and
the 10 real JPEGs sit unreferenced in `images/` (9.1 MB, ~12 MP each). Every slot renders
`<Placeholder/>`.

Create `media-src/` and map originals to slots:

| Slot | Source | Note |
|---|---|---|
| `hero-couple.jpg` | `00.22.34` (paper planes) | **Hero.** Negative space at top for the names, both faces, real motion |
| `moment-1` | `00.22.33 (1)` (overhead, grass) | Emotional core |
| `moment-2` | `00.21.23` (sunflowers, camera) | |
| `moment-3` | `00.22.33` (field, walking) | |
| `moment-4` | `00.21.59` (dancing, hedge) | |
| `moment-5` | `00.22.17` (evening, wine/black) | |
| `moment-6` | `00.21.09` (heritage balcony) | **Crop hard** — couple is small and off-centre |
| `hero-engagement.jpg` / `blessings` poster | `00.22.48` (rani pink, gold) | Carries the tradition |
| `closing.jpg` | `00.22.33 (1)` or `00.22.34` | Dark-overlaid, so detail matters less |
| `venue` | `images/v2.jpeg` (cream/navy hall) | See §4.3 on `v1.jpeg` |

Reduce `moments.counts` from `{family: 4, friends: 8}` to `{family: 4, friends: 6}` — there
are only 6 strong non-hero frames. Padding to 8 means repeats.

All eight photos are **portrait**. Lean into vertical crops; do not letterbox them into the
landscape assumptions in `Moments`/`Hero`.

### A3. Replace every `// SAMPLE: replace`
Draft and commit real copy for: both family descriptions, 4 blessing quotes, 2 event meanings.
Then delete `components/SampleTag.tsx` and its call sites — the `(sample)` tag must not ship.

**Acceptance:** `grep -rn "SAMPLE: replace" content/` returns nothing, and `SampleTag` is gone.

### A4. Fix `Venue` bottom padding (live bug)
`components/sections/Venue.tsx:10` — `.pb-safe` is declared after `@tailwind utilities`, so it
beats `py-28`/`sm:py-40`. The section loses its bottom padding on every device without a bottom
inset. Reorder or rename the utility.

---

## 3. Stage B — performance

### B1. Budget

| | Target |
|---|---|
| First meaningful view (HTML+CSS+JS+fonts+hero) | **≤ 500 KB** transferred |
| Whole page, fully scrolled | **≤ 1.2 MB** transferred |
| LCP, Slow 4G + 4× CPU throttle | ≤ 2.5 s |
| CLS | ≤ 0.05 |
| INP | ≤ 200 ms |
| Scroll | sustained 50+ fps on mid Android |

Projected against that budget (estimates, to be verified in A1):

```
HTML                 ~8 KB     JS: Next+React        ~95 KB
CSS                  ~8 KB     JS: LazyMotion        ~12 KB
Fonts (4, subset)   ~63 KB     JS: app               ~15 KB
Hero AVIF 1080w     ~70 KB
                              ───────────────────────────────
                              First view ≈ 271 KB  ✓
                              + 6 photos @ ~80 KB ≈ 751 KB total  ✓
```

**Audio sits outside this budget by design.** The bansuri loop (~1.1 MB, §4.7) is fetched
only after a deliberate tap, so it never touches first load and never costs a guest who
does not opt in. If it were ever made automatic it would roughly double the page's weight
on its own — which is exactly why §4.7 forbids that.

### B2. Image pipeline — the single biggest win
`next.config.mjs` sets `output: 'export'` + `images: { unoptimized: true }`. `next/image`
therefore emits **no `srcset` and does no resizing** — the exact file named in `src` goes to the
phone. The `sizes` props scattered through the components are correct hints that currently do
nothing. Wire the photos in as-is and one image costs 1.6 MB over the wire and ~40 MB of decoded
bitmap.

**Approach: pre-generate, stay a static export.** Extend `scripts/optimize-media.mjs`:

- Widths `[480, 768, 1080, 1440]` (currently caps at a single 2400px — too wide for phones)
- AVIF (q50) + WebP (q75) + JPEG fallback (mozjpeg q78)
- Keep writing `blur.json`; **start using it** — nothing reads it today
- Strip EXIF

Then replace `components/Media.tsx`'s `next/image` with a plain `<picture>`:
`<source type="image/avif" srcset=...>`, `<source type="image/webp" ...>`, `<img>` fallback
carrying explicit `width`/`height` (CLS), `loading="lazy"` + `decoding="async"` everywhere
except the hero, `fetchpriority="high"` on the hero only, and the `blur.json` LQIP as the
background behind it. Keep the existing `onError` → `<Placeholder/>` fallback.

**Do not** ship the 9.1 MB `images/` folder. It is currently staged for commit — unstage it and
add to `.gitignore`, or move it to `media-src/` which the build consumes but does not publish.

### B3. Fonts
Four faces, all **statically subset** with `pyftsubset`, self-hosted, `font-display: swap`:

| Family | Use | Subset |
|---|---|---|
| Bodoni Moda 400 + 400i | Display/headings | latin basic |
| Jost 300/400 | Body | latin basic |
| Pinyon Script 400 | Names only | **the ~15 glyphs in "Prajwal & Supraja"** (~5 KB) |
| Noto Sans Kannada 400 | The one `ಶುಭ ವಿವಾಹ` line | **7 codepoints only** (~3–4 KB) |

Drop `Bodoni Moda 500` and the italic/weight combinations not actually used — `app/layout.tsx:6`
currently loads 4 Bodoni faces. Preload only the hero's display face; the rest `swap` in.

Also fix `README.md:36`, which still claims "Cormorant (serif), Jost (sans), a Kannada font" —
Cormorant is not loaded.

### B4. JavaScript
- `framer-motion` → `LazyMotion` + `m.*` with `domAnimation`. Full `motion` is ~30–35 KB gz;
  the lazy feature set is ~5–12 KB. 18 files import it.
- Do not mount `DesktopStrip` below `md` (`components/sections/Moments.tsx:139`). It is
  `hidden md:block` but its `useScroll`, `useSpring` and `ResizeObserver` all run on phones.
- Gate `useScroll` subscriptions to sections in or near the viewport. Currently ~17–25 run
  concurrently.

### B5. Measured verification (required, not optional)
Chrome DevTools, **Slow 4G + 4× CPU throttle**, at 375×667 / 390×844 / 430×932:
record transferred bytes on first load, LCP, CLS, INP, long tasks, and a scroll FPS trace.
Then confirm on a real mid-range Android. No performance claim in this document is verified
until this runs.

---

## 4. Stage C — design

### 4.1 Palette: meet in the middle
Seven of ten photos are soft, desaturated, high-key (blush, cream, olive). Only the engagement
frame lives in the current gold-on-near-black world. Dropping the meadow photos into
`--night #1B140C` arches will make them look washed out.

Move the dark end **up and warmer**, and introduce two supporting tones:

```css
--night:      28 22 18;    /* was 27 20 12 — warm deep brown-plum, less flat black */
--gold:       184 137 58;  /* unchanged — it works */
--gold-light: 214 184 120; /* softened, less brassy against blush */
--blush:      232 206 198; /* NEW — from the eyelet dress */
--sage:       150 156 130; /* NEW — from the meadow */
--ivory:      248 244 232; /* unchanged */
```

Grade the meadow set slightly warmer and the engagement frame slightly cooler so one page can
hold both.

### 4.2 Stop the token leak
A real palette exists (CSS vars → Tailwind) but leaks badly: ~13 hardcoded hex and ~35 hardcoded
`rgb()` values. Worst offenders:

- **Three different foil gradients** that do not match: `--foil` in `globals.css:21`,
  `components/sections/Moments.tsx:10`, `components/sections/Celebrations.tsx:13`
- Thread colour `#CFA650` (`components/thread/Trunk.tsx:5`) is in no token
- `components/thread/ScrollProgress.tsx:14`, `components/sections/parts/VenueMap.tsx:26-27`,
  `components/ornaments/Elephant.tsx:408-410,808-810`
- `text-[#F1E6C8]` in `Hero.tsx:140` duplicates `--champagne`

Collapse to one `--foil`. Expose `--night` and `--champagne` as Tailwind colours (they exist as
CSS vars but have no utility, which is why components hardcode them). One source of truth.

### 4.3 The blue venue image
`images/v1.jpeg` (blue-lit dome at dusk) samples as terracotta/navy/cyan — it fights both the
gold and the new blush/sage tones. **Drop it.** Use `v2.jpeg` (cream/navy interior, warm clay and
peach) for the venue, which sits comfortably in the palette. The illustrated `VenueMap` already
carries the wayfinding job.

### 4.4 Kannada — one line only

**`ಶುಭ ವಿವಾಹ`** (*shubha vivāha*, "auspicious wedding"). That is the entire Kannada
content of the site. No other Kannada strings, no transliterated names, no second script
anywhere else.

**Placement:** in the Hero, above the couple's names — small, letterspaced, in gold, as a
blessing header over the two script names. It opens the page in Kannada and then the rest
reads in English, which is exactly the weight it should carry.

**Implementation:**
- Store as `hero.kannadaBlessing` in `content/wedding.ts`, keeping the single-source-of-truth rule
- Render with `lang="kn"` so the browser shapes it with the right font
- Not decorative: it is real text, so **no** `aria-hidden`

**Why this is now cheap.** One string means the Kannada subset is 7 codepoints
(ಶ ು ಭ ␠ ವ ಿ ಾ ಹ) instead of a general Kannada range — roughly **3–4 KB instead of
100–300 KB**. The bilingual requirement effectively stops being a payload concern.

> Still worth a native reader confirming the spelling before ship. It is four syllables, so
> this is a one-minute check, not a review cycle — but I can set the type and cannot certify
> the orthography.

### 4.5 Story order
Move `Moments` **before** `Celebrations`. Today the engagement gallery sits *after* the event
details, which breaks chronology. New order:

```
EntryGate → Hero → Families → Beginning → Moments → Blessings
          → Celebrations → Venue → Closing
```

Add one line of connective copy between sections — the headings are currently bare labels
("Blessings", "Moments", "The venue") with nothing bridging them, which is why the page reads as
a list rather than a journey. Keep `beginning.line` ("Six months of getting to know each other…")
as the spine the rest hangs off.

Also fix the inconsistent capitalisation in `celebrations.printedLine`
("One moment, Two Hearts, Three knots…").

### 4.6 Mobile UI fixes
- `body { overflow-x: clip }` — no page-level guard today; sections each clip individually and a
  leaking sibling is uncovered
- `Moments.tsx:76,78,93`: `100vh`/`h-screen` → `dvh`; gate the pinned strip on
  `(min-width:768px) and (min-height:600px)` so **landscape phones** (844/932 px wide) stop
  getting the desktop scroll-jack with a cut-off bottom
- `EntryGate.tsx:158,177`: `vh` → `svh` (the `min(300vw,170vh)` palace resizes when the Android
  URL bar collapses mid-entrance)
- `ClosingCountdown.tsx:55`: 11.2 px labels → ≥14 px
- `-webkit-text-size-adjust: 100%`; `overscroll-behavior: none` on the gate
- Check `venue.name` against `VenueMap.tsx:106` `whitespace-nowrap` at 375 px
- Body is Jost 300 at 75–85 % opacity in places — raise opacity on small text; thin light-weight
  type at low contrast is hard on cheap Android panels

### 4.7 Background music — Krishna flute

A soothing bansuri (Krishna flute) instrumental under the page, matching the calm of the
meadow photography. `components/MusicToggle.tsx` and the `/media/music.mp3` slot already
exist — the file has simply never been supplied. This is mostly a sourcing and
delivery-discipline job, not new UI.

**Track brief.** Solo bansuri, slow, unhurried, no percussion and no vocals — percussion
fights the scroll rhythm and vocals compete with reading. Raag Yaman or Bhoopali suit the
mood. A **60–90 second seamlessly looping** bed, not a full composition with a beginning
and an end, so nothing lurches when it wraps. Mixed quiet, with headroom — this plays
under text, it is not the content.

> **Licensing is a hard gate.** The track must be royalty-free, commercially licensed, or
> original. Do not lift audio from YouTube, Instagram or a film soundtrack. This site will
> be shared widely over WhatsApp, which makes it a public distribution. Keep the licence
> or purchase receipt in the repo alongside the file.

**Encoding.** Mono (a loop like this gains nothing from stereo, and mono halves it),
96 kbps, loudness-normalised to about −20 LUFS. ~1.1 MB for 90 s. Ship `.webm`/Opus at
~64 kbps (~700 KB) with `.mp3` as the fallback for older Android browsers. Extend
`scripts/optimize-media.mjs` — it already encodes `music.mp3` at 128 kbps; drop it to 96
and add the Opus output.

**Delivery rules** — these are the whole point, and must not be relaxed:

1. **Off by default. Always.** Never autoplay. Mobile browsers block it anyway, and
   unrequested sound is hostile when a guest opens an invitation in a quiet room or at work.
2. **`preload="none"`.** Not a single byte of audio until a tap. Today
   `MusicToggle.tsx:25` fires a `HEAD` request on mount — drop it and handle a missing
   file via the `error` event instead. That removes a wasted round-trip on every load.
3. **Honour `navigator.connection.saveData`** — hide the control entirely under data-saver
   rather than offering a 1 MB download to someone who has asked not to receive one.
4. **Persist the choice** in `sessionStorage` next to the existing `ps-entered` key, so a
   guest who muted it does not have to mute it again after a scroll back.
5. **Keep the fade.** `MusicToggle.tsx:36-50` already ramps volume rather than cutting —
   good; retain it, but replace the 50 ms `setInterval` with a `requestAnimationFrame`
   ramp so it stops competing with scroll on the main thread.
6. **Pause on tab blur** (`visibilitychange`) — music continuing in a backgrounded tab is
   the single most common complaint about invitation sites.

**The offer moment.** The Enter tap on the gate is a genuine user gesture and therefore the
one point where audio may legitimately begin. Put a small, clearly-labelled speaker toggle
beside the Enter button — *offered*, never pre-selected. A guest who ignores it gets a
silent site and pays nothing for the music.

**Accessibility.** The toggle needs a real `aria-label` and a visible focus ring, and must
reach ≥44 px (it is `h-12 w-12` today, which passes). Audio must never be the only carrier
of meaning — here it is purely atmospheric, so that holds.

---

## 5. Stage D — animation rebuild

Principle: **same choreography, a fraction of the cost.** Nothing in the list below removes a
move the guest notices; it changes how each one is produced.

### D1. The gold thread — the dominant jank source
`components/ThreadLayer.tsx:104-132` renders the thread as **two stacked SVGs sized to the
entire Families→Closing height** (many screen-heights on a phone), each carrying
`filter: drop-shadow(...) drop-shadow(...)` (`ThreadLayer.tsx:29`). It is revealed by animating
`strokeDashoffset` (`Trunk.tsx:44`) and a `<rect height>` inside a `<clipPath>`
(`Trunk.tsx:46-48`). Neither property can run on the compositor, so **every scroll frame
re-rasterises a page-height double-Gaussian-blurred surface, twice**, at 2.5–3× DPR.

Rebuild:
1. **Segment it.** One small SVG per section boundary instead of one page-height SVG. Each is at
   most ~1 viewport tall.
2. **Animate only the segment in view**, gated by `IntersectionObserver`.
3. **Delete the duplicate overlay SVG** (`:120-132`).
4. **Drop the `drop-shadow` filter.** Paint the glow as a second, wider, low-opacity stroke
   underneath — visually near-identical, costs nothing per frame.
5. **Stop `measure()` firing on every image `load`** (`ThreadLayer.tsx:84`). Debounce, and
   bail before `setGeo` when geometry is unchanged (it currently `JSON.stringify`-compares
   *after* scheduling a re-render of the full-page SVG).

### D2. The elephant — lighter, smoother, faster
Keep the walk. It is the signature.

- **Node count:** `components/ornaments/Elephant.tsx` is 892 lines / ~171 SVG nodes. Simplify to
  ~60–80. At the size it renders on a phone, most of that detail is invisible.
- **Animation method:** 8 infinite CSS keyframe groups currently animate SVG *children*
  (bob, 2 leg groups, tail, ear, trunk, bells, 7 twinkles). CSS animation on SVG children is
  main-thread and repaints the whole SVG each frame. Collapse to **2–3 transform groups** on the
  wrapper.
- **Drop the ambari `drop-shadow`** (`Elephant.tsx:414-415`). It sits inside `psel-bob`, so the
  double blur recomputes every bob frame once `lit`. Replace with a static radial-gradient ellipse.
- **Pause offscreen** via `IntersectionObserver` — the `Celebrations` instance animates
  continuously even when scrolled far away.
- **Faster:** entry walk `4.4s → 2.4s` (`EntryGate.tsx:162-167`).
- **`ClosingProcession.tsx:8,12` animates `left`** — a layout property — on the whole elephant.
  Change to `x`/`translate3d`.

### D3. Entry gate — keep it, halve it
- Retire the 1125 px-wide palace SVG (`EntryGate.tsx:158`, `min(300vw,170vh)`); keep a simple
  arch silhouette and the door-open beat
- Stars 40 → 12; motes 16 → 6; remove `filter: blur(.4px)` from `.psg-mote`
- Replace the h1 `filter: blur(6px)→blur(0)` (`:184-185`) with opacity + y. Blur animation is
  paint-bound and runs during the heaviest moment of page life
- Keep: names, the Kannada welcome line, Enter button, door-open, elephant walk

### D4. Elsewhere
- `Beginning.tsx:17,31`: scroll-animated rounded `clip-path` on full-size photos → transform +
  opacity reveal
- `hero/Motes.tsx`: 30 glowing spans, each with `box-shadow: 0 0 4-12px` → 8–10, no shadow on
  mobile
- Cut `blur-2xl`/`blur-xl` (`Blessings.tsx:43`, `Celebrations.tsx:93`, `VenueMap.tsx:21`) and
  `backdrop-blur-md` (`ClosingCountdown.tsx:52`, `MusicToggle.tsx:77`) below `md`
- Reduce simultaneous `foil-text` sweeps — up to ~10 run at once, each repainting a glyph mask
  every frame
- Add `will-change: transform` to the few elements that genuinely scroll-animate continuously
  (hero wrapper, closing photo), not broadly

### D5. `prefers-reduced-motion` — fix the bug
`app/globals.css:66-70` sets `animation-duration: 0.01ms !important`. On **infinite** animations
that does not stop them — it cycles them ~100,000×/second. Users who asked for *less* motion
currently get the most expensive version of the page.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;   /* ← the fix */
    transition-duration: 0.01ms !important;
  }
}
```

### D6. Add a low-power path
Beyond `prefers-reduced-motion`, branch on `navigator.connection.saveData`,
`deviceMemory ≤ 4` or `hardwareConcurrency ≤ 4`: drop motes, blurs and the elephant's
secondary animations, keep the thread and section reveals. Only the hero video checks
`saveData` today (`Hero.tsx:51-52`).

---

## 6. Stage E — verification

1. `npm run lint && npm run typecheck && npm run build` green
2. `npm run test:smoke` green — note CI (`.github/workflows/ci.yml`) does **not** run Playwright
   today; add it
3. Budget met (§B1), measured under throttling (§B5)
4. **Real mid-range Android**, real cellular — not just DevTools emulation
5. 375 / 390 / 430 px portrait **and landscape** (landscape is where `Moments` currently breaks)
6. Light and dark mode — `prefers-color-scheme` flips the whole palette (`globals.css:27-35`)
7. `prefers-reduced-motion` on: page is calm and *cheap*, not calm and expensive
8. No horizontal scroll at any width
9. `grep -rn "SAMPLE: replace"` and `grep -rniE "rsvp|whatsapp"` both clean
10. The `ಶುಭ ವಿವಾಹ` line renders correctly (not as tofu boxes) on a real Android device,
    and its spelling is confirmed by a native reader
11. Music: silent on load, no audio bytes fetched before the tap (check the Network panel),
    loop wraps without a seam, pauses on tab blur, control hidden under data-saver,
    licence on file
12. **Freeze on day 19.** No changes on the day.

---

## 7. Risk register

| Risk | Mitigation |
|---|---|
| 19 days is tight | Staged delivery; sendable from end of Stage B; cut from D first |
| Photos are WhatsApp exports with baked-in artefacting | Request originals if they exist; otherwise accept and avoid heavy upscaling/crops |
| Kannada orthography cannot be self-certified | One four-syllable string; one-minute native check before ship (§4.4) |
| Thread rebuild is the riskiest change | Do it behind a flag; the current thread works, it is only slow |
| Music licensing blocks ship, and sourcing is slow | Start sourcing in Stage A, not Stage C. The site ships silent if no licensed track is cleared in time — never ship unlicensed audio |
| Nothing is compiled yet | Stage A1 is the first task for a reason |

---

## 8. Task order

```
A1  npm ci; baseline build + measurement          ← start here
A2  media-src/ + photo mapping + counts 8→6
A3  real copy; delete SampleTag
A4  Venue pb-safe fix
B2  optimize-media.mjs widths/formats; <picture>; blur.json; unstage images/
B3  font subsetting (incl. Kannada); drop unused faces; fix README:36
B4  LazyMotion; DesktopStrip mobile gate; scroll-subscription gating
B5  throttled measurement  ← SENDABLE FROM HERE
C4.7 SOURCE + LICENCE THE BANSURI TRACK  ← long lead time, start during Stage A
C   palette; token consolidation; drop v1.jpeg; bilingual; section reorder; mobile UI fixes
C   music encode + MusicToggle rules (preload none, saveData, visibilitychange, rAF ramp)
D5  reduced-motion bug fix  ← do early, it is one line
D1  thread rebuild
D2  elephant rebuild
D3  entry gate
D4  remaining motion cleanup
D6  low-power path
E   verification + freeze
```
