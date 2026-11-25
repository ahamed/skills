# Kirki eCommerce integration

The product is **Kirki eCommerce** (slug `kirki-ecommerce`). "Kirki" alone
is a different product: never call the plugin "Kirki" in theme text.

Read the installed plugin before a store module: its `resources/views/site/`
files are the source of each override, and its version (`kirki-ecommerce.php`
header) sets `Store::REQUIRED_PLUGIN_VERSION`. Never edit the plugin.

## 1. How a view override works

Kirki eCommerce looks for a view in the active theme first
(`<theme>/views/<path>.php`), then in the plugin
(`resources/views/<path>.php`). A theme view replaces the plugin view
fully.

Rules for every override:

1. **Start from a copy** of the plugin view at the same path, then
   **restructure** it for the chosen layout spec (`plan.md` → Layouts): new
   order, new wrappers and regions, parts moved or split. Do not keep the
   plugin's layout with new colours. Keep the contract: its data
   (`view_data(...)`), its fields and field names, its Alpine components
   (`x-data="cart()"`, `checkout()`, `addToCart({...})` …) and the scope
   they need (elements that use a component's state stay inside its
   `x-data` element), its events, and its `include_view()` calls for parts
   you do not override.
2. **Keep every `kecom-` class.** The plugin's scripts find elements by
   them (field errors, remove buttons, the orders table, the wishlist grid).
   Add the theme class beside each one:
   `class="kecom-cart-item <p>-cart-item"`. Style only the `<p>-` classes.
3. **Add a file header** that says it is the theme version of the plugin view
   with the same path, and that it keeps the plugin's data, fields, Alpine
   components and `kecom-` classes.
4. Plugin strings stay in the `kirki-ecommerce` text domain; new or changed
   strings use the theme text domain.
5. Pages print the site header and footer with
   `Kirki\Ecommerce\App\Supports\Template::get_header()` / `get_footer()`.
   Add body classes before `get_header()` (a small `BodyClass` helper with a
   `body_class` filter).
6. **Record parity**: after each copy, run `npm run parity:update`. The
   parity test fails when the plugin view changes later, and names it:
   compare, bring the change into the copy, run `parity:update` again.

A page the creator did not select keeps the plugin view. It still follows
the theme colours, fonts and radius through the `--kecom-*` token map.

## 2. Views per page

Copy the views that the chosen layout needs to change. For a prime page with
a layout spec, that is normally the page view and the parts whose structure
changes. Parts that only need new colours or spacing can stay with the
plugin and be styled through the token map and the `kecom-` classes.

| Page | Plugin views (`resources/views/…`) |
|---|---|
| Shop | `site/shop.php`, `site/shop/parts/list.php`, `site/shop/parts/product-card.php`, `site/shop/parts/sidebar.php`, `site/shop/parts/meta.php`, `site/shop/parts/breadcrumb.php`, `site/shop/parts/empty.php`, `site/shop/not-found.php` |
| Product details | `site/shop/single.php` |
| Cart | `site/cart.php`, `site/cart/parts/cart-item.php`, `site/cart/parts/cart-summary.php`, `site/cart/parts/item/{image,info,quantity}.php` |
| Checkout | `site/checkout.php`, `site/checkout/parts/*.php` (contact-info, billing-form, shipping-form, shipping-methods, payment-methods, order-products, order-summary, coupon-form, consents, address-picker-modal, address-selected-card) |
| Thank you | `site/order-success.php` |
| Order failed | `site/order-failed.php` |
| Account | `site/account.php`, `site/account/{dashboard,orders,order-details,addresses,account-details,wishlist,sidebar}.php`, `site/account/orders/*.php`, `site/account/parts/*.php`, `site/account/wishlist/*.php` |

`site/shop/parts/product-card.php` is also used by the account wishlist.
Keep it working without the shop page context.

Check the list against the installed plugin: views can be added in a newer
version.

## 3. Drawer cart (not a view)

The plugin's header block `kirki-ecommerce/mini-cart` shows the bag icon and
count. The drawer is the theme's own:

- Markup printed in `wp_footer` by `src/BagDrawer.php` (not a block part:
  kses would drop the Alpine attributes), only when the store is active.
- A document click listener opens it from the mini-cart link (plain click
  only: Ctrl/Cmd/Shift/Alt and middle click keep the link). It stays a link on
  the cart and checkout pages (body class), without JS, and without
  `window.kecomCart`.
- It reads and changes the cart with `window.kecomCart`
  (Kirki eCommerce 1.0.3+): `get()`, `updateItem(itemId, quantity)`,
  `removeItem(itemId)`. Each returns the updated cart; on a refused change
  show the server's message and the server's quantity.
- Listen to `kecom:cart-updated` on `document` to refresh it.
- Modal dialog: `role="dialog"`, `aria-modal`, focus to Close, focus trap,
  Escape and scrim click close, focus back to the trigger, no page scroll.
- States: loading, empty (link to the shop), error (link to the cart page),
  unavailable items (Checkout disabled).

## 4. Script hooks (1.0.3+)

| Hook | Use |
|---|---|
| `kecom:cart-updated` (document) | Any cart change. `event.detail` = cart |
| `kecom:cart:item-added` (window) | After a successful add: `{ variantId, quantity, imageUrl, sourceEl, cart }` |
| `addToCart({ variantId, sourceEl, showSuccessToast })` | Pass `showSuccessToast: false` when the theme shows its own feedback; `sourceEl` tells the event where the add came from |
| `window.kecomCart` | Cart API above |
| PHP filter `kirki_ecommerce_shop_per_page` | Products per shop page (default 12) — use a multiple of the grid's column count |
| Other events | `kecom:variant:changed`, `kecom:quantity:changed`, `kecom:shipping-method:changed`, `kecom:payment-method:changed`, `kecom:modal:opened`/`closed`, `kecom:shop:products-updated` |

Feature-detect each one (`window.kecomCart`, plugin version) and keep the
plugin's default behaviour when it is missing. When the theme turns off the
plugin's success toast, it must announce "Added to cart" in a polite live
region.

## 5. Assets order

The theme script registers Alpine components on `alpine:init`, so it must
print before the plugin bundle calls `Alpine.start()`:

- Enqueue on `wp_enqueue_scripts` priority 20 (after the plugin).
- Add the theme handle to the plugin script's `deps`
  (`kirki-ecommerce-site-scripts`) when that handle is registered; else print
  the theme script in the head.
- The theme stylesheet depends on `kirki-ecommerce-site-styles` when it is
  registered, so theme rules come after the plugin's.
- Load the script only when the store is active. Load the stylesheet always.

## 6. The `--kecom-*` token map

`resources/css/commerce/tokens.css` sets every plugin colour token from a
theme role token, so plugin markup (and pages the creator did not override)
follows the palette and the dark mode:

```css
:root {
  --kecom-font-family: var(--<p>-font-text);

  --kecom-background-fill: var(--<p>-bg-surface);
  --kecom-background-fill-brand: var(--<p>-accent-primary);
  --kecom-background-fill-brand-hover: var(--<p>-accent-hover);
  --kecom-background-fill-secondary: var(--<p>-bg-surface);
  --kecom-background-fill-secondary-hover: var(--<p>-border-subtle);
  --kecom-background-fill-hover: var(--<p>-bg-surface);
  --kecom-background-fill-tertiary: var(--<p>-bg-canvas);
  --kecom-background-fill-tertiary-hover: var(--<p>-bg-surface);
  --kecom-background-fill-disabled: var(--<p>-border-subtle);
  --kecom-background-fill-critical: var(--<p>-state-critical);
  --kecom-background-fill-critical-secondary: var(--<p>-state-critical-soft);
  --kecom-background-fill-success: var(--<p>-state-success);
  --kecom-background-fill-success-secondary: var(--<p>-state-success-soft);
  --kecom-background-fill-caution: var(--<p>-state-caution);
  --kecom-background-fill-caution-secondary: var(--<p>-state-caution-soft);
  --kecom-background-fill-warning: var(--<p>-state-caution);
  --kecom-background-fill-warning-secondary: var(--<p>-state-caution-soft);
  --kecom-background-button-tertiary: var(--<p>-bg-canvas);
  --kecom-background-surface: var(--<p>-bg-canvas);
  --kecom-background-surface-alt: var(--<p>-bg-surface);
  --kecom-background-surface-secondary: var(--<p>-bg-surface);
  --kecom-background-surface-subdued: var(--<p>-bg-surface);
  --kecom-background-surface-tertiary: var(--<p>-bg-surface);
  --kecom-background-surface-disabled: var(--<p>-bg-surface);
  --kecom-background-neutral-surface: var(--<p>-bg-surface);
  --kecom-background-placeholder-surface: var(--<p>-bg-surface);
  --kecom-background-option-hover: var(--<p>-bg-surface);
  --kecom-background-inverse: var(--<p>-text-primary);

  --kecom-border-default: var(--<p>-border-subtle);
  --kecom-border-hover: var(--<p>-border-strong);
  --kecom-border-secondary: var(--<p>-border-subtle);
  --kecom-border-tertiary: var(--<p>-border-subtle);
  --kecom-border-muted: var(--<p>-border-subtle);
  --kecom-border-alt: var(--<p>-border-subtle);
  --kecom-border-ring: var(--<p>-focus-ring);
  --kecom-border-critical: var(--<p>-state-critical);
  --kecom-border-inverse: var(--<p>-bg-canvas);

  --kecom-text-primary: var(--<p>-text-primary);
  --kecom-text-secondary: var(--<p>-text-secondary);
  --kecom-text-subdued: var(--<p>-text-muted);
  --kecom-text-muted: var(--<p>-text-muted);
  --kecom-text-emphasis: var(--<p>-text-primary);
  --kecom-text-dark: var(--<p>-text-primary);
  --kecom-text-light: var(--<p>-accent-on);
  --kecom-text-brand: var(--<p>-accent-primary);
  --kecom-text-critical: var(--<p>-state-critical);
  --kecom-text-success: var(--<p>-state-success);
  --kecom-text-caution: var(--<p>-state-caution);
  --kecom-text-warning: var(--<p>-state-caution);

  --kecom-icon-primary: var(--<p>-text-primary);
  --kecom-icon-secondary: var(--<p>-text-secondary);
  --kecom-icon-brand: var(--<p>-accent-primary);
  --kecom-icon-emphasis: var(--<p>-text-primary);
  --kecom-icon-critical: var(--<p>-state-critical);
  --kecom-icon-success: var(--<p>-state-success);
  --kecom-icon-caution: var(--<p>-state-caution);
  --kecom-icon-warning: var(--<p>-state-caution);
  --kecom-icon-inverse: var(--<p>-bg-canvas);
}
```

The plugin puts `--kecom-text-light` on its solid fills (brand, critical,
success, caution). `accent-on` reaches 4.5:1 on the accent; check the solid
state badges too, and use the soft badge style (state text on the soft fill)
in theme markup. Compare the list with the plugin's SCSS variables
(`resources/site/scss/`) when the plugin version changes: a new
`--kecom-*` name needs a line here.

## 7. Store and version check

- `Store::is_active()`: `function_exists('Kirki\Ecommerce\Framework\app')`.
- `Store::plugin_version()`: `(string) \Kirki\Ecommerce\Framework\app()->version()` when active, else `''`.
- `Store::REQUIRED_PLUGIN_VERSION`: the lowest version that has every hook
  the theme uses (1.0.3 for the cart API, the item-added event and the shop
  page size filter).
- `PluginCheck`: an admin notice for users who can activate plugins, when the
  plugin is missing or older than required. It names what does not work until
  the update ("Requires Kirki eCommerce 1.0.3 or newer").
- `style.css` description says "Needs Kirki eCommerce X.Y.Z or newer."
