# Media sources

## Current ensemble image — temporary v2

- Current hero: `public/images/band-cutout-v2.png`, a transparent PNG generated with built-in `image_gen` edit mode.
- Primary identity reference: the user-supplied video https://www.youtube.com/watch?v=5FVp1YWyd28, whose 360×202 thumbnail is saved as `public/images/band-source.png` and `public/images/music/5FVp1YWyd28.avif`.
- Supporting identity reference: the user-supplied video https://www.youtube.com/watch?v=H-3IpmyzSzk, whose thumbnail is saved as `public/images/band-source-beach.png` and `public/images/music/H-3IpmyzSzk.avif`.
- Edit target: `public/images/band-cutout-v1.png`. The revision asks for face/head/hair correction while preserving its clothes, instruments, poses, arrangement, and transparency.
- The user initially approved v1, then noticed altered faces. After an interim switch to the original photograph, they explicitly requested keeping the cutout with improved faces for now and supplying a better photograph later.
- V2 is a temporary AI-assisted likeness revision, not an exact photographic extraction. The low-resolution references do not support reliable reconstruction of facial details. No exact identity match is claimed.
- `site.heroImage` points to `/images/band-cutout-v2.png`, with `heroImageStyle: cutout`. The site applies the maroon duotone, ochre edge, and torso crop in CSS/SVG.
- The original source pixels and v1 remain available. `heroImageStyle: original-photo` disables the cutout treatment when displaying an unaltered photograph; clearing `heroImage` restores the silhouettes.

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

## Ensemble portraits

The four individual views reuse `band-cutout-v2.png`. `ArtistCutout.astro` uses native SVG viewBoxes and polygon clipping to isolate the members, preserving the shared image pixels and facial treatment. No additional generative portrait edits were made. The rows display Keys, Percussion, Violin, and Bass with instrument details. Empty `name` fields can be populated later. CSS applies the same duotone and ochre edge as the hero, at a smaller size with a short one-time entrance. These are temporary cropped views of an overlapping group photo; occluded body details are not reconstructed.

## Supplied logo

The user's supplied raster drawing is retained at `public/images/darbar-logo-source.png`. The adapted native vector is `public/images/darbar-mark.svg`, with maroon replacing the upper red triangle/dot and ochre replacing the blue lower triangle/loop. Its asymmetric geometry and paired terminal circles follow the source. The header and footer share that file, while the favicon has thicker strokes and compact proportions for small display. The scroll-line finale uses a stroke-only variant of the same mark. This is a manual vector redraw; image generation was not used for the logo.
