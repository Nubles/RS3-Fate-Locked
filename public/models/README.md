# 3D entity models

> **RS3 note:** no models are bundled. The OSRS-cache exports this project
> inherited were removed because they showed OSRS art, and there is no
> maintained open-source RS3 (NXT) cache → glTF exporter. Every boss shows its
> RS3 wiki sprite until you add an RS3 model export here (e.g. from a RuneApps
> model viewer).

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

## Or export one at a time

For RS3, use a model viewer with glTF export (e.g. RuneApps' model viewer) and
drop the file in named by slug.

## Important — intellectual property

RuneScape models (RS3 and OSRS) are **Jagex's intellectual property**. This repo does **not** bundle
any game models; it only references files you place here. Whether to host such
exports is your decision — treat them as fan content (attribution, non-commercial)
and remove them on request. `placeholder.glb` is our own generated test cube, not
a game asset, and is ignored by the manifest.
