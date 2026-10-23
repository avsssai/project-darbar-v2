# Darbar — poster reference study

Checkpoint: `b372869` — cream and maroon hero, local Italiana/Poppins, single band layer, connected scroll thread. The build passed. Browser screenshots remain unverified because this environment blocked browser launch and package downloads.

This is an exploration for the next design pass, not an implemented redesign. The three supplied reference images were inspected directly. Comparisons to the current landing are based on its markup, SVG, and CSS rather than a fresh browser rendering.

Implementation follow-up: direction A has now been applied after this study. The hero has a maroon lower field with a local paisley repeat, a larger ensemble with adjusted shoulder heights, a collective ochre edge, a warm duotone for replacement photographs, and thread colors that follow the measured background boundaries. The type and entrance/parallax timings remain the same for comparison. The silhouettes remain available as a fallback; the current hero uses the subsequently approved AI-assisted ensemble cutout (see `media-sources.md`). Browser verification is still pending because Playwright is unavailable and the local preview server is blocked in this environment.

## What each reference actually does

### Ardhanarishvara

Reference: [red poster](../public/9559c900a6caebf1f86a06c42e1fc648.jpg).

- Red occupies the entire background. Cream type, an ochre disc, and a cool sculptural figure create distinct color planes.
- The title is extremely tall and narrow, broken into three large rows. Its vertical presence is as important as its width.
- The central statue overlaps the middle lettering, while the lower lettering passes in front of the statue. This alternation integrates type and subject more strongly than putting the entire subject above the entire title.
- Cropped, blurred figures enter from opposing corners. They create depth and make the composition feel larger than its frame.
- The disc is a compositional anchor behind the head, rather than a repeated decorative symbol.
- Small captions, rules, and floral motifs fill selected gaps. They follow the figure and type rather than forming conventional website rows.

**Transfer:** vertical type, carefully chosen overlap, a single large background shape, and deliberate edge crops.

### Saraswati

Reference: [charcoal poster](../public/42d947f0092a2ebef8f564f555bd0ca9.jpg).

- This reference uses heavy, block-like blue display lettering, not a delicate serif. A fine font is therefore not the common denominator across these posters.
- A rust-orange figure, halo, instrument, and lotus form one intricate central silhouette. The instrument cuts diagonally across an otherwise symmetrical composition.
- The type acts as a broad architectural slab at the top. The lotus and blue field provide a broad base at the bottom.
- The side text deliberately follows tapering columns around the subject. Negative space is shaped, not simply left empty.
- Coarse halftone, distressed blue ink, and dark paper produce a visible printing process. A faint uniform noise overlay would not produce the same effect.

**Transfer:** subject detail, instrument diagonals, top/bottom visual weight, and selective print texture.

### Naari

Reference: [cream poster](../public/fa6f078d70d93841ad5f967530b4f6b2.jpg).

- The upper field is cream and the lower field is saturated red. The figure bridges that hard horizontal division.
- The red display lettering has distinctive, expressive shapes and subtle internal pattern. Color alone does not account for its presence.
- The illustrated subject occupies most of the width. The boombox, bent arm, draped fabric, and offset head prevent a static rectangular silhouette.
- An ochre contour separates the illustration from both background fields. It acts as a graphic cutout edge.
- The lower field has a large, low-contrast pattern; the cream field has lighter speckling. The two textures serve different roles.
- Small top and bottom captions frame the image without competing with it.

**Transfer:** cream/red division, a subject spanning both fields, an accent cutout edge, and a few peripheral captions.

## Why the current version lacks the same impact

| Current | Next exploration | Why |
| --- | --- | --- |
| Cream dominates; muted maroon supplies almost all contrast | Keep cream, but introduce a substantial maroon lower field | The references contain large, competing masses of ink, not only colored text |
| Four smooth geometric busts | A detailed ensemble cutout with visible instruments, varied poses, and intentional lighting | The people must supply gesture, texture, and identity; anonymous busts cannot do that work |
| One broad, relatively shallow DARBAR line | Test greater vertical presence and a tighter relationship between title and heads | Width alone does not recreate the tall red poster's typography |
| Subject sits mainly below the name | Start the ensemble higher, with selected head/instrument overlap at the title's lower edge | The name and musicians should form a single composition |
| Uniform faint grain | Fine paper grain plus localized halftone or distressed ink on the subject/background field | Material contrast gives the print treatment a reason to exist |
| Thin thread is the principal graphic gesture | Keep the thread peripheral; let the band and the large color field carry the impact | A one-pixel detail cannot supply the missing visual mass |

## Three coherent directions

These are alternatives, not ingredients to combine indiscriminately.

| Direction | Composition | Main source | Tradeoff |
| --- | --- | --- | --- |
| A — Cream / cutout / red field | Cream masthead, maroon lower field, detailed ensemble bridging the divide, restrained ochre cutout edge | Naari | Closest to the agreed palette; depends on a strong band image |
| B — Full maroon concert bill | Cream tall lettering, one ochre disc, ensemble through the center, sparse edge captions | Ardhanarishvara | Stronger immediate color impact; changes the cream-first identity |
| C — Dark screen print | Charcoal paper, rust ensemble, dusty blue headline/base, coarse halftone | Saraswati | Most graphic and gritty; a substantial departure from the approved palette |

## Recommended next pass: A

Preserve the cream/maroon identity, but change the distribution of visual weight.

- **Header:** retain the shallow editorial strip. It should frame the poster quietly.
- **Title:** keep THE PROJECT subordinate and DARBAR dominant. Retain Italiana for the first comparison so the effect of composition can be judged independently of a font change. Test the title's actual visible letter height, not just its CSS box width.
- **Color field:** begin a solid maroon field around the lower 45% of the hero. Keep the music section immediately after the hero.
- **Ensemble:** start the tallest head near the lower edge of DARBAR; carry the people down across the cream/maroon divide. Use visible instruments and staggered shoulder heights to create diagonals. Keep every letter identifiable.
- **Image treatment:** preserve facial and clothing detail. Compare a warm photographic duotone with a coarser printed treatment. Flat filled silhouettes are suitable only for checking placement.
- **Accent:** test one restrained ochre contour around the collective cutout. Do not add the red poster's halo and blurred corner figures to this version as well.
- **Peripheral captions:** place the genre at the cream edge and the listening link at the lower field edge, with sufficient contrast. Keep them close to the ensemble's visual base.
- **Texture:** use fine grain on cream, a large low-contrast motif on the maroon field, and optional halftone localized to the image. Avoid adding multiple unrelated ornamental symbols.
- **Mobile:** preserve the cream-to-maroon crossing and show all four people; reduce peripheral detail rather than shrinking the subjects into insignificance.
- **Motion:** hold the existing motion constant during the comparison. The new composition must have impact in a still frame before any additional animation is considered.

### What the next visual comparison must prove

1. At thumbnail size, the title and ensemble read as two strong, connected shapes.
2. The hero contains a clear cream/maroon contrast even before the viewer reads anything.
3. The people have enough detail and gesture to anchor the layout.
4. At 320px, the band name remains complete and all four members are visible.
5. A static reduced-motion frame carries the same hierarchy as the animated version.

The highest-leverage missing asset is the ensemble photograph or illustration. Layout exploration can continue with the existing silhouettes, but it cannot demonstrate the references' full visual effect until the subject has comparable detail and character.
