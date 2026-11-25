# Page layouts

A theme must not be the plugin layout with new colours. Each theme decides
the layout of its prime pages: Shop, Product details, Cart, Drawer cart and
Checkout. The creator chooses one layout per page in discovery step 8a.

## 1. How to make the options (step 8a)

Ask one question per selected prime page, in this order: Shop, Product
details, Cart, Drawer cart, Checkout. Skip a page that the creator did not
select in step 8.

Each question has 3 options:

1. **Two archetypes from the catalogue (§4)** that fit best. Look at the
   style keywords, the niche, the range size (a few products or many), and
   the photo style. Put the better one first, with "(Recommended)" and one
   line about why.
2. **One composed layout** (§2), made for this theme only.

The creator can type their own layout ("Other"). Turn the answer into the
same spec format (§3), show it as an ASCII preview, and ask
"Use this layout?" before you record it.

Each option has an ASCII `preview` (§3) and a description of 1 or 2 lines:
what the shopper gets, and the trade-off.

## 2. The composed layout

The composed option makes the theme unique. Make it from the chosen
ui-ux-pro-max style:

- Use the style `Keywords` and `Key effects` for the structure. Examples:
  "Bento grid" gives mixed tile sizes; "Editorial" gives a magazine column
  and large type; "Brutalism" gives hard rules, a visible grid and big
  labels; "Swiss" gives a strict column grid and strong alignment.
- Respect the style `Avoid` line.
- Run `"<page> <style> ecommerce" --domain ux -n 5` and
  `"<page> ecommerce" --domain landing -n 3` for ideas, and check each rule
  in §5.
- Combine; do not copy an archetype. A composed layout must differ from
  both archetypes in the same question in at least two of: column structure,
  where the filters or the summary are, the gallery type, the step model,
  how the mobile layout works.

## 3. Spec and preview format

A layout spec has an id, a name, and these lines. The chosen spec goes into
`plan.md` → Layouts, so that a build session can build it with no memory of
the discovery talk:

```text
id: shop/sidebar-catalogue       (catalogue id, or <page>/composed-<word>)
name: Sidebar catalogue
desktop: left filter column 280px, sticky; grid 3 columns; sort + count above the grid
mobile: 2 columns; "Filters (n)" button opens a modal filter drawer; sort as a select
regions: breadcrumb, title + count, filters, sort, grid, pagination, empty state
plugin: shop(), filters and sort from site/shop/parts/sidebar.php + meta.php; product-card.php
a11y: filter groups are fieldsets with legends; results count is aria-live polite
```

The ASCII preview in AskUserQuestion: at most 40 characters wide and 14
lines. Desktop first, then mobile, with a title line for each:

```text
Desktop
+--------+-------------------------+
| Filter | Title (24)       Sort v |
| [ ] a  | [img] [img] [img]       |
| [ ] b  | [img] [img] [img]       |
|        |       < 1 2 3 >         |
+--------+-------------------------+
Mobile
+------------------+
| Title  [Filters] |
| [img] [img]      |
+------------------+
```

## 4. Catalogue

Each entry: id, what it is, when it fits, and its notes. Make the ASCII
preview from the description when you ask. Do not copy one preview to
every theme.

### 4.1 Shop

| id | Layout | Fits |
|---|---|---|
| `shop/sidebar-catalogue` | Sticky left filter column, 3 or 4 column grid, sort above the grid. Mobile: filter drawer. | Large ranges, many filters (fashion, home) |
| `shop/top-filter-bar` | Full-width grid; a horizontal bar of filter buttons that open popovers, and active-filter chips under it. | Medium ranges, image-led stores |
| `shop/editorial-mosaic` | A grid with a large feature tile every 6 to 8 items, and an editorial text tile (story, category intro) in the grid. | Small curated ranges, luxury, handmade |
| `shop/category-led` | A row of category tiles first, then the grid; filters behind one "Filter and sort" drawer button. | Stores with clear categories |
| `shop/lookbook-list` | 2 large cards per row with more text (material, short description, price) and quick view of the second image. | Few, high-value products |
| `shop/compact-grid` | 4 columns on tablet, 5 or 6 on desktop; small cards with a quick-add button. | Small goods, consumables, accessories |

Notes: the DOM order of the mosaic is the visual order. A feature tile is a
normal product card at a larger size, not a separate link. The number of
products per page (`kirki_ecommerce_shop_per_page`) fills the last row.

### 4.2 Product details

| id | Layout | Fits |
|---|---|---|
| `product/split-sticky` | All images stacked on the left (scroll); the buy column on the right stays sticky. | Apparel, products with many photos |
| `product/thumb-rail` | One main image with a thumbnail rail (vertical on desktop, a row on mobile); details in tabs or accordions below. | Most stores; few photos per product |
| `product/grid-gallery` | Images in a 2-column grid on the left, the buy column on the right. | Lifestyle photos, home and living |
| `product/full-bleed` | A full-width image band first, the buy panel under it in a 2-column row, then story sections that alternate image and text. | Hero products, brand stories |
| `product/centered-editorial` | One narrow, centred column: title, image, price and buy, then a long story with large images. | Luxury, handmade, few products |

Notes for all: on mobile, a sticky bottom bar with the price and Add to
cart shows after the main button scrolls out of view. It must not cover the
focused element (WCAG 2.4.11). The gallery is a swipe carousel on touch,
with buttons and arrow keys, never auto-playing.

### 4.3 Cart

| id | Layout | Fits |
|---|---|---|
| `cart/two-column` | Items on the left, a sticky summary on the right with the checkout button. | Most stores |
| `cart/single-column` | One narrow centred column: items, then the summary card. | Minimal styles, few items per order |
| `cart/table` | Items as table rows on desktop (product, price, quantity, total), as cards on mobile. | Many items per order, B2B |
| `cart/with-rail` | Two-column, plus a "You may also like" rail under the items. | Stores that want add-ons |

### 4.4 Drawer cart

| id | Layout | Fits |
|---|---|---|
| `drawer/side-sheet` | A side sheet from the right, 400 to 480px wide, items list, fixed footer with subtotal and two buttons. | Most stores |
| `drawer/wide-sheet` | A wider sheet (about 560px) with large product images and an editorial note. | Image-led, luxury |
| `drawer/adaptive-sheet` | A side sheet on desktop, a bottom sheet (up to 90 % height, with a handle and a close button) on mobile. | Mobile-heavy stores |

Notes: every drawer is a modal dialog with a focus trap, Escape closes it,
and focus goes back to the bag link (`kirki-ecommerce.md` §3).

### 4.5 Checkout

| id | Layout | Fits |
|---|---|---|
| `checkout/two-column` | One page: the form on the left, a sticky order summary on the right. Mobile: summary as a disclosure at the top. | Most stores |
| `checkout/accordion` | One page with sections (Contact, Delivery, Payment). A section closes to a short summary with an Edit button when it is complete. | Long forms, first-time buyers |
| `checkout/split-panel` | The form on a canvas half, the summary on a full-height surface half. | Calm, premium styles |
| `checkout/single-column` | One narrow, centred column; the summary as a disclosure at the top. | Minimal styles, few items |

Notes: the plugin checkout is one form with one `checkout()` Alpine
component. The accordion is a theme layer on top of the same form. Every
field stays in the DOM. A closed section uses `hidden` only after its
fields pass validation, and an error opens its section. Without JS all
sections are open. There is one Place order button.

## 5. UX rules for every layout

A layout option must meet all of these. Leave out an option that does not:

- The DOM order and the reading order are the same as the visual order.
- No horizontal scroll at 320px. Mobile first.
- One primary (accent) action per viewport.
- A sticky element (header, buy column, summary, bottom bar) never covers
  the focused element or the content under it.
- Filters, sort, galleries and steps work with the keyboard. State changes
  are announced (`aria-live` for result counts and cart totals).
- Touch targets 44×44px at least, with 8px between them.
- Images keep the plan ratio and reserve their space (no layout shift).
- Every plugin data field, form field, Alpine component and `kecom-` class
  stays (`kirki-ecommerce.md` §1).

## 6. The other pages

These pages have no own question. They follow the chosen layouts, so the
store feels like one design:

- **Thank you** and **Order failed** use the checkout structure: the same
  column model, with the order summary where the checkout summary was.
- **Account** uses the shop navigation model: with `shop/sidebar-catalogue`,
  a sidebar menu; with a top-bar or category-led shop, a horizontal tab menu.
  On mobile it is always a horizontal scrollable tab menu or a select.

Write the derived layout for each of these pages into `plan.md` → Layouts
too, as a spec with `derived from: <page>`.
