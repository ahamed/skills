---
name: linkedin-post
description: Write a ready-to-paste LinkedIn post (strong hook, short paragraphs, ◆ bullets, hashtags) and a matching 1200×627 banner image, saved to ~/Resources/linkedin-posts/<topic-slug>/. Asks clarifying questions about the topic first, or picks a topic by reading the user's code. Use this whenever the user wants to write, draft, or create a LinkedIn post, share something on LinkedIn, announce a launch/job/milestone/lesson on LinkedIn, turn an idea, article, PR, or experience into a LinkedIn post, or needs a LinkedIn banner/post image — even if they only say "post this on LinkedIn" or "help me write something for LinkedIn".
---

# LinkedIn Post

Turn a topic into two things a person can publish right away:

1. `content.md` — the post text, ready to paste into LinkedIn.
2. `banner.png` — a 1200×627 image that goes with the post.

Both go in `~/Resources/linkedin-posts/<topic-slug>/`.

The single most important quality bar: **it must read like a real person wrote it and a real designer made the image.** LinkedIn readers scroll past anything that smells like AI filler within a second. Every rule below serves that goal or readability.

## Workflow

1. Get the topic and description
2. Check previous posts
3. Clarify with `AskUserQuestion`
4. Resolve the author details
5. Write the post
6. Design and render the banner
7. Save, check, and present

---

## 1. Get the topic and description

The user should give a **topic** (what the post is about) and a **description** (the substance: what happened, what they learned, what they want to say). If either is missing or too thin to write from, ask for it in plain text before doing anything else. A one-line topic with no description is not enough — a post without real substance becomes generic.

### When the user asks you to pick the topic

If the user asks you to choose the topic (for example "pick an interesting topic from this project"), find it in the **source code**. Read how the code works, so the post's substance comes from the mechanism itself.

1. Do step 2 (check previous posts) first, so you do not offer a topic an earlier post already covers.
2. Read the code: the module layout, core classes, build scripts, config, bundled libraries, tests, and the comments that explain a non-obvious choice. If the user names an area (a feature, a package, "architecture"), start there.
3. Look for a **mechanism** a developer would not expect: a design decision with a clear reason, a gotcha the code works around, a platform constraint that shaped the code, or a small piece of code that does a lot.
4. Take topics only from the code. Leave `git log`, commit messages, PR titles, and changelogs out of the search: they tell what changed, not how or why it works. Design docs in the repository (for example OpenSpec proposals) are fine to read after the code, to confirm the reason behind a choice.
5. Offer 3–4 topics with `AskUserQuestion`. Each option names the file or module and states its surprising fact in one line. Put your recommendation first.

This step is done when every offered topic points to a file you read. The chosen topic plus the facts from the code become the description. Step 5's "Validate every claim" checks the draft against those files.

## 2. Check previous posts

Before you plan the new post, read the posts this skill made before, so the new post does not duplicate one of them.

1. List the folders in `~/Resources/linkedin-posts/`. Each folder is one earlier post. If the directory does not exist or is empty, skip this step.
2. Read each `content.md` (and look at `banner.png` when the topic is close). Note the topic, the hook, the key takeaway, the concrete example, and the banner headline, eyebrow, and icon.
3. Compare them with the new topic and description:
   - **Same topic and same angle** — tell the user which earlier post it repeats (give the folder path) and ask whether to take a new angle, write a follow-up that builds on the earlier post, or stop.
   - **Related topic** — keep the new post. Use a different hook, a different example, a different takeaway, and a different banner headline and icon. Do not reuse sentences or phrases from the earlier post. A short reference to the earlier post ("Last week I wrote about X…") is fine when it helps.
   - **Unrelated topic** — continue. Still do not reuse a hook pattern or a banner headline that an earlier post already used.

Use what you learn here in step 3: offer angles that the earlier posts did not cover.

## 3. Clarify with AskUserQuestion

Use the `AskUserQuestion` tool to fill the gaps that would otherwise force you to guess. Good posts come from specifics, so this step is where the post's quality is decided.

Ask **one round of 2–4 questions**. Only ask what the topic and description did not already answer. Typical gaps:

- **Goal** — share a lesson, announce something, start a discussion, hire, promote a product?
- **Audience** — who should stop scrolling? (developers, founders, recruiters, customers…)
- **Angle / key takeaway** — the one thing a reader should remember.
- **Concrete detail** — a number, a moment, a mistake, a before/after. Offer options inferred from the description and let "Other" capture their own.
- **Tone** — reflective, direct, playful, celebratory.
- **Call to action** — a question to readers, a link in comments, none.

**Language** is the one question you always ask, unless the user already chose. Ask whether to write the post in **ASD-STE100** (Simplified Technical English) or in **conversational English**. Recommend ASD-STE100 for a technical post for developers, and conversational English for any other post. The answer decides whether you run "Apply ASD-STE100" in step 5.

Make every option specific to *this* topic (not generic placeholders), put your recommended option first with "(Recommended)" in its label, and keep option descriptions short. If the answers open a real new ambiguity, one short follow-up round is fine; otherwise move on.

## 4. Resolve the author details

The banner footer needs the author's **name** (mandatory) plus **designation** and/or **email**.

Look in this order and stop as soon as you have a name plus at least one of designation/email:

1. `~/.claude/linkedin-profile.md` — simple `key: value` lines:
   ```
   name: Jane Doe
   designation: Senior Software Engineer
   email: jane@example.com
   ```
2. `git config --global user.name` and `git config --global user.email`.

Only if that still leaves you without a name, or with a name but neither designation nor email, ask the user (one `AskUserQuestion` or a short plain-text question — whatever fits; you can fold it into step 3's round to save the user a turn). Ask only for what is missing. Never invent a designation.

If you had to ask, offer to save the answers to `~/.claude/linkedin-profile.md` so next time needs no questions.

## 5. Write the post

### The hook (first 1–2 lines)

LinkedIn shows roughly the first 200 characters before "…see more". The hook's only job is to earn that click. Make it short (under ~15 words per line), specific, and slightly surprising. Good hooks usually do one of these:

- State a concrete, counter-intuitive result: "We deleted 40% of our tests. Bugs went down."
- Open mid-story: "At 2 a.m. the payment webhook failed for the third time."
- Name a specific tension the audience feels: "Code review isn't slow. Waiting for code review is."
- Lead with a real number or admission: "I rejected my best candidate last year. Here's what I got wrong."

Avoid hooks that are vague ("Let's talk about productivity"), clickbait the post can't pay off, or questions with obvious answers ("Want to be more productive?").

### The body

- **Paragraphs of 1–3 sentences.** Put one blank line between every paragraph. Mobile readers see a wall of text otherwise.
- **Bullets when there's a list** (steps, lessons, comparisons) — use the diamond `◆` (U+25C6) followed by a space, one bullet per line, no blank lines between bullets of the same list. LinkedIn has no rich text, so markdown `-`, `*`, `**bold**`, or `#` headings show up as raw symbols — never use them. Only bullet when content is genuinely list-shaped; don't chop a story into bullets.
- **Length:** usually 120–250 words. Shorter is better if the idea is complete. Cut any sentence that doesn't add a fact, a feeling, or a turn.
- **End** with a single line: the takeaway, or a specific question readers can actually answer from their own experience ("What's the oldest test in your codebase that still catches bugs?" — not "Thoughts?").

### Hashtags

After the last line, add one blank line and then **3–5 hashtags on one line**, inferred from the post's actual content: mix one or two broad tags (#SoftwareEngineering) with specific ones (#WordPress, #CodeReview). Use CamelCase for multi-word tags so they're readable and accessible. No hashtags inside the body.

### Make it sound human

Write the way the author would talk to a smart colleague. These patterns mark text as AI-written — avoid them:

- Stock openers/closers: "In today's fast-paced world", "Let's dive in", "Here's the thing", "Buckle up", "Game-changer", "Unlock", "Leverage", "Navigate the landscape", "In conclusion", "Thoughts?", "Agree?"
- Inflated words: delve, tapestry, realm, pivotal, robust, seamless, elevate, testament, journey (unless literal), transformative.
- Formulaic structures used reflexively: "It's not X. It's Y.", tidy rule-of-three lists in every sentence, every paragraph ending in a punchline, rhetorical question followed by its own answer.
- Em-dash overuse (use at most one), emoji sprinkled on every line (zero or one or two total, only if they fit the author's voice), "🚀" and "💡" especially.
- Hedge-free universal claims ("Every developer should…"). Real people speak from their own experience: "I", "we", "on our team".

Prefer: concrete nouns and numbers, the author's own experience, plain verbs, a little imperfection or opinion. Vary sentence length. Contractions are fine.

Before moving on, reread the draft as a skeptical reader. If any sentence could appear unchanged in a post about a different topic, rewrite or cut it.

### Apply ASD-STE100

Do this only when the user chose ASD-STE100 in step 3.

1. Load the `asd-ste100` skill. If it is not installed, tell the user, and write the post in conversational English. Use its **STE-flavored** mode: apply the structural rules in full, and use the lexical rules as advice only.
2. Rewrite the post text, the banner eyebrow, the banner subtitle, and the banner headline under those rules. Keep the author's voice ("I", "we"), the hook, the ◆ bullets, and the hashtags. Keep code, file names, class names, and error messages exactly as they are.
3. Run the linter on the post text: `python3 -I <asd-ste100-dir>/scripts/ste-lint.py <content.md>`, where `<asd-ste100-dir>` is the folder of the `asd-ste100` skill. Fix each hard violation, or keep the sentence and name the reason in step 7's fact check.

This step is done when the linter shows 0 hard violations, or each violation that remains has a reason. Then validate the claims below. An STE rewrite can change a claim, so validation always comes after it.

### Validate every claim

Developers test the post against what they know. One wrong detail, repeated in the comments, costs the author more than the post earns. So before you design the banner, validate the draft claim by claim:

1. **List the claims.** Every sentence that states a fact is a claim: a name, a number, a path, a code snippet, an error message, an order of events, a cause and its effect, or how a tool (PHP, Composer, WordPress, React…) behaves.
2. **Find evidence for each claim.** Evidence is a `file:line` you read in this session, or the output of a command you ran. For a claim about how a tool behaves, read that tool's code (for example `vendor/composer/ClassLoader.php`) or its official docs. A memory of how it works is not evidence.
3. **Match the exact effect.** Each verb names the effect the evidence shows. If the code shows a fatal error, write "crash", not "shadow" or "break". Quote code, names, and error messages character for character, or mark a snippet as simplified.
4. **Match the tense.** A failure that happened is an incident ("broke"). A risk the code prevents, or a bug found before release, is a risk ("could", "would have"). Before/after claims name what really came before.
5. **Fix or cut.** Rewrite a claim until the evidence supports it. Cut a claim you cannot support. Do not soften it into a vague sentence.

This step is done when every claim has evidence. Keep the list of claims and evidence for step 7.

## 6. Design and render the banner

### Size and format

1200 × 627 px (LinkedIn's shared-image size). Write the banner as a self-contained HTML file with inline CSS, then render it to PNG with the bundled script. `<skill-dir>` is the folder that contains this `SKILL.md` (it differs for a global, a project and a plugin install):

```bash
bash <skill-dir>/scripts/render_banner.sh <banner.html> <out-dir>/banner.png
```

The script uses headless Chrome (falls back to Playwright via npx), waits for web fonts, and outputs exactly 1200×627. Write the HTML to a temporary location (e.g. a scratchpad dir or `mktemp -d`), not into the post folder — the folder should contain only `content.md` and `banner.png`.

In the HTML: set `html, body { margin:0; width:1200px; height:627px; overflow:hidden }` and use `box-sizing: border-box`. Google Fonts via `<link>` work.

### Design principles

Every banner uses one **house style**: a dark developer-tool look (deep navy, a faint grid, one teal accent, bold sans type, and one meaningful line icon). Keep this style the same on every post, so the author's posts are recognizable in the feed. Change only the words, the icon, and the tags.

#### Palette (use these exact values)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b1326` | Page background (deep navy) |
| `--grid` | `rgba(148,163,184,0.06)` | 1 px grid lines, 40 px cells, over the whole background |
| `--fg` | `#ffffff` | Headline line 1 |
| `--accent` | `#2dd4bf` | Eyebrow, headline line 2, icon stroke |
| `--muted` | `#a3b1c6` | Subtitle |
| `--pill-bg` | `#111a2e` | Tag pill fill |
| `--pill-border` | `rgba(148,163,184,0.25)` | Tag pill border |
| `--pill-fg` | `#dbe3ee` | Tag pill text |
| `--footer` | `#6b7a90` | Author footer |

Do not add other colors. The only allowed gradient is one soft radial glow of the accent (about 12–18% opacity, fading to transparent) behind the icon.

#### Typography

- Headline, subtitle, pills, footer: **Inter** (Google Fonts). Headline weight 800, about 60–68 px, line-height 1.08, letter-spacing about -0.03em.
- Eyebrow: **JetBrains Mono** 500, about 20 px, in `--accent`. Use a short, lowercase, code-like label when it fits (a package name, a file path, a function name), e.g. `themeum/framework`, `inventory.reserve()`.
- Subtitle: Inter 400, about 22 px, line-height 1.45, max 2 lines, in `--muted`.
- Set `font-variant-ligatures: none` on any monospace text, so `>=` or `!=` do not turn into one symbol.

#### Layout (1200 × 627)

- **Left column (about 60% wide), left-aligned, from top to bottom:**
  1. Eyebrow (mono, accent).
  2. Headline in **two short lines**: line 1 in `--fg` states the subject, line 2 in `--accent` states the payoff. Each line is 2–5 words and ends with a period. Example: "Build WordPress plugins." / "Secure by default."
  3. Subtitle: one plain sentence that says what the post is about.
  4. Optional: one row of **3–5 tag pills** (fully rounded, 1 px border, about 17 px text) that name real concepts from the post. If the pills do not add information, leave them out.
- **Right column (about 30% wide):** **one large icon**, vertically centered, with the soft accent glow behind it.
- **Footer:** at the bottom-left, Inter about 16 px, in `--footer`: `Name · Designation · Email`, separated by a middle dot `·` with spaces. Omit missing parts cleanly (`Name · Email`). Keep at least 28 px between the pills and the footer.
- Margins: at least 72 px left and right, and at least 56 px top and bottom.

#### The icon

- Use **one** icon only, and make it mean the post's core idea: a shield for security, a database cylinder for data or SQL, a padlock or two crossing arrows for concurrency, a branch for git, a gauge for performance, a clock for scheduling.
- Draw it as inline SVG, about 260–320 px tall: an outer shape with a thick `--accent` stroke (about 6–8 px), an optional inner outline of the same shape at about 35% opacity, a dark teal tint fill (accent at about 8–12% opacity), and a small white glyph in the center (for example `</>`, a lock, a check, a short code token).
- Do not use generic icons (rocket, lightbulb, brain, gears, sparkles), stock clip-art, icon fonts, or emoji. Do not put icons in the pills, the eyebrow, or the footer.

#### Avoid

- More than one icon, or more than one row of pills.
- Extra text blocks beyond eyebrow, two-line headline, subtitle, pills, and footer.
- Colors outside the palette, purple-to-blue or neon gradients, glowing blobs other than the one icon glow, glassmorphism, lens flares.
- Centered layouts and gradient-filled text.

### Check the render

After rendering, **look at the PNG** with the Read tool. Check: nothing overflows or gets clipped, the headline wraps nicely (no single orphan word on the last line), the footer is legible, the colors match the palette, there is exactly one icon and it clearly means the post's idea, the whole thing feels balanced and calm, and it obviously relates to the post. Fix the HTML and re-render until it passes — usually one or two passes.

## 7. Save, check, and present

**Folder:** `~/Resources/linkedin-posts/<topic-slug>/` where the slug is the topic in lowercase, non-alphanumeric characters replaced by `-`, repeated dashes collapsed, no leading/trailing dash (e.g. "Why We Ditched Redux!" → `why-we-ditched-redux`). Create it if missing. If it already exists with files in it, ask before overwriting (or offer a `-2` suffix).

**content.md** contains only the post text exactly as it should be pasted: hook, body, blank line, hashtags. No title, no front matter, no markdown formatting.

**Final checks on the post:**
- Hook fits in the first ~200 characters.
- No paragraph longer than 3 sentences; blank line between paragraphs.
- Bullets (if any) use `◆ `, no markdown symbols anywhere.
- 3–5 hashtags on the last line.
- None of the AI-tell phrases above.
- The hook, takeaway, example, and banner headline do not repeat an earlier post in `~/Resources/linkedin-posts/`.
- If the user chose ASD-STE100, `ste-lint.py` shows 0 hard violations on the final `content.md`, or each violation that remains has a reason.
- Every claim in the final text, including the banner subtitle and pills, passed "Validate every claim". If you edited the text after that step, validate the changed sentences again.

**Present** to the user:
- The post text in a fenced code block (so it copies cleanly).
- A short **fact check**: one line per key claim with its evidence (`file:line` or command). Name any claim you softened or cut, and why.
- The banner image path (and show it if your interface can).
- The folder path.
- Offer one round of tweaks (tone, length, hook alternatives, banner icon or tags).
