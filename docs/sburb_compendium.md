# SBURB Canon & Inference Compendium (Design Source of Truth)

This document is the canonical reference for gameplay logic in this repo.

## Scope rules

- **Canon-locked systems (progression-critical):** Class/Aspect, Strife, Sylladex, Alchemy chain, Echeladder growth, Prototyping risk, Quest/God Tier gating, Black King finale, Ultimate Reward.
- **Flavor-only systems (non-blocking):** unresolved lore disputes, fanon-only powers, speculative timeline details.
- If canon and fan interpretation conflict, gameplay gates must follow canon-safe constraints and treat disputed content as optional flavor.

## Primary references used

- Homestuck overview and session premise (Sburb destroys Earth; entry to Medium; create new universe):  
  https://en.wikipedia.org/wiki/Homestuck
- Extended Zodiac official Aspect descriptions (Hiveswap page):  
  http://hs.hiveswap.com/ezodiac/aboutaspects.php
- Community classpect analysis index (inference source, non-canon but useful for conceptual mappings):  
  https://www.tumblr.com/homestuckexamination/175472060924/homestuck-examination-classpect-analysis  
  https://optimisticduelist.home.blog/2018/07/13/homestuck-examination-classpect-analysis/

> Note: Fandom pages returned 403 from this environment, so this compendium uses accessible canonical/official pages plus clearly-labeled inference sources.

---

## SBURB core game model (canon-safe)

1. **Identity:** player has class + aspect + moon + strife + modus.
2. **Pre-entry timer phase:** install, server connection, deploy phernalia, open Cruxtruder, prototype sprite, punch card, carve totem, alchemize entry item, enter before countdown ends.
3. **Medium loop:** explore land, consort guidance, underling strife, grist + XP, echeladder climb, land quest advancement.
4. **Risk branch:** optional second prototyping increases player-side utility and enemy/boss scaling.
5. **Late-game unlocks:** dream self context, quest bed availability, optional God Tier ascension if quest threshold met.
6. **Finale:** Black King scales with prototyping; readiness matters (recommended rung floor); victory enables Ultimate Reward.
7. **Resolution:** session purpose is creation of a new universe.

## Canon/inferred design rules by system

### Class + Aspect (metaphysical split)

- **Class = verb/relationship** to power (how the player acts on metaphysical domain).
- **Aspect = domain/substrate** of metaphysical power (what reality-layer is manipulated).
- **Classpect = composition** (same aspect behaves differently by class vector).
- Gameplay rule: class ability and aspect ability should be distinct actions, with a resonance layer combining both into contextual effects.

### Prototyping

- Prototyping grants sprite/session trait inheritance.
- Session risk rule: more prototyping increases underling and Black King threat scaling.
- Keep this a visible tradeoff, not hidden math.

### Alchemy chain

- Hard gate for entry progression.
- Missing card/totem/entry item is a legitimate fail condition under countdown pressure.
- Grist economy is progression-critical and must stay visible.

### Echeladder

- XP from strife drives rung progression and survivability.
- Final boss should have soft readiness floor communicated to player.

### God Tier

- Optional, high-impact survivability/power route.
- Must be gated by quest-state thresholds and quest bed availability.

### Final battle + Ultimate Reward

- Black King is the explicit endgame gate.
- Reward and ending state should only resolve after final battle completion.

## Variable-first implementation contract

For every major mechanic define and surface:

- **Inputs** (what affects it)
- **State** (what persists)
- **Thresholds** (what gates progression)
- **Outcomes** (success/failure effects)
- **Feedback** (what player sees now and next)

No hidden progression rules for critical path systems.

