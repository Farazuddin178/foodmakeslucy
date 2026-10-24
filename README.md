# Food Makes Lucy — a technique notebook

A concept site for Lucy: a data analyst turned food creator who teaches **techniques, not recipes**.
The whole homepage is an open sketchbook. Visitors turn real curling pages, drag a magnifying glass
across the notes, and jump between techniques from an index. Everything is plain HTML, CSS and JS,
with no build step.

## Site structure

| Section | What it does |
| --- | --- |
| **Sketchbook hero** | Nine illustrated technique plates: drag to turn, a loupe to read the handwriting, zoom, keyboard arrows |
| **About** | Lucy's approach: hunch → change one thing → taste → write it down |
| **How to use this notebook** | The visitor journey: learn the move → watch it → raid your fridge → log your experiment |
| **Watch** | Film cards, one per technique (the plate is the thumbnail until real footage replaces it) |
| **Experiment log** | One-variable kitchen tests laid out like a lab notebook. Each row opens its plate |
| **The techniques** | The full plate index |

## Editing content

All content lives in the `<script>` at the bottom of `index.html`:

- `PAGES`: the plates (file, title, category)
- `FILMS`: film cards. Point `href` at YouTube or Instagram when the videos are live
- `LOG`: experiment-log rows

Social links in the header and the "Say hello" link are `#` placeholders.

## Redrawing the plates

The plates are drawn in code (`tools/make-plates.mjs`): SVG ink and watercolour washes, rasterised
by headless Chrome and compressed to WebP.

```bash
pip install pillow
node tools/make-plates.mjs          # all plates
node tools/make-plates.mjs sear     # just one
```

## Tech stack (and where it can grow)

- **Now:** static HTML + CSS + vanilla JS, hosted free on GitHub Pages.
- **Next:** move `PAGES` / `LOG` into a JSON file or a Google Sheet, so new experiments are data
  entry, not code. Add privacy-friendly analytics (Plausible or GoatCounter) to see which
  techniques people actually come back to.
- **Later:** a small headless CMS or Astro content collections if the archive grows past a few dozen plates.

## Content strategy in one line

Each technique ships as **a plate, a short film and a logged experiment**. The plate teaches,
the film shows, and the log proves it with a variable, a result and what to try next. That pairing of
analytical and creative work is the brand.

## Credits

Sketchbook interaction adapted from ThreeUI's *Meng To Sketchbook* landing page. The paper wash,
botanicals, divider, and the Instrument Serif and Newsreader fonts come from that package. The food
plates are original to this project. Caveat font: SIL Open Font License.
