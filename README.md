# The Project Darbar

An Astro frontend for an Indian Carnatic fusion band. The single-page site includes an introduction, music previews, artist profiles, and contact details.

## Run locally

Requires Node.js 22 or newer and pnpm 10.

```sh
pnpm install
pnpm dev
```

Open the URL printed by Astro. Use `pnpm check` for type and Astro checks, and `pnpm build` to generate the static site in `dist/`.

## Replace sample content

Edit `src/data/site.ts` to add confirmed artist profiles, performances, and contact details. The initial entries are labeled samples, and empty contact fields produce no dead links. Set `heroImage` to a transparent cutout photograph in `public/`, such as `/images/band-cutout.webp`, to replace the stylized group placeholder with the same single-layer placement and maroon treatment. The first music entry is the featured performance. For a playable YouTube preview, add the 11-character video ID from a YouTube URL as `youtubeId` on that entry. The player loads only after a visitor selects it.

The group silhouette is a local SVG component in `src/components/`. A single right-side SVG path follows the page and ends in minimal Sri Chakra inspired geometry. Colors and layout are defined in `src/styles/global.css`. With reduced motion or JavaScript unavailable, the line and chakra remain static and all content stays visible.

## Hero verification

The masthead uses self-hosted Italiana Regular, preloaded in the document head. Poppins 400–500 supplies the small editorial details. The local WOFF2 files and their OFL license are in `public/fonts/`.

With the dev server running, install Playwright and its browser, then run the viewport checks:

```sh
pnpm add -D playwright
pnpm exec playwright install chromium
node scripts/verify-hero.mjs
```

The script checks 1440×900, 1280×720, 390×844, and 320×720, captures the hero and music transition into `artifacts/hero/`, and checks the title, silhouette count, navigation, overflow, font loading, keyboard order, reduced motion, parallax limits, and rail origin. Set `PREVIEW_URL` to check a different local preview URL. Browser checks have not been run in the restricted implementation environment: package downloads, local server startup, and Chrome launch were blocked.
