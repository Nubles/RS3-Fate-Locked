# RS3 Slayer masters and drops (wiki extract)

Fetched 2026-10-12 from the RuneScape Wiki (runescape.wiki, RS3 only). The pages were read through WebFetch, which summarises each page with a small model, so the API and raw wikitext were not available (robots-blocked). Treat individual values as "read off the wiki, not machine-exact".

## Files
- `slayer-masters.json`: `{ master: { assignment: { weight, combat?, slayer?, req? } } }` for 12 masters.
- `drops.json`: `{ monster or boss: string[] }`. It has 145 Slayer monsters plus 53 bosses, and the boss keys are the exact `name` values in `data/rs3Bosses.ts`.

## Sources
- Master list: https://runescape.wiki/w/Slayer_master
- Assignments: https://runescape.wiki/w/{Turael, Jacquelyn, Vannaka, Mazchna, Chaeldar, Sumona, Duradel, Kuradal, Morvran, Laniakea, Mandrith, The_Raptor}
- Drops: each monster's own page `https://runescape.wiki/w/<Monster_name>` (for example `Abyssal_demon`, `Rorarius`, `Araxxi`, `Vindicta_%26_Gorvek`, `Zemouregal_%26_Vorkath`, `Orikalka`, `Barrows`, `TzHaar_Fight_Cave`).

## Notes and gaps
- **Alternate masters**: Spria uses Turael's list, Achtryn uses Mazchna's and Lapalok uses Duradel's, so none of them has a separate key. Specialist masters (Death/Frank, Ling, Erskine, Markus) are not included.
- **Master order**: per the wiki, Vannaka (30 combat) is below Mazchna (50 combat). Vannaka gives the Bats…Zombies list and Mazchna the Aberrant spectres…Werewolves list.
- **Weights**: every master's page has weights, and each master's weights add up to the total stated on its page. The wiki shows "?" for *Ravenous strigoi* and *Sanguine werewolves* (Kuradal, Morvran, Laniakea), so they are stored as weight 0.
- **Combat and Slayer values** come from the "unlock requirements" column. Corrections made:
  - Sumona: the extracted Slayer levels 105/94/88 for Crocodiles, Desert lizards and Scorpions looked like column misreads, so they were dropped and Desert lizards was set to 22.
  - Desert strykewyrms: normalised to Slayer 77, although Kuradal's and Morvran's pages read 79.
- **Drops**:
  - Rare and gem drop table contents and universal tertiaries were removed: clue scrolls, charms, effigies, D&D tokens, key halves, ghost-hunter gear, triskelion pieces, and the Archaeology long/curved/pelvis/foot bones.
  - Long herb and seed tables were trimmed to the higher-value entries for some monsters, so those lists are notable drops rather than complete tables.
  - Some pages are over 100k characters, so their tertiary or Wilderness tables were not read.
- **Representative monsters** (assignment → key): Bats→Bat, Bears→Grizzly bear, Birds→Chicken, Rats→Giant rat, Spiders→Giant spider, Trolls→Mountain troll, Kalphite→Kalphite worker, Ascension members→Rorarius, Corrupted creatures→Corrupted scorpion, Soul devourers→Salawa akh, Dinosaurs→Feral dinosaur, Gemstone dragons→Dragonstone/Onyx/Hydrix dragon, Muspah→Force muspah, Nihil→Smoke nihil, Nodon dragonkin→Nodon hunter, Revenants→Revenant dragon, Stalker creatures→Seeker, Sea snakes→Sea snake young, Vampyres→Vampyre juvinate, Elves→Elf warrior, Cockroaches→Cockroach soldier, Ganodermic creatures→Ganodermic beast, Living rock creatures→Living rock protector, Living wyverns→Wyvern (the wiki page title), Mutated jadinkos→Mutated jadinko male, Nightmare creatures→Nightmare, Greater demon berserkers and ash lords→Greater demon berserker, TzHaar→TzHaar-Ket.
- **Assignments with no drops entry**: Beastmaster's hounds, Cres's creations, Creatures of Daemonheim, Creatures of the Lost Grove, Demons/Dragons/Undead (generic), Dogs, Goblins (the page is a disambiguation), Scabarites (a group page), Scorpions (the extract was unreliable), Shadow creatures, Vile blooms, Vyrewatch (no drop table in the extract) and Zemouregal's undead.
- **Uncertain drop lists**:
  - These lists are short or partial: Bork, Skeletal Horror (only "Decaying journal"), TzHaar Fight Cave (Fire cape and Tokkul, plus TzRek-Jad added from general knowledge), Amascut, Bat, Crocodile, Ghost, Shade and Vampyre juvinate.
  - Araxxor's list merges Araxxi's page with the Noxious weapons.
  - These items were extracted but not confirmed: Smoke nihil "Zaryte bow", K'ril Tsutsaroth "Warpriest of Zamorak" pieces and furniture plans, and Vorago "Omens" items.
