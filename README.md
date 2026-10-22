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

Edit `src/data/site.ts` to add confirmed artist profiles, performances, and contact details. The initial entries are labeled samples, and empty contact fields produce no dead links. Set `heroImage` to a transparent cutout photograph in `public/`, such as `/images/band-cutout.webp`, to replace the stylized group placeholder while retaining its outline effect. The first music entry is the featured performance. For a playable YouTube preview, add the 11-character video ID from a YouTube URL as `youtubeId` on that entry. The player loads only after a visitor selects it.

The group silhouette is a local SVG component in `src/components/`. A single right-side SVG path follows the page and ends in minimal Sri Chakra inspired geometry. Colors and layout are defined in `src/styles/global.css`. With reduced motion or JavaScript unavailable, the line and chakra remain static and all content stays visible.
