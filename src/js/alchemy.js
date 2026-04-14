/**
 * SBURB – Alchemy System
 *
 * Canon-accurate implementation of the captchalogue / alchemy chain:
 *
 *   1. Captchalogue an item  → stored in Sylladex card with 8-char captcha code
 *   2. Punch Designix        → punches the code's hole-pattern onto a blank card
 *   3. Totem Lathe           → uses punched card + Cruxite Dowel → Cruxite Totem
 *   4. Alchemiter            → uses Cruxite Totem → manifests the item
 *
 * COMBINING CARDS (canon):
 *   && (AND / double-punch): hold one punched card over another and punch
 *      through both → creates item combining properties of BOTH.
 *   || (OR  / ghost card):   use a ghost (transparent/inverted) card as
 *      overlay → creates item with properties of EITHER (intersection).
 *
 * CAPTCHA CODES:
 *   Every item has a unique 8-character hexadecimal string.
 *   && combines via bitwise OR  of the two codes (all holes present in either).
 *   || combines via bitwise AND of the two codes (only holes present in both).
 *   The resulting code determines what the Alchemiter produces.
 *
 * GRIST COST:
 *   Each alchemized item has a grist cost. If the player lacks sufficient
 *   grist the Alchemiter cannot run. This is a genuine failure condition.
 */

import CONFIG from './config.js';

// ─── Alchemy Registry ─────────────────────────────────────────────────────────
// Maps captcha code → item definition.
// Built at startup from CONFIG.ALCHEMY_ITEMS.
class AlchemyRegistry {
  constructor() {
    this._byCode = new Map();
    this._byId   = new Map();
    this._build();
  }

  _build() {
    for (const item of (CONFIG.ALCHEMY_ITEMS || [])) {
      this._byCode.set(item.captchaCode, item);
      this._byId.set(item.id, item);
    }
    // Also index room objects that can be captchalogued
    for (const aspect of Object.keys(CONFIG.ROOM_OBJECTS || {})) {
      for (const obj of CONFIG.ROOM_OBJECTS[aspect]) {
        if (obj.captchaCode) {
          this._byCode.set(obj.captchaCode, obj);
          this._byId.set(obj.id, obj);
        }
      }
    }
    for (const obj of (CONFIG.ROOM_CONSTANTS || [])) {
      if (obj.captchaCode) {
        this._byCode.set(obj.captchaCode, obj);
        this._byId.set(obj.id, obj);
      }
    }
  }

  byCode(code) { return this._byCode.get(code) || null; }
  byId(id)     { return this._byId.get(id) || null; }

  // AND-combine two codes (double-punch: bitwise OR of hex strings)
  andCode(codeA, codeB) {
    const a = parseInt(codeA, 16);
    const b = parseInt(codeB, 16);
    return ((a | b) >>> 0).toString(16).padStart(8, '0');
  }

  // OR-combine two codes (ghost-punch: bitwise AND of hex strings)
  orCode(codeA, codeB) {
    const a = parseInt(codeA, 16);
    const b = parseInt(codeB, 16);
    return ((a & b) >>> 0).toString(16).padStart(8, '0');
  }

  // Attempt to find an item matching the combined code exactly.
  // If no exact match, find the closest registered item.
  resolve(code) {
    const exact = this._byCode.get(code);
    if (exact) return exact;

    // Fuzzy match: find the item whose code has the most bits in common
    const target = parseInt(code, 16);
    let bestItem  = null;
    let bestScore = -1;

    for (const [itemCode, item] of this._byCode) {
      const val   = parseInt(itemCode, 16);
      const xor   = (target ^ val) >>> 0;
      // popcount — count bits that MATCH (not differ)
      let match = 0;
      let n = (~xor) >>> 0;
      while (n) { match += n & 1; n >>>= 1; }
      if (match > bestScore) { bestScore = match; bestItem = item; }
    }

    return bestItem;
  }
}

export const REGISTRY = new AlchemyRegistry();

// ─── Punch Designix ──────────────────────────────────────────────────────────
export class PunchDesignix {
  /**
   * Punch the captcha code of `item` onto a blank captchalogue card.
   * Returns a PunchedCard object.
   */
  static punch(item) {
    if (!item || !item.captchaCode) {
      return { ok: false, error: 'Item has no captcha code.' };
    }
    return {
      ok: true,
      card: new PunchedCard(item.captchaCode, item.name, item.icon || '🃏'),
    };
  }

  /**
   * Double-punch (&&): hold cardB over cardA and punch through both.
   * Result has all holes of EITHER card (bitwise OR of codes).
   */
  static doubleAnd(cardA, cardB) {
    const code = REGISTRY.andCode(cardA.code, cardB.code);
    return new PunchedCard(code, `${cardA.sourceName} && ${cardB.sourceName}`, '🃏');
  }

  /**
   * Ghost-punch (||): use the ghost (inverted) of cardB over cardA.
   * Result has only the holes present in BOTH cards (bitwise AND of codes).
   */
  static ghostOr(cardA, cardB) {
    const code = REGISTRY.orCode(cardA.code, cardB.code);
    return new PunchedCard(code, `${cardA.sourceName} || ${cardB.sourceName}`, '👻');
  }
}

// ─── Punched Card ─────────────────────────────────────────────────────────────
export class PunchedCard {
  constructor(code, sourceName, icon = '🃏') {
    this.code       = code;
    this.sourceName = sourceName;
    this.icon       = icon;
    this.isPunched  = true;
  }

  get ghostVersion() {
    // The ghost card is the bitwise NOT of the code (inverted holes)
    const inv = (~parseInt(this.code, 16) & 0xFFFFFFFF) >>> 0;
    return new PunchedCard(inv.toString(16).padStart(8,'0'), `ghost(${this.sourceName})`, '👻');
  }

  display() {
    return `[${this.icon} ${this.sourceName} | code: ${this.code}]`;
  }
}

// ─── Totem Lathe ─────────────────────────────────────────────────────────────
export class TotemLathe {
  /**
   * Carve a Cruxite Dowel using a PunchedCard.
   * Returns a CruxiteTotem or an error.
   *
   * Canon: the Lathe needs both the Dowel (from Cruxtruder) and a Punched Card.
   * The Dowel is consumed. The card is consumed. The Totem is produced.
   */
  static carve(dowel, punchedCard) {
    if (!dowel || dowel.id !== 'cruxite_dowel') {
      return { ok: false, error: 'Need a Cruxite Dowel (from the Cruxtruder).' };
    }
    if (!punchedCard || !punchedCard.isPunched) {
      return { ok: false, error: 'Need a punched Captchalogue Card (from the Punch Designix).' };
    }
    return {
      ok:    true,
      totem: new CruxiteTotem(punchedCard.code, punchedCard.sourceName),
      consumedDowel: true,
      consumedCard:  true,
    };
  }
}

// ─── Cruxite Totem ────────────────────────────────────────────────────────────
export class CruxiteTotem {
  constructor(code, sourceName) {
    this.code       = code;
    this.sourceName = sourceName;
    this.icon       = '🕯️';
  }

  display() {
    return `[Cruxite Totem | carved from: ${this.sourceName} | code: ${this.code}]`;
  }
}

// ─── Alchemiter ───────────────────────────────────────────────────────────────
export class Alchemiter {
  /**
   * Place a CruxiteTotem on the Alchemiter platform.
   * Reads the totem's code, resolves it to an item, checks grist, produces item.
   *
   * Canon: the Alchemiter costs Grist. Running out of Grist = cannot alchemize.
   */
  static alchemize(totem, playerGrist) {
    if (!totem || !totem.code) {
      return { ok: false, error: 'Place a carved Cruxite Totem on the platform.' };
    }

    const item = REGISTRY.resolve(totem.code);
    if (!item) {
      return { ok: false, error: 'The Alchemiter cannot determine what this totem encodes.' };
    }

    // Check grist cost
    const cost = item.gristCost || { build: 5 };
    const missing = [];
    for (const [type, amount] of Object.entries(cost)) {
      const have = (playerGrist[type] || 0);
      if (have < amount) {
        missing.push(`${type}: need ${amount}, have ${have}`);
      }
    }
    if (missing.length > 0) {
      return {
        ok: false,
        error: `Insufficient Grist:\n${missing.join('\n')}`,
        missingGrist: true,
        cost,
      };
    }

    return {
      ok:    true,
      item,
      cost,
      message: `The Alchemiter hums. ${item.icon || '✨'} ${item.name} materializes on the platform.`,
    };
  }

  /**
   * Special case: alchemize the Entry Item.
   * The Entry Item's code comes from the SBURB installation disc itself —
   * it is not something the player punches. It is always available.
   */
  static alchemizeEntryItem(aspect, playerGrist) {
    const entry = CONFIG.ENTRY_ITEMS && CONFIG.ENTRY_ITEMS[aspect];
    if (!entry) {
      return { ok: false, error: 'Entry item data not found for this aspect.' };
    }
    const cost = { build: 25 };
    if ((playerGrist.build || 0) < cost.build) {
      return { ok: false, error: `Need ${cost.build} Build Grist for the Entry Item. Have ${playerGrist.build || 0}.`, missingGrist: true, cost };
    }
    return {
      ok:    true,
      item:  { ...entry, id: 'entry_item', type: 'entry', captchaCode: 'entry0000' },
      cost,
      message: `The Alchemiter blazes with light. The ${entry.name} materializes, glowing faintly.`,
      isEntryItem: true,
    };
  }
}

// ─── Sylladex (Fetch Modus engine) ────────────────────────────────────────────
// Canon modi: Stack, Queue, Array, Hash Map, Tree, Bag, Wallet, Combinatorics.
// Each has a different retrieval mechanic with distinct consequences.

export class Sylladex {
  constructor(modusId, capacity) {
    this.modusId  = modusId;
    this.capacity = capacity;
    this.cards    = [];   // SylladexCard[]
    this.log      = [];
  }

  get modus() {
    return CONFIG.SYLLADEX_MODI
      ? CONFIG.SYLLADEX_MODI.find(m => m.id === this.modusId)
      : { id: this.modusId, name: this.modusId };
  }

  isFull() { return this.cards.length >= this.capacity; }

  // ── Captchalogue (store an item) ───────────────────────────────────────────
  captchalogue(item) {
    if (this.isFull()) {
      this.log.push({ text: `Sylladex full (${this.capacity} cards). Cannot captchalogue ${item.name}.`, type: 'error' });
      return { ok: false, ejected: null };
    }
    const card = new SylladexCard(item);

    switch (this.modusId) {
      case 'stack':
        this.cards.unshift(card); // push to front
        break;
      case 'queue':
        this.cards.push(card);
        break;
      case 'combinatorics':
      case 'array':
      case 'hashmap':
      case 'tree':
      case 'bag':
      case 'wallet':
      default:
        this.cards.push(card);
    }

    this.log.push({ text: `Captchalogued: ${item.icon || '📦'} ${item.name}`, type: 'store' });
    return { ok: true };
  }

  // ── Retrieve an item ───────────────────────────────────────────────────────
  retrieve(query) {
    if (this.cards.length === 0) {
      return { ok: false, item: null, ejected: [] };
    }

    switch (this.modusId) {
      case 'stack':
        return this._retrieveStack(query);
      case 'queue':
        return this._retrieveQueue(query);
      case 'array':
        return this._retrieveArray(query);
      case 'hashmap':
        return this._retrieveHashmap(query);
      case 'bag':
        return this._retrieveBag();
      case 'wallet':
        return this._retrieveWallet(query);
      case 'tree':
        return this._retrieveTree(query);
      case 'combinatorics':
        return this._retrieveCombinatorics(query);
      default:
        return this._retrieveWallet(query);
    }
  }

  _retrieveStack(query) {
    // LIFO: can only get top card. Trying to get any other ejects top cards.
    const top = this.cards[0];
    if (query && top.item.id !== query && top.item.name !== query) {
      // Must eject top card to access anything below
      const ejected = this.cards.shift();
      this.log.push({ text: `Stack modus: ejected ${ejected.item.name} to access below.`, type: 'eject' });
      return { ok: false, item: null, ejected: [ejected.item] };
    }
    this.cards.shift();
    this.log.push({ text: `Retrieved: ${top.item.icon || ''} ${top.item.name}`, type: 'retrieve' });
    return { ok: true, item: top.item, ejected: [] };
  }

  _retrieveQueue(query) {
    // FIFO: must take oldest first
    const oldest = this.cards[0];
    if (query && oldest.item.id !== query && oldest.item.name !== query) {
      this.log.push({ text: `Queue modus: must retrieve ${oldest.item.name} first.`, type: 'warn' });
      return { ok: false, item: null, ejected: [], mustTakeFirst: oldest.item };
    }
    this.cards.shift();
    this.log.push({ text: `Retrieved: ${oldest.item.icon || ''} ${oldest.item.name}`, type: 'retrieve' });
    return { ok: true, item: oldest.item, ejected: [] };
  }

  _retrieveArray(query) {
    // Access by index; items above target index are ejected
    const idx = typeof query === 'number' ? query : this.cards.findIndex(c => c.item.id === query || c.item.name === query);
    if (idx < 0) return { ok: false, item: null, ejected: [] };
    const ejected = this.cards.splice(0, idx);
    const target  = this.cards.shift();
    this.log.push({ text: `Array modus: ejected ${ejected.length} card(s) to reach index ${idx}.`, type: ejected.length > 0 ? 'eject' : 'retrieve' });
    this.log.push({ text: `Retrieved: ${target.item.icon || ''} ${target.item.name}`, type: 'retrieve' });
    return { ok: true, item: target.item, ejected: ejected.map(c => c.item) };
  }

  _retrieveHashmap(query) {
    // Access by name/key; collision ejects a random card
    const idx = this.cards.findIndex(c => c.item.id === query || c.item.name === query);
    if (idx < 0) {
      // Hash miss — eject random card
      const randIdx = Math.floor(Math.random() * this.cards.length);
      const ejected = this.cards.splice(randIdx, 1)[0];
      this.log.push({ text: `Hash Map modus: key "${query}" missed. Ejected ${ejected.item.name}.`, type: 'eject' });
      return { ok: false, item: null, ejected: [ejected.item] };
    }
    const [card] = this.cards.splice(idx, 1);
    this.log.push({ text: `Retrieved: ${card.item.icon || ''} ${card.item.name}`, type: 'retrieve' });
    return { ok: true, item: card.item, ejected: [] };
  }

  _retrieveBag() {
    // Random retrieval
    const idx  = Math.floor(Math.random() * this.cards.length);
    const card = this.cards.splice(idx, 1)[0];
    this.log.push({ text: `Bag modus: randomly retrieved ${card.item.name}.`, type: 'retrieve' });
    return { ok: true, item: card.item, ejected: [] };
  }

  _retrieveWallet(query) {
    // Free access to any card
    const idx = typeof query === 'number'
      ? query
      : this.cards.findIndex(c => c.item.id === query || c.item.name === query);
    if (idx < 0 || idx >= this.cards.length) return { ok: false, item: null, ejected: [] };
    const [card] = this.cards.splice(idx, 1);
    this.log.push({ text: `Retrieved: ${card.item.icon || ''} ${card.item.name}`, type: 'retrieve' });
    return { ok: true, item: card.item, ejected: [] };
  }

  _retrieveTree(query) {
    // Only leaf nodes accessible (last quarter of array approximates leaves)
    const leafStart = Math.floor(this.cards.length / 2);
    const idx = this.cards.slice(leafStart).findIndex(c => c.item.id === query || c.item.name === query);
    if (idx < 0) {
      this.log.push({ text: `Tree modus: "${query}" is not a leaf node and cannot be directly retrieved.`, type: 'warn' });
      return { ok: false, item: null, ejected: [] };
    }
    const realIdx = leafStart + idx;
    const [card]  = this.cards.splice(realIdx, 1);
    this.log.push({ text: `Retrieved leaf node: ${card.item.icon || ''} ${card.item.name}`, type: 'retrieve' });
    return { ok: true, item: card.item, ejected: [] };
  }

  _retrieveCombinatorics(query) {
    // Must solve a math problem to retrieve
    const n = this.cards.length;
    const target = Math.floor(Math.random() * n);
    const answer = typeof query === 'number' ? query : -1;
    if (answer !== target) {
      this.log.push({ text: `Combinatorics modus: wrong combination (needed ${target}). Try again.`, type: 'warn' });
      return { ok: false, item: null, ejected: [], hint: `Solve: C(${n}, k) where k = ${target}` };
    }
    const [card] = this.cards.splice(target, 1);
    this.log.push({ text: `Retrieved: ${card.item.icon || ''} ${card.item.name}`, type: 'retrieve' });
    return { ok: true, item: card.item, ejected: [] };
  }

  // ── Convenience ────────────────────────────────────────────────────────────
  listItems() { return this.cards.map(c => c.item); }
  hasItem(id)  { return this.cards.some(c => c.item.id === id); }
  getItem(id)  { const c = this.cards.find(c => c.item.id === id); return c ? c.item : null; }
}

class SylladexCard {
  constructor(item) {
    this.item = item;
    this.code = item.captchaCode || '00000000';
  }
}
