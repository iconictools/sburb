/**
 * SBURB Game Configuration
 * Contains all static game data: classes, aspects, strife specibi, etc.
 */

const CONFIG = {
  // ─── CLASSES ───────────────────────────────────────────────────────────────
  CLASSES: [
    { name: 'Heir',    desc: 'Inherits and embodies their Aspect',          color: '#3388ff' },
    { name: 'Witch',   desc: 'Manipulates their Aspect directly',           color: '#33dd88' },
    { name: 'Knight',  desc: 'Exploits their Aspect for battle',            color: '#ff8833' },
    { name: 'Seer',    desc: 'Understands and advises through their Aspect',color: '#88aaff' },
    { name: 'Page',    desc: 'Provides their Aspect to others',             color: '#ffcc33' },
    { name: 'Rogue',   desc: 'Steals Aspect and redistributes it',         color: '#ff5533' },
    { name: 'Thief',   desc: 'Steals Aspect for themselves',               color: '#aa33ff' },
    { name: 'Bard',    desc: 'Invites destruction through their Aspect',    color: '#ff3377' },
    { name: 'Mage',    desc: 'Knows their Aspect through experience',      color: '#33ffee' },
    { name: 'Prince',  desc: 'Destroys their Aspect or destroys with it',  color: '#ff4444' },
    { name: 'Maid',    desc: 'Creates or becomes their Aspect',            color: '#ffaacc' },
    { name: 'Sylph',   desc: 'Heals or creates with their Aspect',         color: '#aaffcc' },
  ],

  // ─── ASPECTS ───────────────────────────────────────────────────────────────
  ASPECTS: [
    { name: 'Breath',  desc: 'Freedom, direction, leadership',  color: '#88ddff', icon: '💨' },
    { name: 'Life',    desc: 'Vitality, optimism, nature',      color: '#88ff88', icon: '🌿' },
    { name: 'Light',   desc: 'Luck, knowledge, relevance',      color: '#ffff88', icon: '✨' },
    { name: 'Time',    desc: 'Responsibility, doom, music',     color: '#ff8844', icon: '⏰' },
    { name: 'Space',   desc: 'Creation, size, the universe',    color: '#88aaff', icon: '🌌' },
    { name: 'Mind',    desc: 'Decisions, justice, thought',     color: '#88ffee', icon: '🧠' },
    { name: 'Heart',   desc: 'Soul, identity, emotion',         color: '#ff5577', icon: '♥' },
    { name: 'Blood',   desc: 'Unity, bonds, obligation',        color: '#cc3333', icon: '🩸' },
    { name: 'Hope',    desc: 'Belief, positivity, potential',   color: '#ffffcc', icon: '⭐' },
    { name: 'Rage',    desc: 'Limits, anger, negation',         color: '#aa33ff', icon: '⚡' },
    { name: 'Doom',    desc: 'Death, fate, laws of nature',     color: '#446644', icon: '💀' },
    { name: 'Void',    desc: 'Nothingness, secrets, unknown',   color: '#333366', icon: '🌑' },
  ],

  // ─── STRIFE SPECIBI ────────────────────────────────────────────────────────
  STRIFE_SPECIBI: [
    { name: '2x4kind',    icon: '🪵', weapon: 'Plank of Wood',  atk: 5,  special: 'Splinter' },
    { name: 'Bladekind',  icon: '⚔️',  weapon: 'Butter Knife',  atk: 8,  special: 'Slash' },
    { name: 'Hammerkind', icon: '🔨', weapon: 'Wrench',         atk: 10, special: 'Slam' },
    { name: 'Needlekind', icon: '🪡', weapon: 'Knitting Needle',atk: 6,  special: 'Pierce' },
    { name: 'Bowkind',    icon: '🏹', weapon: 'Toy Bow',        atk: 7,  special: 'Volley' },
    { name: 'Wandkind',   icon: '🪄', weapon: 'Stick',          atk: 6,  special: 'Zap' },
    { name: 'Riflekind',  icon: '🔫', weapon: 'BB Gun',         atk: 9,  special: 'Burst' },
    { name: 'Clubkind',   icon: '🏏', weapon: 'Baseball Bat',   atk: 8,  special: 'Batter Up' },
  ],

  // ─── SYLLADEX MODI ─────────────────────────────────────────────────────────
  SYLLADEX_MODI: [
    { name: 'Stack',    desc: 'LIFO — last in, first out. Items stack on top of each other.' },
    { name: 'Queue',    desc: 'FIFO — first in, first out. Items form a line.' },
    { name: 'Array',    desc: 'Items stored by index. Retrieving wrong slot ejects the item.' },
    { name: 'Hash Map', desc: 'Items stored by key. Fast lookup, but keys can collide.' },
    { name: 'Tree',     desc: 'Binary tree structure. Only leaf items are accessible.' },
    { name: 'Bag',      desc: 'Random retrieval. Any item could come out at any time.' },
  ],

  // ─── GRIST TYPES ───────────────────────────────────────────────────────────
  GRIST_TYPES: [
    { id: 'build',    name: 'Build',    color: '#888888', desc: 'The universal resource.' },
    { id: 'shale',    name: 'Shale',    color: '#4a4a6a', desc: 'From imps on stone planets.' },
    { id: 'marble',   name: 'Marble',   color: '#c8c8d8', desc: 'Polished grist of elegance.' },
    { id: 'obsidian', name: 'Obsidian', color: '#6633aa', desc: 'Dark, volcanic mineral.' },
    { id: 'tar',      name: 'Tar',      color: '#665500', desc: 'Sticky arcane substance.' },
    { id: 'ruby',     name: 'Ruby',     color: '#ff0044', desc: 'Precious red crystals.' },
    { id: 'amber',    name: 'Amber',    color: '#cc8800', desc: 'Ancient preserved resin.' },
    { id: 'cobalt',   name: 'Cobalt',   color: '#0055cc', desc: 'Blue metallic grist.' },
  ],

  // ─── PHERNALIA ─────────────────────────────────────────────────────────────
  PHERNALIA: [
    {
      id: 'cruxtruder',
      name: 'Cruxtruder',
      icon: '🔩',
      desc: 'Creates Cruxite Dowels from the Kernelsprite. You need these for alchemy.',
      cost: { build: 0 },
      unlocks: 'cruxite_dowel',
      position: { left: '15%', top: '45%' },
    },
    {
      id: 'totem_lathe',
      name: 'Totem Lathe',
      icon: '🪜',
      desc: 'Carves a Cruxite Dowel into a Cruxite Totem using a punched card.',
      cost: { build: 0 },
      requires: 'cruxtruder',
      position: { left: '65%', top: '45%' },
    },
    {
      id: 'punch_designix',
      name: 'Punch Designix',
      icon: '🖨️',
      desc: 'Punches holes in a Captchalogue Card to encode an alchemical formula.',
      cost: { build: 0 },
      position: { left: '40%', top: '65%' },
    },
    {
      id: 'alchemiter',
      name: 'Alchemiter',
      icon: '⚗️',
      desc: 'Uses a Cruxite Totem to manifest an item. The Entry item is created here.',
      cost: { build: 0 },
      requires: 'totem_lathe',
      position: { left: '80%', top: '65%' },
    },
  ],

  // ─── ALCHEMY RECIPES ────────────────────────────────────────────────────────
  // Simple combinatorial alchemy (card1 || card2, card1 && card2)
  ALCHEMY_RECIPES: [
    {
      id: 'cruxite_apple',
      name: 'Cruxite Apple',
      icon: '🍎',
      type: 'entry',
      desc: 'The Entry item. Carve this, smash it on the ground, and enter the Medium.',
      atk: 0, def: 5,
      grist: { build: 50 },
    },
    {
      id: 'strifekind_upgrade',
      name: 'Upgraded Weapon',
      icon: '⚔️',
      type: 'weapon',
      desc: 'A stronger version of your strife weapon.',
      atk: 15, def: 0,
      grist: { build: 30, shale: 10 },
    },
    {
      id: 'armor_shirt',
      name: 'Armor Shirt',
      icon: '🧥',
      type: 'armor',
      desc: 'Basic armored shirt. +10 defense.',
      atk: 0, def: 10,
      grist: { build: 20, marble: 5 },
    },
    {
      id: 'godtier_prototype',
      name: 'God Tier Prototype',
      icon: '✨',
      type: 'special',
      desc: 'A prototype weapon infused with your Aspect.',
      atk: 30, def: 10,
      grist: { build: 100, ruby: 20, obsidian: 10 },
    },
  ],

  // ─── ENEMIES ───────────────────────────────────────────────────────────────
  ENEMIES: [
    {
      id: 'imp',
      name: 'Shale Imp',
      art: `  /\\__/\\
 ( o.o  )
  > ^ <
 /|   |\\`,
      hp: 30, maxHp: 30, atk: 5, def: 1,
      grist: { build: 10, shale: 3 },
      xp: 15,
      type: 'imp',
    },
    {
      id: 'ogre',
      name: 'Underling Ogre',
      art: `  _____
 /o   o\\
|  ___  |
 \\_____/
  |   |`,
      hp: 80, maxHp: 80, atk: 12, def: 4,
      grist: { build: 30, marble: 8, shale: 5 },
      xp: 50,
      type: 'ogre',
    },
    {
      id: 'basilisk',
      name: 'Basilisk',
      art: `  __===__
 (  o  o )
  \\~~~~~/ 
   |||||`,
      hp: 50, maxHp: 50, atk: 8, def: 2,
      grist: { build: 20, obsidian: 5 },
      xp: 30,
      type: 'basilisk',
    },
    {
      id: 'lich',
      name: 'Lich',
      art: `   ___
  /x x\\
 | ___ |
  \\___/
  |___|`,
      hp: 120, maxHp: 120, atk: 18, def: 6,
      grist: { build: 50, ruby: 10, tar: 10 },
      xp: 100,
      type: 'lich',
    },
  ],

  // ─── ECHELADDER RUNGS ──────────────────────────────────────────────────────
  ECHELADDER: [
    { rung: 1,  name: 'Pupa Pan',           xpRequired: 0   },
    { rung: 2,  name: 'Pony Rider',         xpRequired: 30  },
    { rung: 3,  name: 'Squabbling Squire',  xpRequired: 80  },
    { rung: 4,  name: 'Daring Dastard',     xpRequired: 160 },
    { rung: 5,  name: 'Gallant Galloot',    xpRequired: 280 },
    { rung: 6,  name: 'Formidable Fighter', xpRequired: 450 },
    { rung: 7,  name: 'Paragon Pirate',     xpRequired: 680 },
    { rung: 8,  name: 'Heroic Hoodlum',     xpRequired: 980 },
    { rung: 9,  name: 'Legendary Loser',    xpRequired: 1350},
    { rung: 10, name: 'Wicked Windbag',     xpRequired: 1800},
  ],

  // ─── CHAT MESSAGES (Pesterchum simulation) ─────────────────────────────────
  PESTERCHUM_INTRO: [
    {
      handle: 'ectoBiologist',
      color: '#0715cd',
      messages: [
        'EB: oh man oh man oh man.',
        'EB: i got the beta!',
        'EB: SBURB BETA!!!!',
        'EB: have you installed it yet?',
        'EB: you should install it we can connect.',
        'EB: i\'ll be your server player!',
      ],
    },
    {
      handle: 'turntechGodhead',
      color: '#ff0000',
      messages: [
        'TG: yo',
        'TG: yeah i heard about that game',
        'TG: supposed to be some kind of reality altering deal',
        'TG: sounds p intense',
        'TG: better install it before something destroys your house',
        'TG: just saying',
      ],
    },
    {
      handle: 'gardenGnostic',
      color: '#4ac925',
      messages: [
        'GG: ohh that sounds so exciting!!',
        'GG: sburb!! i read that it actually changes things in real life',
        'GG: like you and a server player are connected',
        'GG: and the server player can move things in your house!!',
        'GG: you should install it right away :)',
      ],
    },
  ],

  // ─── PLANET DATA ───────────────────────────────────────────────────────────
  PLANETS: [
    {
      aspect: 'Breath',
      name: 'Land of Wind and Shade',
      abbrev: 'LOWAS',
      color: '#4488cc',
      desc: 'A world of perpetual darkness and howling winds. Consorts: Salamanders.',
      consort: '🦎',
    },
    {
      aspect: 'Life',
      name: 'Land of Frost and Frogs',
      abbrev: 'LOFAF',
      color: '#44aaaa',
      desc: 'A frozen world teeming with frogs. Consorts: Turtles.',
      consort: '🐢',
    },
    {
      aspect: 'Light',
      name: 'Land of Light and Rain',
      abbrev: 'LOLAR',
      color: '#cccc44',
      desc: 'A dazzlingly bright world of endless rain. Consorts: Iguanas.',
      consort: '🦎',
    },
    {
      aspect: 'Time',
      name: 'Land of Heat and Clockwork',
      abbrev: 'LOHAC',
      color: '#cc6622',
      desc: 'A clockwork world of lava and gears. Consorts: Crocodiles.',
      consort: '🐊',
    },
    {
      aspect: 'Space',
      name: 'Land of Quartz and Melody',
      abbrev: 'LOQAM',
      color: '#8866cc',
      desc: 'A crystalline world resonating with music. Consorts: Cats.',
      consort: '🐱',
    },
    {
      aspect: 'Mind',
      name: 'Land of Maps and Treasure',
      abbrev: 'LOMAT',
      color: '#44ccaa',
      desc: 'A world of labyrinthine maps and hidden treasure. Consorts: Turtles.',
      consort: '🐢',
    },
    {
      aspect: 'Heart',
      name: 'Land of Rays and Frogs',
      abbrev: 'LORAF',
      color: '#cc4488',
      desc: 'A warm world of light and leaping frogs. Consorts: Cats.',
      consort: '🐱',
    },
    {
      aspect: 'Blood',
      name: 'Land of Pulse and Haze',
      abbrev: 'LOPAH',
      color: '#aa2222',
      desc: 'A world of mist and rhythmic pulsing. Consorts: Crocodiles.',
      consort: '🐊',
    },
    {
      aspect: 'Hope',
      name: 'Land of Wrath and Angels',
      abbrev: 'LOWAA',
      color: '#ccccaa',
      desc: 'A heavenly world of angelic architecture. Consorts: Turtles.',
      consort: '🐢',
    },
    {
      aspect: 'Rage',
      name: 'Land of Tents and Mirth',
      abbrev: 'LOTAM',
      color: '#7744cc',
      desc: 'A world of colorful tents and inexplicable humor. Consorts: Iguanas.',
      consort: '🦎',
    },
    {
      aspect: 'Doom',
      name: 'Land of Tombs and Krypton',
      abbrev: 'LOTAK',
      color: '#336644',
      desc: 'A desolate world of ancient tombs. Consorts: Salamanders.',
      consort: '🦎',
    },
    {
      aspect: 'Void',
      name: 'Land of Crypts and Helium',
      abbrev: 'LOCAH',
      color: '#333366',
      desc: 'A dark world of whispering crypts. Consorts: Turtles.',
      consort: '🐢',
    },
  ],

  // ─── KERNELSPRITE PROTOTYPINGS ─────────────────────────────────────────────
  SPRITE_OBJECTS: [
    { id: 'cat',    name: 'Cat',    icon: '🐈', power: 'Nine Lives — 9-life Sprite' },
    { id: 'clown',  name: 'Clown',  icon: '🤡', power: 'Honk Blast — AoE attack' },
    { id: 'wizard', name: 'Wizard', icon: '🧙', power: 'Arcane — magic bonus +10' },
    { id: 'robot',  name: 'Robot',  icon: '🤖', power: 'Analyze — see enemy stats' },
    { id: 'skull',  name: 'Skull',  icon: '💀', power: 'Terror — enemies flee' },
    { id: 'angel',  name: 'Angel',  icon: '👼', power: 'Blessing — passive healing' },
    { id: 'flower', name: 'Flower', icon: '🌺', power: 'Bloom — regenerate HP' },
    { id: 'sword',  name: 'Sword',  icon: '🗡️',  power: 'Combat — attack +5' },
  ],
};

export default CONFIG;
