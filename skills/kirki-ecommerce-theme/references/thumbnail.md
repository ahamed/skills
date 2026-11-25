# Theme thumbnail (screenshot.png)

WordPress shows `screenshot.png` from the theme root on the theme card in
Appearance → Themes and in the theme details. It is the first look a merchant
gets of the theme, so it must look like the theme: calm, modern and clean,
with nothing that the theme does not have.

## 1. File

- `<theme>/screenshot.png`, exactly **1200 × 900 px** (4:3), PNG.
- Keep it under 500 KB if possible (1 MB at most). Use `pngquant` or
  `oxipng` if one is installed. Do not lower the size in pixels.
- No extra screenshots in other places: WordPress uses only this file.
- Every image in it must be the theme's own drawing, or a photo with a
  GPL-compatible licence (CC0). Record the source in `readme.txt`. Simple
  drawn product shapes are the safe default.

## 2. Content: few things, a lot of space

Show a simplified home page above the fold. Use only these parts:

1. **Header** (a thin row): the theme name as a wordmark on the left,
   at most 3 navigation words, and a bag icon on the right. A hairline in
   `border-subtle` below it, or no line.
2. **Hero text**: one headline of 2 to 5 words in the display font (large,
   for example 72–96px), one short line in `text-secondary` (at most 10
   words), and **one** primary button.
3. **Products**: 2 or 3 product frames in the photo ratio from plan.md, on
   `bg-surface`, each with a simple product shape, a name and a price.
   Or one large hero image frame in place of the product row, if that fits
   the chosen style better.

Do not add: badges, ratings, sale labels, pop-ups, cookie bars, search
fields, filters, long paragraphs, lorem ipsum, footers, social icons, device
frames or mock-ups, "Buy now" banners, version numbers, feature lists or
any marketing text. If a part does not help a merchant see the style in
one second, remove it.

## 3. Colour

- Use the **default palette** that the creator chose (`design/palettes.json`
  → `default`), in its main mode: the light set for Light and Both, the dark
  set for Dark.
- Follow the 90-8-2 rule here too: the page is `bg-canvas` and `bg-surface`,
  the type is `text-primary` and `text-secondary`, and **only the primary
  button** uses `accent-primary` with an `accent-on` label. One more small
  accent mark is allowed only if the theme really uses it (for example the
  active navigation underline). No other saturated colour.
- Take every hex value from the generated tokens (`theme.json` palette),
  not from memory, so the thumbnail matches the theme.
- No gradients, glows, heavy shadows or textures, unless the theme uses
  them.

## 4. Type and layout

- The theme's own fonts, loaded from `assets/fonts/` with `@font-face`.
  If the fonts are not there yet, the typography module is not done: build it
  first.
- All spacing on the 4-point grid. Outer margin at least 64px, and more
  space around the headline than between the parts.
- A clear grid: an asymmetric split (text left, products or hero image
  right) is modern and reads well at small sizes. Align to one baseline and
  one left edge.
- The theme card shows the image at about 300–400px wide, so the headline
  must still be easy to read at a quarter of the size. Nothing smaller than
  14px at full size.
- Radius, border width and button style the same as the theme.

## 5. How to make it

1. Write `design/screenshot.html`: a fixed 1200 × 900 page
   (`html, body { width: 1200px; height: 900px; margin: 0; overflow: hidden; }`),
   with the colours as CSS custom properties copied from `theme.json`, the
   fonts from `../assets/fonts/`, and simple inline SVG product shapes in
   `text-muted` at low opacity.
2. Render it to PNG with what the machine has, in this order:
   - Chrome or Chromium:
     `"<chrome>" --headless=new --hide-scrollbars --window-size=1200,900 --screenshot=<theme>/screenshot.png file://<theme>/design/screenshot.html`
     (on macOS the binary is
     `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).
   - Playwright: `npx playwright screenshot --viewport-size=1200,900 file://<theme>/design/screenshot.html <theme>/screenshot.png`.
   - If neither is available, tell the creator and give the command to run.
3. Check the size (`sips -g pixelWidth -g pixelHeight` on macOS, or
   `file screenshot.png`): it must be 1200 × 900.
4. Look at the PNG yourself (open the image file with your file-reading
   tool) and check it against the list below. Fix and render again.
5. Show it to the creator and ask: "Use this thumbnail?" with the options
   "Use it (Recommended)" and "Change it". Apply the changes they ask for.

`design/` is not part of the release zip; `screenshot.png` is.

## 6. Done when

- [ ] 1200 × 900 PNG at the theme root, under 1 MB.
- [ ] Only header, hero text with one button, and 2–3 products (or one
      hero image).
- [ ] The default palette's colours; the accent only on the button (and at
      most one small active mark).
- [ ] The theme's own fonts; the headline is readable at a quarter size.
- [ ] 4-point spacing, wide margins, a clear grid.
- [ ] No placeholder text, no third-party images without a licence.
- [ ] The creator approved it.
