# Keeping the app up to date with new RuneScape 3 content

> *"Can the app self-update — when a new quest / collection-log item / boss is
> released, does it add itself?"*

Short answer: **the collection log already self-updates live, and the rest is
kept current automatically through a reviewed weekly pull request.** Here's the
full picture and the reasoning behind it.

## The two layers

The app is a static site (React + Vite on GitHub Pages) whose game data lives in
typed files under `data/`. "Self-updating" is solved with two complementary
mechanisms:

### 1. Runtime self-update — live, zero action (Collection Log)

`services/CollectionLogSyncService.ts` runs in the browser the first time a
player opens the Collection Log. RS3 has no machine-readable collection-log
module (OSRS's WikiSync-fed `Module:Collection_log` does not exist on the RS3
wiki), so it fetches the RS3 wiki's rendered log pages — **`Boss collection
log`** and **`Slayer collection log`** — via `action=parse`, reads each section
heading as a log entry and the first item link of each table row as a tracked
item, diffs that against the bundled snapshot, and **appends any newly-listed
items onto existing pages, in memory.** A drop Jagex adds and the wiki records
shows up with **no redeploy**.

The **Treasure Trail collection log** is synced only at build time
(`npm run clog:sync`): the bundled Clues tab is a curated subset of its
hundreds of casket rewards, and auto-appending them all at runtime would
balloon the slot count. The **Minigames** and **Other** tabs are app-curated —
RS3 has no minigame log — and are never synced.

It is deliberately constrained to stay safe:

| Property | Behaviour |
|---|---|
| **Additive only** | Only *appends* new items. Never renames or deletes — the reviewed build-time data owns those. |
| **Fail-safe** | Any network/parse error leaves the bundled data untouched; the app just shows the snapshot. |
| **Lazy + cached** | Fetched once on first open, cached in `localStorage` (works offline after), re-checked weekly. |
| **ID-stable** | New items get fresh synthetic IDs that don't collide; existing IDs (and player progress) are untouched. |

Brand-new **pages** (a new boss's whole log) are *detected* (`newSources`) but
**not** auto-added — see why below.

### 2. Automated repo sync — reviewed, then auto-deployed (everything)

`.github/workflows/sync-content.yml` runs weekly (and on demand). It re-runs the
wiki sync, runs the **full test suite** (including the cross-data invariants),
and opens a **pull request** with whatever the wiki changed. A maintainer
reviews and merges; the merge triggers the existing Deploy workflow and ships.

This is what bakes wiki changes into the committed bundle (so first-load is
correct and names get the wiki's polished forms), and it's where anything that
needs human curation surfaces as a reviewable diff instead of shipping blind.

Run it locally any time:

```bash
npm run clog:sync     # or: npm run content:sync
```

## What's automatic vs. what needs a human — and why

| Content | New item on existing source | Brand-new source/entry |
|---|---|---|
| **Collection log items** | ✅ **Auto, live** (runtime sync) + baked in by CI | ⚠️ Detected; page added by `clog:sync` once a tab is chosen |
| **Bosses** | ✅ new drops auto-add to the boss's log | ⚠️ **Detected** (new log page) → curate: model, drop-rate, key cost, gacha tier, `BOSSES_LIST` |
| **Quests** | — | ✅ **Detected** by `content:check` (wiki `{{Globals\|quests}}` count) → curate: skill reqs, prereqs, region, QP, difficulty tier |
| **Combat Achievements** | ⚠️ App-side self-audit (RS3 has no tiered CA task pages to compare against) | ⚠️ same |
| **Diaries** | — | ⚠️ App-side self-audit (no clean wiki marker; diary content changes very rarely) |

The curation gate is **intentional**, not a limitation:

- **A boss is more than a name.** The app needs a 3D model, a drop-rate, a key
  cost and a gacha tier for it — none of which can be mechanically derived from
  the wiki. Auto-injecting a boss with no model/economy would be broken.
- **Cross-data invariants must hold.** e.g. *every* Collection-Log boss page must
  map to an unlockable boss (`data/consistency.test.ts`), directly, through
  `BOSS_PAGE_ALIASES` (e.g. the log's "Araxxi" page → `Araxxor`), or via the
  explicit `COLLOG_ONLY_BOSS_PAGES` holding list for brand-new bosses not yet in
  `BOSSES_LIST` (both in `data/collectionLogData.ts`). The review gate is where
  that judgement lives.
- **The wiki can be mid-edit or vandalised.** A test-gated PR means a bad upstream
  edit can't silently reach players.

So: **fully hands-off where the data is self-describing (collection-log items),
and detected-then-reviewed where real game-design curation is required.**

## Detecting new quests / CAs (implemented)

Unlike the collection log, quests/CAs/diaries have **no clean machine-readable
wiki source** (no public Cargo API, and their on-wiki tables are generated). So
instead of a blind importer, `scripts/check-content-sync.mjs` (`npm run
content:check`, also part of `content:sync`) is a **detector**. It records the
wiki's own authoritative numbers next to the app's in **`docs/SYNC_STATUS.md`**:

- **Quests** — the RS3 wiki's `{{Globals|quests}}` / `quests p2p` / `quests f2p`
  / `quest points` variables (Module:Globals, rendered via the API). The app tracks *more* entries than the
  wiki's quest count because it also includes miniquests/sub-quests, so the
  signal to watch is a **change** in the wiki number.
- **Combat Achievements** — RS3 has no OSRS-style tiered CA task pages (its
  combat achievements are boss-grouped entries in the Achievements system), so
  `content:check` reports the app's per-tier counts only; the wiki comparison
  switches back on if `RS3_CA_WIKI_PAGES` in the script is given a per-tier
  source.
- **Diaries** — app-side self-audit (per region/tier counts); the wiki exposes no
  stable per-task marker and diary content changes very rarely.

Because the report is **deterministic** (no timestamps), git only shows a diff
when an upstream number actually moves — so the weekly workflow turns "a new
quest/CA shipped" into a reviewable PR (`docs/SYNC_STATUS.md` is in its
`add-paths`). A human then curates the real entry in `data/questData.ts` /
`data/caTasks.ts`.

> Adding another content type later follows the same pattern: a `sync-*`
> script (if fully wiki-defined) or a detector entry, joining the same weekly PR
> automatically.
