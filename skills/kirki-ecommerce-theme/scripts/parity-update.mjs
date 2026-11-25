/**
 * Record the current plugin view hashes for every override.
 *
 * Run `npm run parity:update` after you copy a view, or after you review a
 * changed plugin view and bring the theme copy up to date. Entries that did
 * not change keep their version.
 */

import { writeFileSync } from 'node:fs';

import { overriddenViews, pluginHash, pluginVersion, readRecord, RECORD_FILE } from './parity.mjs';

const previous = readRecord().views ?? {};
const version = pluginVersion();
const views = {};

for (const view of overriddenViews()) {
  const sha256 = pluginHash(view);
  if (sha256 === null) {
    console.error(`Skipped ${view}: the plugin has no view with this path.`);
    continue;
  }
  const kept = previous[view]?.sha256 === sha256 ? previous[view].pluginVersion : version;
  views[view] = { sha256, pluginVersion: kept };
}

writeFileSync(RECORD_FILE, `${JSON.stringify({ views }, null, 2)}\n`);
console.warn(`Recorded ${Object.keys(views).length} views against Kirki eCommerce ${version}.`);
