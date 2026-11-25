# ui-ux-pro-max: style, colours and fonts

This skill must use the `ui-ux-pro-max` skill for the target style, the
palette seeds and the font pairings. Its results win over this skill's
default colour and font rules. Only the hard limits in §5 stay.

## 1. Make sure it is installed

Do this in Phase 1, step 1, before the first question.

1. Look for `SKILL.md` in these folders, in this order:
   - `<project>/.claude/skills/ui-ux-pro-max/` (project local)
   - `~/.claude/skills/ui-ux-pro-max/` (global)
   Use the first one that you find. Call its folder `$UIPRO` in the commands
   below.
2. Check Python 3: `python3 --version` (or `python`, or `py -3`). If there
   is no Python 3, stop and tell the creator to install it. The search
   script needs it.
3. If the skill is not found, tell the creator that this skill needs
   `ui-ux-pro-max`, and that you will install it globally. Then run:

   ```bash
   cd ~ && npx -y uipro-cli@latest init --ai claude
   ```

   `uipro init` installs into `<current folder>/.claude/skills/`. Run it
   from the home folder, so that the skill goes to
   `~/.claude/skills/ui-ux-pro-max/`.
   If `npx` is not available or the command fails, use this fallback:

   ```bash
   tmp="$(mktemp -d)" \
     && git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill "$tmp/uipro" \
     && mkdir -p ~/.claude/skills \
     && cp -R "$tmp/uipro/.claude/skills/ui-ux-pro-max" ~/.claude/skills/ \
     && rm -rf "$tmp"
   ```

4. Make sure that it works:
   `python3 "$UIPRO/scripts/search.py" "ecommerce" --domain style -n 1`.
   If this fails, stop and tell the creator. Do not continue without the
   skill, and do not invent style data.

Read `$UIPRO/SKILL.md` once per session for its query rules. Do not send
private project data (paths, the creator's name, client names) in a query.

## 2. Build the query

Make one query from the answers so far:

- the niche and the audience (discovery step 1),
- the free-text description, if the creator gave one (in the request or in an
  answer): take 2 to 4 strong words from it (for example "handmade",
  "earthy", "playful", "premium"),
- always the word `ecommerce`.

Keep the query at 3 to 6 words, for example
`ecommerce handmade ceramics earthy calm`.

## 3. Find the top target styles (discovery step 2)

Run both commands:

```bash
python3 "$UIPRO/scripts/search.py" "<query>" --design-system -p "<working title>"
python3 "$UIPRO/scripts/search.py" "<query>" --domain style -n 8 --json
```

Then make the shortlist:

1. Put the style from `--design-system` first. It is the recommended style.
2. Add the next styles from the style search, without duplicates (compare the
   `Style ID`).
3. Remove a style if its `Status` is not `active`, or if its `Accessibility`
   says `risk:high`.
4. Keep the 4 best fits for a store. A good store style lets the product
   photos carry the page: prefer styles whose `Best For` names e-commerce,
   retail, luxury, lifestyle or the niche.
5. If fewer than 4 remain, retry once with a narrower query (for example
   `ecommerce <niche>` only). If that also gives too few, show the ones that
   you have, and say that the search found no more matches.

Ask with AskUserQuestion: one option per style. The label is the
`Style Category`. The first option has "(Recommended)". The description has
the keywords in a few words and one line about why it fits the niche. The
creator can type their own style ("Other"). If they do, search it with
`--domain style` and use the top match.

Record in `plan.md` → Decisions: the `Style ID`, the category, and the
query.

## 4. Use the chosen style later

After the creator picks a style, run the design system again with the
chosen style in the query, and save it in the theme:

```bash
python3 "$UIPRO/scripts/search.py" "<query> <style category>" --design-system --persist \
  -p "<Theme name>" --output-dir "<theme>/design"
```

This writes `<theme>/design/design-system/<theme-slug>/MASTER.md`. If the file
exists already, read it, and do not use `--force` unless the creator says so.
Each build session reads `MASTER.md` before it builds a store page.

The design system feeds these discovery steps:

| Discovery step | What to take from ui-ux-pro-max |
|---|---|
| 6. Palettes | Palette 1 comes from the `--design-system` colours. Palettes 2 to 5 come from `"<query> <style>" --domain color -n 6`. See the mapping in §4.1. |
| 9. Typography | The `--design-system` pairing first, then `"<style> <niche>" --domain typography -n 6`. Filter by licence (§5). |
| 8a. Layouts | The style keywords, `Key effects` and `Avoid` lines decide the composed layout option (see `layouts.md` §2). |
| Build | `MASTER.md` and its `Pre-delivery checklist` are part of each store module's "Done when". |

### 4.1 Colour mapping into `design/palettes.json`

`palettes.mjs` takes three inputs per mode. Map the ui-ux-pro-max colours
like this:

| ui-ux-pro-max | `palettes.json` |
|---|---|
| Background | `canvas` |
| Foreground | `text` |
| Accent/CTA (if none, Primary) | `accent` |
| Card | `override.surface` (only if it differs from Background) |
| Border | `override.border-subtle` |
| Destructive | `override.critical` |

Do not change a ui-ux-pro-max colour for taste. Change it only when a hard
check in §5 fails. The generator moves the accent and the derived colours
(muted text, borders, states) until they pass. If `canvas`, `text` or an
override fails, move that colour yourself in small lightness steps, and keep
its hue. Write each change in the palette `mood` line, for example
"text darkened from #475569 for 4.5:1".

For a dark mode that ui-ux-pro-max does not give, use the same hue and follow
`color-system.md` §6 (dark-mode notes).

## 5. Hard limits (they win over ui-ux-pro-max)

These are the only rules that the style cannot change:

- **WCAG contrast.** Text 4.5:1, large text and UI parts (input borders,
  focus ring) 3:1. `palettes.mjs` fails on these. Every other colour rule
  only warns.
- **Fonts.** A GPL-compatible licence (OFL, Apache 2.0, or another
  GPL-compatible licence). Look it up in `$UIPRO/data/google-font-licenses.json`.
  If the top pairing fails, take the next one. Self-host the fonts. Never
  load them from the Google Fonts URL or the `@import` line in the output.
  WordPress.org themes must not load fonts from a CDN.
- **Accessibility and UX rules** in `design-rules.md` (44px targets, focus,
  labels, reduced motion) and the ui-ux-pro-max priority 1 and 2 rules.
- **The Kirki eCommerce view contract** (`kirki-ecommerce.md` §1).
