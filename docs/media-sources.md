# Media sources

## Current hero — supplied transparent four-person cutout

The user supplied a transparent 1448×1086 PNG of the four members on October 24, 2026. `public/images/band-cutout-clear.webp` is a lossless WebP export made with `cwebp -lossless -exact`. A decoded RGBA comparison confirmed that the delivery export preserves the uploaded pixels, including transparency, exactly. No face generation, warping, or hand-drawn background mask is applied to this asset.

`HeroPhoto.astro` renders that alpha cutout directly with the established warm duotone and parchment edge. The source aspect ratio is preserved inside main’s 1454×1082 poster canvas. The current size trial is 132% rather than main’s 124%. Four handwritten main-name callouts and curved arrows share the same coordinate system, with the photo edge filter isolated from the lettering.

Individual ensemble portraits continue to use chest-up crops of the earlier clear temple photograph described below. Previous generated cutouts and the intermediate hand-traced hero masks are historical approaches, not the active hero image.

### Initial cutout prompt (v1)

Edit target: the supplied low-resolution photograph of four real Indian band members standing together at a temple doorway. Task: background-extraction only. Remove the olive side panels, temple doorway, stonework, foliage and floor, leaving the FOUR ORIGINAL band members and their original musical instruments as one group on a genuinely transparent background. Preserve all four identities, faces, skin tones, hair, facial hair, expressions, body proportions, clothes, poses, order, spacing, original lighting and instruments exactly as the source provides. In particular preserve the dark green outfit and keyboard at left, cream/purple outfit beside him, peach outfit and string instrument in the center-right, and pale mint outfit and long string instrument at right. Do not reconstruct, beautify or invent faces or sharpen them into different people; keep source details and original photographic appearance. No new people, no extra limbs, no missing instruments. Tightly crop the transparent canvas around the complete group from hair to feet, retaining the original group arrangement. No lettering, no additional graphic treatment, no ochre outline and no background shadow; the website will apply those separately. This is a faithful cutout of the existing photo, not a new portrait or illustration.

### Face revision prompt (v2)

Edit target is image 1: the existing transparent cutout of FOUR band members in dark green, purple/cream, peach, and pale mint outfits holding keyboard, drumsticks, violin, and bass. Images 2 and 3 are the ORIGINAL photographs of these SAME FOUR PEOPLE, in the SAME LEFT-TO-RIGHT ORDER, and must be used as identity references. Image 2 is the primary face reference; image 3 is supporting evidence for facial proportions, hair and beard shapes only. The earlier cutout has drifted from their actual faces. Correct only the faces, head shapes and hair to resemble the original people more closely. Match the actual eye spacing, nose shape, jaw width, cheeks, moustaches/beards, skin tones, hairlines, and expressions from the original photographs instead of retaining generic handsome faces from image 1. Keep sunglasses on members 2 and 4, and clear glasses on member 3. Member 1 should match his original subtler expression and facial proportions. No beautification, no exaggerated smiles, no invented teeth or aggressive detail enhancement. Given the tiny references, slightly softer natural facial detail is preferable to confidently invented features. Keep EVERYTHING ELSE in image 1 unchanged: all four people, clothing, order, positions, poses, hands, body proportions, all instruments, crop, scale, transparent background and natural colors. Do not borrow the blue clothing or beach background from image 3. Do not add a background, text, border, halo, shadows or extra people. Return one transparent PNG group cutout. This is a temporary closer-likeness revision of the existing cutout, not a newly styled group portrait.

## Music previews

The IDs and order below come directly from the user's supplied links. Share-tracking parameters were removed. Every preview has a local image, click-to-load privacy-enhanced YouTube player, and direct watch link. Only one player remains active at a time.

| Video | Local thumbnail | Display label |
| --- | --- | --- |
| https://www.youtube.com/watch?v=5FVp1YWyd28 | `public/images/music/5FVp1YWyd28.avif` | The Project Darbar / Ensemble performance |
| https://www.youtube.com/watch?v=EAhQd8oxbKo | `public/images/music/EAhQd8oxbKo.avif` | Manavyalakincharadate / Drive with Darbar |
| https://www.youtube.com/watch?v=H-3IpmyzSzk | `public/images/music/H-3IpmyzSzk.avif` | The Project Darbar / Band performance |
| https://www.youtube.com/watch?v=HKwedk2cVRE | `public/images/music/HKwedk2cVRE.avif` | Madhava Mamava / Drive with Darbar |
| https://www.youtube.com/watch?v=zb4hbnv7YvQ | `public/images/music/zb4hbnv7YvQ.avif` | Maha Ganapathim / Drive with Darbar |

The three track names were read from the thumbnail artwork. Neutral labels are used for the two thumbnails without visible track titles. No venue, date, member name, or unavailable video title has been inferred.

All five AVIF thumbnails were recovered from cached responses matching the supplied video IDs, without altering the image pixels. The first three are 360×202; the last two are 720×404. No browser cache paths or request signatures are needed by the site.

## Ensemble portraits — clear source photograph

The user supplied a clearer 6456×3944 temple photograph on October 24, 2026. `public/images/band-source-clear.webp` is its high-quality WebP delivery export at 3228×1972, preserving the original framing and aspect ratio. The export uses WebP quality 94; no generative face edits or reconstruction were performed.

The four chest-up portraits use this single shared photograph through `ArtistCutout.astro`. Per-member SVG viewBoxes and closed Bézier masks in `src/data/site.ts` isolate the hair, face, shoulders, and upper chest without changing facial geometry. Source dimensions are explicit, so the component preserves the photograph’s proportions. The contours were checked using enlarged source overlays and rendered duotone previews; these are manual traces, not a claim of pixel-perfect hair segmentation. Desktop portrait width is 120px, with 104px portraits beside the instrument stages on mobile. The established warm duotone, parchment keyline, names, ordering, and scroll-driven instrument drawings remain.

The hero uses the separately supplied transparent cutout described above.

## Supplied logo

The user's supplied raster drawing is retained at `public/images/darbar-logo-source.png`. The adapted native vector is `public/images/darbar-mark.svg`, with the original deep red (`#c81d11`) on the upper triangle/dot and blue (`#1951A8`) on the lower triangle/loop. Its asymmetric geometry and paired terminal circles follow the source. The header and footer share that file, while the favicon has thicker strokes and compact proportions for small display. The scroll-line finale uses a stroke-only variant of the same mark. A transparent luminance mask hides the sweeping string inside the upper triangle in the shared SVG, favicon, and measured scroll finale. This is a manual vector redraw; image generation was not used for the logo.
