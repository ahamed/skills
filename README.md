# Skills

Agent skills for [Claude Code](https://docs.claude.com/en/docs/claude-code).
A skill is a folder with a `SKILL.md` file. Claude reads the skill when a
task matches its description, and then follows its steps.

## Table of contents

1. [Skills in this repository](#1-skills-in-this-repository)
2. [Installation](#2-installation)
3. [Usage](#3-usage)
4. [Requirements](#4-requirements)
5. [Repository layout](#5-repository-layout)
6. [Update and remove](#6-update-and-remove)
7. [License](#7-license)

## 1. Skills in this repository

| Skill | What it does |
|---|---|
| [`kirki-ecommerce-theme`](skills/kirki-ecommerce-theme/SKILL.md) | Plans and builds a WordPress block theme (FSE, `theme.json` v3, WordPress 6.8+) for a store that runs on the Kirki eCommerce plugin. |
| [`linkedin-post`](skills/linkedin-post/SKILL.md) | Writes a LinkedIn post that you can paste directly, and renders a matching 1200 × 627 banner image. |

### 1.1 kirki-ecommerce-theme

- Uses the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
  skill to find the top target styles, the palettes and the font pairings.
  If ui-ux-pro-max is not installed, the skill installs it globally.
- Gives a layout choice for each prime page (shop, product details, cart,
  drawer cart, checkout), with ASCII previews. Thus, two themes are different
  in layout, not only in colour.
- Previews 5 accessible palettes. WCAG contrast is a hard check.
- Has two phases, because a full store theme is too large for one session:
  - **Plan** writes `plan.md`, which has the decisions and one module for
    each part of the theme.
  - **Build** builds one module for each call, runs the checks, and records
    the result in `plan.md`.
- Makes a `screenshot.png` thumbnail for Appearance → Themes.

### 1.2 linkedin-post

- Asks about the topic, the audience, the angle and the language
  (ASD-STE100 or conversational English). It can also find a topic in your
  source code.
- Reads your earlier posts, so that a new post does not repeat one of them.
- Checks each claim against a file or a command output before it shows the
  post.
- Saves `content.md` and `banner.png` to
  `~/Resources/linkedin-posts/<topic-slug>/`.

## 2. Installation

Use one of these methods.

### 2.1 Claude Code plugin marketplace (recommended)

In Claude Code, run:

```text
/plugin marketplace add ahamed/skills
/plugin install ahamed-skills@ahamed-skills
```

To get updates later, run `/plugin marketplace update ahamed-skills`.
Plugin skills have the plugin name before them, for example
`/ahamed-skills:linkedin-post`.

### 2.2 The `skills` CLI

```bash
# All skills, for all your projects
npx skills add ahamed/skills -g

# One skill only
npx skills add ahamed/skills --skill linkedin-post -g
```

If you do not use `-g`, the CLI installs the skills into the current project
(`.claude/skills/`).

### 2.3 Manual copy

```bash
git clone https://github.com/ahamed/skills.git
mkdir -p ~/.claude/skills
cp -R skills/skills/kirki-ecommerce-theme skills/skills/linkedin-post ~/.claude/skills/
```

To install a skill for one project only, copy it into
`<project>/.claude/skills/`.

After you install a skill, start a new Claude Code session. Then type `/` to
make sure that the skill shows in the list.

## 3. Usage

| Skill | Command (plugin install: `/ahamed-skills:<skill>`) | Other prompts that start the skill |
|---|---|---|
| kirki-ecommerce-theme | `/kirki-ecommerce-theme` (plan), then `/kirki-ecommerce-theme build` (one module for each call) | "Make me a shop theme for Kirki eCommerce" |
| linkedin-post | `/linkedin-post` | "Write a LinkedIn post about …", "Pick a LinkedIn topic from this repo" |

## 4. Requirements

| Skill | Requirements |
|---|---|
| kirki-ecommerce-theme | Node.js 20+ and npm, Composer, Python 3 (for ui-ux-pro-max), a WordPress install with the Kirki eCommerce plugin. For the thumbnail: Chrome or Chromium, or Playwright through `npx`. |
| linkedin-post | Chrome, Chromium, Edge or Brave, or Node.js (the skill then uses Playwright through `npx`). Optional: the `asd-ste100` skill, for posts in Simplified Technical English. |

The linkedin-post skill reads your name and email for the banner footer from
`~/.claude/linkedin-profile.md`, or from `git config`. These values stay on
your computer.

## 5. Repository layout

```text
.
├── .claude-plugin/
│   ├── marketplace.json     the plugin marketplace (section 2.1)
│   └── plugin.json          the plugin, with the list of its skills
├── skills/
│   ├── kirki-ecommerce-theme/
│   │   ├── SKILL.md
│   │   ├── references/      read by the skill step by step
│   │   └── scripts/         palette generator and view parity helpers
│   └── linkedin-post/
│       ├── SKILL.md
│       └── scripts/         banner renderer
└── README.md
```

To add a skill, put a new folder with a `SKILL.md` file in `skills/`, and add
its path to `skills` in `.claude-plugin/plugin.json`. Then increase
`version` in the same file, so that plugin users get the update.

## 6. Update and remove

| Method | Update | Remove |
|---|---|---|
| Plugin | `/plugin marketplace update ahamed-skills` | `/plugin uninstall ahamed-skills@ahamed-skills` |
| `skills` CLI | `npx skills update -g` | `npx skills remove <skill> -g` |
| Manual | Pull the repository and copy the folders again | Delete `~/.claude/skills/<skill>/` |

## 7. License

[MIT](LICENSE)
