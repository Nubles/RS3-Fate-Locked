# RS3 quest starts and shops (quests.json, shops.json)

Fetched 2026-10-12. Text is from the RuneScape Wiki (https://runescape.wiki, the RS3 wiki only).
Spawn coordinates are from the RS3 cache dump of the wiki maps project
(https://github.com/mejrs/data_rs3, `npc_name_collection.json` and `npcids/npcid=N.json`).
No Old School wiki data is used.

## quests.json

There is one entry for each of the 300 quest names in `data/questData.ts`, spelled exactly as they are there.

- `start`: the quest details "Start point" text from each quest's wiki page, as plain text.
  For Raksha, Tears of Guthix and Curse of the Empty Lord this comes from the `(quest)` or `(miniquest)` page.
- `startNpc`: 284 of 300 quests have one. It is left out when the quest starts from an object, an
  item or an event (Elemental Workshops, Duck Quest, Necromancy!, Regicide and others).
- `places`: other notable places the quest visits, all 300 quests. These were read off the wiki
  page, so treat them as a rough list.
- `coords`: 272 of 300 quests have one. These are game tile coordinates (x, y), not pixels.
  `coordsSource` says where each one came from:
  - `npc` (97): the cache spawn of `startNpc` closest to the place named in the start text, kept
    only if it is within about 220 tiles of that place. This is accurate to the tile.
  - `place` (175): the centre of the place named in the start text (`coordsPlace`). The centre
    comes from `data/subAreaChunks.ts` or from the cache world-map labels. It is accurate to the
    town or area only.
- How `coords` was built: the wiki's rendered pages do not expose the map x/y. `api.php`,
  `?action=raw` and Special:Export are blocked by robots.txt for the fetch tool, so no
  `{{Map}}` parameters could be read. Coordinates were worked out instead (see above). Rebuild them
  with `tools2/build_quests.py` from the session scratchpad. That script is not committed.

### Gaps
- 28 quests have no coords:
  - The NPC or place is not in the cache dump (it is too old), or the area is instanced:
    City of Um quests, Keldagrim interior, TzHaar City, Dorgesh-Kaan, Het's Oasis,
    the Empyrean Citadel, Senntisten and the Fairy Resistance Hideout.
  - The start has no location: player-owned-house portal (A Clockwork Syringe, Pieces of Hate),
    the Regicide messenger, Enter the Abyss (the Mage of Zamorak roams).
- The RFD "Freeing …" subquests point at Lumbridge, not at the banquet hall tile.
- Some `place` coords are only as precise as a whole town (e.g. "Varrock").

## shops.json

There are 153 shops: the 50 general stores from the wiki's General store page, plus
archery, armour, weapon, magic, fishing, crafting, mining, herblore, farming, food,
hunter, gem, cookery, construction and clothes shops in the main towns. The lists come from
the wiki's shop-type pages (Archery shop, Armour shop, Magic shop and so on).

- Every entry has `stockFetched`.
- 87 shops have `"stockFetched": true` and full `items` stock lists, read from each shop's wiki page:
  - all 50 general stores
  - archery: Lowe's, Brian's, Hickton's, Dargaud's, Aaron's, Lletya, Crossbow Shop (Dwarven
    Mine), Valaine's
  - armour: Horvik's, Oziach's, Zenesha's, Armour Shop (Jatizso), Armour Shop (Anachronia),
    Buried Bargains, Cassie's, Flynn's, Peksa's, Skulgrimen's, Quality Armour Shop
  - weapons: Varrock Sword Shop, Zeke's, Bob's, Brian's Battleaxe, Gaius's, Daga's, Jukat's,
    Quality Weapons Shop, Weapon Shop (Anachronia), Vigr's, Warriors' Guild Armoury, Gulluck and
    Sons, Happy Heroes'
  - magic: Aubury's, Baba Yaga's, Battle Runes, Betty's, Carwen Essencebinder
- 66 shops have `npc` and `location` only, with `"items": []` and `"stockFetched": false`.
  The session's shared WebFetch budget (400 per hour) ran out again. These are the rest of
  the magic shops and all the fishing, crafting, mining, herblore, farming, food, hunter, gem,
  cookery, construction and clothes shops. To fill them in, fetch
  `https://runescape.wiki/w/<Shop_name>` for each of them.
- The stock lists were taken from the rendered pages by a summariser. Items marked "(Free)" and
  duplicates were removed. Spot-check unusual entries before relying on them.
