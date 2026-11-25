#!/usr/bin/env node
/**
 * Kirki eCommerce theme palette generator.
 *
 * Reads design/palettes.json, derives every colour token of each palette from
 * three inputs per mode (canvas, text, accent), moves weak colours until they
 * meet the contrast targets, and writes:
 *
 *   theme.json                  settings.color.palette + settings.custom.<prefix>.color (default palette)
 *   styles/colors/<slug>.json   one colour-only variation per kept palette
 *   resources/css/scheme.css    dark-mode overrides (mode "both" only)
 *   design/palettes.html        visual preview (with `preview`)
 *
 * Usage (run from the theme folder, or pass --dir):
 *   node scripts/palettes.mjs preview      write design/palettes.html only
 *   node scripts/palettes.mjs write        write theme.json, styles/colors, scheme.css
 *   node scripts/palettes.mjs check        exit 1 when a WCAG contrast target fails or a file is stale
 *
 * Only WCAG contrast is a failure. The colour-style rules (tinted neutrals,
 * muted states, no pure black, a visible hover step) are warnings, because
 * the chosen ui-ux-pro-max style may go against them on purpose.
 *
 * design/palettes.json:
 *   {
 *     "prefix": "aurora",                     // theme slug, the CSS prefix
 *     "mode": "both",                         // "light" | "dark" | "both"
 *     "default": "stone-clay",                // palette in theme.json
 *     "keep": true,                           // write the other palettes as colour presets
 *     "palettes": [
 *       {
 *         "slug": "stone-clay", "title": "Stone & Clay",
 *         "light": { "canvas": "#F7F5F2", "text": "#1C1A17", "accent": "#9A4B2F" },
 *         "dark":  { "canvas": "#161412", "text": "#EDE9E3", "accent": "#D98B6A" },
 *         "override": { "light": { "border-subtle": "#E4DFD8" } }   // optional, any token
 *       }
 *     ]
 *   }
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WHITE = '#FFFFFF';
const BLACK = '#000000';

/** Editor palette slugs (theme.json settings.color.palette), in order, with names and CSS role names. */
export const SLUGS = /** @type {const} */ ([
  ['canvas', 'Canvas', 'bg-canvas'],
  ['surface', 'Surface', 'bg-surface'],
  ['text-primary', 'Text', 'text-primary'],
  ['text-secondary', 'Text secondary', 'text-secondary'],
  ['text-muted', 'Text muted', 'text-muted'],
  ['border-subtle', 'Border subtle', 'border-subtle'],
  ['border-strong', 'Border strong', 'border-strong'],
  ['accent-primary', 'Accent', 'accent-primary'],
  ['accent-on', 'On accent', 'accent-on'],
  ['accent-soft', 'Accent soft', 'accent-soft'],
  ['success', 'Success', 'state-success'],
  ['critical', 'Critical', 'state-critical'],
  ['caution', 'Caution', 'state-caution'],
]);

/** Extra colours (settings.custom.<prefix>.color), not shown in the editor palette. */
export const CUSTOM = /** @type {const} */ ([
  ['accent-hover', 'accent-hover'],
  ['success-soft', 'state-success-soft'],
  ['critical-soft', 'state-critical-soft'],
  ['caution-soft', 'state-caution-soft'],
  ['shadow', 'shadow-color'],
  ['scrim', 'scrim'],
]);

/**
 * Contrast targets (WCAG 2): [foreground, backgrounds, minimum].
 * border-subtle is a decorative hairline and has no target; border-strong is
 * for input borders and controls (3:1).
 */
export const CHECKS = /** @type {const} */ ([
  ['text-primary', ['canvas', 'surface', 'accent-soft'], 4.5],
  ['text-secondary', ['canvas', 'surface'], 4.5],
  ['text-muted', ['canvas', 'surface'], 4.5],
  ['accent-primary', ['canvas', 'surface'], 4.5],
  ['accent-on', ['accent-primary', 'accent-hover'], 4.5],
  ['border-strong', ['canvas', 'surface'], 3],
  ['success', ['canvas', 'surface', 'success-soft'], 4.5],
  ['critical', ['canvas', 'surface', 'critical-soft'], 4.5],
  ['caution', ['canvas', 'surface', 'caution-soft'], 4.5],
]);

/** Desaturated state starting points (light mode). They stay quiet next to product photos. */
const STATES = { success: '#3F6B55', critical: '#A2463B', caution: '#8A6A2E' };

// ---------------------------------------------------------------- colour math

/** @param {string} hex */
export function hexToRgb(hex) {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Not a #RRGGBB colour: ${hex}`);
  }
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
}

/** @param {number[]} rgb */
export function rgbToHex(rgb) {
  return `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** WCAG 2 relative luminance. @param {string} hex */
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio (1 to 21). @param {string} a @param {string} b */
export function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** sRGB mix: `weight` of a, the rest of b. @param {string} a @param {string} b @param {number} weight */
export function mix(a, b, weight) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(x.map((c, i) => c * weight + y[i] * (1 - weight)));
}

/** HSL saturation, 0 to 1. @param {string} hex */
export function saturation(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return 0;
  }
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

/**
 * Move `color` toward `toward` in 1% steps until it reaches `ratio` on every background.
 * @param {string} color @param {string[]} backgrounds @param {number} ratio @param {string} toward
 */
export function ensureContrast(color, backgrounds, ratio, toward) {
  for (let step = 0; step <= 100; step += 1) {
    const candidate = mix(toward, color, step / 100);
    if (backgrounds.every((bg) => contrast(candidate, bg) >= ratio)) {
      return candidate;
    }
  }
  throw new Error(`No shade of ${color} reaches ${ratio}:1 on ${backgrounds.join(', ')}`);
}

/** @param {string} hex @param {number} alpha */
function rgba(hex, alpha) {
  return `rgba(${hexToRgb(hex).join(', ')}, ${alpha})`;
}

// ---------------------------------------------------------------- derivation

/**
 * A hover fill for a button with `label` text on `fill`.
 * @param {string} fill @param {string} label
 */
export function hoverFor(fill, label) {
  const labelIsLight = luminance(label) > luminance(fill);
  for (const toward of labelIsLight ? [BLACK, WHITE] : [WHITE, BLACK]) {
    for (let step = 4; step <= 60; step += 2) {
      const candidate = mix(toward, fill, step / 100);
      if (contrast(candidate, fill) >= 1.15 && contrast(candidate, label) >= 4.5) {
        return candidate;
      }
    }
  }
  throw new Error(`No hover fill for ${fill} keeps ${label} at 4.5:1`);
}

/**
 * Every token of one palette in one mode.
 * @param {{ canvas: string, text: string, accent: string }} input
 * @param {boolean} dark
 * @param {Record<string, string>} [override]
 * @returns {Record<string, string>}
 */
export function derive(input, dark, override = {}) {
  const away = dark ? WHITE : BLACK; // away from the page
  /** @type {Record<string, string>} */
  const c = {};

  // The style's colours are used as given; warnings() flags pure black and white.
  const canvas = input.canvas.toUpperCase();
  const text = input.text.toUpperCase();

  c.canvas = override.canvas ?? canvas;
  // One tonal step: a little deeper on a light page, a little lighter on a dark page.
  c.surface = override.surface ?? (dark ? mix(WHITE, c.canvas, 0.05) : mix(text, c.canvas, 0.035));
  c['text-primary'] = override['text-primary'] ?? text;

  const textBgs = [c.canvas, c.surface];
  c['text-muted'] = override['text-muted'] ?? ensureContrast(mix(text, c.canvas, 0.5), textBgs, 4.5, text);
  // Secondary text is at least 6:1 and clearly stronger than muted text.
  const secondaryTarget = Math.max(6, contrast(c['text-muted'], c.canvas) + 0.75);
  c['text-secondary'] = override['text-secondary'] ?? ensureContrast(mix(text, c.canvas, 0.7), textBgs, secondaryTarget, text);
  c['border-subtle'] = override['border-subtle'] ?? mix(text, c.canvas, dark ? 0.14 : 0.11);
  c['border-strong'] = override['border-strong'] ?? ensureContrast(mix(text, c.canvas, 0.3), textBgs, 3, text);

  c['accent-primary'] = override['accent-primary'] ?? ensureContrast(input.accent.toUpperCase(), textBgs, 4.5, away);
  c['accent-soft'] = override['accent-soft'] ?? mix(c['accent-primary'], c.surface, 0.1);

  // Text on the accent: a near-page tint or the text colour, whichever reads better.
  const lightOn = dark ? text : mix(WHITE, c.canvas, 0.7);
  const darkOn = dark ? c.canvas : text;
  const onCandidates = [lightOn, darkOn].sort((a, b) => contrast(b, c['accent-primary']) - contrast(a, c['accent-primary']));
  c['accent-on'] = override['accent-on'] ?? onCandidates[0];
  // Hover: the smallest visible step (1.15:1 from the accent) that keeps the label at 4.5:1.
  // First try away from the label, then toward it.
  c['accent-hover'] = override['accent-hover'] ?? hoverFor(c['accent-primary'], c['accent-on']);

  for (const [state, base] of Object.entries(STATES)) {
    let color = dark ? mix(WHITE, base, 0.45) : base;
    color = ensureContrast(color, textBgs, 4.5, away);
    const soft = override[`${state}-soft`] ?? mix(color, c.surface, dark ? 0.16 : 0.12);
    c[state] = override[state] ?? ensureContrast(color, [...textBgs, soft], 4.5, away);
    c[`${state}-soft`] = soft;
  }

  c.shadow = override.shadow ?? (dark ? BLACK : text);
  c.scrim = override.scrim ?? rgba(c.shadow, dark ? 0.6 : 0.4);
  return c;
}

/**
 * Failed WCAG contrast targets of one derived set. These block the build.
 * @param {Record<string, string>} c
 */
export function problems(c) {
  return CHECKS.flatMap(([fg, bgs, min]) =>
    bgs
      .map((bg) => [bg, contrast(c[fg], c[bg])])
      .filter(([, ratio]) => /** @type {number} */ (ratio) < min)
      .map(([bg, ratio]) => `${fg} on ${bg}: ${/** @type {number} */ (ratio).toFixed(2)}:1 (needs ${min}:1)`),
  );
}

/** Colour-style warnings: they never block, the chosen style may override them. @param {Record<string, string>} c */
export function warnings(c) {
  const out = [];
  if (contrast(c['accent-hover'], c['accent-primary']) < 1.15) {
    out.push('accent-hover is too close to accent-primary to show a hover');
  }
  for (const slug of ['canvas', 'surface', 'text-primary']) {
    if (saturation(c[slug]) > 0.3) {
      out.push(`${slug} is too saturated (${Math.round(saturation(c[slug]) * 100)}%): neutrals must be tinted, not coloured`);
    }
  }
  for (const state of Object.keys(STATES)) {
    if (saturation(c[state]) > 0.55) {
      out.push(`${state} is too saturated: state colours must stay muted`);
    }
  }
  if (c.canvas === BLACK) {
    out.push('canvas is pure black: a tinted near-black such as #111111 reads softer');
  }
  if ([BLACK, WHITE].includes(c['text-primary'])) {
    out.push('text-primary is pure black or white: a tinted off-black or off-white reads softer');
  }
  if (saturation(c.canvas) === 0 && saturation(c['text-primary']) === 0) {
    out.push('canvas and text are flat greys: tint them warm or cool toward the accent');
  }
  if (contrast(c['text-primary'], c.canvas) < 7) {
    out.push(`text-primary on canvas is ${contrast(c['text-primary'], c.canvas).toFixed(2)}:1; editorial body text reads best at 7:1 or more`);
  }
  return out;
}

// ---------------------------------------------------------------- config and output

/** @param {string} dir */
export function readConfig(dir) {
  const file = path.join(dir, 'design/palettes.json');
  if (!existsSync(file)) {
    throw new Error(`Missing ${file}`);
  }
  const config = JSON.parse(readFileSync(file, 'utf8'));
  if (!/^[a-z][a-z0-9-]*$/.test(config.prefix ?? '')) {
    throw new Error('design/palettes.json: "prefix" must be the theme slug (a-z, 0-9, -)');
  }
  if (!['light', 'dark', 'both'].includes(config.mode)) {
    throw new Error('design/palettes.json: "mode" must be "light", "dark" or "both"');
  }
  return config;
}

/** All modes a config needs. @param {{ mode: string }} config */
function modes(config) {
  return config.mode === 'both' ? ['light', 'dark'] : [config.mode];
}

/**
 * The derived sets of one palette: { light?, dark? }.
 * @param {any} palette @param {any} config
 */
export function derivePalette(palette, config) {
  /** @type {Record<string, Record<string, string>>} */
  const sets = {};
  for (const mode of modes(config)) {
    if (!palette[mode]) {
      throw new Error(`Palette ${palette.slug} has no "${mode}" colours`);
    }
    sets[mode] = derive(palette[mode], mode === 'dark', palette.override?.[mode]);
  }
  return sets;
}

/** The theme.json settings fragment of one palette. @param {any} palette @param {any} config */
export function settingsFor(palette, config) {
  const sets = derivePalette(palette, config);
  const main = config.mode === 'dark' ? sets.dark : sets.light;
  /** @type {Record<string, any>} */
  const color = Object.fromEntries(CUSTOM.map(([key]) => [key, main[key]]));
  if (config.mode === 'both') {
    color.dark = Object.fromEntries([...SLUGS.map(([slug]) => slug), ...CUSTOM.map(([key]) => key)].map((key) => [key, sets.dark[key]]));
  }
  return {
    palette: SLUGS.map(([slug, name]) => ({ slug, name, color: main[slug] })),
    // Keep every extra colour under a "color" key: WordPress keeps only colour
    // paths when it applies a colour-only variation from styles/colors.
    custom: { [config.prefix]: { color } },
  };
}

/** The dark-mode stylesheet for mode "both". @param {any} config */
export function schemeCss(config) {
  const p = config.prefix;
  const lines = [
    ...SLUGS.map(([slug]) => `  --wp--preset--color--${slug}: var(--wp--custom--${p}--color--dark--${slug});`),
    ...CUSTOM.map(([key]) => `  --wp--custom--${p}--color--${key}: var(--wp--custom--${p}--color--dark--${key});`),
    '  color-scheme: dark;',
  ].join('\n');
  return `/*
 * Dark colours. Written by scripts/palettes.mjs: do not edit by hand.
 *
 * The page follows the system setting. The shopper's choice in the header
 * toggle (data-${p}-scheme on <html>) wins over it.
 */
@media (prefers-color-scheme: dark) {
  :root:not([data-${p}-scheme='light']) {
${lines.replace(/^/gm, '  ')}
  }
}

:root[data-${p}-scheme='dark'] {
${lines}
}
`;
}

/** Files that `write` produces: [{ file, text }]. @param {string} dir */
export function outputFiles(dir) {
  const config = readConfig(dir);
  const files = [];
  const defaultPalette = config.palettes.find((p) => p.slug === config.default);
  if (!defaultPalette) {
    throw new Error(`design/palettes.json: default palette "${config.default}" is not in "palettes"`);
  }

  const themeFile = path.join(dir, 'theme.json');
  const theme = JSON.parse(readFileSync(themeFile, 'utf8'));
  const settings = settingsFor(defaultPalette, config);
  theme.settings ??= {};
  theme.settings.color ??= {};
  theme.settings.color.palette = settings.palette;
  theme.settings.custom ??= {};
  theme.settings.custom[config.prefix] ??= {};
  theme.settings.custom[config.prefix].color = settings.custom[config.prefix].color;
  files.push({ file: themeFile, text: `${JSON.stringify(theme, null, '\t')}\n` });

  if (config.keep) {
    for (const palette of config.palettes.filter((p) => p.slug !== config.default)) {
      const variation = {
        $schema: 'https://schemas.wp.org/trunk/theme.json',
        version: 3,
        title: palette.title,
        settings: { color: { palette: settingsFor(palette, config).palette }, custom: settingsFor(palette, config).custom },
      };
      files.push({ file: path.join(dir, 'styles/colors', `${palette.slug}.json`), text: `${JSON.stringify(variation, null, '\t')}\n` });
    }
  }

  if (config.mode === 'both') {
    files.push({ file: path.join(dir, 'resources/css/scheme.css'), text: schemeCss(config) });
  }
  return files;
}

// ---------------------------------------------------------------- preview

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

/** @param {Record<string, string>} c @param {string} label */
function previewCard(c, label) {
  const swatches = [...SLUGS.map(([slug]) => slug), 'accent-hover']
    .map((slug) => {
      const ratio = slug === 'canvas' ? '' : `${contrast(c[slug], c.canvas).toFixed(1)}:1`;
      return `<div class="sw"><span style="background:${c[slug]}"></span><b>${slug}</b><code>${c[slug]} ${ratio}</code></div>`;
    })
    .join('');
  const issues = problems(c);
  const notes = warnings(c);
  return `
  <div class="mode" style="--canvas:${c.canvas};--surface:${c.surface};--text:${c['text-primary']};--text2:${c['text-secondary']};--muted:${c['text-muted']};--line:${c['border-subtle']};--strong:${c['border-strong']};--accent:${c['accent-primary']};--on:${c['accent-on']};--hover:${c['accent-hover']};--soft:${c['accent-soft']};--caution:${c.caution};--caution-soft:${c['caution-soft']};--success:${c.success};--shadow:${c.shadow}">
    <p class="label">${label}</p>
    <div class="store">
      <header><strong>Store</strong><nav>New · Shop · Journal</nav><span>Bag (2)</span></header>
      <div class="grid">
        ${[0, 1]
          .map(
            (i) => `<article>
          <div class="frame"><svg viewBox="0 0 80 100" aria-hidden="true"><path d="M28 18 40 24l12-6 14 10-6 12-6-3v45H26V37l-6 3-6-12z" fill="${c['text-muted']}" opacity=".35"/></svg>${i === 0 ? '<em>Sale</em>' : ''}</div>
          <h3>${i === 0 ? 'Linen overshirt' : 'Wool trousers'}</h3>
          <p class="meta">${i === 0 ? '3 colours' : '<span class="ok">In stock</span>'}</p>
          <p class="price">${i === 0 ? '$89 <s>$120</s>' : '$140'}</p>
        </article>`,
          )
          .join('')}
      </div>
      <div class="actions"><button>Add to cart</button><button class="is-hover">Hover</button><a href="#">Size guide</a></div>
      <label class="field">Email<input value="name@example.com"></label>
    </div>
    <div class="swatches">${swatches}</div>
    ${issues.length ? `<ul class="bad">${issues.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="good">All contrast targets pass.</p>'}
    ${notes.length ? `<ul class="warn">${notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  </div>`;
}

/** @param {string} dir */
export function previewHtml(dir) {
  const config = readConfig(dir);
  const sections = config.palettes
    .map((palette, index) => {
      const sets = derivePalette(palette, config);
      return `<section><h2>${index + 1}. ${esc(palette.title)}${palette.slug === config.default ? ' <small>(default)</small>' : ''}</h2>
      ${palette.mood ? `<p class="mood">${esc(palette.mood)}</p>` : ''}
      <div class="modes">${Object.entries(sets).map(([mode, c]) => previewCard(c, mode)).join('')}</div></section>`;
    })
    .join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Palette preview</title>
<style>
  body { margin: 0; padding: 24px 16px 64px; font: 14px/1.5 system-ui, sans-serif; background: #F4F4F2; color: #1A1A19; }
  h1 { font-size: 24px; margin: 0 0 8px; } h2 { font-size: 20px; margin: 48px 0 4px; } .mood { margin: 0 0 16px; color: #555; }
  .modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 16px; }
  .mode { background: var(--canvas); color: var(--text); padding: 16px; border-radius: 8px; border: 1px solid var(--line); }
  .label { margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  .store header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--line); font-size: 13px; }
  .store nav { color: var(--text2); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
  .frame { position: relative; aspect-ratio: 4 / 5; background: var(--surface); border-radius: 4px; display: grid; place-items: center; }
  .frame svg { width: 55%; } .frame em { position: absolute; top: 8px; left: 8px; font: 500 11px/1 system-ui; font-style: normal; padding: 4px 8px; border-radius: 2px; background: var(--caution-soft); color: var(--caution); }
  h3 { font-size: 14px; margin: 8px 0 0; font-weight: 500; } .meta { margin: 0; color: var(--muted); font-size: 12px; } .ok { color: var(--success); }
  .price { margin: 4px 0 0; font-weight: 600; } .price s { color: var(--muted); font-weight: 400; margin-left: 4px; }
  .actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  button { font: 500 13px/1 system-ui; padding: 12px 20px; border: 0; border-radius: 4px; background: var(--accent); color: var(--on); }
  button.is-hover { background: var(--hover); } .actions a { color: var(--accent); }
  .field { display: grid; gap: 4px; margin-top: 16px; font-size: 12px; color: var(--text2); }
  .field input { font: inherit; font-size: 14px; padding: 8px 12px; border: 1px solid var(--strong); border-radius: 4px; background: var(--surface); color: var(--text); }
  .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 4px 12px; margin-top: 16px; font-size: 12px; }
  .sw { display: grid; grid-template-columns: 20px 1fr; column-gap: 8px; align-items: center; }
  .sw span { grid-row: span 2; width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--line); }
  .sw code { color: var(--muted); font-size: 11px; }
  .good { color: var(--success); font-size: 12px; } .bad { color: var(--text); background: var(--caution-soft); padding: 8px 8px 8px 24px; font-size: 12px; } .warn { color: var(--muted); font-size: 12px; }
  @media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
</style></head>
<body><h1>Palette preview · ${esc(config.prefix)}</h1><p>Mode: ${esc(config.mode)}. Ratios are against the canvas.</p>${sections}</body></html>
`;
}

// ---------------------------------------------------------------- CLI

function main() {
  const args = process.argv.slice(2);
  const command = args.find((a) => !a.startsWith('--')) ?? 'check';
  const dirFlag = args.indexOf('--dir');
  const dir = path.resolve(dirFlag >= 0 ? args[dirFlag + 1] : process.cwd());
  const config = readConfig(dir);

  const failures = config.palettes.flatMap((palette) =>
    Object.entries(derivePalette(palette, config)).flatMap(([mode, c]) => problems(c).map((x) => `${palette.title} (${mode}): ${x}`)),
  );

  if (command === 'preview') {
    const file = path.join(dir, 'design/palettes.html');
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, previewHtml(dir));
    console.log(`Wrote ${path.relative(dir, file)}`);
    if (failures.length) console.error(failures.join('\n'));
    return;
  }

  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }

  let stale = 0;
  for (const { file, text } of outputFiles(dir)) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : '';
    if (current === text) continue;
    stale += 1;
    if (command === 'check') {
      console.error(`Out of date: ${path.relative(dir, file)}`);
    } else {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
      console.log(`Wrote ${path.relative(dir, file)}`);
    }
  }
  if (command === 'check' && stale) {
    console.error('Run `npm run palettes`.');
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
