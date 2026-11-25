/**
 * Override parity record (views/.parity.json).
 *
 * The record maps each Kirki eCommerce view that the theme overrides to the
 * SHA-256 of the plugin file it was copied from, plus the plugin version at
 * that time. The test fails when the plugin view changes, so the copy is
 * reviewed before it drifts.
 *
 * The plugin folder is KIRKI_ECOMMERCE_DIR, or ../../plugins/kirki-ecommerce
 * (the theme is in wp-content/themes/<slug>).
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const THEME_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const THEME_VIEWS = path.join(THEME_DIR, 'views');
export const PLUGIN_DIR = path.resolve(process.env.KIRKI_ECOMMERCE_DIR ?? path.join(THEME_DIR, '../../plugins/kirki-ecommerce'));
export const PLUGIN_VIEWS = path.join(PLUGIN_DIR, 'resources/views');
export const RECORD_FILE = path.join(THEME_VIEWS, '.parity.json');

/** Every overridden view, relative to the views folder, sorted. */
export function overriddenViews(dir = THEME_VIEWS, prefix = '') {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        return overriddenViews(path.join(dir, entry.name), relative);
      }
      return entry.name.endsWith('.php') ? [relative] : [];
    })
    .sort();
}

export function pluginHash(view) {
  const file = path.join(PLUGIN_VIEWS, view);
  return existsSync(file) ? createHash('sha256').update(readFileSync(file)).digest('hex') : null;
}

export function pluginVersion() {
  const header = readFileSync(path.join(PLUGIN_DIR, 'kirki-ecommerce.php'), 'utf8');
  return /Version:\s*([^\s*]+)/.exec(header)?.[1] ?? 'unknown';
}

export function readRecord() {
  return existsSync(RECORD_FILE) ? JSON.parse(readFileSync(RECORD_FILE, 'utf8')) : { views: {} };
}

/** Views whose plugin file changed, disappeared, or has no record. */
export function parityProblems(record = readRecord()) {
  const problems = [];
  for (const view of overriddenViews()) {
    const hash = pluginHash(view);
    const entry = record.views?.[view];
    if (hash === null) {
      problems.push(`${view}: the plugin no longer has this view`);
    } else if (!entry) {
      problems.push(`${view}: no parity record`);
    } else if (entry.sha256 !== hash) {
      problems.push(`${view}: the plugin view changed since the copy from ${entry.pluginVersion}`);
    }
  }
  return problems;
}
