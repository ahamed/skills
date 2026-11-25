# Tech stack and project layout

## 1. Stack

| Part | Choice |
|---|---|
| Theme type | WordPress block theme (Full Site Editing), `theme.json` version 3 |
| WordPress | 6.8 or newer (`Requires at least: 6.8`) |
| PHP | 7.4 or newer, PSR-4 classes in `src/`, Composer autoload |
| Templates | HTML block templates (`templates/`), template parts (`parts/`), PHP patterns (`patterns/`) |
| Store views | PHP view overrides in `views/site/…` (Kirki eCommerce loads them first) |
| Interactivity | Alpine.js components. Alpine comes from Kirki eCommerce: never bundle it |
| Scripts | TypeScript (strict), bundled by Vite 6 into one IIFE file `assets/js/<p>.js` |
| Styles | Plain CSS with custom properties, `@import`ed into one file `assets/css/<p>.css` by Vite. No Sass, no Tailwind |
| Minify | terser, with the i18n function names kept for `wp i18n make-pot` |
| Tests | Vitest (node environment) |
| Lint / format | ESLint 10 flat config + typescript-eslint (type-checked) + `@stylistic` + `simple-import-sort`; Prettier 3 |
| PHP lint | PHP_CodeSniffer with WordPress Coding Standards and PHPCompatibilityWP |
| Fonts | Self-hosted variable `woff2` files in `assets/fonts/` with their licence |
| i18n | Text domain = theme slug; JS uses `wp.i18n` (`wp-i18n` dependency) |

## 2. Folder layout

```
<slug>/
├── style.css               theme header only (styles are in assets/css)
├── theme.json              presets, palette, custom tokens, element and block styles
├── functions.php           constants, Composer autoload, Theme::boot()
├── composer.json           PSR-4 autoload "<Namespace>\\": "src/"; dev: phpcs, wpcs
├── package.json            scripts below
├── vite.config.ts  tsconfig.json  eslint.config.js  .prettierrc.json  .prettierignore
├── vitest.config.ts  vitest.setup.ts  phpcs.xml.dist
├── src/                    PHP classes, one per file, namespace <Namespace>
│   ├── Theme.php           boots every service in order
│   ├── Assets.php          front-end and editor assets
│   ├── Store.php           is Kirki eCommerce active / supported, required version
│   ├── PluginCheck.php     admin notice when the plugin is missing or too old
│   ├── ColorScheme.php     (mode Both) the early scheme script and the toggle block
│   ├── BagDrawer.php       (drawer cart) drawer markup in wp_footer
│   └── …                   one class per feature module
├── resources/
│   ├── css/
│   │   ├── main.css        @imports in order: tokens, scheme, base, layout, components, commerce
│   │   ├── tokens.css      --<p>-* tokens from the theme.json presets
│   │   ├── scheme.css      generated dark overrides (mode Both)
│   │   ├── base.css        element defaults, focus, reduced motion, utilities
│   │   ├── components/     one file per component
│   │   └── commerce/       tokens.css (the --kecom-* map) + one file per store page
│   └── ts/
│       ├── main.ts         registers Alpine components on alpine:init, starts small modules
│       ├── globals.d.ts    window.Alpine, window.wp, window.kirki_ecommerce, window.kecomCart
│       ├── components/     <name>.ts + <name>.test.ts
│       └── parity.test.ts  palettes.test.ts
├── scripts/                palettes.mjs, parity.mjs, parity-update.mjs (from the skill)
├── design/                 palettes.json, palettes.html (preview)
├── views/                  Kirki eCommerce view overrides + .parity.json
├── templates/  parts/  patterns/
├── styles/colors/          kept palettes as colour-only variations
├── assets/                 built css/js (git-ignored or shipped), fonts/, images/
├── languages/
├── docs/<slug>.md          theme documentation
├── plan.md                 the build plan (this skill)
└── readme.txt
```

`vendor/` holds only the Composer autoloader in the release zip
(`composer install --no-dev --optimize-autoloader`). The theme has no runtime
Composer packages unless a module really needs one.

## 3. Files of the starter module

**package.json** (`"type": "module"`, `"private": true`):

```json
"scripts": {
  "dev": "vite build --watch",
  "build": "tsc --noEmit && vite build",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --cache --cache-location node_modules/.cache/eslint/",
  "lint:fix": "eslint . --fix --cache --cache-location node_modules/.cache/eslint/",
  "format": "prettier --write .",
  "test": "vitest run",
  "palettes": "node scripts/palettes.mjs write",
  "palettes:check": "node scripts/palettes.mjs check",
  "palettes:preview": "node scripts/palettes.mjs preview",
  "parity:update": "node scripts/parity-update.mjs",
  "lint:php": "vendor/bin/phpcs"
},
"devDependencies": {
  "@eslint/js": "^10", "@stylistic/eslint-plugin": "^5", "@types/alpinejs": "^3",
  "@types/node": "^24", "eslint": "^10", "eslint-plugin-simple-import-sort": "^14",
  "globals": "^17", "prettier": "^3", "terser": "^5", "typescript": "^5.7",
  "typescript-eslint": "^8", "vite": "^6", "vitest": "^4"
}
```

Install with `npm install` and keep the lock file. Use the newest versions
that satisfy these ranges.

**vite.config.ts**: `root` = theme folder, `build.outDir` = `assets`,
`emptyOutDir: false` (fonts live there), `cssCodeSplit: false`,
`minify: 'terser'` with `terserOptions: { compress: { conditionals: false },
mangle: { reserved: ['__', '_x', '_n', '_nx'] }, format: { comments: /translators:/i } }`,
one input `resources/ts/main.ts`, output `format: 'iife'`,
`entryFileNames: 'js/<p>.js'`, CSS asset name `css/<p>.css`, other assets
`media/[name]-[hash][extname]`. `main.ts` imports `../css/main.css`.

**tsconfig.json**: `target` ES2020, `module` ESNext, `moduleResolution`
bundler, `strict`, `noEmit`, `skipLibCheck`, `types: ["vite/client", "node"]`,
`lib: ["ES2020", "DOM", "DOM.Iterable"]`, include `resources/**/*.ts`, the
config files and `scripts/**/*.mjs` (the scripts are type-checked through
JSDoc; tests import them, so give each a `.d.mts` file or use
`// @ts-expect-error` on the import).

**eslint.config.js** (`tseslint.config`): ignore `node_modules/**`,
`assets/**`, `vendor/**`; JS files → `js.configs.recommended`, node globals;
TS files → `recommendedTypeChecked` + `stylisticTypeChecked`, browser
globals, `projectService: true`; rules: `simple-import-sort/imports` with
groups `[['^node:', '^@?\\w'], ['^@/'], ['^\\.'], ['^\\u0000']]`,
`consistent-type-imports` (separate type imports), `curly: all`,
`eqeqeq` (null ignored), `no-console` (warn/error allowed),
`prefer-const`, single quotes, trailing commas always-multiline,
unused vars with `^_` ignored, `no-misused-promises` with
`checksVoidReturn: { attributes: false, properties: false }`.

**.prettierrc.json**: 2 spaces, single quotes, trailing commas all, semicolons,
`printWidth` 100, `arrowParens` always. `.prettierignore`: `assets/`,
`node_modules/`, `vendor/`.

**vitest.config.ts**: `environment: 'node'`, `setupFiles: ['./vitest.setup.ts']`,
`include: ['resources/**/*.test.ts']`. `vitest.setup.ts` gives tests an empty
`window`: `(globalThis as { window?: unknown }).window ??= {};`. Keep
components testable without a DOM: put the logic in pure functions, and keep
the Alpine object thin.

**composer.json**: `"type": "wordpress-theme"`, `"autoload": { "psr-4": { "<Namespace>\\": "src/" } }`,
`"require": { "php": ">=7.4" }`, dev: `squizlabs/php_codesniffer`,
`wp-coding-standards/wpcs`, `phpcompatibility/phpcompatibility-wp`,
`dealerdirect/phpcodesniffer-composer-installer`; `config.allow-plugins`
for the installer; `config.platform.php` `7.4`.

**phpcs.xml.dist**: rulesets `WordPress-Extra`, `PHPCompatibilityWP`,
`testVersion` 7.4-, text domain = slug, prefixes = slug, namespace and
constant prefix; files `functions.php`, `src`, `views`, `patterns`; exclude
`vendor`, `node_modules`, `assets`. Kirki eCommerce view copies keep the
plugin's code style: exclude the rules that the copies break, not the files.

## 4. PHP conventions

- `functions.php`: `defined('ABSPATH') || exit;`, `define('<CONST>_VERSION', '1.0.0');`,
  `require_once __DIR__ . '/vendor/autoload.php';` (with a clear admin notice
  if it is missing, for a git checkout without `composer install`), then
  `<Namespace>\Theme::boot();`.
- One class per file, `namespace <Namespace>;`, a file docblock with
  `@package <Namespace>` and `@since`, a class docblock that says why it
  exists. Classes are final-by-convention service classes with a static
  `init()` that adds the hooks; `Theme::boot()` calls each `init()`.
- Escape late (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`), translate
  every visible string with the theme text domain, and add `translators:`
  comments to `sprintf` strings.
- Never read `$_GET`/`$_POST` directly: use `filter_input` or the
  WordPress sanitizers. Never store data the merchant did not ask for: the
  colour presets, the scheme and the settings are core theme.json features,
  so the theme needs no options.
- Every Kirki eCommerce call goes through `Store` (`Store::is_active()`,
  `Store::is_supported()`), so the theme still renders when the plugin is
  off.

## 5. Front-end conventions

- `main.ts` registers Alpine components inside
  `document.addEventListener('alpine:init', …)` with
  `window.Alpine.data('<p>Name', factory)`. The theme script is added to the
  plugin script's dependencies, so it prints first and the components exist
  before `Alpine.start()`.
- Component names and classes: `<p>Name` (camelCase of the prefix), CSS
  block classes `<p>-name`, elements `<p>-name__part`, states `is-open`,
  `is-active`.
- Interactive markup with Alpine attributes (`x-data`, `x-on:`, `@`, `:`)
  must not live in block template parts or patterns: kses drops the
  attributes when the merchant saves the part. Print it from PHP
  (`wp_footer`, a dynamic block `render_callback`, or a view override).
- Listen to the plugin's events, never patch its code: see
  `kirki-ecommerce.md`.
- Reduced motion: read `matchMedia('(prefers-reduced-motion: reduce)')`
  once and pass it into components.
