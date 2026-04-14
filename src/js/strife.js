/**
 * SBURB – Strife System
 *
 * Turn-based combat with classpect-specific abilities.
 * Each class has a unique battle skill tied to how they relate to their Aspect.
 * The underlings' traits scale with Kernelsprite prototypings (shared across session).
 *
 * ── COMBAT LOOP ────────────────────────────────────────────────────────────
 *   Player turn → choose action → resolve → check win/lose
 *   Enemy turn → AI → resolve → check win/lose
 *   Repeat
 *
 * ── PLAYER ACTIONS ─────────────────────────────────────────────────────────
 *   ATTACK   – Normal attack using equipped weapon. Chance of crit.
 *   SPECIBUS – Strife Specibus special move. High damage, once per battle.
 *   CLASS    – Unique class ability (see below). Once per battle.
 *   ASPECT   – Aspect-element attack. Once per battle. Costs HP.
 *   ITEM     – Use a consumable from the Sylladex.
 *   FLEE     – 60% escape chance. On failure, enemy attacks.
 *
 * ── CLASS ABILITIES ──────────────────────────────────────────────────────
 *   Heir:    INHERITANCE  — Aspect shield, absorbs next hit entirely
 *   Seer:    REVELATION   — Scans enemy, reveals all stats + weakness
 *   Page:    POTENTIAL    — If HP < 30%, ATK doubles for 3 turns
 *   Maid:    MANIFEST     — Summons a random item from Aspect
 *   Sylph:   MEND         — Restores 40% max HP
 *   Rogue:   SIPHON       — Steals ATK from enemy temporarily
 *   Knight:  EXPLOIT      — Deals 3× damage using Aspect weakness
 *   Witch:   REWRITE      — Halves enemy ATK and DEF for 3 turns
 *   Mage:    SACRIFICE    — Spend 25% HP to deal 4× damage
 *   Prince:  ANNIHILATE   — Removes 20% of enemy max HP instantly
 *   Thief:   PILFERAGE    — Steals enemy's highest stat for 3 turns
 *   Bard:    INVOKE       — Random effect (6 possibilities, some dangerous)
 */

import CONFIG from './config.js';

// ─── Class ability definitions ────────────────────────────────────────────────
const CLASS_ABILITIES = {
  Heir: {
    name: 'INHERITANCE',
    desc: 'You draw your Aspect around you like armor. The next attack against you deals 0 damage.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      state.playerShield = true;
      state.log.push({ text: `> INHERITANCE — ${player.aspect} shields you. Next hit: blocked.`, cls: 'log-special' });
      return { end: false };
    },
  },
  Seer: {
    name: 'REVELATION',
    desc: 'As Seer, you perceive everything. Enemy stats, weakness, and remaining HP become visible.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      state.enemyRevealed = true;
      state.log.push({ text: `> REVELATION — ${enemy.name}: HP ${enemy.hp}/${enemy.maxHp} | ATK ${enemy.atk} | DEF ${enemy.def || 0}`, cls: 'log-special' });
      state.log.push({ text: `> Weakness: ${enemy.weakness || 'None identified.'}`, cls: 'log-system' });
      return { end: false };
    },
  },
  Page: {
    name: 'POTENTIAL',
    desc: 'Near death, your true potential emerges. Below 30% HP, your ATK doubles for 3 turns.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      if (player.hpPercent() < 30) {
        state.atkMultiplier = 2;
        state.atkMultiplierTurns = 3;
        state.log.push({ text: `> POTENTIAL — your true power activates! ATK ×2 for 3 turns.`, cls: 'log-special' });
      } else {
        state.log.push({ text: `> POTENTIAL — you must be below 30% HP for this to activate. Preparing...`, cls: 'log-system' });
        state.pageCharging = true;
      }
      return { end: false };
    },
  },
  Maid: {
    name: 'MANIFEST',
    desc: 'You create something from your Aspect mid-battle.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      const bonus = Math.floor(player.atk * 0.5);
      const healAmt = Math.floor(player.maxHp * 0.15);
      player.heal(healAmt);
      state.log.push({ text: `> MANIFEST — you create from ${player.aspect}. Healed ${healAmt} HP, ATK +${bonus} for this battle.`, cls: 'log-special' });
      state.atkBonus = (state.atkBonus || 0) + bonus;
      return { end: false };
    },
  },
  Sylph: {
    name: 'MEND',
    desc: 'You heal 40% of your maximum HP.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      const amt = Math.floor(player.maxHp * 0.4);
      player.heal(amt);
      state.log.push({ text: `> MEND — ${player.aspect} restores ${amt} HP. (${player.hp}/${player.maxHp})`, cls: 'log-special' });
      return { end: false };
    },
  },
  Rogue: {
    name: 'SIPHON',
    desc: 'You redistribute the enemy\'s ATK — take 30% of it for yourself for 3 turns.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      const stolen = Math.floor(enemy.atk * 0.3);
      state.atkBonus = (state.atkBonus || 0) + stolen;
      state.enemyAtkDebuff = (state.enemyAtkDebuff || 0) + stolen;
      state.siphonTurns = 3;
      state.log.push({ text: `> SIPHON — redistributed ${stolen} ATK from ${enemy.name} to yourself for 3 turns.`, cls: 'log-special' });
      return { end: false };
    },
  },
  Knight: {
    name: 'EXPLOIT',
    desc: 'You find and exploit the enemy\'s weakness using your Aspect. 3× damage.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      const dmg = player.totalAtk() * 3 + Math.floor(Math.random() * 15);
      enemy.hp = Math.max(0, enemy.hp - dmg);
      state.log.push({ text: `> EXPLOIT — you weaponize ${player.aspect} against ${enemy.name}'s weakness! (${dmg} DMG)`, cls: 'log-special' });
      return { end: enemy.hp <= 0 };
    },
  },
  Witch: {
    name: 'REWRITE',
    desc: 'You rewrite the rules of the fight. Enemy ATK and DEF are halved for 3 turns.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      state.enemyAtkDebuff = (state.enemyAtkDebuff || 0) + Math.floor(enemy.atk * 0.5);
      state.enemyDefDebuff = (state.enemyDefDebuff || 0) + Math.floor((enemy.def || 0) * 0.5);
      state.rewriteTurns = 3;
      state.log.push({ text: `> REWRITE — you bend reality. ${enemy.name}'s ATK and DEF halved for 3 turns.`, cls: 'log-special' });
      return { end: false };
    },
  },
  Mage: {
    name: 'SACRIFICE',
    desc: 'Pay 25% of your current HP to deal 4× damage. Knowledge through suffering.',
    cost: 'hp_25pct',
    uses: 1,
    execute: (player, enemy, state) => {
      const cost = Math.floor(player.hp * 0.25);
      player.takeDamage(cost);
      const dmg = player.totalAtk() * 4;
      enemy.hp = Math.max(0, enemy.hp - dmg);
      state.log.push({ text: `> SACRIFICE — you pay ${cost} HP to channel ${player.aspect}. (${dmg} DMG to ${enemy.name})`, cls: 'log-special' });
      return { end: enemy.hp <= 0 };
    },
  },
  Prince: {
    name: 'ANNIHILATE',
    desc: 'Instantly remove 20% of the enemy\'s MAXIMUM HP. No defense roll.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      const dmg = Math.floor(enemy.maxHp * 0.2);
      enemy.hp = Math.max(0, enemy.hp - dmg);
      state.log.push({ text: `> ANNIHILATE — you destroy a portion of ${enemy.name}'s existence. (${dmg} DMG, unresistable)`, cls: 'log-special' });
      return { end: enemy.hp <= 0 };
    },
  },
  Thief: {
    name: 'PILFERAGE',
    desc: 'Steal the enemy\'s highest stat bonus for 3 turns.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      const stolen = Math.floor(enemy.atk * 0.4);
      state.atkBonus = (state.atkBonus || 0) + stolen;
      state.pilferageTurns = 3;
      state.log.push({ text: `> PILFERAGE — stolen ${stolen} ATK from ${enemy.name} for 3 turns.`, cls: 'log-special' });
      return { end: false };
    },
  },
  Bard: {
    name: 'INVOKE CHAOS',
    desc: 'Let your Aspect flow through you uncontrolled. The result is unpredictable.',
    cost: null,
    uses: 1,
    execute: (player, enemy, state) => {
      const roll = Math.random();
      if (roll < 0.15) {
        // Catastrophic backfire
        const dmg = Math.floor(player.maxHp * 0.4);
        player.takeDamage(dmg);
        state.log.push({ text: `> INVOKE CHAOS — the power turns on YOU. You take ${dmg} damage.`, cls: 'log-enemy-hit' });
      } else if (roll < 0.35) {
        // Massive damage
        const dmg = player.totalAtk() * 5;
        enemy.hp = Math.max(0, enemy.hp - dmg);
        state.log.push({ text: `> INVOKE CHAOS — CATACLYSMIC STRIKE! (${dmg} DMG to ${enemy.name})`, cls: 'log-special' });
        return { end: enemy.hp <= 0 };
      } else if (roll < 0.55) {
        // Enemy confused
        state.enemyConfused = 2;
        state.log.push({ text: `> INVOKE CHAOS — ${enemy.name} is wracked with confusion for 2 turns!`, cls: 'log-special' });
      } else if (roll < 0.70) {
        // Full heal
        player.heal(player.maxHp);
        state.log.push({ text: `> INVOKE CHAOS — your Aspect heals you completely!`, cls: 'log-special' });
      } else if (roll < 0.85) {
        // Moderate damage
        const dmg = player.totalAtk() * 2;
        enemy.hp = Math.max(0, enemy.hp - dmg);
        state.log.push({ text: `> INVOKE CHAOS — controlled chaos! (${dmg} DMG)`, cls: 'log-special' });
        return { end: enemy.hp <= 0 };
      } else {
        // Nothing
        state.log.push({ text: `> INVOKE CHAOS — ...nothing happens. The void gazes back.`, cls: 'log-system' });
      }
      return { end: false };
    },
  },
};

// ─── Aspect combat flavor ────────────────────────────────────────────────────
// When using the Aspect move, these are the attack descriptions
const ASPECT_ATTACKS = {
  Breath:  { name: 'GALE BURST',      desc: 'A cyclone tears through the enemy.' },
  Life:    { name: 'LIFE DRAIN',      desc: 'You steal vitality from the enemy.' },
  Light:   { name: 'LUCKY STAR',      desc: 'Fortune strikes — critical hit with bonus luck.' },
  Time:    { name: 'TEMPORAL SNAP',   desc: 'You freeze the enemy in a moment of time.' },
  Space:   { name: 'SCALE SHIFT',     desc: 'You miniaturize the enemy, reducing their ATK.' },
  Mind:    { name: 'MIND STAB',       desc: 'A targeted mental strike exploits decision-making lag.' },
  Heart:   { name: 'SOUL REND',       desc: 'You tear at the enemy\'s very identity.' },
  Blood:   { name: 'BOND BREAK',      desc: 'You sever the enemy\'s connection to its allies.' },
  Hope:    { name: 'ANGEL WINGS',     desc: 'Holy light sears the enemy.' },
  Rage:    { name: 'NIHIL BLAST',     desc: 'Pure fury obliterates a portion of the enemy.' },
  Doom:    { name: 'DOOM KNELL',      desc: 'You pronounce doom upon the enemy. Fate descends.' },
  Void:    { name: 'ERASURE',         desc: 'Part of the enemy simply stops existing.' },
};

const CLASS_VECTORS = {
  Heir:   { verb: 'embodies', scalar: 0.9 },
  Seer:   { verb: 'interprets', scalar: 0.8 },
  Page:   { verb: 'amplifies', scalar: 1.0 },
  Maid:   { verb: 'creates', scalar: 1.0 },
  Sylph:  { verb: 'restores', scalar: 0.85 },
  Rogue:  { verb: 'redistributes', scalar: 0.9 },
  Knight: { verb: 'weaponizes', scalar: 1.1 },
  Witch:  { verb: 'bends', scalar: 1.1 },
  Mage:   { verb: 'understands through suffering', scalar: 1.05 },
  Prince: { verb: 'destroys', scalar: 1.2 },
  Thief:  { verb: 'steals', scalar: 1.1 },
  Bard:   { verb: 'invites destruction through', scalar: 1.0 },
};

const ASPECT_METAPHYSICS = {
  Breath: (player, enemy, state, scale) => {
    state.fleeBonus = (state.fleeBonus || 0) + (0.1 * scale);
    state.enemyConfused = (state.enemyConfused || 0) + 1;
    return { text: 'Breath loosens fate-lines: movement expands and escape routes open.' };
  },
  Blood: (player, enemy, state, scale) => {
    state.playerShield = true;
    state.enemyAtkDebuff = (state.enemyAtkDebuff || 0) + Math.floor(enemy.atk * 0.08 * scale);
    return { text: 'Blood reinforces bonds: your position stabilizes and the foe loses momentum.' };
  },
  Life: (player, enemy, state, scale) => {
    const heal = Math.floor(player.maxHp * 0.12 * scale);
    player.heal(heal);
    return { text: `Life surges through paradox space, restoring ${heal} HP.` };
  },
  Doom: (player, enemy, state, scale) => {
    const cost = Math.max(1, Math.floor(player.maxHp * 0.05 * scale));
    const dmg = Math.max(1, Math.floor(enemy.maxHp * 0.08 * scale));
    player.takeDamage(cost);
    enemy.hp = Math.max(0, enemy.hp - dmg);
    return { text: `Doom exacts ${cost} HP from you to mark inevitable collapse (${dmg} DMG).`, damage: dmg };
  },
  Light: (player, enemy, state, scale) => {
    state.luckBoost = (state.luckBoost || 0) + (0.08 * scale);
    const bonus = Math.floor(player.totalAtk() * 0.2 * scale);
    enemy.hp = Math.max(0, enemy.hp - bonus);
    return { text: `Light aligns probabilities in your favor (${bonus} DMG).`, damage: bonus };
  },
  Void: (player, enemy, state, scale) => {
    state.enemyRevealed = false;
    state.enemyAtkDebuff = (state.enemyAtkDebuff || 0) + Math.floor(enemy.atk * 0.12 * scale);
    return { text: 'Void obscures certainty and hollows enemy intent.' };
  },
  Time: (player, enemy, state, scale) => {
    const dmg = Math.floor(player.totalAtk() * 0.35 * scale);
    enemy.hp = Math.max(0, enemy.hp - dmg);
    return { text: `Time overlays doomed splinters into a single strike (${dmg} DMG).`, damage: dmg };
  },
  Space: (player, enemy, state, scale) => {
    state.enemyDefDebuff = (state.enemyDefDebuff || 0) + Math.floor(((enemy.def || 0) + 6) * 0.5 * scale);
    return { text: 'Space distorts scale: the enemy loses structural coherence.' };
  },
  Mind: (player, enemy, state, scale) => {
    state.enemyConfused = (state.enemyConfused || 0) + 1;
    state.enemyAtkDebuff = (state.enemyAtkDebuff || 0) + Math.floor(enemy.atk * 0.1 * scale);
    return { text: 'Mind forks decision trees; the opponent hesitates in contradiction.' };
  },
  Heart: (player, enemy, state, scale) => {
    const dmg = Math.floor(enemy.maxHp * 0.07 * scale);
    enemy.hp = Math.max(0, enemy.hp - dmg);
    return { text: `Heart attacks identity itself (${dmg} DMG).`, damage: dmg };
  },
  Hope: (player, enemy, state, scale) => {
    state.atkMultiplier = Math.max(state.atkMultiplier || 1, 1 + (0.25 * scale));
    state.atkMultiplierTurns = Math.max(state.atkMultiplierTurns || 0, 2);
    return { text: 'Hope hardens belief into force. Your convictions become damage.' };
  },
  Rage: (player, enemy, state, scale) => {
    const dmg = Math.floor(player.totalAtk() * 0.45 * scale);
    const recoil = Math.max(1, Math.floor(player.maxHp * 0.04 * scale));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    player.takeDamage(recoil);
    return { text: `Rage shatters illusion: ${dmg} DMG dealt, ${recoil} recoil taken.`, damage: dmg };
  },
};

// ─── Strife Engine ────────────────────────────────────────────────────────────
export class StrifeEngine {
  constructor(player, enemy) {
    this.player = player;
    this.enemy  = { ...enemy, hp: enemy.hp, maxHp: enemy.maxHp };

    this.state = {
      turn:              'player',
      log:               [],
      over:              false,
      won:               false,
      fled:              false,
      turnCount:         0,
      playerShield:      false,
      atkMultiplier:     1,
      atkMultiplierTurns: 0,
      atkBonus:          0,
      enemyAtkDebuff:    0,
      enemyDefDebuff:    0,
      enemyConfused:     0,
      enemyRevealed:     false,
      luckBoost:         0,
      fleeBonus:         0,
      rewriteTurns:      0,
      siphonTurns:       0,
      pilferageTurns:    0,
      pageCharging:      false,
      classUsed:         false,
      specibusUsed:      false,
      aspectUsed:        false,
    };

    // Assign weakness based on aspect/prototyping
    this.enemy.weakness = this._assignWeakness();
  }

  _assignWeakness() {
    const weaknesses = {
      Breath: 'Space (scale manipulation)', Life: 'Doom (death is inevitable)',
      Light: 'Void (ignorance counters revelation)', Time: 'Space (no room for loops)',
      Space: 'Mind (precision beats scale)', Mind: 'Rage (fury disrupts logic)',
      Heart: 'Void (erasure of self)', Blood: 'Breath (freedom severs bonds)',
      Hope: 'Doom (hope cannot survive inevitability)', Rage: 'Life (vitality absorbs fury)',
      Doom: 'Hope (belief defies fate)', Void: 'Light (revelation fills void)',
    };
    return weaknesses[this.player.aspect] || 'Unknown';
  }

  // ─── Action: Normal attack ─────────────────────────────────────────────────
  attack() {
    if (!this._isPlayerTurn()) return null;

    const mult = this.state.atkMultiplier || 1;
    const bonus = this.state.atkBonus || 0;
    const critChance = Math.min(0.45, 0.12 + (this.state.luckBoost || 0));
    const crit = Math.random() < critChance;
    const base = this.player.totalAtk() + bonus;
    const dmg  = Math.floor(base * mult * (crit ? 1.8 : 1) + Math.random() * 8);

    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    this.state.log.push({
      text: `> You strike ${this.enemy.name} for ${dmg} damage${crit ? ' (CRITICAL HIT!)' : ''}.`,
      cls:  crit ? 'log-special' : 'log-hit',
    });

    this._decrementBuffs();
    this._emit();

    if (this.enemy.hp <= 0) return this._enemyDefeated();
    return this._enemyTurn();
  }

  // ─── Action: Strife Specibus special ──────────────────────────────────────
  specibusAttack() {
    if (!this._isPlayerTurn()) return null;
    if (this.state.specibusUsed) {
      this.state.log.push({ text: '> Specibus special already used this battle.', cls: 'log-system' });
      this._emit();
      return null;
    }

    const dmg = Math.floor(this.player.totalAtk() * 2.5 + Math.random() * 12);
    this.state.specibusUsed = true;
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    this.state.log.push({
      text: `> ${this.player.strifeSpecial}!! (${dmg} DMG)`,
      cls:  'log-special',
    });

    this._decrementBuffs();
    this._emit();

    if (this.enemy.hp <= 0) return this._enemyDefeated();
    return this._enemyTurn();
  }

  // ─── Action: Class ability ─────────────────────────────────────────────────
  classAbility() {
    if (!this._isPlayerTurn()) return null;
    if (this.state.classUsed) {
      this.state.log.push({ text: '> Class ability already used this battle.', cls: 'log-system' });
      this._emit();
      return null;
    }

    const ability = CLASS_ABILITIES[this.player.playerClass];
    if (!ability) {
      this.state.log.push({ text: '> Unknown class ability.', cls: 'log-system' });
      return null;
    }

    this.state.classUsed = true;
    const result = ability.execute(this.player, this.enemy, this.state);
    this._applyClassAspectResonance('class');

    this._decrementBuffs();
    this._emit();

    if (result.end) return this._enemyDefeated();
    if (!this.player.isAlive()) return this._playerDefeated();
    return this._enemyTurn();
  }

  // ─── Action: Aspect attack ─────────────────────────────────────────────────
  aspectAttack() {
    if (!this._isPlayerTurn()) return null;
    if (this.state.aspectUsed) {
      this.state.log.push({ text: '> Aspect power already used this battle.', cls: 'log-system' });
      this._emit();
      return null;
    }

    const attack = ASPECT_ATTACKS[this.player.aspect] || { name: 'ASPECT STRIKE', desc: 'Raw aspect power.' };
    const vector = CLASS_VECTORS[this.player.playerClass] || { verb: 'channels', scalar: 1 };
    const hpCost = Math.floor(this.player.hp * 0.15);
    this.player.takeDamage(hpCost);
    const dmg = Math.floor(this.player.totalAtk() * (1.45 + (vector.scalar * 0.35)) + Math.random() * 10);

    this.state.aspectUsed = true;
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    this.state.log.push({
      text: `> ${attack.name}! ${attack.desc} (${dmg} DMG, cost: ${hpCost} HP)\n> ${this.player.playerClass} ${vector.verb} ${this.player.aspect}.`,
      cls:  'log-special',
    });
    this._applyClassAspectResonance('aspect');

    this._decrementBuffs();
    this._emit();

    if (!this.player.isAlive()) return this._playerDefeated();
    if (this.enemy.hp <= 0) return this._enemyDefeated();
    return this._enemyTurn();
  }

  // ─── Action: Flee ──────────────────────────────────────────────────────────
  flee() {
    if (!this._isPlayerTurn()) return null;
    const success = Math.random() < Math.min(0.9, 0.6 + (this.state.fleeBonus || 0));
    if (success) {
      this.state.fled = true;
      this.state.over = true;
      this.state.log.push({ text: `> You flee from ${this.enemy.name}.`, cls: 'log-system' });
      this._emit();
      return { fled: true };
    } else {
      this.state.log.push({ text: `> You couldn't get away!`, cls: 'log-system' });
      this._emit();
      return this._enemyTurn();
    }
  }

  // ─── Enemy AI ─────────────────────────────────────────────────────────────
  _enemyTurn() {
    this.state.turn = 'enemy';
    this.state.turnCount++;

    // Confused: misses
    if (this.state.enemyConfused > 0) {
      this.state.enemyConfused--;
      this.state.log.push({ text: `> ${this.enemy.name} is confused and misses!`, cls: 'log-system' });
      this.state.turn = 'player';
      this._emit();
      return { turnEnd: true };
    }

    // Calc enemy ATK with debuffs
    const eAtk = Math.max(1, this.enemy.atk - (this.state.enemyAtkDebuff || 0));
    const dmg  = this.player.takeDamage(eAtk + Math.floor(Math.random() * 5));

    // Player shield (Heir)
    if (this.state.playerShield) {
      this.state.playerShield = false;
      this.state.log.push({ text: `> ${this.enemy.name} attacks — BLOCKED by Inheritance! (0 DMG)`, cls: 'log-special' });
    } else {
      this.state.log.push({ text: `> ${this.enemy.name} hits you for ${dmg} damage.`, cls: 'log-enemy-hit' });
    }

    // Page potential check
    if (this.state.pageCharging && this.player.hpPercent() < 30) {
      this.state.atkMultiplier = 2;
      this.state.atkMultiplierTurns = 3;
      this.state.pageCharging = false;
      this.state.log.push({ text: '> POTENTIAL activates! You are near death — your power SURGES. ATK ×2.', cls: 'log-special' });
    }

    this.state.turn = 'player';
    this._emit();

    if (!this.player.isAlive()) return this._playerDefeated();
    return { turnEnd: true };
  }

  _decrementBuffs() {
    if (this.state.atkMultiplierTurns > 0) {
      this.state.atkMultiplierTurns--;
      if (this.state.atkMultiplierTurns === 0) this.state.atkMultiplier = 1;
    }
    if (this.state.rewriteTurns > 0) {
      this.state.rewriteTurns--;
      if (this.state.rewriteTurns === 0) { this.state.enemyAtkDebuff = 0; this.state.enemyDefDebuff = 0; }
    }
    if (this.state.siphonTurns > 0) {
      this.state.siphonTurns--;
      if (this.state.siphonTurns === 0) this.state.atkBonus = 0;
    }
    if (this.state.pilferageTurns > 0) {
      this.state.pilferageTurns--;
      if (this.state.pilferageTurns === 0) this.state.atkBonus = 0;
    }
    this.state.turn = 'enemy';
  }

  _enemyDefeated() {
    this.state.over = true;
    this.state.won  = true;
    const xp     = this.enemy.xp;
    const grist  = this.enemy.grist;
    const levels = this.player.gainXp(xp);
    this.player.addGrist(grist);

    const gristStr = Object.entries(grist).map(([k,v]) => `${v} ${k}`).join(', ');
    this.state.log.push({ text: `> ${this.enemy.name} DEFEATED! +${xp} XP | ${gristStr}`, cls: 'log-system' });

    this._emit();
    return { won: true, xp, grist, levelUps: levels };
  }

  _playerDefeated() {
    this.state.over = true;
    this.state.won  = false;
    this.state.log.push({ text: `> You have been slain. Your Dream Self wakes on ${this.player.dreamMoon}.`, cls: 'log-enemy-hit' });
    this._emit();
    return { won: false };
  }

  _isPlayerTurn() {
    return this.state.turn === 'player' && !this.state.over;
  }

  _emit() {
    // Snapshot for consumers
    return {
      state:  { ...this.state },
      player: { hp: this.player.hp, maxHp: this.player.maxHp, hpPct: this.player.hpPercent() },
      enemy:  { hp: this.enemy.hp, maxHp: this.enemy.maxHp, hpPct: Math.floor(this.enemy.hp / this.enemy.maxHp * 100) },
    };
  }

  _applyClassAspectResonance(source) {
    const vector = CLASS_VECTORS[this.player.playerClass] || { verb: 'channels', scalar: 1 };
    const apply = ASPECT_METAPHYSICS[this.player.aspect];
    if (!apply) return;
    const result = apply(this.player, this.enemy, this.state, vector.scalar) || {};
    this.state.log.push({
      text: `> CLASSPECT RESONANCE (${source.toUpperCase()}): ${this.player.playerClass} ${vector.verb} ${this.player.aspect}. ${result.text || ''}`.trim(),
      cls: 'log-system',
    });
  }

  snapshot() {
    return this._emit();
  }

  // ─── Static helpers ────────────────────────────────────────────────────────
  static abilityFor(playerClass) {
    return CLASS_ABILITIES[playerClass] || null;
  }

  static aspectAttackFor(aspect) {
    return ASPECT_ATTACKS[aspect] || { name: 'ASPECT STRIKE', desc: 'Raw aspect power.' };
  }

  // Scale enemy for prototyping count
  static scaleEnemy(enemy, protoCount) {
    const e = JSON.parse(JSON.stringify(enemy));
    e.hp    = Math.floor(e.hp * (1 + protoCount * 0.25));
    e.maxHp = e.hp;
    e.atk   = Math.floor(e.atk * (1 + protoCount * 0.12));
    return e;
  }
}
