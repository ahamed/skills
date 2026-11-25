# plan.md template

Write `<theme>/plan.md` from this template. Fill every `{{…}}` from the
discovery answers. Remove the module sections of pages the creator did not
select (and their rows in the status table). Keep the wording short and
concrete: a later session builds each module from this file alone, with no
memory of the discovery talk.

---

```markdown
# {{Theme name}} — build plan

A WordPress block theme for a {{niche}} store on Kirki eCommerce.
Built with the `kirki-ecommerce-theme` skill: run `/kirki-ecommerce-theme build`
to build the next open module, or `/kirki-ecommerce-theme build <module> [<module>]`.

## Status

| # | Module | Status |
|---|---|---|
| 1 | starter | [ ] |
| 2 | tokens | [ ] |
| 3 | typography | [ ] |
| 4 | motion | [ ] |
| 5 | chrome | [ ] |
| 6 | shop | [ ] |
| 7 | product | [ ] |
| 8 | cart | [ ] |
| 9 | drawer-cart | [ ] |
| 10 | checkout | [ ] |
| 11 | thank-you | [ ] |
| 12 | order-failed | [ ] |
| 13 | account | [ ] |
| 14 | thumbnail | [ ] |
| 15 | docs-release | [ ] |

## Decisions

| Item | Value |
|---|---|
| Name / slug / prefix | {{Name}} / `{{slug}}` / `--{{slug}}-*`, `.{{slug}}-*` |
| PHP namespace / constants | `{{Namespace}}` / `{{CONST}}_*` |
| Niche and audience | {{niche, range, audience}} |
| Target style (ui-ux-pro-max) | {{Style Category}} (`{{style-id}}`), query `{{query}}`; design system `design/design-system/{{slug}}/MASTER.md` |
| Colour mode | {{Light / Dark / Both}} |
| Default palette | {{title}} (`design/palettes.json` → `default`) |
| Colour presets | {{kept palettes, or "none"}} |
| Pages overridden | {{list}} |
| Layouts | Shop `{{id}}`, Product `{{id}}`, Cart `{{id}}`, Drawer `{{id}}`, Checkout `{{id}}` (specs in Layouts) |
| Typography | Display {{font}}, text {{font}}; licence {{OFL}} |
| Photos | {{Studio cutout / Lifestyle}}, ratio {{4:5}} for the grid and product page; hero {{16:9}} |
| Theme folder | `{{path}}` |
| Kirki eCommerce | folder `{{plugin path}}`, installed {{version}}, required {{version}} |
| WordPress / PHP | 6.8+ / 7.4+ |

## Design brief

{{4–6 lines: the mood in words, how the page is composed (whitespace,
grid, image size), how the accent is used, the type voice, the motion
level. Concrete enough that two people would build the same feel.}}

Rules that always apply: `design/design-system/{{slug}}/MASTER.md` (the
style; it wins on colour and type), the hard limits in the skill's
`references/ui-ux-pro-max.md` §5, `references/design-rules.md` (4-point
spacing, photos, motion, clean code), `references/layouts.md` §5 (layout UX
rules) and `references/kirki-ecommerce.md` (view overrides).

## Layouts

{{One spec per prime page that the creator selected, in the format of
`layouts.md` §3, with the ASCII preview that the creator chose. Then the
derived specs for Thank you, Order failed and Account (`layouts.md` §6).
Remove the specs of pages that are not overridden.}}

### Shop

```text
{{spec}}
```

```text
{{ASCII preview}}
```

### Product details

…

### Cart · Drawer cart · Checkout · Thank you · Order failed · Account

…

## Modules

### 1. starter

- **Goal:** an empty theme that activates, builds and passes every check.
- **Files:** `style.css`, `functions.php`, `composer.json`, `package.json`,
  `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.json`,
  `.prettierignore`, `vitest.config.ts`, `vitest.setup.ts`, `phpcs.xml.dist`,
  `.gitignore` (node_modules, vendor, assets/js, assets/css, design/palettes.html),
  `theme.json` (version 3, layout `contentSize`/`wideSize`, spacing scale,
  `custom.{{slug}}` radius, border, motion; `appearanceTools: true`),
  `src/Theme.php`, `src/Assets.php`, `src/Store.php`, `src/PluginCheck.php`,
  `src/BodyClass.php`, `resources/ts/main.ts`, `resources/ts/globals.d.ts`,
  `resources/css/main.css`, `resources/css/base.css`, `templates/index.html`,
  `scripts/palettes.mjs`, `scripts/parity.mjs`, `scripts/parity-update.mjs`,
  `resources/ts/parity.test.ts`, `views/.parity.json` (`{ "views": {} }`).
- **Steps:** copy the three scripts from the skill's `scripts/`; write the
  configs from `references/tech-stack.md`; `npm install`; `composer install`.
- **Done when:** `npm run build`, `npm run typecheck`, `npm run lint`,
  `npm test`, `npm run lint:php` pass; the theme
  activates with no PHP notice; with the plugin off, the PluginCheck notice shows.

### 2. tokens

- **Goal:** every colour, space, radius, shadow and motion value is a token.
- **Files:** `design/palettes.json` (already written in discovery),
  generated `theme.json` palette, `styles/colors/*.json`{{, `resources/css/scheme.css`}},
  `resources/css/tokens.css`, `resources/css/commerce/tokens.css`,
  `resources/ts/palettes.test.ts`{{, `src/ColorScheme.php`, `resources/ts/components/scheme-toggle.ts` + test}}.
- **Steps:** `npm run palettes`; write `tokens.css` (role tokens over the
  presets, 4-point space scale, radius, shadow, motion, z layers); write the
  `--kecom-*` map; the palette test runs `problems()` on every palette and
  checks that the committed files equal `outputFiles()`.
  {{Mode Both: `ColorScheme` prints a tiny inline script at `wp_head`
  priority 0 that sets `data-{{slug}}-scheme` on `<html>` from
  localStorage (try/catch) before the first paint; a dynamic block
  `{{slug}}/scheme-toggle` renders the toggle button (aria-pressed, a
  visible label for screen readers, sun/moon icon); the TS component switches
  the attribute and saves the choice; "System" is the state with no saved
  choice.}}
- **Done when:** `npm run palettes:check` passes; the editor palette shows
  the role names; {{both: switching the OS setting and the toggle changes
  the page and the plugin's pages}}.

### 3. typography

- **Goal:** the chosen fonts, self-hosted, and the type scale.
- **Files:** `assets/fonts/*.woff2` + licence files, `theme.json`
  `fontFamilies` (with `fontFace`), `fontSizes` (fluid), element styles
  (h1–h6, link, button, caption), tokens `--{{slug}}-font-*`, `--{{slug}}-text-*`.
- **Done when:** no request goes to a font CDN; body 16px / 1.5; prices
  tabular; Global Styles → Typography shows the two families.

### 4. motion

- **Goal:** the shared, minimal motion layer.
- **Files:** `resources/css/base.css` (reduced-motion block, transitions on
  hover and focus), `resources/ts/motion/reveal.ts` + test, `main.ts`.
- **Done when:** reveals run once, only transform/opacity, ≤ 8px, and nothing
  moves with reduced motion on; content shows without JS.

### 5. chrome

- **Goal:** header, footer and the general templates.
- **Files:** `parts/header.html` (site title or logo, navigation,
  search and account links, `kirki-ecommerce/mini-cart`{{, scheme toggle}}),
  `parts/footer.html`, `templates/{index,front-page,home,page,single,archive,search,404}.html`,
  `patterns/*.php` (hero with the {{hero ratio}} image, featured products,
  editorial split, newsletter), `src/Blocks.php` for any dynamic block.
- **Done when:** the header is ≤ {{64/72}}px, sticky without layout shift,
  keyboard reachable; patterns use only palette slugs and space tokens;
  no Alpine attributes in parts or patterns.

Every store module (6 to 13) builds the layout in its spec under Layouts:
restructure the copied view, keep the plugin contract. "Done when" always
includes: the page matches its spec on desktop and mobile; the
`layouts.md` §5 rules hold; the `Pre-delivery checklist` in `MASTER.md` holds.

### 6. shop

- **Goal:** the `{{shop layout id}}` layout (Layouts → Shop).
- **Views:** `site/shop.php`, `site/shop/parts/{list,product-card,sidebar,meta,breadcrumb,empty}.php`, `site/shop/not-found.php` (copy only those the layout changes).
- **Also:** filters where the spec puts them (a modal drawer on mobile),
  `kirki_ecommerce_shop_per_page` = a multiple of the column count, image frames {{ratio}} on `bg-surface`,
  hover: second image or a ≤ 1.03 scale.
- **Done when:** parity recorded; filters, sort and pagination work (plugin
  Alpine components); the column counts of the spec; no coloured background
  behind the grid (unless the style says so).

### 7. product

- **Goal:** the `{{product layout id}}` layout (Layouts → Product details).
- **Views:** `site/shop/single.php`.
- **Also:** the gallery type of the spec ({{ratio}}, swipe on touch,
  keyboard), the buy column or panel of the spec, option tiles with `accent-soft` for the
  chosen value, sold-out options muted and struck, Add to cart with
  `addToCart({ variantId, sourceEl })`, delivery and returns notes,
  related products.
- **Done when:** variant change updates price, stock and image (plugin
  events); one accent CTA in the viewport.

### 8. cart

- **Goal:** the `{{cart layout id}}` layout (Layouts → Cart).
- **Views:** `site/cart.php`, `site/cart/parts/*`.
- **Done when:** quantity, remove, invalid-item notice and the summary work;
  the cart page adds the body class that keeps the bag icon a link.

### 9. drawer-cart

- **Goal:** the `{{drawer layout id}}` layout (Layouts → Drawer cart).
- **Files:** `src/BagDrawer.php`, `resources/ts/components/bag-drawer.ts` + test,
  `resources/css/commerce/bag-drawer.css`.
- **Done when:** the rules in `references/kirki-ecommerce.md` §3 hold
  (modal dialog, states, server limits, link fallback).

### 10. checkout

- **Goal:** the `{{checkout layout id}}` layout (Layouts → Checkout).
- **Views:** `site/checkout.php`, `site/checkout/parts/*` (those the layout changes).
- **Done when:** every field, error, address picker, shipping and payment
  method and coupon works; one Place order CTA; the summary where the spec
  puts it; without JS every section is open.

### 11. thank-you

- **Goal:** the derived layout (Layouts → Thank you).
- **Views:** `site/order-success.php`.
- **Done when:** order number, items, totals, addresses and next steps show;
  a calm success state (no confetti).

### 12. order-failed

- **Goal:** the derived layout (Layouts → Order failed).
- **Views:** `site/order-failed.php`.
- **Done when:** the reason (if any), a retry path and a support link show,
  in `state-critical` text, not a red page.

### 13. account

- **Goal:** the derived layout (Layouts → Account).
- **Views:** `site/account.php`, `site/account/**`.
- **Done when:** dashboard, orders, order details, addresses (with modals),
  account details, password and wishlist work; the menu follows the derived
  spec on desktop and mobile.

### 14. thumbnail

- **Goal:** a clean, modern `screenshot.png` for Appearance → Themes, in the
  default palette ({{default palette}}), with the accent only on the one button.
- **Files:** `design/screenshot.html`, `screenshot.png` (1200×900).
- **Steps:** follow the skill's `references/thumbnail.md`: header, hero text
  with one button, 2–3 product frames in the {{ratio}} ratio; render with
  headless Chrome or Playwright; look at the PNG; ask the creator to approve.
- **Done when:** every item in `thumbnail.md` §6 holds.

### 15. docs-release

- **Files:** `docs/{{slug}}.md` (table of contents, numbered sections: quick
  start, photo guidelines, each page, tokens and palettes, overridden views
  and parity, and "Where this differs from a WooCommerce block theme"),
  `readme.txt` (WordPress.org format, licence and font credits),
  `languages/{{slug}}.pot` (`screenshot.png` comes from the thumbnail module).
- **Done when:** every check passes; `wp i18n make-pot` finds every string;
  a release zip without `node_modules`, `design/` and dev files works on a
  clean site.

## Log

Add one entry per built module: date, module, what was built, decisions made
while building (and why), anything left for later, and the check results.
```
