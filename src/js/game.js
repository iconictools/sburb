/**
 * SBURB – Game State Machine
 *
 * Manages all game state and transitions between scenes.
 * The lifecycle mirrors the SBURB narrative arc:
 *
 *   quiz → charSelect → prologue → bedroom → serverConnect →
 *   phernalia → kernelsprite1 → countdown → alchemy →
 *   entry → medium → strife → dreaming → godTier → ending
 */

import CONFIG from './config.js';
import { Player } from './player.js';
import { QuizEngine } from './quiz.js';
import { ObjectivesEngine, STAGE } from './objectives.js';

// ─── Game States ──────────────────────────────────────────────────────────────
export const STATE = {
  LOADING:        'loading',
  TITLE:          'title',
  QUIZ:           'quiz',
  QUIZ_RESULT:    'quizResult',
  CHAR_SELECT:    'charSelect',
  PROLOGUE:       'prologue',
  BEDROOM:        'bedroom',
  PESTERCHUM:     'pesterchum',
  INSTALL:        'install',
  SERVER_CONNECT: 'serverConnect',
  PHERNALIA:      'phernalia',
  KERNELSPRITE:   'kernelsprite',
  COUNTDOWN:      'countdown',
  ALCHEMY:        'alchemy',
  ENTRY:          'entry',
  MEDIUM:         'medium',
  STRIFE:         'strife',
  DREAMING:       'dreaming',
  SKAIA:          'skaia',
  QUEST:          'quest',
  GOD_TIER:       'godTier',
  ENDING:         'ending',
};

export class Game {
  constructor() {
    this.state         = STATE.LOADING;
    this.player        = null;
    this.quizEngine    = new QuizEngine();
    this.quizResult    = null;
    this.listeners     = {};      // event listeners
    this.countdownTimer = null;
    this.countdownLeft  = 300;    // seconds
    this.strifeState    = null;   // current combat data
    this.pesterlogs     = [];     // all chat messages shown so far
    this.notifications  = [];
    this.skaiaVisionIdx = 0;
    this.objectives     = null;

    // Persistent flags
    this.flags = {
      pesterOpen:         false,
      sburbInstalled:     false,
      serverConnected:    false,
      cruxtruderOpened:   false,
      kernelspriteProto1: false,
      kernelspriteProto2: false,
      alchemiterUsed:     false,
      entryItemCreated:   false,
      hasEntered:         false,
      dreamSelfAwoken:    false,
      godTierAscended:    false,
      countdownActive:    false,
      entryFailed:        false,
      cardPunched:        false,
      totemCarved:        false,
      exploredLand:       false,
      metConsorts:        false,
      underlingKills:     0,
      questBedFound:      false,
      blackKingDefeated:  false,
      ultimateRewardClaimed: false,
    };
  }

  // ─── Event system ──────────────────────────────────────────────────────────
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(fn => fn(data));
  }

  // ─── State transitions ─────────────────────────────────────────────────────
  transition(newState, data = {}) {
    const prev = this.state;
    this.state = newState;
    this.emit('stateChange', { prev, next: newState, data });
    this._refreshProgress();
  }

  // ─── Quiz ──────────────────────────────────────────────────────────────────
  startQuiz() {
    this.quizEngine.reset();
    this.transition(STATE.QUIZ);
  }

  submitQuizAnswer(questionId, answerIndex) {
    this.quizEngine.recordAnswer(questionId, answerIndex);
    this.emit('quizAnswer', { questionId, answerIndex });

    if (this.quizEngine.answeredMainCount >= this.quizEngine.totalMainQuestions) {
      // Check for tiebreakers
      const pending = this.quizEngine.pendingTiebreakers();
      if (pending.length > 0) {
        this.emit('quizTiebreaker', { pending });
      } else {
        this._finalizeQuiz();
      }
    } else {
      this.emit('quizNextQuestion', { index: this.quizEngine.answeredMainCount });
    }
  }

  submitTiebreaker(type, key, winner) {
    this.quizEngine.recordTiebreaker(type, key, winner);
    const pending = this.quizEngine.pendingTiebreakers();
    if (pending.length > 0) {
      this.emit('quizTiebreaker', { pending });
    } else {
      this._finalizeQuiz();
    }
  }

  _finalizeQuiz() {
    this.quizResult = this.quizEngine.computeResult();
    this.transition(STATE.QUIZ_RESULT, { result: this.quizResult });
  }

  // ─── Character creation ────────────────────────────────────────────────────
  createPlayer(kidIdOrCustom, customName = null) {
    if (kidIdOrCustom === 'custom') {
      // Build a custom player from the quiz result
      this._createCustomPlayer(customName || 'Player');
    } else {
      // Use a preset Beta Kid
      this.player = new Player(kidIdOrCustom);
      // Apply quiz result bonuses if taken
      if (this.quizResult) {
        this._applyQuizBonuses(this.player);
      }
    }
    this.objectives = new ObjectivesEngine(this.player);
    this.objectives.on('objectiveComplete', ({ obj }) => {
      this.emit('notification', { text: `OBJECTIVE COMPLETE: ${obj.title}`, type: 'green' });
    });
    this.objectives.on('stageAdvance', ({ to }) => {
      this.emit('notification', { text: `OBJECTIVES ADVANCED: ${this._stageLabel(to)}`, type: 'yellow' });
    });
    this._refreshProgress();
    this.transition(STATE.PROLOGUE, { player: this.player });
  }

  _createCustomPlayer(name) {
    const r = this.quizResult;
    if (!r) { this.createPlayer('john'); return; }

    // Find matching planet from config
    const planet = CONFIG.PLANETS.find(p => p.aspect === r.aspect) || CONFIG.PLANETS[0];

    // Build a minimal "kid" config for the Player constructor
    // We monkey-patch CONFIG temporarily
    const customKidId = 'custom_' + Date.now();
    const customKid = {
      id:          customKidId,
      name:        name,
      handle:      name.toLowerCase().replace(/\s+/g, '') + 'Player',
      initials:    name.slice(0,2).toUpperCase(),
      color:       this._aspectColor(r.aspect),
      aspect:      r.aspect,
      playerClass: r.playerClass,
      title:       r.title,
      planet:      planet.abbrev,
      planetFull:  planet.name,
      dreamMoon:   r.dreamMoon,
      strife:      r.strife,
      startWeapon: this._startWeaponForStrife(r.strife),
      sylladexModus: r.modus,
      consorts:    planet.consort,
      consortIcon: planet.consortIcon,
      server:      'npc',
      client:      'npc',
      denizen:     planet.denizen || r.denizen,
      sprite:      null,
      questSummary: planet.quest,
      introMessages: [
        { handle: name.slice(0,2).toUpperCase(), text: `You have installed SBURB. The game has begun.` },
        { handle: name.slice(0,2).toUpperCase(), text: `You are the ${r.title}.` },
        { handle: name.slice(0,2).toUpperCase(), text: `Your planet awaits: the ${planet.name}.` },
      ],
      roomDesc: `Your name is ${name.toUpperCase()}. You are a young person standing in your bedroom. You have just received the SBURB beta. Today, everything changes.`,
      icon: this._aspectIcon(r.aspect),
      baseHp:  100,
      baseAtk: 5,
    };

    // Temporarily inject into CONFIG for Player constructor
    CONFIG.BETA_KIDS.push(customKid);
    this.player = new Player(customKidId);
    CONFIG.BETA_KIDS.pop(); // remove after construction

    this._applyQuizBonuses(this.player);
  }

  _applyQuizBonuses(player) {
    // Minor bonuses from classpect
    const r = this.quizResult;
    if (!r) return;
    // Active classes get +2 ATK; passive get +10 HP
    const activeClasses = ['Knight','Witch','Mage','Prince','Thief','Bard'];
    if (activeClasses.includes(r.playerClass)) {
      player.atk += 2;
    } else {
      player.maxHp += 10;
      player.hp    += 10;
    }
  }

  _aspectColor(aspect) {
    const map = { Breath:'#66ccff', Life:'#66ff66', Light:'#ffff66', Time:'#ff8833',
                  Space:'#9966ff', Mind:'#66ffee', Heart:'#ff4488', Blood:'#cc3333',
                  Hope:'#ffffcc',  Rage:'#aa44ff',  Doom:'#447744',  Void:'#334466' };
    return map[aspect] || '#00ff41';
  }

  _aspectIcon(aspect) {
    const map = { Breath:'💨', Life:'🌿', Light:'✨', Time:'⏳', Space:'🌌', Mind:'🧠',
                  Heart:'♥',  Blood:'🩸', Hope:'⭐',  Rage:'⚡',  Doom:'💀',  Void:'🌑' };
    return map[aspect] || '⭐';
  }

  _startWeaponForStrife(strife) {
    const def = CONFIG.STRIFE_SPECIBI.find(s => s.name === strife);
    if (!def) return { id: 'default_weapon', name: 'Weapon', atk: 5, icon: '⚔️' };
    const item = CONFIG.ALCHEMY_ITEMS.find(i => i.id === def.startWeaponId);
    if (!item) return { id: def.startWeaponId, name: def.startWeaponId, atk: 5, icon: '⚔️' };
    return { id: item.id, name: item.name, atk: item.atk, icon: item.icon };
  }

  // ─── Prologue / Pesterchum ─────────────────────────────────────────────────
  openPesterchum() {
    this.flags.pesterOpen = true;
    this.transition(STATE.PESTERCHUM);
    this.emit('pesterOpen', { kid: this.player });
  }

  closePesterchum() {
    this.flags.pesterOpen = false;
    this.transition(STATE.BEDROOM);
  }

  installSburb() {
    if (this.flags.sburbInstalled) return;
    this.flags.sburbInstalled = true;
    this.emit('sburbInstalled', {});
    this._refreshProgress();
    this.transition(STATE.SERVER_CONNECT);
  }

  // ─── Server connection ─────────────────────────────────────────────────────
  serverConnect() {
    this.flags.serverConnected = true;
    this.emit('serverConnected', { server: this.player.server });
    this._refreshProgress();
    setTimeout(() => this.transition(STATE.PHERNALIA), 2000);
  }

  // ─── Phernalia ─────────────────────────────────────────────────────────────
  deployPhernalia(phernaId) {
    const phernalia = CONFIG.PHERNALIA.find(p => p.id === phernaId);
    if (!phernalia) return { ok: false, reason: 'Unknown phernalia.' };

    if (phernalia.requires && !this.player.phernalidDeployed.includes(phernalia.requires)) {
      return { ok: false, reason: `You need the ${phernalia.requires} first.` };
    }

    if (this.player.phernalidDeployed.includes(phernaId)) {
      return { ok: false, reason: 'Already deployed.' };
    }

    this.player.phernalidDeployed.push(phernaId);
    this.emit('phernaDeployed', { phernalia });
    this._refreshProgress();

    if (phernaId === 'cruxtruder') {
      this._openCruxtruder();
    }

    return { ok: true };
  }

  _openCruxtruder() {
    this.flags.cruxtruderOpened = true;
    this.countdownLeft = 300;
    this.emit('cruxtruderOpened', { countdown: this.countdownLeft });
    this.emit('kernelspriteEmerged', {});
    this._startCountdown();
    this.transition(STATE.KERNELSPRITE);
  }

  // ─── Kernelsprite ──────────────────────────────────────────────────────────
  protoKernelsprite(objId) {
    const obj = CONFIG.SPRITE_OBJECTS.find(o => o.id === objId);
    if (!obj) return { ok: false, reason: 'Unknown object.' };

    const ok = this.player.protoSprite(obj);
    if (!ok) return { ok: false, reason: 'Sprite already prototyped twice.' };

    const proto = this.player.kernelspriteProto.length;
    if (proto === 1) {
      this.flags.kernelspriteProto1 = true;
      this.emit('spriteProto1', { obj, sprite: this.player.sprite });
    } else {
      this.flags.kernelspriteProto2 = true;
      this.emit('spriteProto2', { obj, sprite: this.player.sprite });
    }

    this.emit('notification', { text: `${this.player.sprite.name} formed! ${obj.power}`, type: 'yellow' });
    this._refreshProgress();
    return { ok: true, sprite: this.player.sprite };
  }

  // ─── Countdown ─────────────────────────────────────────────────────────────
  _startCountdown() {
    this.flags.countdownActive = true;
    this._refreshProgress();
    this.countdownTimer = setInterval(() => {
      this.countdownLeft -= 1;
      this.emit('countdownTick', { seconds: this.countdownLeft });
      if (this.countdownLeft <= 0) {
        this._meteorsHit();
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.flags.countdownActive = false;
    this._refreshProgress();
  }

  _meteorsHit() {
    this.stopCountdown();
    if (!this.flags.hasEntered) {
      this.flags.entryFailed = true;
      this.emit('meteorsHit', {});
      // Game over — but let the scene handle the animation/retry
      this.emit('gameOver', { reason: 'The meteors destroyed your home before you could enter.' });
    }
  }

  // ─── Alchemy ───────────────────────────────────────────────────────────────
  goToAlchemy() {
    this.transition(STATE.ALCHEMY);
  }

  tryAlchemize(cardCode, gristCost) {
    if (!this.player.hasGrist(gristCost)) {
      return { ok: false, reason: 'Insufficient grist.' };
    }
    this.player.spendGrist(gristCost);
    return { ok: true };
  }

  createEntryItem() {
    const kidId = this.player.kidId;
    // Find the entry item for this kid (or generic if custom)
    let entryItem = CONFIG.ALCHEMY_ITEMS.find(i => i.type === 'entry' && i.forKid === kidId);
    if (!entryItem) {
      entryItem = {
        id: 'cruxite_object',
        name: 'Cruxite Object',
        icon: '💎',
        type: 'entry',
        desc: 'Your entry item. Smash it.',
        grist: { build: 50 },
      };
    }
    this.player.entryItem = entryItem;
    this.flags.entryItemCreated = true;
    this.flags.alchemiterUsed   = true;
    this.emit('entryItemCreated', { item: entryItem });
    this.emit('notification', { text: `${entryItem.name} created! Now smash it to enter the Medium.`, type: 'yellow' });
    this._refreshProgress();
    return { ok: true, item: entryItem };
  }

  // ─── Entry ─────────────────────────────────────────────────────────────────
  smashEntryItem() {
    if (!this.player.entryItem) {
      return { ok: false, reason: 'No entry item.' };
    }
    this.stopCountdown();
    this.flags.hasEntered   = true;
    this.flags.entryFailed  = false;
    this.player.hasEntered  = true;
    this._refreshProgress();
    this.transition(STATE.ENTRY);
    setTimeout(() => this.transition(STATE.MEDIUM), 5000);
    return { ok: true };
  }

  // ─── Medium ────────────────────────────────────────────────────────────────
  startStrife(enemyId) {
    const enemy = CONFIG.ENEMIES.find(e => e.id === enemyId);
    if (!enemy) return;

    // Clone enemy for this battle
    const e = JSON.parse(JSON.stringify(enemy));
    // Scale enemy HP based on prototypings
    const protos = this.player.kernelspriteProto.length;
    e.hp     = Math.floor(e.hp * (1 + protos * 0.2));
    e.maxHp  = e.hp;
    e.atk    = Math.floor(e.atk * (1 + protos * 0.1));

    this.strifeState = {
      enemy: e,
      turn:  'player',    // 'player' | 'enemy'
      log:   [],
      fled:  false,
      over:  false,
      won:   false,
    };

    this.transition(STATE.STRIFE, { enemy: e });
  }

  playerAttack(moveType = 'normal') {
    if (!this.strifeState || this.strifeState.turn !== 'player') return;
    const s = this.strifeState;

    let dmg, logClass;
    if (moveType === 'special') {
      dmg = Math.floor(this.player.totalAtk() * 2.2) + Math.floor(Math.random() * 10);
      logClass = 'log-special';
      s.log.push({ text: `> YOU USE ${this.player.strifeSpecial}! (${dmg} DMG)`, cls: logClass });
    } else {
      const crit = Math.random() < 0.1;
      dmg = Math.floor(this.player.totalAtk() * (crit ? 1.8 : 1)) + Math.floor(Math.random() * 6);
      logClass = crit ? 'log-special' : 'log-hit';
      s.log.push({ text: `> You hit ${s.enemy.name} for ${dmg} damage${crit ? ' (CRIT!)' : ''}.`, cls: logClass });
    }

    s.enemy.hp = Math.max(0, s.enemy.hp - dmg);
    this.emit('strifeUpdate', { state: s });

    if (s.enemy.hp <= 0) {
      this._enemyDefeated();
    } else {
      s.turn = 'enemy';
      setTimeout(() => this._enemyTurn(), 800);
    }
  }

  _enemyTurn() {
    const s = this.strifeState;
    if (!s || s.over) return;

    // Check sprite power — Calsprite sometimes makes enemies flee
    if (this.player.sprite?.id === 'lil_cal_s' && Math.random() < 0.15) {
      s.log.push({ text: `> ${s.enemy.name} FLEES IN TERROR from Calsprite!`, cls: 'log-system' });
      this._enemyDefeated();
      return;
    }

    const dmg = this.player.takeDamage(s.enemy.atk + Math.floor(Math.random() * 5));
    s.log.push({ text: `> ${s.enemy.name} hits you for ${dmg} damage.`, cls: 'log-enemy-hit' });
    this.emit('strifeUpdate', { state: s });

    if (!this.player.isAlive()) {
      s.over = true;
      s.won  = false;
      this.emit('strifeOver', { won: false, enemy: s.enemy });
      this._handleDeath();
    } else {
      s.turn = 'player';
      this.emit('strifeUpdate', { state: s });
    }
  }

  fleeStrife() {
    const s = this.strifeState;
    if (!s) return;
    const success = Math.random() < 0.6;
    if (success) {
      s.fled = true;
      s.over = true;
      this.emit('strifeOver', { fled: true });
      this.transition(STATE.MEDIUM);
    } else {
      s.log.push({ text: '> You couldn\'t get away!', cls: 'log-system' });
      s.turn = 'enemy';
      setTimeout(() => this._enemyTurn(), 500);
      this.emit('strifeUpdate', { state: s });
    }
  }

  _enemyDefeated() {
    const s = this.strifeState;
    s.over = true;
    s.won  = true;

    // Loot
    this.player.addGrist(s.enemy.grist);
    const levelUps = this.player.gainXp(s.enemy.xp);
    const gristStr = Object.entries(s.enemy.grist).map(([k,v]) => `${v} ${k}`).join(', ');
    s.log.push({ text: `> ${s.enemy.name} defeated! Gained ${s.enemy.xp} XP, ${gristStr}.`, cls: 'log-system' });

    this.emit('strifeOver', { won: true, enemy: s.enemy, xp: s.enemy.xp, grist: s.enemy.grist, levelUps });

    if (levelUps.length > 0) {
      levelUps.forEach(l => {
        this.emit('notification', { text: `ECHELADDER: ${l.name} (Rung ${l.rung})! +${l.hpBonus} HP, +${l.atkBonus} ATK`, type: 'yellow' });
      });
    }

    // Quest progress
    this.player.questProgress = Math.min(100, this.player.questProgress + 10);
    this.flags.underlingKills = (this.flags.underlingKills || 0) + 1;
    this.flags.exploredLand = true;
    this.emit('questProgress', { progress: this.player.questProgress });

    if (s.enemy.id === 'black_king') {
      this.flags.blackKingDefeated = true;
      this.emit('notification', { text: 'THE BLACK KING FALLS. The Ultimate Reward is now within reach.', type: 'yellow' });
    }
    this._refreshProgress();
  }

  _handleDeath() {
    if (this.player.godTier) {
      // God Tier immunity — respawn unless Just/Heroic (10% chance)
      const fated = Math.random() < 0.1;
      if (fated) {
        this.emit('godTierDeath', { type: Math.random() < 0.5 ? 'Just' : 'Heroic' });
        this.emit('gameOver', { reason: 'Your death was deemed Just/Heroic. Your God Tier immunity did not apply.' });
      } else {
        this.player.hp = this.player.maxHp;
        this.emit('notification', { text: 'God Tier: death was not Just or Heroic. You are restored.', type: 'cyan' });
        this.transition(STATE.MEDIUM);
      }
    } else {
      this.emit('gameOver', { reason: 'You have been slain. Your Dream Self wakes on your moon.' });
    }
  }

  // ─── Dream / Skaia ─────────────────────────────────────────────────────────
  dreamSelfWake() {
    this.flags.dreamSelfAwoken = true;
    this.player.dreamSelfAwake = true;
    this._refreshProgress();
    this.transition(STATE.DREAMING);
    this.emit('dreamSelfAwoken', { moon: this.player.dreamMoon });
  }

  viewSkaia() {
    this.player.skaiaVisionsUnlocked = true;
    this._refreshProgress();
    this.transition(STATE.SKAIA);
    const vision = CONFIG.SKAIA_VISIONS[this.skaiaVisionIdx % CONFIG.SKAIA_VISIONS.length];
    this.skaiaVisionIdx += 1;
    this.emit('skaiaVision', { text: vision });
  }

  // ─── God Tier ──────────────────────────────────────────────────────────────
  ascendGodTier() {
    if (this.player.questProgress < 80) {
      this.emit('notification', { text: 'Your quest is not complete. The Quest Bed does not accept you.', type: 'red' });
      return false;
    }
    this.player.ascendGodTier();
    this.flags.godTierAscended = true;
    this._refreshProgress();
    this.transition(STATE.GOD_TIER);
    this.emit('godTierAscended', { player: this.player });
    return true;
  }

  // ─── Quest progress ────────────────────────────────────────────────────────
  advanceQuest(amount = 15) {
    this.player.questProgress = Math.min(100, this.player.questProgress + amount);
    this.flags.metConsorts = true;
    this.emit('questProgress', { progress: this.player.questProgress });
    if (this.player.questProgress >= 100) {
      this.emit('notification', { text: 'QUEST COMPLETE. The Quest Bed awaits.', type: 'yellow' });
    }
    this._refreshProgress();
  }

  // ─── Black King ────────────────────────────────────────────────────────────
  startBlackKingBattle() {
    if (this.player.questProgress < 80) {
      return { ok: false, reason: 'Your land quest is not complete enough to challenge the Black King.' };
    }
    if (this.player.rung < 10) {
      this.emit('notification', {
        text: 'WARNING: Rung 10+ is strongly recommended before facing the Black King.',
        type: 'red',
      });
    }
    const bk = JSON.parse(JSON.stringify(CONFIG.BLACK_KING));
    // Scale with prototypings
    const protos = this.player.kernelspriteProto.length;
    bk.hp    = bk.hp    * (1 + protos * 0.5);
    bk.maxHp = bk.hp;
    bk.atk   = bk.atk * (1 + protos * 0.3);
    bk.id    = 'black_king';
    bk.icon  = '♛';
    bk.xp    = CONFIG.BLACK_KING.xp;
    bk.grist = CONFIG.BLACK_KING.grist;
    bk.tier  = 5;
    bk.art   = ['  ♛  ', '(O_O)', ' |_| '];
    bk.desc  = CONFIG.BLACK_KING.desc;

    this.strifeState = {
      enemy: bk, turn: 'player', log: [], fled: false, over: false, won: false,
    };
    this.transition(STATE.STRIFE, { enemy: bk, isFinalBoss: true });
    return { ok: true, enemy: bk };
  }

  winGame() {
    this.flags.blackKingDefeated = true;
    this.flags.ultimateRewardClaimed = true;
    this._refreshProgress();
    this.transition(STATE.ENDING);
    this.emit('victory', { player: this.player });
  }

  markCardPunched() {
    this.flags.cardPunched = true;
    this._refreshProgress();
    return { ok: true };
  }

  markTotemCarved() {
    this.flags.totemCarved = true;
    this._refreshProgress();
    return { ok: true };
  }

  discoverQuestBed() {
    this.flags.questBedFound = true;
    this._refreshProgress();
    return { ok: true };
  }

  claimUltimateReward() {
    if (!this.flags.blackKingDefeated) {
      return { ok: false, reason: 'Defeat the Black King first.' };
    }
    this.flags.ultimateRewardClaimed = true;
    this._refreshProgress();
    this.emit('notification', { text: 'ULTIMATE REWARD CLAIMED. A new universe is born.', type: 'yellow' });
    return { ok: true };
  }

  sessionSnapshot() {
    if (!this.player) return null;
    return {
      player: {
        class: this.player.playerClass,
        aspect: this.player.aspect,
        moon: this.player.dreamMoon,
        strifeSpecibus: this.player.strifeName,
        modus: this.player.sylladexModus,
        rung: this.player.rung,
        xp: this.player.xp,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        atk: this.player.totalAtk(),
        def: this.player.def,
        godTier: this.player.godTier,
      },
      session: {
        prototypingCount: this.player.kernelspriteProto.length,
        prototypingTraits: this.player.kernelspriteProto.map(p => p.id || p.name),
        countdownActive: this.flags.countdownActive,
        countdownLeft: this.countdownLeft,
        phernaliaDeployed: [...this.player.phernalidDeployed],
        entrySuccess: this.flags.hasEntered,
        entryFailed: this.flags.entryFailed,
      },
      quest: {
        progress: this.player.questProgress,
        exploredLand: this.flags.exploredLand,
        metConsorts: this.flags.metConsorts,
        questBedFound: this.flags.questBedFound,
      },
      combat: {
        kills: this.flags.underlingKills,
        critChance: 0.1,
        fleeChance: 0.6,
        blackKingScaling: {
          hpMult: 1 + this.player.kernelspriteProto.length * 0.5,
          atkMult: 1 + this.player.kernelspriteProto.length * 0.3,
        },
      },
    };
  }

  _stageLabel(stage) {
    switch (stage) {
      case STAGE.PRE_ENTRY: return 'Pre-Entry';
      case STAGE.MEDIUM: return 'Medium';
      case STAGE.LATE_GAME: return 'Late-Game';
      case STAGE.FINAL: return 'Finale';
      case STAGE.COMPLETE: return 'Complete';
      default: return 'Unknown';
    }
  }

  _refreshProgress() {
    if (!this.objectives || !this.player) return;
    this.objectives.tick(this.player, this.flags);
    const stageProgress = this.objectives.stageProgress();
    const current = this.objectives.currentObjective();
    this.emit('objectiveUpdate', {
      stage: this.objectives.stage,
      stageLabel: this._stageLabel(this.objectives.stage),
      stageProgress,
      currentObjective: current,
      hints: this.objectives.activeHints(),
      variables: this.sessionSnapshot(),
    });
  }

  // ─── Utility ──────────────────────────────────────────────────────────────
  notify(text, type = 'green') {
    this.emit('notification', { text, type });
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
