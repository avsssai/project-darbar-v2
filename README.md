# The Project Darbar

An Astro frontend for an Indian Carnatic fusion band. The single-page site includes an introduction, music previews, artist profiles, and contact details.

## Run locally

Requires Node.js 22.23.4 or newer and pnpm 10.34.7.

```sh
pnpm install
pnpm dev
```

Open the URL printed by Astro. Use `pnpm check` for type and Astro checks, and `pnpm build` to generate the static site in `dist/`.

## Replace sample content

Edit `src/data/site.ts` to add confirmed artist profiles, performances, and contact details. The four ensemble rows show their instruments and individual SVG-clipped portraits from the group image. The rows are ordered violin, keys, guitar, then drums. Each full name uses `highlight` to emphasize Koundinya, Manas, Mouli, or Meher in larger solid type; the remaining name uses smaller outlined lettering with a solid-text fallback. The portrait crop stays paired with its musician. The visible spelling Manas follows the requested copy; the source document is unchanged. Empty contact fields produce no dead links. Set `heroImage` to a transparent cutout photograph in `public/`, such as `/images/band-cutout.webp`, to replace the stylized group placeholder with the same single-layer placement and warm duotone treatment. The first music entry is featured; later entries appear as preview cards when they have a valid `youtubeId`. Add each performance's title, subtitle, note, and 11-character YouTube video ID. Thumbnails load lazily, and the privacy-enhanced player loads only after a visitor selects play. Starting another performance restores the previous thumbnail and stops its audio. Each video keeps a direct YouTube link available below the player.

All five user-supplied YouTube videos are configured in `src/data/site.ts`, in the supplied order. Their thumbnail images are bundled locally as AVIF files in `public/images/music/`. Track names visible in the thumbnails are used for the Drive with Darbar entries; the other two retain neutral band labels because their video titles could not be fetched. The original search URL remains the discovery link. Source URLs and image-generation provenance are documented in `docs/media-sources.md`.

The group silhouette is a local SVG component in `src/components/`. A single right-side SVG path follows the page and ends in a stroke version of the supplied band logo. Colors and layout are defined in `src/styles/global.css`. With reduced motion or JavaScript unavailable, the line and chakra remain static and all content stays visible.

The hero restores the original poster composition: a muted brick-red textile field, a warm duotone ensemble crossing the cream/color boundary, and a parchment keyline around the cutout. The paisley repeat is a local vector asset at `public/images/paisley-ink.svg`; no new runtime dependencies are used. The journey thread changes from dusty indigo on paper to parchment on the textile field. The hero retains the temporary revised cutout at `public/images/band-cutout-v2.png`; its faces remain approximate at this source resolution. A higher-resolution original is needed for a faithful final cutout. Both source photographs and v1 are retained; `heroImageStyle: original-photo` can display an untouched source with CSS framing only. The silhouette component remains available as a fallback when `heroImage` is empty.

The route and final symbol share one drawing-distance calculation tied to scrolling. In “Old roots. New fire.”, the thread forms one connected keyboard/percussion/violin/bass illustration. The section maps its entry and exit to the actual instrument stage: scrolling down draws the motif and scrolling up retraces it immediately. There is no timer, easing, once-only completion, or automatic playback for this drawing. Before and after that section, the thread continues through its normal page journey; the final route/logo handoff keeps one consistent stroke-distance rate and completes at the page bottom. Reduced motion continues to show the complete static line. Run the regression checks with `node --experimental-strip-types --test scripts/rail-progress.test.mjs`.

## Hero verification

The masthead uses self-hosted Italiana Regular, preloaded in the document head. Poppins 400–500 supplies the small editorial details. The local WOFF2 files and their OFL license are in `public/fonts/`.

With the dev server running, install Playwright and its browser, then run the viewport checks:

```sh
pnpm add -D playwright
pnpm exec playwright install chromium
node scripts/verify-hero.mjs
```

The script checks 1440×900, 1280×720, 390×844, and 320×720, captures the hero and music transition into `artifacts/hero/`, and checks the title, ensemble image loading, all five preview buttons, local thumbnails, navigation, overflow, font loading, keyboard order, reduced motion, parallax limits, and rail origin. Set `PREVIEW_URL` to check a different local preview URL. Browser checks have not been run in the restricted implementation environment: package downloads, local server startup, and Chrome launch were blocked.

## Logo and ensemble styling

The exact brand blue (`#1951A8`) and deep red (`#c81d11`) stay in the logo and favicon. Larger areas use muted print inks: dusty indigo (`#344b70`), brick red (`#884942`), parchment (`#f5f0e7`), and a warm keyline (`#d8bc91`). The colored textile hero, warm duotone portraits, outlined typography, and red contact/finale fields retain the original poster direction. Smaller labels, navigation, and footer details stay quieter to preserve hierarchy. Palette tokens are in `src/styles/global.css`. The supplied email and phone enable direct booking enquiries.

The supplied logo is redrawn as a transparent, native SVG at `public/images/darbar-mark.svg`. Its two opposing triangles, central dot, sweeping loop, and terminal circles are retained in the original deep red (`#c81d11`) and blue (`#1951A8`). The header and footer use this asset through `BrandMark.astro`; `public/favicon.svg` is an optically simplified favicon variant. The original supplied artwork is retained at `public/images/darbar-logo-source.png`. The scroll finale uses `src/data/brand.ts` to draw the same geometry in parchment, with the logo's upper terminal connected to the thread. Scale is baked into the path coordinates so the final logo keeps the same stroke-distance-per-scroll-pixel calculation.

Individual ensemble portraits use `ArtistCutout.astro` with per-member `cutout.viewBox` and `cutout.outline` values in `src/data/site.ts`. They reuse the same temporary v2 group PNG without generating new faces. Each portrait uses the warm duotone and parchment keyline shared with the hero. A one-time entrance rises 8px from scale .96 over 240ms using the shared ease-out curve; reduced motion shows the portraits statically. Update these crop coordinates when replacing the group photograph.

## Instrument thread

`src/data/instrument-thread.ts` defines the connected 600×480 line-art motif. It contains only line and curve commands, so insertion into the journey path creates no disconnected subpaths. `measureRail()` places it into the measured `data-instrument-stage` in the about section, keeping it clear of text on desktop and stacking it below the copy on mobile. The route's prefix and motif end lengths are measured to anchor the drawing to that stage's passage through the viewport. `scrollStrokeDistance()` in `src/lib/rail-progress.ts` interpolates the scroll anchors directly in both directions. Reduced motion shows the whole drawing; without JavaScript, the same motif appears as a static inline SVG fallback. The Playwright script includes forward/reverse motif checks; browser execution remains unavailable in this environment.

### Ensemble-to-contact scroll continuity

The thread now records separate stroke-length checkpoints at the ensemble loop entrance, its exit, and the contact section entrance. Later sections no longer share a single post-instrument interpolation span. A resize observer remeasures these checkpoints if the main layout changes.

The logo has six separate visible paths. Their dash offsets spend one drawing budget sequentially through `strokePartOffsets()`, avoiding SVG's per-subpath dash reset that made the ending appear all at once. The combined logo path remains hidden for geometry measurement and compatibility with the existing checks. Scrolling backward unwinds the same visible paths in reverse; reduced motion shows them all fully drawn. Regression checks cover premature completion, reverse progress, and sequential logo drawing. Browser checks for the visible strokes are included in `scripts/verify-hero.mjs`, but have not run in this environment.

## Rotating performance grid and mobile finale

The music chapter uses `MusicShowcase.astro` and `src/lib/music-showcase.ts`: one large current session and four directly selectable thumbnail tiles. Choosing a thumbnail rotates the sessions through the grid over 280ms, promotes the chosen video into the main position, and starts it. Previous/next controls and arrow keys also select and play a session. The desktop layout places the current video on the left beside a 2×2 preview grid; tablets put four previews below it, while phones use a full-width player above two rows of thumbnails. Reduced motion changes positions instantly. No horizontal scrolling or cloned cards are used. Without JavaScript, all performances and their YouTube links remain in the document.

YouTube's IFrame API loads on the first play request. Only the current performance can play. Selecting a different session stops and removes the old player immediately, even during rapid selections, and plays the final selected session once its rotation completes. Positions are remembered for the current visit. Leaving the viewport or hiding the tab pauses without automatic resumption; ending a video leaves the current session selected. Errors restore the preview for retry and retain the external YouTube link. Browser autoplay restrictions show a prompt to use the player's play control.

The waveform is decorative, driven by actual YouTube playback state rather than audio samples. Its measured endpoints coincide with a straight segment of the journey rail. A local SVG overlay animates while playing; route length, scroll anchors, instrument drawing, and final-logo timing remain independent. Paused, buffering, ended, hidden and offscreen states stop the animation. Reduced motion uses a still waveform. Below 760px, a 320px muted brick-red finale area between the booking section and footer centers the larger final logo, with a static logo fallback before JavaScript initializes.

Validation:

```sh
pnpm exec astro-check
node --experimental-strip-types --test scripts/rail-progress.test.mjs scripts/scrape-youtube.test.mjs
# With Playwright installed and the dev server running:
node scripts/verify-hero.mjs
node scripts/verify-showcase.mjs
```

The showcase browser checks use a mock YouTube API to cover grid layout, direct selection, playback handoff, saved positions, buffering, blocked autoplay, failed embeds, viewport/tab pauses, waveform motion, and mobile logo clearance at 320/390/768/1280/1440px. Actual audio playback, fullscreen, and touch feel still require a real browser/device check. In this implementation environment, Astro's standalone checker runs, but `pnpm build`/`pnpm dev` cannot start because the Rolldown native binary is an unavailable iCloud placeholder. Chrome launch is blocked by the sandbox, and Playwright is not installed. The browser checks have been added but not executed here.

Header and footer share `SocialLinks.astro`, with Instagram and YouTube icons, accessible labels, and mobile layouts. The header uses a second navigation row on phones to keep social targets comfortable to tap. Thread helper captions have been removed. Set `site.instagram` and `site.youtube` to the confirmed profile/channel URLs: Instagram keeps the previously confirmed profile URL, and YouTube retains the existing band search URL.


## GitHub Pages CI/CD

`.github/workflows/pages.yml` checks pull requests and automatically deploys successful pushes to `main`. It installs the locked dependencies with pnpm, runs the regression suite, checks Astro types, builds the site, verifies emitted HTML/CSS asset references, uploads `dist/`, and deploys it to the `github-pages` environment. Manual runs are also available from the Actions tab. Pull requests build and test without deploying.

The Pages origin and project prefix come from `GITHUB_REPOSITORY` in CI, so a repository named `project-darbar` under `avsssai` builds for `https://avsssai.github.io/project-darbar/`. This is the intended address, not confirmation of a live deployment. A `<username>.github.io` repository uses `/` instead. Local development remains at `/`; set `ASTRO_SITE` and `ASTRO_BASE` to override these values for a custom domain or another host. Public image URLs use `assetPath()`; Vite rewrites public CSS font/background URLs for the configured base.

One-time setup, once GitHub CLI has working authentication and network access:

```sh
gh repo create project-darbar --public --source=. --remote=origin --description 'The Project Darbar — Carnatic fusion performances and band website'
git push -u origin main
gh api --method POST repos/avsssai/project-darbar/pages -f build_type=workflow
```

The account/repository in the Pages command must match the created repository. If the first Actions run reached deployment before Pages was enabled, rerun that failed run from the Actions tab. Subsequent pushes deploy automatically; no separate deployment token is needed. The workflow uses GitHub's built-in token with Pages and OIDC write permissions limited to the deployment job.

To check a project-path build locally after restoring the missing native dependency:

```sh
ASTRO_SITE=https://avsssai.github.io ASTRO_BASE=/project-darbar/ pnpm build
ASTRO_BASE=/project-darbar/ pnpm verify:dist
```

## Short copy and musician instrument thread

`content/the-project-darbar-content.md` is the retained client reference. Editable homepage copy is in `copy` in `src/data/site.ts`; the public page keeps the introduction and musician bios brief, with email and telephone links for bookings. The compact interlude uses oversized “Ragas. Riffs. Room to play.” lettering and one musical refrain, rather than explanatory cards. Individual concert counts, disputed credits, and editorial notes are not published.

Each musician has a distinct, continuous instrument stroke from `src/data/ensemble-thread.ts`: violin and bow, keyboard, guitar, and drum with sticks. The scroll thread enters a reserved stage beside the portrait and returns to the gutter without encircling the musician. Stages are measured independently of the portrait entrance. Preferred scroll ranges run from stage-top at 72% viewport height to stage-bottom at 40%; overlapping desktop ranges share a boundary so no instrument's stroke length is skipped. Downward scrolling draws, upward scrolling retraces, and page-bottom completion is unchanged. Static SVGs show all four instruments without JavaScript; reduced motion shows the full journey path.

At widths up to 760px, the portrait and instrument sit side by side above the full name, role, and bio. Desktop rows put text on the left and the portrait/instrument pair on the right. Geometry regressions cover distinct paths, stage and gutter bounds, scaling, reordered portrait/name mappings, overlapping scroll ranges, and reversibility. Browser assertions cover name highlights, phone/email links, stage clearance, resize behavior, mobile visual order, and no-JavaScript fallback. The browser checks still require Playwright and a working Astro server; the local Rolldown binary is an iCloud placeholder, and Chrome cannot launch in the current sandbox. Real-device touch and landscape checks remain outstanding.
