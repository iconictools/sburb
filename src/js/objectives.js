/**
 * SBURB – Objectives Engine
 *
 * Tracks every game requirement (the "game needs") and provides clear
 * feedback to the player about what must be done next.
 *
 * SBURB has very specific requirements at each stage. Failing them has
 * real consequences — the game will tell you exactly what those are.
 *
 * ── STAGE OVERVIEW ───────────────────────────────────────────────────────
 *
 * STAGE 1 — PRE-ENTRY (the countdown is running)
 *   ✓ Install SBURB client disc
 *   ✓ Await server player connection
 *   ✓ Server deploys all 4 phernalia
 *   ✓ Open Cruxtruder → Kernelsprite emerges → Countdown begins
 *   ✓ Prototype Kernelsprite (at least once before entry)
 *   ✓ Punch a Captchalogue Card with an item code
 *   ✓ Carve a Cruxite Totem on the Totem Lathe
 *   ✓ Alchemize the Entry Item on the Alchemiter
 *   ✓ USE the Entry Item before the countdown reaches zero
 *
 * STAGE 2 — THE MEDIUM (your planet)
 *   ✓ Explore your Land
 *   ✓ Defeat underlings to collect Grist
 *   ✓ Speak with your Consorts
 *   ✓ Begin your Land Quest
 *   ✓ Advance your Echeladder (reach at least Rung 5)
 *   ✓ Second Kernelsprite prototyping (optional but recommended)
 *   ✓ Complete your Land Quest (80%+ progress)
 *
 * STAGE 3 — GOD TIER (optional but the most powerful path)
 *   ✓ Locate your Quest Bed
 *   ✓ Die on your Quest Bed (sacrifice)
 *   ✓ Ascend to God Tier
 *
 * STAGE 4 — SKAIA AND THE FINAL BATTLE
 *   ✓ Wake your Dream Self
 *   ✓ Receive Skaia visions
 *   ✓ Defeat the Black King
 *   ✓ Claim the Ultimate Reward
 *
 * ── CONSEQUENCES ────────────────────────────────────────────────────────
 *   • Countdown hits zero before Entry: Meteors destroy your home. Game over.
 *   • No Kernelsprite prototyping: You enter weakened. The Black King is
 *     harder (fewer underling variants to exploit).
 *   • Over-prototyping (bad objects): All underlings in session gain those
 *     traits. The Black King inherits them too. Higher power but higher risk.
 *   • Quest incomplete at God Tier attempt: Quest Bed rejects you.
 *   • Echeladder too low for Black King: Very low chance of survival.
 *   • Grist runs out before alchemy: Can't create Entry Item. Countdown kills you.
 */

export const STAGE = {
  PRE_ENTRY:   'pre_entry',
  MEDIUM:      'medium',
  LATE_GAME:   'late_game',
  FINAL:       'final',
  COMPLETE:    'complete',
};

export class ObjectivesEngine {
  constructor(player) {
    this.player = player;
    this.stage  = STAGE.PRE_ENTRY;
    this.objectives = this._buildObjectives();
    this.completedIds = new Set();
    this.failedIds    = new Set();
    this.listeners    = {};
  }

  on(ev, fn)  { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  emit(ev, d) { (this.listeners[ev] || []).forEach(fn => fn(d)); }

  // ─── Objective definitions ─────────────────────────────────────────────────
  _buildObjectives() {
    return [
      // ── Stage 1: Pre-Entry ────────────────────────────────────────────────
      {
        id: 'install_sburb', stage: STAGE.PRE_ENTRY, order: 1,
        title: 'Install SBURB',
        detail: 'Install the SBURB client disc on your computer. The server disc must be installed by your server player.',
        consequence: 'Cannot begin the session without installation.',
        hint: 'Click on the SBURB disc in your bedroom.',
        check: (p, f) => f.sburbInstalled,
      },
      {
        id: 'server_connect', stage: STAGE.PRE_ENTRY, order: 2,
        title: 'Await Server Connection',
        detail: 'Your server player must connect to your session. They will be able to see and interact with your environment.',
        consequence: 'Without a server player, phernalia cannot be deployed.',
        hint: 'Check Pesterchum — your server player will contact you.',
        check: (p, f) => f.serverConnected,
      },
      {
        id: 'deploy_cruxtruder', stage: STAGE.PRE_ENTRY, order: 3,
        title: 'Deploy the Cruxtruder',
        detail: 'Your server player must deploy the Cruxtruder into your environment. When the lid is removed, a Cruxite Dowel is extruded, a Kernelsprite emerges, and the countdown begins.',
        consequence: 'Without the Cruxtruder, no Kernelsprite, no countdown, no entry.',
        hint: 'Ask your server player to deploy the Cruxtruder via Pesterchum.',
        check: (p, f) => p.phernalidDeployed.includes('cruxtruder'),
      },
      {
        id: 'open_cruxtruder', stage: STAGE.PRE_ENTRY, order: 4,
        title: 'Open the Cruxtruder',
        detail: 'Remove the Cruxtruder lid. This produces a Cruxite Dowel (used in alchemy), summons the Kernelsprite, and starts the meteor countdown. YOU HAVE 5 MINUTES.',
        consequence: 'The Kernelsprite does not emerge and no Cruxite Dowel is produced.',
        hint: 'Click on the Cruxtruder.',
        check: (p, f) => f.cruxtruderOpened,
      },
      {
        id: 'prototype_sprite', stage: STAGE.PRE_ENTRY, order: 5,
        title: 'Prototype the Kernelsprite',
        detail: 'Throw an object into the Kernelsprite to prototype it. The sprite takes on the qualities of that object. It becomes your guide and advisor. The prototyped traits are also distributed to ALL underlings in the session.\n\n⚠ WARNING: Every underling, ogre, lich, and the Black King will inherit whatever you prototype. Choose with intent.',
        consequence: 'You lose the guidance of your sprite-guide. The Black King does not inherit any prototyping traits (making him marginally easier, but you miss out on the sprite\'s HP/ATK bonus).',
        hint: 'Click the Kernelsprite and choose an object from your Sylladex.',
        check: (p, f) => f.kernelspriteProto1,
      },
      {
        id: 'deploy_punch_designix', stage: STAGE.PRE_ENTRY, order: 6,
        title: 'Deploy the Punch Designix',
        detail: 'The Punch Designix is how you create alchemical recipes. Insert a Captchalogue Card and an item to punch the item\'s 8-character captcha code onto the card. You can double-punch two cards together using && (AND) or || (OR) to create hybrid recipes.',
        consequence: 'Cannot create custom alchemized items. Limited to basic items.',
        hint: 'Ask your server player to deploy the Punch Designix.',
        check: (p, f) => p.phernalidDeployed.includes('punch_designix'),
      },
      {
        id: 'deploy_totem_lathe', stage: STAGE.PRE_ENTRY, order: 7,
        title: 'Deploy the Totem Lathe',
        detail: 'The Totem Lathe carves a Cruxite Dowel into a Cruxite Totem. Insert the Dowel and a Punched Card, and the Lathe will carve the Dowel into the shape of the card\'s hole pattern.',
        consequence: 'Cannot create Cruxite Totems, which means you cannot use the Alchemiter.',
        hint: 'Ask your server player to deploy the Totem Lathe.',
        check: (p, f) => p.phernalidDeployed.includes('totem_lathe'),
      },
      {
        id: 'punch_card', stage: STAGE.PRE_ENTRY, order: 8,
        title: 'Punch a Captchalogue Card',
        detail: 'Use the Punch Designix to punch an item\'s captcha code onto a blank Captchalogue Card. The code represents the item\'s "recipe" in alchemical terms. You can combine cards for more powerful items.',
        consequence: 'The Totem Lathe cannot carve without a punched card.',
        hint: 'Click the Punch Designix, then select an item.',
        check: (p, f) => f.cardPunched,
      },
      {
        id: 'carve_totem', stage: STAGE.PRE_ENTRY, order: 9,
        title: 'Carve a Cruxite Totem',
        detail: 'Insert the Cruxite Dowel and your Punched Card into the Totem Lathe. The Lathe will carve the Dowel into a Cruxite Totem that matches the card\'s pattern.',
        consequence: 'The Alchemiter has nothing to work with.',
        hint: 'Click the Totem Lathe and insert the Dowel and card.',
        check: (p, f) => f.totemCarved,
      },
      {
        id: 'deploy_alchemiter', stage: STAGE.PRE_ENTRY, order: 10,
        title: 'Deploy the Alchemiter',
        detail: 'The Alchemiter is the final machine. Place a Cruxite Totem on its platform and it will manifest the item encoded in the totem\'s shape. Your Entry Item is created here.',
        consequence: 'Cannot create the Entry Item.',
        hint: 'Ask your server player to deploy the Alchemiter.',
        check: (p, f) => p.phernalidDeployed.includes('alchemiter'),
      },
      {
        id: 'create_entry_item', stage: STAGE.PRE_ENTRY, order: 11,
        title: 'Create your Entry Item',
        detail: 'Place the Cruxite Totem on the Alchemiter platform. The Entry Item will materialize. This is the object you will use to enter the Medium.\n\nJohn: Cruxite Apple\nRose: Cruxite Bottle\nDave: Cruxite Record\nJade: Cruxite Sphere',
        consequence: 'Cannot enter the Medium. You will die to the meteors.',
        hint: 'Click the Alchemiter and place your carved totem.',
        check: (p, f) => f.entryItemCreated,
      },
      {
        id: 'enter_medium', stage: STAGE.PRE_ENTRY, order: 12,
        title: 'Enter the Medium',
        detail: 'USE your Entry Item before the countdown reaches zero. For John, smash the Cruxite Apple. For Rose, drink the Cruxite Bottle. For Dave, drop the Cruxite Record. For Jade, release the Cruxite Sphere.\n\n⚠ THE METEORS DO NOT WAIT.',
        consequence: 'The meteors destroy your home and you die. Game over.',
        hint: 'Click your Entry Item in inventory and select USE.',
        check: (p, f) => f.hasEntered,
      },

      // ── Stage 2: The Medium ────────────────────────────────────────────────
      {
        id: 'explore_land', stage: STAGE.MEDIUM, order: 1,
        title: 'Explore your Land',
        detail: 'Your personal planet in the Medium is your home base. Explore it. Find the consorts. Understand the landscape. Your planet was constructed specifically for you and your classpect.',
        consequence: 'Without exploring, you won\'t find the grist, consorts, or quest.',
        hint: 'Use the explore options in the Medium screen.',
        check: (p, f) => f.exploredLand,
      },
      {
        id: 'meet_consorts', stage: STAGE.MEDIUM, order: 2,
        title: 'Speak with your Consorts',
        detail: 'Your consorts are the small animal-like creatures native to your land. They have been waiting for you for centuries. They hold the key to your land quest and have crucial information about your denizen.',
        consequence: 'Without the consorts, you don\'t know what your quest is.',
        hint: 'Find the consort village on your land.',
        check: (p, f) => f.metConsorts,
      },
      {
        id: 'defeat_10_underlings', stage: STAGE.MEDIUM, order: 3,
        title: 'Defeat Underlings (×10)',
        detail: 'Underlings are the enemies that populate your land. Defeating them yields Grist (used for building and alchemy) and XP (for the Echeladder). You need both to survive and progress.\n\nUnderlings are stronger if you over-prototype your Kernelsprite.\nThey come in tiers: Imps → Ogres → Basilisks → Liches → Giclops.',
        consequence: 'Without grist: cannot alchemize. Without XP: Echeladder stays too low to survive later fights.',
        hint: 'Select "STRIVE" in the Medium exploration options.',
        check: (p, f) => (f.underlingKills || 0) >= 10,
      },
      {
        id: 'reach_rung_5', stage: STAGE.MEDIUM, order: 4,
        title: 'Reach Echeladder Rung 5',
        detail: 'The Echeladder is your level progression. Each rung has a whimsical name and grants HP and ATK bonuses. The Black King is virtually impossible below Rung 10. Begin climbing as soon as you enter the Medium.',
        consequence: 'You will not survive the later areas of your land, let alone the Black King.',
        hint: 'Defeat underlings. Each kill grants XP.',
        check: (p) => p.rung >= 5,
      },
      {
        id: 'complete_quest', stage: STAGE.MEDIUM, order: 5,
        title: 'Complete your Land Quest (80%)',
        detail: 'Your land has a specific quest tied to your classpect. This is not optional — it is why you are here.\n\nJohn (LOWAS): Free the imprisoned wind from the underground pipelines.\nRose (LOLAR): Defeat the Rainbow Drinkers corrupting Skaia\'s light.\nDave (LOHAC): Repair the broken clockwork gears.\nJade (LOFAF): Breed the Genesis Frog from all frog species.\n\nYour quest must be 80%+ complete before the Quest Bed will accept you.',
        consequence: 'Cannot ascend to God Tier. The Quest Bed simply will not work.',
        hint: 'Complete the quest tasks in the exploration screen.',
        check: (p) => p.questProgress >= 80,
      },
      {
        id: 'second_proto', stage: STAGE.MEDIUM, order: 6,
        title: 'Second Kernelsprite Prototyping (optional)',
        detail: 'You can prototype your Kernelsprite a second time after entering the Medium. The sprite\'s powers stack. The same warning applies: ALL underlings in the session gain the prototyped traits.\n\n⚠ The Black King\'s HP and ATK scale with each prototyping. A second prototyping creates more powerful enemies. Weigh the sprite bonus against the enemy bonus carefully.',
        consequence: 'Optional — but missing the second bonus means weaker sprite guidance.',
        hint: 'Click the Kernelsprite on the Medium screen.',
        check: (p, f) => f.kernelspriteProto2,
        optional: true,
      },

      // ── Stage 3: God Tier ─────────────────────────────────────────────────
      {
        id: 'wake_dream_self', stage: STAGE.LATE_GAME, order: 1,
        title: 'Wake your Dream Self',
        detail: 'Every player has a Dream Self sleeping on either Prospit (golden moon) or Derse (purple moon). When your physical body dies, your Dream Self wakes. But the Dream Self can also be deliberately awakened.\n\nProspit dreamers see Skaia\'s visions clearly. Derse dreamers tend toward skepticism and are contacted by the Horrorterrors.',
        consequence: 'Without an awakened Dream Self, you cannot receive Skaia visions and certain late-game events will not trigger.',
        hint: 'Die in combat (your Dream Self wakes) or find the sleeping platform on your land.',
        check: (p, f) => f.dreamSelfAwoken,
      },
      {
        id: 'find_quest_bed', stage: STAGE.LATE_GAME, order: 2,
        title: 'Locate your Quest Bed',
        detail: 'Each player\'s land has a Quest Bed hidden in its deepest area. This is where you will achieve God Tier. The consorts know where it is. The path to it is guarded by stronger underlings.\n\n⚠ Dying on the Quest Bed only works if your quest is sufficiently complete. If not, it is simply death.',
        consequence: 'Cannot achieve God Tier without the Quest Bed.',
        hint: 'Ask your consorts where the Quest Bed is. You need 80%+ quest progress first.',
        check: (p, f) => f.questBedFound,
      },
      {
        id: 'god_tier', stage: STAGE.LATE_GAME, order: 3,
        title: 'Ascend to God Tier',
        detail: 'Die on your Quest Bed. Your dream self rises to meet you. You ascend, wearing your God Tier outfit — a costume representing your Class and Aspect. You are reborn with full power.\n\nGod Tier grants immortality with one exception: deaths deemed JUST or HEROIC (10% chance) are permanent.\n\nThis is the most important power-up in SBURB.',
        consequence: 'The Black King will be significantly harder without God Tier power.',
        hint: 'Go to the Quest Bed location and use it.',
        check: (p, f) => f.godTierAscended,
        optional: true,
      },

      // ── Stage 4: Final Battle ─────────────────────────────────────────────
      {
        id: 'defeat_black_king', stage: STAGE.FINAL, order: 1,
        title: 'Defeat the Black King',
        detail: 'The Black King commands the armies of Derse on the Battlefield of Skaia. He is the final boss of the session. His power scales with every prototyping in the session.\n\n⚠ PROTOTYPING EFFECTS ON THE BLACK KING:\n• 0 prototypings: baseline\n• 1 prototyping: +50% HP, +30% ATK\n• 2 prototypings: +100% HP, +60% ATK\n\nAll players in the session fight him together. This is why coordination matters.',
        consequence: 'You cannot claim the Ultimate Reward. The White Kingdom falls.',
        hint: 'Your Echeladder should be at least Rung 10. God Tier is strongly recommended.',
        check: (p, f) => f.blackKingDefeated,
      },
      {
        id: 'ultimate_reward', stage: STAGE.FINAL, order: 2,
        title: 'Claim the Ultimate Reward',
        detail: 'When the Black King falls, the Ultimate Reward materializes. The winning players gain the power to create a new universe. This universe — not the players\' original world — is the true purpose of SBURB.\n\nYou are not saving your world. You are creating a new one.',
        consequence: 'This is the final objective. There is nothing beyond it.',
        hint: 'Defeat the Black King.',
        check: (p, f) => f.ultimateRewardClaimed,
      },
    ];
  }

  // ─── Query methods ─────────────────────────────────────────────────────────
  getStageObjectives(stage) {
    return this.objectives.filter(o => o.stage === stage);
  }

  currentObjective() {
    const flags = this.player?.flags || {};
    // Return the first incomplete, non-failed objective in current stage order
    for (const obj of this.objectives) {
      if (obj.stage !== this.stage) continue;
      if (this.completedIds.has(obj.id)) continue;
      if (obj.optional) continue;
      return obj;
    }
    // All required done — check optional
    for (const obj of this.objectives) {
      if (obj.stage !== this.stage) continue;
      if (this.completedIds.has(obj.id)) continue;
      return obj;
    }
    return null;
  }

  // Check all objectives against current state
  tick(player, flags) {
    const newly = [];
    for (const obj of this.objectives) {
      if (this.completedIds.has(obj.id)) continue;
      try {
        if (obj.check(player, flags)) {
          this.completedIds.add(obj.id);
          newly.push(obj);
          this.emit('objectiveComplete', { obj });
        }
      } catch (e) { /* silent */ }
    }

    // Advance stage if all required stage objectives are done
    this._checkStageAdvance(flags);

    return newly;
  }

  _checkStageAdvance(flags) {
    const stages = [STAGE.PRE_ENTRY, STAGE.MEDIUM, STAGE.LATE_GAME, STAGE.FINAL];
    const idx = stages.indexOf(this.stage);
    if (idx === -1) return;

    const stageObjs = this.objectives.filter(o => o.stage === this.stage && !o.optional);
    const allDone = stageObjs.every(o => this.completedIds.has(o.id));

    if (allDone && idx < stages.length - 1) {
      const next = stages[idx + 1];
      this.stage = next;
      this.emit('stageAdvance', { from: stages[idx], to: next });
    }
  }

  // ─── Status display helpers ────────────────────────────────────────────────
  statusFor(objId) {
    if (this.completedIds.has(objId)) return 'complete';
    if (this.failedIds.has(objId))    return 'failed';
    return 'pending';
  }

  stageProgress() {
    const objs = this.objectives.filter(o => o.stage === this.stage && !o.optional);
    const done = objs.filter(o => this.completedIds.has(o.id)).length;
    return { done, total: objs.length, percent: objs.length ? Math.floor(done / objs.length * 100) : 0 };
  }

  // Collect all visible hints for the HUD
  activeHints() {
    const cur = this.currentObjective();
    if (!cur) return [];
    return [
      { title: cur.title, hint: cur.hint, consequence: cur.consequence },
    ];
  }

  // Full objective panel data
  allForDisplay() {
    return this.objectives.map(o => ({
      ...o,
      status: this.statusFor(o.id),
      isCurrent: this.currentObjective()?.id === o.id,
    }));
  }
}
