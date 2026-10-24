# Lucy Makes Food — her shorts, in a sketchbook

A concept site for [Lucy Makes Food](https://www.youtube.com/@LucyMakesFood): a national dish for every
World Cup country, favourites rebuilt from scratch, and a little kitchen chaos. The homepage is an open
sketchbook. Each plate is drawn from one of her shorts, turns like real paper, and has a
**Watch this short** button that plays the video in place. Everything is plain HTML, CSS and JS,
with no build step.

## Site structure

| Section | What it does |
| --- | --- |
| **Sketchbook** | Nine plates: three of her own recipes (Cheez-Its, Coca-Cola chicken, infinite yogurt), World Cup and from-scratch methods, anatomy of a short, her World Cup passport, the numbers |
| **About** | Her own line, “I'm Lucy and I make food”, and the three series |
| **Shorts** | All 48 recent shorts with real thumbnails, filterable by series, playing in an embedded player |
| **How she makes them** | Hook → cook → taste → recipe |
| **By the numbers** | Channel stats, plus average views per series, computed live from the data |
| **The notebook** | Index of the plates |

## Data

`data/shorts.json` holds every short (id, title, views, series) and the channel stats. To refresh
titles and view counts from YouTube:

```bash
python tools/fetch_shorts.py
```

Series are kept per short: `world` (World Cup kitchen), `scratch` (Made from scratch),
`life` (Lucy being Lucy). New shorts arrive as `life` until they're filed. The channel stats
(subscribers, videos, total views) are updated by hand.

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

Videos and thumbnails © Lucy Makes Food, embedded from YouTube. Sketchbook interaction adapted from ThreeUI's *Meng To Sketchbook* landing page. The paper wash,
botanicals, divider, and the Instrument Serif and Newsreader fonts come from that package. The food
plates are original to this project. Caveat font: SIL Open Font License.
