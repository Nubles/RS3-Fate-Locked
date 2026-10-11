# Fate Locked Ironman

A companion tracker for the **Fate Locked Ironman** challenge mode in **RuneScape 3 (RS3)** — a "snowball" restriction run where your account starts with *everything* locked, and Fate decides what you unlock.

**Live app:** https://nubles.github.io/RS3-Fate-Locked/

## The concept

You begin as a fresh Ironman with nothing: no skills past level 1, no equipment slots, no map regions, no transport. To progress you:

1. **Farm Keys** — complete in-game tasks (Slayer tasks, Clue scrolls, quests, diaries, levels) and roll against their drop rate.
2. **Spend Keys** — cash Keys in on a content table (Skills, Equipment, Regions, Bosses, Minigames…) to unlock a random entry.
3. **Snowball** — each unlock opens up new tasks, which earn more Keys.

## The RS3 mode

Everything in the tables is RuneScape 3 content:

- **All 29 skills** — including Constitution (starts at 10), Summoning, Dungeoneering, Divination, Invention, Archaeology and Necromancy — unlocked in level tiers.
- **RS3 regions** — Misthalin is the free starting area; every other continent is locked: Asgarnia, Kandarin, Karamja, the Kharidian Desert (incl. Menaphos), Morytania, Fremennik Province, Tirannwn (incl. Prifddinas), the Wilderness, Daemonheim, Anachronia, the Arc and the outlying islands (Ape Atoll, Zanaris, Mazcab, Everlight…).
- **RS3 Slayer masters** — Turael/Spria/Jacquelyn, Vannaka, the Raptor, Mazchna, Chaeldar, Sumona, Duradel/Lapalok, Kuradal, Morvran, Laniakea and Mandrith, plus Reaper (boss) assignments. Clue scrolls run Easy → Master.
- **RS3 bossing** — God Wars Dungeon 1 & 2, Elite Dungeons (Temple of Aminishi, Dragonkin Laboratory, The Shadow Reef), Raids (Liberation of Mazcab), Zamorakian Undercity, Vorago, Telos, Solak, Araxxor, Arch-Glacor, Kerapac, Rasial, Sanctum of Rebirth and more.
- **RS3 equipment tiers** — nine Fate tiers from Bronze/Iron up to tier 92-95 Masterwork / Elite Tectonic / Elite Sirenic / Elite Malevolent / tier 95 Necromancy gear.
- **RS3 unlocks** — Distractions & Diversions, minigames, transport (lodestones, fairy rings, spirit trees…), Player-Owned House, guilds and Slayer rewards.

Bad luck is cushioned by **Fate Points** (a pity timer) and the **Void Altar**, where Fate Points can be spent on rituals. Rare **Omni-Keys** let you pick an unlock directly; **Chaos Keys** unlock from any table at random.

## Features

- **In-app Codex** — a full rulebook covering the Key Economy (every way to earn and spend keys, with a worked example), drop rates, game modes, the Void Altar, region bonuses, and equipment tiers. It renders from one typed source (`config/economy.ts`) that a consistency test pins to the engine's drop rates, so the rules you read always match the rules the game runs.
- **Farm Keys** — Slayer master & Clue scroll roll cards with animated rolls, plus pointers to skill/journal/collection-log rolling.
- **Spend Keys** — gacha-style unlock tables with reveal animations.
- **Progression Dashboard** — Character (equipment tiers, skills), World (interactive region map), Activities & Utility (bosses, minigames, guilds… with region tags), Journal (quests, diaries, combat achievements), and Collection Log.
- **Game Modes** — Vanilla, Casual, Hardcore, Region Rush, and a fully tunable Custom mode. The mode is chosen at the start of a run and locked in permanently.
- **Region modifiers** — in Region Rush, every continent you unlock grants a passive bonus.
- **Region map authoring** — paint custom region/chunk layouts, export/import as JSON.
- **Integrity & verification** — a tamper-evident hash chain over the run history, a deterministic run ID, invariant replay, and exportable verified bundles, so a completed run can be shared and checked.
- **Shareable run card & timelapse** — generate an image of your run, or play its history back as a narrated timelapse.
- **Profiles** — multiple independent runs in one browser.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Recharts · Vitest

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. All state is stored in the browser's `localStorage` — no backend, no API keys.

## Other scripts

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
npm test          # run the test suite (Vitest)
npm run test:watch
```

## Deployment

The app deploys to **GitHub Pages** automatically via `.github/workflows/deploy.yml` on every push to `main` — it installs dependencies, runs the tests, builds, and publishes. The build's base path is derived from the repository name, so it works regardless of what the repo is called.

To enable it on a fresh fork: **Settings → Pages → Build and deployment → Source → "GitHub Actions"**.

## Maintainer docs

- [`docs/RESOURCE_ENGINE.md`](./docs/RESOURCE_ENGINE.md) — the Resource Engine: data shape, the supply-chain analyzer, the three wiki-sourced generator scripts (`scripts/buildCraftables.mjs`, `scripts/buildPotions.mjs`, `scripts/buildSourceEnrichment.ts`), the enrichment merge pattern, the integrity-test contract, and the workflow for adding curated items.

## Client plugins

The Old School version shipped a RuneLite plugin; RuneLite is OSRS-only, so the RS3 mode does not include one. An [Alt1 Toolkit](https://runeapps.org/alt1) app would be the RS3 equivalent and is not built yet.

## Known limitations

- The world map is the RS3 map (mainland incl. Menaphos, Prifddinas, Fort Forinthry and the Daemonheim peninsula, plus Anachronia), stitched from the RuneScape Wiki maps project's cache-rendered tiles by mejrs (`scripts/build-rs3-map.py`). The Arc (far north) and Havenhythe (not in that tile set yet) aren't drawn and are listed in an "Off the map" panel; instanced areas (Daemonheim floors, Zanaris, Mazcab, …) are list-only too.
- Shooting stars: RS3 telescopes announce a region, not a site, so the map's **Star sites** layer shows every region's landing sites (`public/star-sites.json`, per the RuneScape Wiki) and highlights the announced region. RS3 has no public live-star feed, so none is built in; a feed returning `[{ world, region, size?, earliest?, latest?, site? }]` with CORS can be set via the layer's *feed* button (saved in `localStorage` as `fate_star_feed`) or `VITE_STAR_FEED` at build time.
- The Equipment Lab's Gear view, DPS calculator and the Boss Kill Planner use a bundled, curated RS3 dataset (`data/rs3Gear.ts`, `data/rs3Bosses.ts`) and the RuneScape Wiki's ability-damage and hit-chance formulas. DPS is an estimate: each global cooldown averages a chosen rotation multiplier (basic / Revolution / advanced), and Necromancy affinities are estimated where the wiki doesn't list them.
- The RS3 hiscores do not allow cross-origin requests from a browser, so Auto-Roll falls back to pasting your levels when the lookup is blocked.

## Disclaimer

RuneScape and its assets are © Jagex Ltd. This is an unofficial fan-made tool and is not affiliated with Jagex.
