/**
 * SBURB Personality Quiz — Classpect Determination System
 *
 * Pokémon Mystery Dungeon-style questionnaire that derives the player's
 * CLASSPECT (Class + Aspect) from their answers. The classpect then
 * determines their planet, denizen, dream moon, strife specibus,
 * sylladex modus, God Tier power, and narrative role.
 *
 * ── CLASS THEORY (canon) ─────────────────────────────────────────────────
 * Classes come in Active/Passive pairs. Active classes DO the thing to
 * their Aspect; Passive classes have the thing happen TO them or THROUGH them.
 *
 *   Active  ↔  Passive
 *   Witch   ↔  Heir      (direct manipulation / inheritance)
 *   Knight  ↔  Page      (exploitation / service / potential)
 *   Prince  ↔  Bard      (destruction / invitation of destruction)
 *   Thief   ↔  Rogue     (steal for self / redistribute to others)
 *   Mage    ↔  Seer      (knowledge through suffering / perception)
 *   Maid    ↔  Sylph     (creation / healing/restoration)
 *
 * ── ASPECT THEORY (canon) ────────────────────────────────────────────────
 * Aspects represent broad cosmic concepts. Each player embodies one.
 *
 *   Breath – freedom, movement, direction, leadership, detachment
 *   Life   – vitality, growth, optimism, healing, abundance
 *   Light  – luck, knowledge, information, relevance, revelation
 *   Time   – time, music, doom, responsibility, loops, rhythm
 *   Space  – creation, scale, the void, frogs, the genesis frog
 *   Mind   – thought, decisions, justice, consequence, logic
 *   Heart  – soul, identity, emotion, the self, passion
 *   Blood  – unity, bonds, obligation, community, fellowship
 *   Hope   – belief, potential, faith, idealism, angels
 *   Rage   – limits, fury, negation, nihilism, intensity
 *   Doom   – death, fate, sacrifice, natural law, inevitability
 *   Void   – nothingness, secrets, the unknown, irrelevance, erasure
 */

// ─── Scoring weights ──────────────────────────────────────────────────────────
// Each answer adds weighted points to specific classes and aspects.
// 3 = strong indicator, 2 = moderate, 1 = weak

const CLASSES = ['Heir','Seer','Page','Maid','Sylph','Rogue','Knight','Witch','Mage','Prince','Thief','Bard'];
const ASPECTS = ['Breath','Life','Light','Time','Space','Mind','Heart','Blood','Hope','Rage','Doom','Void'];

// ─── Quiz Questions ───────────────────────────────────────────────────────────
export const QUIZ_QUESTIONS = [
  // ── Q1: First instinct ──────────────────────────────────────────────────────
  {
    id: 'q01',
    category: 'action',
    text: "A countdown has begun. You have limited time. Your FIRST instinct is to:",
    answers: [
      {
        text: "Start moving immediately — you'll figure it out as you go.",
        scores: { classes: { Knight: 3, Witch: 2 }, aspects: { Breath: 3, Life: 1 } },
      },
      {
        text: "Assess the situation carefully before committing to anything.",
        scores: { classes: { Seer: 3, Mage: 2 }, aspects: { Mind: 3, Light: 2 } },
      },
      {
        text: "Make sure everyone around you is safe before you do anything.",
        scores: { classes: { Sylph: 3, Page: 2 }, aspects: { Blood: 3, Life: 2 } },
      },
      {
        text: "Figure out what this situation WANTS from you — then respond.",
        scores: { classes: { Heir: 3, Seer: 1 }, aspects: { Doom: 2, Void: 2 } },
      },
      {
        text: "Immediately start probing the rules of the situation for weaknesses.",
        scores: { classes: { Witch: 3, Prince: 2 }, aspects: { Void: 2, Rage: 2 } },
      },
    ],
  },

  // ── Q2: Social role ──────────────────────────────────────────────────────────
  {
    id: 'q02',
    category: 'social',
    text: "Among your friends, you are most naturally:",
    answers: [
      {
        text: "The one who pushes everyone forward when they'd rather give up.",
        scores: { classes: { Heir: 3, Knight: 2 }, aspects: { Breath: 3, Blood: 2 } },
      },
      {
        text: "The one everyone comes to for guidance and perspective.",
        scores: { classes: { Seer: 3, Mage: 2 }, aspects: { Light: 3, Mind: 2 } },
      },
      {
        text: "The glue — you hold the group together when things get bad.",
        scores: { classes: { Rogue: 3, Sylph: 2 }, aspects: { Blood: 3, Life: 2 } },
      },
      {
        text: "The wildcard who keeps everything unpredictable and interesting.",
        scores: { classes: { Witch: 2, Bard: 3 }, aspects: { Void: 2, Rage: 2 } },
      },
      {
        text: "The one who quietly provides what others need before they even ask.",
        scores: { classes: { Page: 3, Maid: 2 }, aspects: { Life: 3, Blood: 1 } },
      },
    ],
  },

  // ── Q3: Power ────────────────────────────────────────────────────────────────
  {
    id: 'q03',
    category: 'values',
    text: "What does 'POWER' mean to you?",
    answers: [
      {
        text: "Freedom — having power means no one can control you.",
        scores: { classes: { Witch: 3, Thief: 2 }, aspects: { Breath: 3, Void: 2 } },
      },
      {
        text: "Responsibility — power is a weight you carry for others.",
        scores: { classes: { Heir: 3, Knight: 2 }, aspects: { Blood: 3, Doom: 2 } },
      },
      {
        text: "Knowledge — real power is knowing what others don't.",
        scores: { classes: { Seer: 3, Mage: 2 }, aspects: { Light: 3, Void: 2 } },
      },
      {
        text: "Creation — the ability to make something that didn't exist before.",
        scores: { classes: { Maid: 3, Witch: 1 }, aspects: { Space: 3, Life: 2 } },
      },
      {
        text: "Negation — the ability to say NO. To stop what shouldn't continue.",
        scores: { classes: { Prince: 3, Rogue: 1 }, aspects: { Rage: 3, Doom: 2 } },
      },
    ],
  },

  // ── Q4: Rules ────────────────────────────────────────────────────────────────
  {
    id: 'q04',
    category: 'values',
    text: "Rules and laws exist to:",
    answers: [
      {
        text: "Be bent or broken strategically. They're tools, not masters.",
        scores: { classes: { Witch: 3, Knight: 2 }, aspects: { Breath: 2, Light: 2 } },
      },
      {
        text: "Protect the community. Without them, we fall apart.",
        scores: { classes: { Heir: 2, Page: 3 }, aspects: { Blood: 3, Life: 2 } },
      },
      {
        text: "Be deeply understood — their purpose reveals something true.",
        scores: { classes: { Mage: 3, Seer: 2 }, aspects: { Mind: 3, Doom: 2 } },
      },
      {
        text: "Be abolished. They're just someone else's cage.",
        scores: { classes: { Prince: 3, Thief: 2 }, aspects: { Rage: 3, Void: 2 } },
      },
      {
        text: "Be accepted. Some things are fixed, and that's actually okay.",
        scores: { classes: { Bard: 2, Heir: 2 }, aspects: { Doom: 3, Time: 2 } },
      },
    ],
  },

  // ── Q5: Fear ──────────────────────────────────────────────────────────────────
  {
    id: 'q05',
    category: 'inner',
    text: "The thing that keeps you up at night is:",
    answers: [
      {
        text: "Whether you're really free — truly, genuinely free.",
        scores: { classes: { Heir: 2, Witch: 2 }, aspects: { Breath: 3, Heart: 2 } },
      },
      {
        text: "Whether the people you love are safe.",
        scores: { classes: { Sylph: 3, Page: 2 }, aspects: { Blood: 3, Life: 2 } },
      },
      {
        text: "Whether any of it actually means anything.",
        scores: { classes: { Bard: 3, Mage: 2 }, aspects: { Void: 3, Doom: 2 } },
      },
      {
        text: "Whether you're making the right decisions in the moments that matter.",
        scores: { classes: { Knight: 2, Seer: 3 }, aspects: { Mind: 3, Time: 2 } },
      },
      {
        text: "Whether you'll ever become who you're supposed to be.",
        scores: { classes: { Heir: 2, Maid: 2 }, aspects: { Heart: 3, Hope: 2 } },
      },
    ],
  },

  // ── Q6: Conflict ──────────────────────────────────────────────────────────────
  {
    id: 'q06',
    category: 'action',
    text: "There is no good answer. Every path forward causes harm. You:",
    answers: [
      {
        text: "Make a decision and own every consequence. Hesitation causes more damage.",
        scores: { classes: { Knight: 3, Prince: 2 }, aspects: { Mind: 3, Blood: 2 } },
      },
      {
        text: "Find the third option no one thought of. There's always another way.",
        scores: { classes: { Witch: 3, Maid: 2 }, aspects: { Space: 3, Hope: 2 } },
      },
      {
        text: "Accept that sometimes there are no good answers. Make peace with it.",
        scores: { classes: { Bard: 3, Seer: 1 }, aspects: { Doom: 3, Void: 2 } },
      },
      {
        text: "Fight like hell for what you believe is right, consequences be damned.",
        scores: { classes: { Prince: 2, Knight: 2 }, aspects: { Rage: 3, Hope: 2 } },
      },
      {
        text: "Ask what the people affected need. Their voice matters most.",
        scores: { classes: { Rogue: 3, Sylph: 2 }, aspects: { Life: 2, Blood: 3 } },
      },
    ],
  },

  // ── Q7: Time ──────────────────────────────────────────────────────────────────
  {
    id: 'q07',
    category: 'inner',
    text: "Your relationship with time is best described as:",
    answers: [
      {
        text: "Always moving — toward something, away from something. Never still.",
        scores: { classes: { Witch: 2, Heir: 2 }, aspects: { Breath: 3, Life: 2 } },
      },
      {
        text: "Haunted — by the past, by what was lost, by choices I can't unmake.",
        scores: { classes: { Mage: 3, Knight: 2 }, aspects: { Time: 3, Doom: 2 } },
      },
      {
        text: "Immediate — right now is the only real thing. The rest is abstraction.",
        scores: { classes: { Witch: 2, Prince: 1 }, aspects: { Life: 2, Rage: 3 } },
      },
      {
        text: "Cyclical — things repeat. History turns on itself. Maybe that's okay.",
        scores: { classes: { Bard: 2, Seer: 2 }, aspects: { Time: 2, Blood: 3 } },
      },
      {
        text: "Mysterious — I'm comfortable not knowing what comes next.",
        scores: { classes: { Page: 2, Heir: 1 }, aspects: { Void: 3, Hope: 2 } },
      },
    ],
  },

  // ── Q8: Identity ──────────────────────────────────────────────────────────────
  {
    id: 'q08',
    category: 'inner',
    text: "When someone asks 'who are you?' — your most honest answer is:",
    answers: [
      {
        text: "Someone still trying to figure that out.",
        scores: { classes: { Heir: 3, Mage: 2 }, aspects: { Heart: 3, Void: 2 } },
      },
      {
        text: "Someone defined entirely by what they've survived.",
        scores: { classes: { Mage: 3, Knight: 2 }, aspects: { Time: 2, Doom: 3 } },
      },
      {
        text: "Someone whose identity is inseparable from the people they love.",
        scores: { classes: { Rogue: 2, Heir: 2 }, aspects: { Blood: 3, Heart: 2 } },
      },
      {
        text: "Someone who makes things happen.",
        scores: { classes: { Witch: 3, Knight: 2 }, aspects: { Breath: 3, Life: 1 } },
      },
      {
        text: "Someone who sees the things others miss.",
        scores: { classes: { Seer: 3, Thief: 2 }, aspects: { Light: 3, Mind: 2 } },
      },
    ],
  },

  // ── Q9: Emotion under pressure ────────────────────────────────────────────────
  {
    id: 'q09',
    category: 'emotion',
    text: "When something goes terribly wrong, your first genuine feeling is:",
    answers: [
      {
        text: "Anger. Raw and immediate. Someone or something will pay for this.",
        scores: { classes: { Prince: 3, Knight: 2 }, aspects: { Rage: 3, Blood: 1 } },
      },
      {
        text: "Calm. This was always possible. I knew this.",
        scores: { classes: { Seer: 3, Bard: 2 }, aspects: { Doom: 3, Void: 2 } },
      },
      {
        text: "Grief — and then, immediately after, determination.",
        scores: { classes: { Sylph: 2, Knight: 2 }, aspects: { Life: 3, Heart: 2 } },
      },
      {
        text: "Curiosity. What does this change? What does this reveal?",
        scores: { classes: { Mage: 3, Seer: 2 }, aspects: { Mind: 3, Light: 2 } },
      },
      {
        text: "Responsibility. Could I have prevented this? Should I have seen it coming?",
        scores: { classes: { Knight: 2, Mage: 2 }, aspects: { Blood: 2, Time: 3 } },
      },
    ],
  },

  // ── Q10: Create or Destroy ────────────────────────────────────────────────────
  {
    id: 'q10',
    category: 'values',
    text: "If you could do one thing to change the world, you would:",
    answers: [
      {
        text: "Build something completely new that replaces what's broken.",
        scores: { classes: { Maid: 3, Witch: 2 }, aspects: { Space: 3, Life: 2 } },
      },
      {
        text: "Tear down the systems that shouldn't exist in the first place.",
        scores: { classes: { Prince: 3, Thief: 2 }, aspects: { Rage: 3, Doom: 2 } },
      },
      {
        text: "Heal what's broken. Restoration, not demolition.",
        scores: { classes: { Sylph: 3, Rogue: 2 }, aspects: { Life: 3, Blood: 2 } },
      },
      {
        text: "Reveal the truth. Let people see clearly for once.",
        scores: { classes: { Seer: 3, Mage: 2 }, aspects: { Light: 3, Void: 2 } },
      },
      {
        text: "Show everyone that a better way is possible. Inspire them.",
        scores: { classes: { Page: 3, Heir: 2 }, aspects: { Hope: 3, Breath: 2 } },
      },
    ],
  },

  // ── Q11: Final battle ────────────────────────────────────────────────────────
  {
    id: 'q11',
    category: 'action',
    text: "In the final battle, you're fighting for:",
    answers: [
      {
        text: "The people standing right beside you. Nothing else matters in this moment.",
        scores: { classes: { Knight: 3, Sylph: 2 }, aspects: { Blood: 3, Life: 2 } },
      },
      {
        text: "The future you believe in. The one that doesn't exist yet.",
        scores: { classes: { Heir: 3, Page: 2 }, aspects: { Hope: 3, Breath: 2 } },
      },
      {
        text: "Because you've come too far not to. You don't get to stop now.",
        scores: { classes: { Mage: 3, Knight: 2 }, aspects: { Doom: 2, Time: 3 } },
      },
      {
        text: "The truth. Someone has to know what actually happened here.",
        scores: { classes: { Seer: 3, Thief: 2 }, aspects: { Light: 3, Void: 2 } },
      },
      {
        text: "To prove something. To yourself, or to someone who said you couldn't.",
        scores: { classes: { Prince: 2, Mage: 2 }, aspects: { Heart: 3, Rage: 2 } },
      },
    ],
  },

  // ── Q12: Unknown ─────────────────────────────────────────────────────────────
  {
    id: 'q12',
    category: 'inner',
    text: "Faced with something completely and genuinely UNKNOWN, you feel:",
    answers: [
      {
        text: "Excited. Unknown means possibility. This could be anything.",
        scores: { classes: { Page: 3, Heir: 2 }, aspects: { Hope: 3, Void: 2 } },
      },
      {
        text: "Cautious. Information is protection. Gather facts first.",
        scores: { classes: { Seer: 3, Mage: 2 }, aspects: { Light: 3, Mind: 2 } },
      },
      {
        text: "At ease. Everything unknown resolves eventually. No rush.",
        scores: { classes: { Bard: 3, Seer: 1 }, aspects: { Void: 3, Doom: 2 } },
      },
      {
        text: "Hungry. You want to understand it. You need to.",
        scores: { classes: { Mage: 3, Witch: 2 }, aspects: { Space: 2, Light: 3 } },
      },
      {
        text: "Alert. The unknown is often the most dangerous thing.",
        scores: { classes: { Knight: 3, Heir: 2 }, aspects: { Doom: 2, Blood: 3 } },
      },
    ],
  },

  // ── Q13: What you're best at ──────────────────────────────────────────────────
  {
    id: 'q13',
    category: 'social',
    text: "You are at your absolute BEST when you are:",
    answers: [
      {
        text: "Moving — physically, emotionally, socially. Motion is your element.",
        scores: { classes: { Witch: 2, Heir: 3 }, aspects: { Breath: 3, Life: 2 } },
      },
      {
        text: "Alone with a problem. Thinking. Peeling back layers.",
        scores: { classes: { Mage: 3, Seer: 2 }, aspects: { Mind: 2, Void: 3 } },
      },
      {
        text: "Needed. When people genuinely depend on you to come through.",
        scores: { classes: { Sylph: 2, Page: 3 }, aspects: { Blood: 2, Life: 3 } },
      },
      {
        text: "Discovering something. New information, new territory.",
        scores: { classes: { Seer: 2, Mage: 3 }, aspects: { Light: 3, Space: 2 } },
      },
      {
        text: "At the edge of your own limit. Right where it hurts.",
        scores: { classes: { Prince: 2, Knight: 3 }, aspects: { Rage: 3, Doom: 2 } },
      },
    ],
  },

  // ── Q14: Legacy ───────────────────────────────────────────────────────────────
  {
    id: 'q14',
    category: 'values',
    text: "If you could choose your legacy — what you're remembered for — it would be:",
    answers: [
      {
        text: "'They never gave up, even when everyone else did.'",
        scores: { classes: { Heir: 3, Knight: 2 }, aspects: { Breath: 2, Hope: 3 } },
      },
      {
        text: "'They told the truth, even when it was dangerous.'",
        scores: { classes: { Prince: 2, Seer: 3 }, aspects: { Light: 3, Mind: 2 } },
      },
      {
        text: "'They were always there when it mattered most.'",
        scores: { classes: { Sylph: 3, Page: 2 }, aspects: { Blood: 3, Life: 2 } },
      },
      {
        text: "'They changed everything.'",
        scores: { classes: { Witch: 3, Prince: 2 }, aspects: { Space: 2, Rage: 3 } },
      },
      {
        text: "'They understood — truly, deeply understood — what it all meant.'",
        scores: { classes: { Mage: 3, Seer: 2 }, aspects: { Mind: 3, Light: 2 } },
      },
    ],
  },

  // ── Q15: Warning from the future ─────────────────────────────────────────────
  {
    id: 'q15',
    category: 'action',
    text: "A message arrives from a future version of yourself. It says: 'Don't. It ends in catastrophe.' You:",
    answers: [
      {
        text: "Ignore it. Future-me doesn't know what present-me knows. I'll do it anyway.",
        scores: { classes: { Witch: 3, Heir: 2 }, aspects: { Breath: 3, Rage: 2 } },
      },
      {
        text: "Heed it completely. Change course. Prevent the catastrophe.",
        scores: { classes: { Seer: 3, Mage: 2 }, aspects: { Doom: 2, Time: 3 } },
      },
      {
        text: "Investigate first. What IS the catastrophe? What caused it?",
        scores: { classes: { Mage: 3, Seer: 2 }, aspects: { Light: 3, Mind: 2 } },
      },
      {
        text: "Accept that the catastrophe is inevitable. Work to survive it.",
        scores: { classes: { Bard: 3, Heir: 1 }, aspects: { Doom: 3, Void: 2 } },
      },
      {
        text: "Find a third path. There's always something between 'do it' and 'don't.'",
        scores: { classes: { Knight: 2, Witch: 3 }, aspects: { Hope: 3, Space: 2 } },
      },
    ],
  },

  // ── Q16: The deepest thing ────────────────────────────────────────────────────
  {
    id: 'q16',
    category: 'inner',
    text: "Deep down, the thing you most deeply want is:",
    answers: [
      {
        text: "To be free. Completely. Without compromise.",
        scores: { classes: { Witch: 3, Thief: 2 }, aspects: { Breath: 3, Heart: 2 } },
      },
      {
        text: "To understand. Everything. Completely.",
        scores: { classes: { Mage: 3, Seer: 2 }, aspects: { Light: 3, Mind: 2 } },
      },
      {
        text: "To belong. To be part of something that matters.",
        scores: { classes: { Rogue: 2, Page: 2 }, aspects: { Blood: 3, Life: 2 } },
      },
      {
        text: "To create. To make something that didn't exist before you.",
        scores: { classes: { Maid: 3, Witch: 2 }, aspects: { Space: 3, Life: 2 } },
      },
      {
        text: "To matter. To leave a mark. To not disappear without trace.",
        scores: { classes: { Thief: 2, Prince: 2 }, aspects: { Light: 2, Heart: 3 } },
      },
    ],
  },
];

// ─── Tiebreaker questions ─────────────────────────────────────────────────────
// Triggered when top two aspects or classes are within 2 points of each other.

export const TIEBREAKERS = {
  aspects: {
    'Breath-Hope': {
      text: "What drives you forward when everything else fails?",
      answers: [
        { text: "The feeling of movement itself. You just cannot stay still.", wins: 'Breath' },
        { text: "Belief. In a better outcome, in people, in the possibility of things getting better.", wins: 'Hope' },
      ],
    },
    'Breath-Life': {
      text: "What matters more to you?",
      answers: [
        { text: "Freedom. The ability to move, choose, and remain uncontained.", wins: 'Breath' },
        { text: "Vitality. Growth, abundance, the warmth of being fully alive.", wins: 'Life' },
      ],
    },
    'Blood-Life': {
      text: "Your deepest need is:",
      answers: [
        { text: "To BELONG — to feel genuinely, unquestionably connected to others.", wins: 'Blood' },
        { text: "To GROW — to be more alive tomorrow than you are today.", wins: 'Life' },
      ],
    },
    'Time-Doom': {
      text: "What haunts you more?",
      answers: [
        { text: "The mistakes I made. I could have chosen differently.", wins: 'Time' },
        { text: "The ends I cannot escape. Fate is indifferent to my feelings.", wins: 'Doom' },
      ],
    },
    'Void-Mind': {
      text: "When faced with something you don't understand:",
      answers: [
        { text: "I analyze it. I want to understand the logic, the pattern, the why.", wins: 'Mind' },
        { text: "I sit with the not-knowing. Some things aren't meant to be understood.", wins: 'Void' },
      ],
    },
    'Heart-Rage': {
      text: "What is your most dangerous emotion?",
      answers: [
        { text: "The need to be truly KNOWN — authentically, completely seen by someone.", wins: 'Heart' },
        { text: "The desire to BREAK something — to crash through limits and prove they were false.", wins: 'Rage' },
      ],
    },
    'Light-Mind': {
      text: "What do you seek most?",
      answers: [
        { text: "INFORMATION. Facts, data, relevance, the truth of what's actually happening.", wins: 'Light' },
        { text: "UNDERSTANDING. Not just what happened, but why it had to happen.", wins: 'Mind' },
      ],
    },
    'Space-Void': {
      text: "What is the nature of nothingness?",
      answers: [
        { text: "A canvas — the empty space where creation happens.", wins: 'Space' },
        { text: "A state of being — valuable in itself, not defined by what fills it.", wins: 'Void' },
      ],
    },
    'Hope-Blood': {
      text: "What holds a community together?",
      answers: [
        { text: "Shared belief. A vision of something worth being part of.", wins: 'Hope' },
        { text: "Real bonds. Obligation, loyalty, the history of having shown up for each other.", wins: 'Blood' },
      ],
    },
    'Doom-Void': {
      text: "Endings are:",
      answers: [
        { text: "Inevitable — and there's something honest about accepting that.", wins: 'Doom' },
        { text: "Just the absence of what came before. Empty. Silent.", wins: 'Void' },
      ],
    },
  },
  classes: {
    'Heir-Witch': {
      text: "Your relationship with your power is:",
      answers: [
        { text: "I BECOME it. It flows through me. I don't wield it — I am it.", wins: 'Heir' },
        { text: "I DIRECT it. I bend it, shape it, aim it. It does what I tell it.", wins: 'Witch' },
      ],
    },
    'Knight-Page': {
      text: "Your relationship with what you're capable of:",
      answers: [
        { text: "I know exactly what I can do, and I use it completely and efficiently.", wins: 'Knight' },
        { text: "I haven't found my ceiling yet. The potential is still out there.", wins: 'Page' },
      ],
    },
    'Seer-Mage': {
      text: "How do you come to understand something?",
      answers: [
        { text: "By observing clearly — from a careful distance, without distortion.", wins: 'Seer' },
        { text: "By living through it — by failing, suffering, and emerging changed.", wins: 'Mage' },
      ],
    },
    'Maid-Sylph': {
      text: "When it comes to building or healing:",
      answers: [
        { text: "I CREATE. I build from nothing into something. That's my purpose.", wins: 'Maid' },
        { text: "I RESTORE. I find what's broken and make it whole again.", wins: 'Sylph' },
      ],
    },
    'Thief-Rogue': {
      text: "When you take something you shouldn't have:",
      answers: [
        { text: "I keep it. I earned it. It's mine now.", wins: 'Thief' },
        { text: "I redistribute it. Whoever needs it most should have it.", wins: 'Rogue' },
      ],
    },
    'Prince-Bard': {
      text: "Your relationship with destruction:",
      answers: [
        { text: "I destroy deliberately. I choose what ends and I end it.", wins: 'Prince' },
        { text: "Things fall apart around me. I let them. Sometimes that's the only way.", wins: 'Bard' },
      ],
    },
  },
};

// ─── Aspect-specific follow-up flavor ─────────────────────────────────────────
// One extra question per aspect for flavor/confirmation after the main quiz
export const ASPECT_CONFIRMATIONS = {
  Breath: "The wind is calling. It always has been, hasn't it?",
  Life:   "Something in you has always known: growing things don't stop.",
  Light:  "You've always suspected you were looking at something others couldn't see.",
  Time:   "Some part of you has always felt the weight of time pressing down.",
  Space:  "The universe is very large. Have you ever felt like you understood that better than most?",
  Mind:   "Every decision has consequences. You've always felt that acutely.",
  Heart:  "Who you are is the most important question you've ever faced.",
  Blood:  "The people you love aren't just your strength — they're your reason.",
  Hope:   "You've never stopped believing it can get better. Even when you probably should have.",
  Rage:   "You've pushed against things that seemed immovable. And sometimes they moved.",
  Doom:   "You have a very clear sense of how things end.",
  Void:   "Some secrets are meant to stay secret. You understand that.",
};

// ─── Classpect result data ────────────────────────────────────────────────────
// What each class DOES with its aspect + flavor text for the assessment screen

export const CLASSPECT_RESULTS = {
  // Active classes
  Witch: {
    shortDesc: "You manipulate your Aspect directly and willfully. You don't wait for it — you WIELD it.",
    longDesc: "A Witch changes the rules. Where others are bound by their Aspect, you bend it to your will. You act first, think second, and correct course as you go. Your power is real and yours, but it can unsettle those around you. The Witch of Breath rides the wind; the Witch of Time rewrites timelines; the Witch of Space bends reality itself. You are not passive. You are not careful. You are the variable no one accounted for.",
    combatStyle: "Direct manipulation. You change the battlefield's rules mid-fight.",
    weakness: "Impulsiveness. You act before you fully understand consequences.",
  },
  Knight: {
    shortDesc: "You exploit and weaponize your Aspect. It is your tool in battle and in life.",
    longDesc: "A Knight serves others through strength — using their Aspect as a weapon, a shield, a lever. Knights are the soldiers of SBURB, the ones who show up and get the job done. But every Knight carries a hidden cost: they use their Aspect because they don't yet believe in it for its own sake. The Knight of Time wields time loops as weapons but can't yet accept what they mean. The Knight of Blood fights for bonds but struggles to be vulnerable. The Knight's greatest enemy is their own mask.",
    combatStyle: "Exploitation of Aspect. High damage; efficient and relentless.",
    weakness: "Denial. You use your Aspect before you truly understand it.",
  },
  Mage: {
    shortDesc: "You know your Aspect through suffering. You have paid to understand it.",
    longDesc: "A Mage knows — truly, viscerally knows — their Aspect, because they've been hurt by it. The Mage of Doom understands death because they've lost. The Mage of Time knows the weight of timelines because they've lived wrong ones. This knowledge is power, but it's costly. Mages tend toward fatalism, toward self-destruction in service of insight. Their gift is that they're never surprised. Their curse is the same.",
    combatStyle: "Costly power. Trading health and resources for devastating knowledge-based strikes.",
    weakness: "Fatalism. You can see what's coming and struggle to believe it can be changed.",
  },
  Prince: {
    shortDesc: "You destroy your Aspect, or you destroy WITH your Aspect. Either way — things end.",
    longDesc: "A Prince eliminates. The Prince of Hope destroys hope (or uses hope as a weapon of annihilation). The Prince of Heart erases souls, identity, the self. The Prince of Doom ends things that should have ended long ago. Princes are among the most powerful classes in SBURB — and the most dangerous, to enemies and to themselves. Something in you has always been drawn to the irreversible act. The thing that once broken cannot be unbroken.",
    combatStyle: "Pure destruction. Maximum damage; scorched-earth approach.",
    weakness: "Collateral damage. You destroy more than you intend. Sometimes you can't stop.",
  },
  Thief: {
    shortDesc: "You steal your Aspect for yourself. Others have it — you take it.",
    longDesc: "A Thief takes. Not redistributes, not shares — takes, and keeps. The Thief of Light steals luck, leaving others unlucky. The Thief of Life drains vitality. There is something fundamentally acquisitive about the Thief — a belief that power taken is more real than power given. Thieves are often deeply compelling, charismatic, and difficult to hold still. They are also, frequently, alone.",
    combatStyle: "Drain and steal. Take enemy resources and turn them into your own power.",
    weakness: "Isolation. You accumulate Aspect at the cost of the relationships that would give it meaning.",
  },
  Bard: {
    shortDesc: "Chaos flows through you. You invite destruction by your very existence.",
    longDesc: "A Bard is the vessel through which their Aspect annihilates. Bards don't choose destruction — destruction happens around them. The Bard of Rage is a nihilistic clown who unmakes belief. The Bard of Hope is a true believer whose faith accidentally destroys everything it touches. Bards are wildly unpredictable and, at their worst, catastrophically dangerous. At their best, they're catalysts — the chaos that breaks open something that needed to break.",
    combatStyle: "Unleashed chaos. Unpredictable; can backfire catastrophically or land devastatingly.",
    weakness: "Control. You don't always choose when the Aspect acts through you.",
  },
  // Passive classes
  Heir: {
    shortDesc: "You inherit your Aspect. It flows into you, protects you, becomes you.",
    longDesc: "An Heir doesn't fight their Aspect — they grow into it, until the distinction disappears. The Heir of Breath IS the wind: free, directional, unkillable by anything that tries to contain it. The Heir of Doom is protected by fate itself. Heirs often start unaware of their power — it develops slowly, organically, until one day they realize the Aspect is no longer something they have. It's something they are.",
    combatStyle: "Passive mastery. Your Aspect protects you and grows with you.",
    weakness: "Late blooming. Your power is enormous but takes time to manifest.",
  },
  Seer: {
    shortDesc: "You perceive your Aspect with perfect clarity. You are an advisor, a strategist, a guide.",
    longDesc: "A Seer understands. The Seer of Light perceives luck and knowledge — she sees what information is relevant, what paths are fortunate. The Seer of Mind reads decisions and consequences like a map. Seers don't always lead from the front — they lead from behind, whispering the right thing at the right moment. Their curse is knowledge: they often know what's coming and can't stop it, only prepare.",
    combatStyle: "Perception and guidance. You expose weaknesses and exploit information.",
    weakness: "Knowing without doing. You can see the answer clearly and still watch others miss it.",
  },
  Page: {
    shortDesc: "You provide your Aspect to others. You are the servant of your Aspect — and its greatest potential vessel.",
    longDesc: "A Page starts with the least power in their session. They serve. They provide. They enable others to use what they themselves barely understand. But a fully realized Page — one who has worked through their self-doubt and found their footing — becomes one of the most powerful entities in SBURB. The Page of Hope, fully awakened, is the avatar of pure belief. The Page of Breath, matured, is freedom given form. Pages take longest. Pages go furthest.",
    combatStyle: "Supportive. Grows dramatically stronger over the course of the game.",
    weakness: "Self-doubt. Early-game Pages are chronically underestimated, often by themselves.",
  },
  Maid: {
    shortDesc: "You create through your Aspect, or you become it. You are both servant and engine of creation.",
    longDesc: "A Maid creates — draws from their Aspect to build, manifest, bring into being. The Maid of Time can create more time. The Maid of Space can spawn new space. The Maid of Life restores vitality from nothing. Maids are defined by their service to their world — they are always creating for others, even when they don't realize it. The Maid of Life literally creates life. The Maid of Space may be responsible for the universe.",
    combatStyle: "Creation and summoning. Generate resources and advantages from thin air.",
    weakness: "Depletion. You create so much for others that you can lose yourself in the process.",
  },
  Sylph: {
    shortDesc: "You heal through your Aspect. You restore what's broken.",
    longDesc: "A Sylph heals — with their Aspect as the medium. The Sylph of Space heals the fractures in reality. The Sylph of Life heals bodies. The Sylph of Heart heals identity, souls, the fractured sense of self. Sylphs are caregivers, restorers, people who notice what's been hurt and quietly make it whole again. Their power scales with destruction — the more there is to heal, the more capable they become.",
    combatStyle: "Healing and restoration. Maintains the party and recovers from damage.",
    weakness: "Neglecting themselves. Sylphs heal everyone except themselves.",
  },
  Rogue: {
    shortDesc: "You redistribute your Aspect. You take it from those who hoard it and give it to those who need it.",
    longDesc: "A Rogue is a redistributor of cosmic power. The Rogue of Void takes irrelevance and ignorance away from enemies, grants it to allies as camouflage. The Rogue of Life drains vitality from enemies and channels it to wounded friends. Rogues understand one thing deeply: nothing is truly owned. Power flows. Their job is to direct the flow justly.",
    combatStyle: "Redistribution. Steal from enemies and give to allies. Equalizer.",
    weakness: "Self-sacrifice. Rogues naturally give away their own power, leaving themselves exposed.",
  },
};

// ─── Dream Moon assignment ────────────────────────────────────────────────────
// Prospit: connected to Skaia, optimistic, often the 'hero'
// Derse: connected to the Furthest Ring, skeptical, often the 'questioner'
export const DREAM_MOON = {
  Breath: 'Prospit', Life:  'Prospit', Light: 'Derse',  Time:  'Derse',
  Space:  'Prospit', Mind:  'Derse',   Heart: 'Derse',  Blood: 'Prospit',
  Hope:   'Prospit', Rage:  'Derse',   Doom:  'Derse',  Void:  'Derse',
};

// ─── Strife Specibus assignment by Class ─────────────────────────────────────
export const CLASS_STRIFE = {
  Heir:    'Hammerkind',  // John — the direct, powerful heir
  Seer:    'Needlekind',  // Rose — precise, surgical
  Page:    'Bowkind',     // reach further than you can stand
  Maid:    '2x4kind',     // build with whatever's at hand
  Sylph:   'Needlekind',  // healing is precise
  Rogue:   'Riflekind',   // from a distance, redistributing
  Knight:  'Bladekind',   // Dave — efficient, weaponized
  Witch:   'Wandkind',    // Jade-ish — bend reality
  Mage:    'Wandkind',    // knowledge as power
  Prince:  'Bladekind',   // destroy with precision
  Thief:   'Bladekind',   // quick and decisive
  Bard:    'Clubkind',    // blunt chaotic force
};

// ─── Sylladex Modus assignment by Aspect ─────────────────────────────────────
export const ASPECT_MODUS = {
  Breath:  'Stack',     // always at the top of mind; impulsive retrieval
  Life:    'Bag',       // abundant; generous; anything might come up
  Light:   'Hash Map',  // organized by knowledge; fast lookup
  Time:    'Queue',     // things in their proper order
  Space:   'Tree',      // complex, branching, high capacity
  Mind:    'Array',     // structured, indexed, precise
  Heart:   'Stack',     // immediate, emotional, impulsive
  Blood:   'Queue',     // communal, orderly, everyone waits their turn
  Hope:    'Bag',       // optimistic; anything is possible
  Rage:    'Stack',     // all or nothing; you want it NOW
  Doom:    'Queue',     // the inevitable order of things
  Void:    'Hash Map',  // hidden, coded, secret keys
};

// ─── God Tier descriptions ────────────────────────────────────────────────────
export const GOD_TIER_DESC = {
  Heir:   'Your Aspect flows into you completely. You ARE it.',
  Seer:   'Your perception becomes total. You see everything relevant.',
  Page:   'Your potential finally manifests. Full power, at last.',
  Maid:   'You create endlessly from your Aspect.',
  Sylph:  'You heal with total mastery of your Aspect.',
  Rogue:  'You redistribute Aspect with perfect justice.',
  Knight: 'Your Aspect becomes an unstoppable weapon.',
  Witch:  'You rewrite the rules of your Aspect at will.',
  Mage:   'Your suffering becomes absolute, devastating knowledge.',
  Prince: 'You destroy with or through your Aspect completely.',
  Thief:  'You steal Aspect without limit.',
  Bard:   'Destruction flows through you on a cosmic scale.',
};

// ─── Quiz Engine ─────────────────────────────────────────────────────────────
export class QuizEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.scores = {
      classes:  Object.fromEntries(CLASSES.map(c => [c, 0])),
      aspects:  Object.fromEntries(ASPECTS.map(a => [a, 0])),
    };
    this.answeredQuestions = [];
    this.tiebreakerQueue  = [];
    this.tiebreakersDone  = new Set();
    this.phase            = 'main';  // 'main' | 'tiebreaker' | 'done'
    this.currentQ         = 0;
    this.result           = null;
  }

  // Record an answer from the main quiz
  recordAnswer(questionId, answerIndex) {
    const q = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!q) return;
    const a = q.answers[answerIndex];
    if (!a) return;

    this.answeredQuestions.push({ questionId, answerIndex });

    // Apply scores
    if (a.scores.classes) {
      Object.entries(a.scores.classes).forEach(([cls, pts]) => {
        this.scores.classes[cls] = (this.scores.classes[cls] || 0) + pts;
      });
    }
    if (a.scores.aspects) {
      Object.entries(a.scores.aspects).forEach(([asp, pts]) => {
        this.scores.aspects[asp] = (this.scores.aspects[asp] || 0) + pts;
      });
    }
  }

  // Record a tiebreaker answer (wins a specific aspect or class)
  recordTiebreaker(type, key, winner) {
    this.tiebreakersDone.add(`${type}:${key}`);
    if (type === 'aspect') {
      this.scores.aspects[winner] = (this.scores.aspects[winner] || 0) + 5;
    } else {
      this.scores.classes[winner] = (this.scores.classes[winner] || 0) + 5;
    }
  }

  // Get sorted scores
  sortedAspects() {
    return Object.entries(this.scores.aspects)
      .sort(([,a],[,b]) => b - a);
  }

  sortedClasses() {
    return Object.entries(this.scores.classes)
      .sort(([,a],[,b]) => b - a);
  }

  // Check which tiebreakers are needed
  pendingTiebreakers() {
    const pending = [];

    const [asp1, asp2] = this.sortedAspects();
    if (asp1 && asp2 && Math.abs(asp1[1] - asp2[1]) <= 2) {
      const key = [asp1[0], asp2[0]].sort().join('-');
      const tbKey = `aspect:${key}`;
      if (TIEBREAKERS.aspects[key] && !this.tiebreakersDone.has(tbKey)) {
        pending.push({ type: 'aspect', key });
      }
    }

    const [cls1, cls2] = this.sortedClasses();
    if (cls1 && cls2 && Math.abs(cls1[1] - cls2[1]) <= 2) {
      const key = [cls1[0], cls2[0]].sort().join('-');
      const tbKey = `class:${key}`;
      if (TIEBREAKERS.classes[key] && !this.tiebreakersDone.has(tbKey)) {
        pending.push({ type: 'class', key });
      }
    }

    return pending;
  }

  // Compute final result
  computeResult() {
    const [topClass]  = this.sortedClasses()[0];
    const [topAspect] = this.sortedAspects()[0];

    const planet       = this._assignPlanet(topAspect);
    const dreamMoon    = DREAM_MOON[topAspect] || 'Prospit';
    const strife       = CLASS_STRIFE[topClass] || 'Hammerkind';
    const modus        = ASPECT_MODUS[topAspect] || 'Stack';
    const classData    = CLASSPECT_RESULTS[topClass];
    const denizen      = planet ? planet.denizen : 'Typheus';

    // Check if this matches a Beta Kid
    const import_ = () => import('./config.js');
    // We'll pass config from outside; just store the values
    this.result = {
      playerClass:   topClass,
      aspect:        topAspect,
      title:         `${topClass} of ${topAspect}`,
      planet:        planet,
      dreamMoon:     dreamMoon,
      strife:        strife,
      modus:         modus,
      denizen:       denizen,
      classDesc:     classData?.shortDesc || '',
      longDesc:      classData?.longDesc  || '',
      aspectConfirm: ASPECT_CONFIRMATIONS[topAspect] || '',
      godTierDesc:   GOD_TIER_DESC[topClass]          || '',
      scores:        { ...this.scores },
    };

    return this.result;
  }

  _assignPlanet(aspect) {
    // Returns a planet-like object for this aspect
    // We'll import from config at runtime — here return a minimal structure
    // The full PLANETS list is in config.js; scenes.js resolves it
    return { aspect, denizen: this._denizen(aspect) };
  }

  _denizen(aspect) {
    const map = {
      Breath: 'Typheus', Life: 'Hemera', Light: 'Nix', Time: 'Hephaestus',
      Space: 'Echidna', Mind: 'Hemera', Heart: 'Nix', Blood: 'Typheus',
      Hope: 'Hemera', Rage: 'Nix', Doom: 'Typheus', Void: 'Nix',
    };
    return map[aspect] || 'Typheus';
  }

  // Check if result matches a Beta Kid
  matchesBetaKid(result) {
    const matches = {
      'Heir-Breath':    'john',
      'Seer-Light':     'rose',
      'Knight-Time':    'dave',
      'Witch-Space':    'jade',
    };
    return matches[`${result.playerClass}-${result.aspect}`] || null;
  }

  // Progress info
  get totalMainQuestions() { return QUIZ_QUESTIONS.length; }
  get answeredMainCount()  { return this.answeredQuestions.length; }
  get progressPercent()    { return Math.floor((this.answeredMainCount / this.totalMainQuestions) * 100); }
}
