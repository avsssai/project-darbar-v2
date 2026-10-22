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

Edit `src/data/site.ts` to add confirmed artist profiles, performances, and contact details. The initial entries are labeled samples, and empty contact fields produce no dead links. Set `heroImage` to a band photograph in `public/`, such as `/images/band.jpg`, to replace the hero placeholder. Artist portraits can use paths such as `/artists/name.jpg`. For a playable YouTube preview, add the 11-character video ID from a YouTube URL as `youtubeId` on a music entry. The player loads only after a visitor selects it.

The Sri Chakra inspired geometry, damaru motif, and scroll-drawn lines are local SVG components in `src/components/`. Colors and layout are defined in `src/styles/global.css`. The line drawing becomes static when reduced motion is requested or JavaScript is unavailable.
