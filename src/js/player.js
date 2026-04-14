/**
 * Player — represents the current player's state
 */

import CONFIG from './config.js';

export class Player {
  constructor(kidId) {
    const kid = CONFIG.BETA_KIDS.find(k => k.id === kidId);
    if (!kid) throw new Error(`Unknown kid: ${kidId}`);

    this.kidId       = kidId;
    this.name        = kid.name;
    this.handle      = kid.handle;
    this.initials    = kid.initials;
    this.color       = kid.color;
    this.aspect      = kid.aspect;
    this.playerClass = kid.playerClass;
    this.title       = kid.title;
    this.planet      = kid.planet;
    this.planetFull  = kid.planetFull;
    this.dreamMoon   = kid.dreamMoon;
    this.strifeName  = kid.strife;
    this.startWeapon = kid.startWeapon;
    this.sylladexModus = kid.sylladexModus;
    this.consortIcon  = kid.consortIcon;
    this.consorts     = kid.consorts;
    this.denizen      = kid.denizen;
    this.sprite       = null;       // set after first prototyping

    // ── Stats ──
    this.baseHp  = kid.baseHp;
    this.baseAtk = kid.baseAtk;
    this.maxHp   = kid.baseHp;
    this.hp      = kid.baseHp;
    this.atk     = kid.baseAtk;
    this.def     = 0;
    this.godTier = false;

    // ── Echeladder ──
    this.xp   = 0;
    this.rung = 1;

    // ── Weapon / Armor ──
    const strifeSpec = CONFIG.STRIFE_SPECIBI.find(s => s.name === kid.strife);
    this.equippedWeapon = kid.startWeapon;
    this.equippedArmor  = null;
    this.strifeSpecial  = strifeSpec ? strifeSpec.special      : 'ATTACK';
    this.strifeSpecialDesc = strifeSpec ? strifeSpec.specialDesc : '';

    // ── Grist ──
    this.grist = {};
    CONFIG.GRIST_TYPES.forEach(g => { this.grist[g.id] = 0; });
    this.grist.build = 0;

    // ── Sylladex ──
    this.sylladex = new Sylladex(kid.sylladexModus);

    // ── Phernalia & alchemy progress ──
    this.phernalidDeployed = [];     // ids of deployed phernalia
    this.kernelspriteProto = [];     // up to 2 prototyping objects
    this.countdownActive   = false;
    this.countdownSeconds  = 300;    // 5-minute countdown
    this.alchemyDone       = false;
    this.entryItem         = null;
    this.hasEntered        = false;

    // ── Medium / quest ──
    this.questProgress = 0;          // 0-100%
    this.skaiaVisionsUnlocked = false;
    this.dreamSelfAwake = false;
    this.fraymotifsUnlocked = [];
  }

  // ── Echeladder ─────────────────────────────────────────────────────────────
  gainXp(amount) {
    this.xp += amount;
    const results = [];
    let leveled = true;
    while (leveled) {
      leveled = false;
      const next = CONFIG.ECHELADDER[this.rung]; // rung is 1-indexed; index rung = next
      if (next && this.xp >= next.xp) {
        this.rung += 1;
        this.maxHp  += next.hpBonus;
        this.hp      = Math.min(this.hp + next.hpBonus, this.maxHp);
        this.atk    += next.atkBonus;
        results.push({ rung: this.rung, name: next.name, hpBonus: next.hpBonus, atkBonus: next.atkBonus });
        leveled = true;
      }
    }
    return results; // array of level-up objects
  }

  currentRungData() {
    return CONFIG.ECHELADDER[this.rung - 1];
  }

  nextRungData() {
    return CONFIG.ECHELADDER[this.rung] || null;
  }

  xpToNextRung() {
    const next = this.nextRungData();
    return next ? next.xp - this.xp : 0;
  }

  xpPercent() {
    const cur  = this.currentRungData();
    const next = this.nextRungData();
    if (!next) return 100;
    const range = next.xp - cur.xp;
    const prog  = this.xp  - cur.xp;
    return Math.min(100, Math.floor((prog / range) * 100));
  }

  // ── Health ─────────────────────────────────────────────────────────────────
  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  takeDamage(amount) {
    const actual = Math.max(1, amount - this.def);
    this.hp = Math.max(0, this.hp - actual);
    return actual;
  }

  isAlive() { return this.hp > 0; }
  hpPercent() { return Math.floor((this.hp / this.maxHp) * 100); }

  // ── Grist ──────────────────────────────────────────────────────────────────
  addGrist(bundle) {
    Object.entries(bundle).forEach(([k, v]) => {
      if (this.grist[k] !== undefined) this.grist[k] += v;
    });
  }

  hasGrist(cost) {
    return Object.entries(cost).every(([k, v]) => (this.grist[k] || 0) >= v);
  }

  spendGrist(cost) {
    if (!this.hasGrist(cost)) return false;
    Object.entries(cost).forEach(([k, v]) => { this.grist[k] -= v; });
    return true;
  }

  // ── Kernelsprite ──────────────────────────────────────────────────────────
  protoSprite(obj) {
    if (this.kernelspriteProto.length >= 2) return false;
    this.kernelspriteProto.push(obj);
    this.maxHp  += obj.hpBonus;
    this.hp      = Math.min(this.hp + obj.hpBonus, this.maxHp);
    this.atk    += obj.atkBonus;
    this.sprite  = obj;
    return true;
  }

  // ── Equipment ─────────────────────────────────────────────────────────────
  equipWeapon(item) {
    if (item.specibus && item.specibus !== this.strifeName) return false;
    this.equippedWeapon = item;
    return true;
  }

  equipArmor(item) {
    this.equippedArmor = item;
    this.def = item.def || 0;
    return true;
  }

  totalAtk() {
    return this.atk + (this.equippedWeapon ? this.equippedWeapon.atk : 0);
  }

  // ── God Tier ──────────────────────────────────────────────────────────────
  ascendGodTier() {
    this.godTier = true;
    this.hp = this.maxHp;
    this.atk += 20;
    this.def += 15;
  }

  // ── Serialization ─────────────────────────────────────────────────────────
  toJSON() {
    return {
      kidId: this.kidId, xp: this.xp, rung: this.rung,
      hp: this.hp, maxHp: this.maxHp, atk: this.atk, def: this.def,
      grist: { ...this.grist },
      godTier: this.godTier,
      phernalidDeployed: [...this.phernalidDeployed],
      kernelspriteProto: this.kernelspriteProto.map(o => o.id),
      hasEntered: this.hasEntered,
      questProgress: this.questProgress,
    };
  }
}

// ─── Sylladex ────────────────────────────────────────────────────────────────

export class Sylladex {
  constructor(modusName) {
    this.modusName = modusName;
    this.cards = [];   // array of { item, code }
    const modus = CONFIG.SYLLADEX_MODI.find(m => m.name === modusName);
    this.capacity = modus ? modus.capacity : 10;
    this.ejected  = [];  // items thrown out by failed retrievals
  }

  get size() { return this.cards.length; }

  // Captchalogue (pick up) an item
  captchalogue(item) {
    if (this.cards.length >= this.capacity) return { ok: false, reason: 'Sylladex full!' };
    this.cards.push({ item, code: item.captchaCode || '????????' });
    return { ok: true };
  }

  // Retrieve an item based on modus rules. Returns { item, ejected[] }
  retrieve(index = 0, key = null) {
    if (this.cards.length === 0) return { ok: false, reason: 'Sylladex empty.' };

    switch (this.modusName) {
      case 'Stack': {
        // Only top (last) card accessible
        if (index !== this.cards.length - 1) {
          const ejected = this.cards.splice(index, 1)[0];
          this.ejected.push(ejected.item);
          return { ok: false, reason: `Stack Modus: ejected "${ejected.item.name}" to access the stack!`, ejected: [ejected.item] };
        }
        return { ok: true, item: this.cards.pop().item, ejected: [] };
      }
      case 'Queue': {
        // FIFO — always get index 0
        return { ok: true, item: this.cards.shift().item, ejected: [] };
      }
      case 'Array': {
        if (index < 0 || index >= this.cards.length) return { ok: false, reason: 'Invalid index!' };
        const ejectedItems = this.cards.splice(index + 1).map(c => c.item);
        const got = this.cards.splice(index, 1)[0];
        ejectedItems.forEach(i => this.ejected.push(i));
        return { ok: true, item: got.item, ejected: ejectedItems };
      }
      case 'Hash Map': {
        const idx = this.cards.findIndex(c => c.code === key || c.item.name.toLowerCase() === key?.toLowerCase());
        if (idx === -1) {
          // Hash collision — eject a random card
          const ri = Math.floor(Math.random() * this.cards.length);
          const ejected = this.cards.splice(ri, 1)[0];
          this.ejected.push(ejected.item);
          return { ok: false, reason: `Hash collision! Ejected "${ejected.item.name}".`, ejected: [ejected.item] };
        }
        return { ok: true, item: this.cards.splice(idx, 1)[0].item, ejected: [] };
      }
      case 'Tree': {
        // Only leaf nodes (even indices in simplified model) accessible
        const leaves = this.cards.filter((_, i) => i % 2 === 0 || i === this.cards.length - 1);
        if (leaves.length === 0) return { ok: false, reason: 'No leaf nodes accessible.' };
        const target = leaves[index % leaves.length];
        const realIdx = this.cards.indexOf(target);
        return { ok: true, item: this.cards.splice(realIdx, 1)[0].item, ejected: [] };
      }
      case 'Bag':
      default: {
        // Random
        const ri = Math.floor(Math.random() * this.cards.length);
        return { ok: true, item: this.cards.splice(ri, 1)[0].item, ejected: [] };
      }
    }
  }

  // Get all items as array (for display)
  all() {
    return this.cards.map(c => c.item);
  }

  hasItem(itemId) {
    return this.cards.some(c => c.item.id === itemId);
  }

  // For alchemy: get card by item
  getCard(itemId) {
    return this.cards.find(c => c.item.id === itemId) || null;
  }
}
