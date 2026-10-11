# 3D entity models

> **RS3 note:** the batch exporter below reads the *Old School* cache — there is
> no maintained open-source RS3 (NXT) cache → glTF exporter, so RS3 models are
> not generated automatically. The `.gltf` files currently in this folder are
> OSRS cache exports inherited from the OSRS fork. Only those whose slug matches
> an RS3 `BOSSES_LIST`/`MINIGAMES_LIST` entry are ever shown (Araxxor, Barrows
> Brothers, Chaos Elemental, Commander Zilyana, Corporeal Beast, Dagannoth
> Kings, General Graardor, Giant Mole, K'ril Tsutsaroth, Kalphite Queen, King
> Black Dragon, Kree'arra, Nex, TzHaar Fight Cave) — and even those are the
> *OSRS* look of the boss, not its RS3 model. The rest are OSRS-only bosses and
> are simply never matched. Replace any of them with an RS3 export (e.g. from
> a RuneApps model viewer) by dropping a file with the same slug here.

Drop a model file here and it shows up automatically when that entity is
unlocked (in the unlock reveal and the Boss Planner) — **no code changes**.

## How it works

1. Name the file by the entity's **slug**: lowercase, with non-alphanumeric runs
   becoming `-`. Examples:
   - `Vorago` → `vorago.glb`
   - `King Black Dragon` → `king-black-dragon.glb`
   - `K'ril Tsutsaroth` → `kril-tsutsaroth.glb`
2. Drop the `.glb` (or `.gltf`) into this folder. Files in `/public` are served
   at the site root, so it's reachable at `/models/<slug>.glb`.
3. The manifest (`data/modelManifest.ts`) is regenerated automatically before
   `npm run dev` / `npm run build`. To refresh it by hand: `npm run models:manifest`.

That's it — any unlock whose slug has a file here renders in 3D, with its 2D
sprite as the instant poster + fallback. Names that don't slugify cleanly can be
mapped explicitly in `MODEL_REGISTRY` in `data/entityModels.ts`.

## Batch export from an OSRS cache (legacy)

`scripts/export-models.mjs` generates these files from a local **OSRS** cache
using the open-source [osrscachereader](https://github.com/Dezinater/osrscachereader):

```bash
npm install -D osrscachereader                 # cache reader (pulls `canvas`)
# get a cache (e.g. an OpenRS2 archive) — a folder with main_file_cache.*
npm run models:export -- --cache "C:/path/to/cache" --names
npm run models:manifest
```

It reads the entities in `scripts/models.config.json` (`names` are auto-resolved
by scanning the cache; `aliases` map raids/multi-boss names to a representative
NPC; `npcIds` pin an explicit id) and writes `<slug>.gltf` here.

## Or export one at a time

For RS3, use a model viewer with glTF export (e.g. RuneApps' model viewer) and
drop the file in named by slug.

## Important — intellectual property

RuneScape models (RS3 and OSRS) are **Jagex's intellectual property**. This repo does **not** bundle
any game models; it only references files you place here. Whether to host such
exports is your decision — treat them as fan content (attribution, non-commercial)
and remove them on request. `placeholder.glb` is our own generated test cube, not
a game asset, and is ignored by the manifest.
