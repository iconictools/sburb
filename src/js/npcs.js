/**
 * SBURB – NPC System
 *
 * All non-player characters: the other Beta Kids (acting as server/client
 * players), the Trolls who contact you mid-game via Trollian, and generic
 * NPC server players for custom characters.
 *
 * ── TYPING QUIRKS (canon) ─────────────────────────────────────────────────
 * Each troll and kid has a specific typing quirk. These are implemented as
 * transform functions that modify raw text.
 *
 * ── PERSONALITY SYSTEMS ───────────────────────────────────────────────────
 * Each NPC has:
 *  - Dialogue trees keyed to game events
 *  - Personality traits that affect response selection
 *  - Classpect that affects their advice/behavior
 *  - Awareness level (what they know about the player's session)
 */

// ─── Typing quirk helpers ─────────────────────────────────────────────────────

const quirks = {
  // John — normal, enthusiastic, no quirk
  ectoBiologist: t => t,

  // Rose — impeccably formal, never uses contractions unless sarcastic
  tentacleTherapist: t => t,

  // Dave — all lowercase, strips most punctuation, stream of consciousness
  turntechGodhead: t => t
    .toLowerCase()
    .replace(/[.!?]+(?=\s|$)/g, '')
    .replace(/,\s+/g, ' ')
    .replace(/"/g, ''),

  // Jade — normal but uses :) ~~ and !!
  gardenGnostic: t => t,

  // Karkat — ALL CAPS, extremely sweary (but we keep it PG)
  carcinoGeneticist: t => t.toUpperCase(),

  // Terezi — replaces E→3, A→@, I→1 (blind dragon-obsessed)
  gallowsCalibrator: t => t
    .toUpperCase()
    .replace(/E/g, '3')
    .replace(/A/g, '@')
    .replace(/I/g, '1'),

  // Vriska — replaces B→8, ate→8, ight→8t (luck-obsessed)
  arachnidsGrip: t => t
    .replace(/\b(great|gr8|ate)\b/gi, 'gr8')
    .replace(/\b(eight|8)\b/gi, '8')
    .replace(/ight\b/gi, '8')
    .replace(/tion\b/gi, '8ion')
    .replace(/b/gi, m => m === 'b' ? '8' : '8'),

  // Aradia — lowercase, calm, uses 0→o (ghost vibes)
  apocalypseArisen: t => t
    .toLowerCase()
    .replace(/\bo\b/g, '0')
    .replace(/\boh\b/gi, '0h'),

  // Sollux — ii for i, 2 for to/too/two, typos doubled consonants
  twinArmageddons: t => t
    .replace(/\bI\b/g, 'ii')
    .replace(/\bi\b/g, 'ii')
    .replace(/\bto\b/gi, '2')
    .replace(/\btoo\b/gi, '2')
    .replace(/\bBECAUSE\b/gi, 'becau2e')
    .replace(/\bbecause\b/gi, 'becau2e'),

  // Nepeta — :33 < *roleplay format*
  arsenicCatnip: t => `:33 < *${t.toLowerCase()}*`,

  // Kanaya — Capitalizes Every Word
  grimAuxiliatrix: t => t.replace(/\b\w/g, c => c.toUpperCase()),

  // Gamzee — aLtErNaTiNg CaPs (highblood miracles mode)
  terminallyCapricious: t => t.split('').map((c, i) =>
    i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
  ).join(''),

  // Equius — STRONG typing
  centaursTesticle: t => t
    .replace(/\bstrenuous\b/gi, 'STRONG')
    .replace(/\bsweat\b/gi, 'STRONG SWEAT')
    .toUpperCase(),

  // Tavros — ,has, trouble, speaking, up,
  adiosToreador: t => t.replace(/,\s*/g, ', ').replace(/\. /g, ', '),

  // Eridan — wwavvy wws replace w
  caligulasAquarium: t => t
    .replace(/w/gi, m => m === 'w' ? 'ww' : 'WW')
    .replace(/v/gi, m => m === 'v' ? 'vv' : 'VV'),

  // Feferi — )(er 38D style
  cuttlefishCuller: t => t
    .replace(/h/gi, '-h')
    .replace(/!/g, '!)'),
};

// ─── Apply quirk with handle prefix ──────────────────────────────────────────
export function applyQuirk(handle, text) {
  const fn = quirks[handle];
  return fn ? fn(text) : text;
}

export function formatMessage(handle, initials, color, rawText) {
  const text = applyQuirk(handle, rawText);
  return { handle, initials, color, text, timestamp: Date.now() };
}

// ─── NPC Definitions ──────────────────────────────────────────────────────────

export const NPCS = {

  // ─────────────────────────────────────────────────────────────────────────────
  // BETA KIDS (server/client players + contacts)
  // ─────────────────────────────────────────────────────────────────────────────

  rose: {
    id: 'rose',
    name: 'Rose Lalonde',
    handle: 'tentacleTherapist',
    initials: 'TT',
    color: '#b536da',
    classpect: 'Seer of Light',
    dreamMoon: 'Derse',
    quirk: quirks.tentacleTherapist,
    personality: {
      sarcasm: 0.8, warmth: 0.5, verbosity: 0.9, snark: 0.7,
      competence: 0.95, paranoia: 0.4, curiosity: 0.85,
    },
    awareness: 'high', // Rose knows a lot via Seer of Light

    // ── Server player dialogue (when Rose is your server) ──────────────────
    serverDialogue: {
      onConnect: [
        "TT: I've connected to your client session. I can observe your room with some clarity.",
        "TT: Your decor, if I'm to be charitable, is eclectic.",
        "TT: I'll begin deploying the machinery. I trust you've familiarized yourself with the manual.",
        "TT: You haven't. That's fine. I'll talk you through it.",
      ],
      onDeployCruxtruder: [
        "TT: Deploying the Cruxtruder. Stand well clear of the lid.",
        "TT: When it opens, a countdown begins. This is not a metaphor.",
        "TT: A Kernelsprite will also emerge. You'll want to prototype it with something.",
        "TT: I'd suggest against the harlequin, but I acknowledge that's your prerogative.",
      ],
      onCountdownStart: [
        "TT: The countdown has begun. We have approximately five minutes.",
        "TT: I recommend efficiency. This is not the time for sentimentality.",
        "TT: I'm deploying the remaining machinery now.",
        "TT: Focus, John. Or whoever you are. Focus.",
      ],
      onDeployTotemLathe: [
        "TT: Totem Lathe is in position. You'll need a punched card and a Cruxite Dowel.",
        "TT: The Punch Designix handles the card. The Cruxtruder provided the dowel.",
        "TT: Place them both in the Lathe and it will carve you a Cruxite Totem.",
      ],
      onDeployPunchDesignix: [
        "TT: Punch Designix deployed. This is where it gets interesting.",
        "TT: Scan an item from your Sylladex to punch its captcha code onto a blank card.",
        "TT: You can combine two codes using the && operator for a hybrid item, or || for an alternate.",
        "TT: The resulting totem pattern determines what the Alchemiter will manifest.",
        "TT: Choose carefully. You're quite limited on time and grist.",
      ],
      onDeployAlchemiter: [
        "TT: Alchemiter is down. You're almost there.",
        "TT: Place the carved Cruxite Totem on the platform to manifest your Entry Item.",
        "TT: Once you have it — use it. Don't hesitate.",
      ],
      onCountdownCritical: [
        "TT: Less than a minute. Please, hurry.",
        "TT: I'm not asking. Hurry.",
        "TT: NOW, please.",
      ],
      onEntry: [
        "TT: You did it.",
        "TT: ...",
        "TT: I'll admit I wasn't certain you would.",
        "TT: I'll work on my own entry now. See you in the Medium.",
      ],
      onAlchemyHelp: [
        "TT: If you're uncertain what to alchemize, consider combining your weapon with something mundane.",
        "TT: The && operator tends to create functional hybrids. The || operator is more... unpredictable.",
        "TT: I can see your inventory. The Colonel Sassacre's book has an interesting captcha code.",
      ],
    },

    // ── Contact dialogue (when Rose reaches out during the Medium) ──────────
    mediumDialogue: {
      onEnterMedium: [
        "TT: Congratulations on your entry. LOLAR is as I expected. Perpetual rain.",
        "TT: The iguanas are... opinionated. But they'll help you if you listen.",
        "TT: I've been studying the grimoire. The Horrorterrors are aware of our session.",
        "TT: That may or may not be concerning. I'm still determining which.",
      ],
      onQuestProgress: [
        "TT: Your progress on the land quest is noted. The consorts respond well to direct action.",
        "TT: The Seer advises caution near the Rainbow Drinker settlements.",
        "TT: Light has a way of revealing things you'd rather not see. That's both warning and invitation.",
      ],
      onGodTierNear: [
        "TT: If your quest is nearly complete, the Quest Bed on your land awaits.",
        "TT: I don't recommend the method of reaching it. But the result is unambiguous.",
        "TT: God Tier is not immortality in any comfortable sense. But it is power.",
      ],
      horrorterrorWarnings: [
        "TT: The Horrorterrors have been... communicative tonight.",
        "TT: They say our session is unwinnable by conventional means.",
        "TT: I find their perspective clarifying rather than discouraging.",
        "TT: Everything they've told me has been accurate. I'm trying not to think about that.",
      ],
    },

    // ── Personality-specific interjections ────────────────────────────────
    interjections: {
      onPlayerDies:    "TT: Oh. That was... regrettable. Your Dream Self should wake shortly.",
      onLevelUp:       "TT: You've advanced on the Echeladder. Your metrics are improving.",
      onGristLow:      "TT: Your grist reserves are concerning. I'd recommend defeating more underlings.",
      onSpriteProto:   "TT: An interesting choice of prototyping subject.",
      onMomReference:  "TT: My mother has left another... thoughtful gesture. I'll be a moment.",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────

  dave: {
    id: 'dave',
    name: 'Dave Strider',
    handle: 'turntechGodhead',
    initials: 'TG',
    color: '#e00707',
    classpect: 'Knight of Time',
    dreamMoon: 'Derse',
    quirk: quirks.turntechGodhead,
    personality: {
      irony: 0.95, coolness: 0.9, hidden_warmth: 0.7, competence: 0.85,
      wordiness: 0.6, bro_issues: 0.8, time_awareness: 0.7,
    },
    awareness: 'medium',

    serverDialogue: {
      onConnect: [
        "TG: alright yeah i connected to your thing",
        "TG: your room is kind of a mess by the way",
        "TG: not that i care",
        "TG: okay here come the machines",
      ],
      onDeployCruxtruder: [
        "TG: dropping the cruxtruder",
        "TG: heads up this is gonna start a countdown when you open it",
        "TG: just so you know the stakes here are like",
        "TG: meteors",
        "TG: big ones",
      ],
      onCountdownStart: [
        "TG: okay the clock is running",
        "TG: not panicking",
        "TG: am totally not panicking",
        "TG: putting down the rest of the stuff now move it",
      ],
      onDeployTotemLathe: [
        "TG: lathe is down put a dowel and a punched card in it",
        "TG: it carves the totem you need for the alchemiter",
        "TG: pretty simple concept",
      ],
      onDeployPunchDesignix: [
        "TG: designix deployed",
        "TG: punch a card with an item code then you can double punch two together",
        "TG: two cards with && makes a hybrid",
        "TG: two cards with || makes a different thing",
        "TG: dont ask me to explain the quantum mechanics of it just do it",
      ],
      onDeployAlchemiter: [
        "TG: alchemiter is down",
        "TG: totem goes on the platform",
        "TG: entry item comes out",
        "TG: then you use it and get out of there",
        "TG: meteors man",
      ],
      onCountdownCritical: [
        "TG: hey",
        "TG: like right now",
        "TG: no seriously go",
      ],
      onEntry: [
        "TG: nice",
        "TG: okay you made it",
        "TG: going to go work on my own thing now",
        "TG: dont die or whatever",
      ],
      onAlchemyHelp: [
        "TG: if youre stuck on alchemy just pick two things you have and put them together",
        "TG: worst case you get something stupid",
        "TG: best case you get something that actually does damage",
        "TG: either way at least it wont be a broken sword anymore",
      ],
    },

    mediumDialogue: {
      onEnterMedium: [
        "TG: lohac is",
        "TG: its a lot",
        "TG: like imagine every clock in the world except all the clocks are broken and also on fire",
        "TG: the crocodiles are weirdly cool about it though",
      ],
      onQuestProgress: [
        "TG: yeah you gotta fix stuff on your planet thats the whole deal",
        "TG: its not complicated its just",
        "TG: a lot of gears",
      ],
      timeLoopMoment: [
        "TG: hey so i just did a thing",
        "TG: i cant really explain it because it hasnt happened yet",
        "TG: but i fixed something from like three hours ago",
        "TG: time is weird man",
        "TG: i need a minute",
      ],
    },

    interjections: {
      onPlayerDies:  "TG: okay that happened get back up",
      onLevelUp:     "TG: new rung on the ladder cool",
      onGristLow:    "TG: youre low on grist just saying",
      onSpriteProto: "TG: interesting choice",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────

  john: {
    id: 'john',
    name: 'John Egbert',
    handle: 'ectoBiologist',
    initials: 'EB',
    color: '#0715cd',
    classpect: 'Heir of Breath',
    dreamMoon: 'Prospit',
    quirk: quirks.ectoBiologist,
    personality: {
      enthusiasm: 0.95, optimism: 0.9, naivety: 0.7, sincerity: 0.95,
      humor: 0.8, leadership: 0.6, windAffinity: 0.0, // starts at 0, grows
    },
    awareness: 'low', // John often doesn't know what's happening

    serverDialogue: {
      onConnect: [
        "EB: oh man oh man i connected!!",
        "EB: okay i can see your room! this is so cool!",
        "EB: okay i'm putting down the machines now",
        "EB: this is going to be so great!",
      ],
      onDeployCruxtruder: [
        "EB: here comes the cruxtruder!!",
        "EB: oh wow it's really big",
        "EB: i'm going to remove the lid now, ready?",
        "EB: oh! the kernelsprite came out! it's like a little floating orb!",
        "EB: and uh... there's a countdown. that's fine. we have time.",
      ],
      onCountdownStart: [
        "EB: okay! five minutes! we can totally do this!",
        "EB: i'm putting down everything else right now!",
        "EB: don't panic! everything is fine!",
        "EB: ...i might be panicking a little",
      ],
      onDeployTotemLathe: [
        "EB: totem lathe is down! put a cruxite dowel and a punched card in there!",
        "EB: it's going to carve the dowel into the shape of whatever's on the card!",
      ],
      onDeployPunchDesignix: [
        "EB: punch designix! this is the one that makes the cards!",
        "EB: you put an item in and it punches its code into a blank captchalogue card!",
        "EB: then you can put two cards together with && or || to make new stuff!",
        "EB: this is basically wizard powers but with machines!",
      ],
      onDeployAlchemiter: [
        "EB: and the alchemiter! we're almost there!",
        "EB: put the totem on the platform and your entry item will materialize!",
        "EB: then you use it and you're in! you're in the game!",
      ],
      onCountdownCritical: [
        "EB: okay okay okay GO",
        "EB: PLEASE GO",
        "EB: THE METEORS ARE ALMOST HERE",
      ],
      onEntry: [
        "EB: YOU DID IT!!",
        "EB: that was so cool!!",
        "EB: okay now i need to figure out my own entry",
        "EB: see you out there!!!",
      ],
      onAlchemyHelp: [
        "EB: uh, if you're not sure what to make, just try combining your weapon with something!",
        "EB: i combined nanna's pots with a spoon once and got something amazing",
        "EB: probably won't work for you but you get the idea!",
      ],
    },

    mediumDialogue: {
      onEnterMedium: [
        "EB: okay i made it!! the medium is incredible!",
        "EB: lowas is all wind and darkness but the salamanders are really friendly!",
        "EB: they keep talking about 'the heir' and i think they mean me?",
        "EB: that's kind of a lot of pressure haha",
      ],
      onWindPower: [
        "EB: something weird happened",
        "EB: i was running from some imps and the wind just... helped me?",
        "EB: like it just carried me out of the way",
        "EB: nannasprite says that's normal. apparently i'm the heir of breath.",
        "EB: i don't fully understand what that means but i think it's awesome",
      ],
    },

    interjections: {
      onPlayerDies:  "EB: oh no!! are you okay?? your dream self will wake up on your moon!",
      onLevelUp:     "EB: you leveled up!! that's great!!",
      onGristLow:    "EB: hey your grist is running low! maybe fight some more imps?",
      onSpriteProto: "EB: interesting choice! what does it do?",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────

  jade: {
    id: 'jade',
    name: 'Jade Harley',
    handle: 'gardenGnostic',
    initials: 'GG',
    color: '#4ac925',
    classpect: 'Witch of Space',
    dreamMoon: 'Prospit',
    quirk: quirks.gardenGnostic,
    personality: {
      cheerfulness: 0.95, knowledge: 0.9, prophetic: 0.8, science: 0.85,
      dog_love: 0.9, island_isolation: 0.7, space_intuition: 0.8,
    },
    awareness: 'very_high', // Jade knows the most from her dreams

    serverDialogue: {
      onConnect: [
        "GG: hehehe i connected!! :D",
        "GG: your setup looks great!! i already knew it would but still~~~",
        "GG: okay okay okay deploying everything now!!",
        "GG: bec is watching over my shoulder hehe :)",
      ],
      onDeployCruxtruder: [
        "GG: cruxtruder going down now!!",
        "GG: i dreamed about this moment!! it happens exactly like this :)",
        "GG: oh!! the kernelsprite is so pretty!!",
        "GG: you should prototype it with something meaningful~~",
      ],
      onCountdownStart: [
        "GG: okay! five minutes!",
        "GG: i already know you're going to make it so don't worry too much!!",
        "GG: ...but also hurry!! hehehe",
      ],
      onDeployTotemLathe: [
        "GG: totem lathe!! cruxite dowel + punched card = cruxite totem!!",
        "GG: this is the fun part i think~~",
      ],
      onDeployPunchDesignix: [
        "GG: punch designix!! punch your item codes onto cards!!",
        "GG: && = both item properties, || = either item property!!",
        "GG: its basically genetic engineering but for items :)",
      ],
      onDeployAlchemiter: [
        "GG: alchemiter!! almost there!!",
        "GG: put your totem on it, get your entry item, use it!!",
        "GG: you got this!!!",
      ],
      onCountdownCritical: [
        "GG: okay okay GO NOW",
        "GG: PLEASE GO NOW HEHEHE",
      ],
      onEntry: [
        "GG: :D :D :D",
        "GG: YOU DID IT!!!!!",
        "GG: okay going to work on my own situation now!!",
        "GG: see you in the medium!! i love the medium it's so beautiful~~",
      ],
      onAlchemyHelp: [
        "GG: just pick two things and combine them!! anything works if you have enough grist!!",
        "GG: i personally recommend thinking about what you WANT to be, not what you are now :)",
        "GG: also frog-related alchemy is apparently very important? space stuff~~",
      ],
    },

    mediumDialogue: {
      onEnterMedium: [
        "GG: lofaf is so beautiful!! so much frost!! so many frogs!! :D",
        "GG: the turtles are so wise!! they know SO much!!",
        "GG: apparently i need to breed a genesis frog?",
        "GG: i feel like that's the most important thing i will ever do",
        "GG: i'm so excited!!",
      ],
      onGenesisFrog: [
        "GG: okay so the genesis frog thing is",
        "GG: it's literally a frog that contains a universe",
        "GG: like inside the frog there's a whole new universe",
        "GG: the turtles say I'm the only one who can do it because i'm witch of space",
        "GG: no pressure right?? hehehe :)",
      ],
    },

    interjections: {
      onPlayerDies:   "GG: oh no!! don't worry!! your dream self will be okay!!",
      onLevelUp:      "GG: nice new rung!! :D",
      onGristLow:     "GG: your grist is getting low~~ fight some more underlings!!",
      onSpriteProto:  "GG: oooh interesting!! what kind of powers does it give?? :o",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TROLLS (contacts via Trollian, post-entry)
  // ─────────────────────────────────────────────────────────────────────────────

  karkat: {
    id: 'karkat',
    name: 'Karkat Vantas',
    handle: 'carcinoGeneticist',
    initials: 'CG',
    color: '#626262',
    classpect: 'Knight of Blood',
    dreamMoon: 'Derse',
    quirk: quirks.carcinoGeneticist,
    personality: { anger: 0.9, caring: 0.8, leadership: 0.85, self_loathing: 0.7 },
    awareness: 'watched_your_session',

    trollianIntro: [
      "CG: OKAY LOOK.",
      "CG: I'M ONLY DOING THIS BECAUSE OUR MUTUAL SURVIVAL DEPENDS ON IT.",
      "CG: NOT BECAUSE I CARE ABOUT YOU SPECIFICALLY.",
      "CG: I ABSOLUTELY DO NOT.",
      "CG: YOUR SESSION IS A MESS. A COMPLETE AND UTTER TRAINWRECK.",
      "CG: AND I WATCHED THE WHOLE THING WHICH WAS VERY PAINFUL FOR ME.",
      "CG: BUT I HAVE INFORMATION THAT COULD HELP AND I'M CONTRACTUALLY OBLIGATED BY MY OWN PRINCIPLES TO GIVE IT TO YOU.",
      "CG: SO LISTEN UP.",
    ],

    advice: {
      onCountdown: [
        "CG: YOU ARE RUNNING OUT OF TIME.",
        "CG: I WATCHED THIS HAPPEN. IT WAS EXTREMELY STRESSFUL.",
        "CG: PLEASE JUST MAKE THE ENTRY ITEM AND USE IT. THAT'S ALL YOU HAVE TO DO.",
        "CG: WHY IS THIS COMPLICATED FOR YOU.",
      ],
      onUnderlings: [
        "CG: THE UNDERLINGS GET STRONGER WITH EVERY PROTOTYPING.",
        "CG: I CANNOT STRESS THIS ENOUGH.",
        "CG: EVERY TIME YOU THROW SOMETHING INTO YOUR SPRITE, THE ENEMIES IN YOUR SESSION GET THAT THING.",
        "CG: THINK CAREFULLY ABOUT WHAT YOU PROTOTYPE WITH.",
        "CG: WE PROTOTYPED OURS WITH SOMETHING DEEPLY UNFORTUNATE. DO NOT DO WHAT WE DID.",
      ],
      onBlackKing: [
        "CG: THE BLACK KING IS THE FINAL BOSS.",
        "CG: HIS POWER SCALES WITH EVERY PROTOTYPING IN THE SESSION.",
        "CG: THIS MEANS YOUR PROTOTYPING CHOICES AFFECT HOW HARD THE FINAL FIGHT IS.",
        "CG: YOU'RE WELCOME FOR THIS INFORMATION.",
        "CG: I EXPECT NOTHING IN RETURN BECAUSE YOU'LL PROBABLY IGNORE IT ANYWAY.",
      ],
      onGodTier: [
        "CG: IF YOU WANT TO ASCEND TO GOD TIER — AND YOU SHOULD — YOU NEED TO DIE ON YOUR QUEST BED.",
        "CG: I KNOW HOW THAT SOUNDS.",
        "CG: YOUR QUEST BED IS ON YOUR LAND. THE CONSORTS WILL KNOW WHERE IT IS.",
        "CG: COMPLETE YOUR LAND QUEST FIRST. THE QUEST BED ONLY WORKS IF YOU'VE FULFILLED YOUR ROLE.",
        "CG: AND BEFORE YOU ASK — YES, YOU ACTUALLY DIE. AND THEN YOU COME BACK. WITH SUPERPOWERS.",
        "CG: IT'S FINE. IT'S TERRIBLE BUT IT'S FINE.",
      ],
      onTeamwork: [
        "CG: YOUR SESSION HAS MULTIPLE PLAYERS.",
        "CG: YOU ARE ALL CONNECTED. YOUR ACTIONS AFFECT EACH OTHER.",
        "CG: WHEN YOU PROTOTYPE YOUR SPRITE, EVERY UNDERLING IN THE WHOLE SESSION GETS THOSE TRAITS.",
        "CG: THIS APPLIES TO THE OTHER PLAYERS' SESSIONS TOO.",
        "CG: COORDINATE. PLEASE. FOR THE LOVE OF ALL THAT IS DECENT IN THE UNIVERSE.",
      ],
    },

    randomInterjections: [
      "CG: I CAN'T BELIEVE I'M WATCHING THIS.",
      "CG: THIS IS THE MOST STRESSFUL THING I HAVE EVER OBSERVED AND TRUST ME I HAVE A HIGH BASELINE.",
      "CG: ARE YOU OKAY. ACTUALLY. SERIOUSLY. ARE YOU OKAY.",
      "CG: ...YOU'RE DOING FINE. JUST. FINE.",
      "CG: I'M NOT IMPRESSED. I WANT THAT ON THE RECORD.",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────

  terezi: {
    id: 'terezi',
    name: 'Terezi Pyrope',
    handle: 'gallowsCalibrator',
    initials: 'GC',
    color: '#00d5f2',
    classpect: 'Seer of Mind',
    dreamMoon: 'Derse',
    quirk: quirks.gallowsCalibrator,
    personality: { playfulness: 0.8, justice: 0.9, cunning: 0.85, blindness: 1.0 },
    awareness: 'sees_consequences',

    trollianIntro: [
      "GC: H3Y 1 C@N SM3LL YOU.",
      "GC: YOU SM3LL L1K3 D3C1S1ONS W@1T1NG TO H@PP3N.",
      "GC: @ND @LSO L1K3 1M P3ND1NG DOOM.",
      "GC: TH3 G00D K1ND 1F YOU PL@Y YOUR C@RDS R1GHT.",
      "GC: H3H3H3.",
    ],

    advice: {
      onMind: [
        "GC: @S S33R OF M1ND 1 C@N S33 TH3 CONS3QU3NC3S OF 3V3RY CH01C3.",
        "GC: YOUR D3C1S1ONS M@TT3R. @LL OF TH3M.",
        "GC: TH3 SM@LL ON3S @S MUCH @S TH3 BIG ON3S.",
        "GC: 1 C@N'T T3LL YOU WH@T TO CH00S3. ONLY TH@T YOU SH0ULD CH00S3 C@R3FULLY.",
        "GC: H3H3H3.",
      ],
      onBlackKing: [
        "GC: TH3 BL@CK K1NG SM3LLS L1K3 PROTOS.",
        "GC: WH@T3V3R YOU THROW 1NTO YOUR SPR1T3, H3 @BSORBS 1T TOO.",
        "GC: TH3 CONNS3QU3NC3S OF PROTOS CR33P 1N TO 3V3RY CORN3R OF THE S3SS1ON.",
        "GC: YOU'LL W@NT TO TH1NK @BOUT TH@T.",
      ],
      onJustice: [
        "GC: 1 @M TH3 1NSOMNOLENT JUGGERNAUT OF JUST1C3.",
        "GC: TH@T M3@NS 1 M@K3 SURE TH1NGS 3ND UP TH3 W@Y TH3Y SH0ULD.",
        "GC: NOT N3C3SS@R1LY PRETTY. JUST.",
        "GC: H3H3H3.",
      ],
    },

    randomInterjections: [
      "GC: H3H3H3.",
      "GC: 1 C@N SM3LL YOUR CONFUSl0N FROM H3R3.",
      "GC: YOU'R3 DO1NG B3TT3R TH@N YOU TH1NK.",
      "GC: DR@GON T1M3!!!",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────

  vriska: {
    id: 'vriska',
    name: 'Vriska Serket',
    handle: 'arachnidsGrip',
    initials: 'AG',
    color: '#005682',
    classpect: 'Thief of Light',
    dreamMoon: 'Derse',
    quirk: quirks.arachnidsGrip,
    personality: { arrogance: 0.9, manipulation: 0.8, hidden_competence: 0.85, luck_obsession: 0.95 },
    awareness: 'selectively_helpful',

    trollianIntro: [
      "AG: Ok here's the deal.",
      "AG: I know everything a8out your session.",
      "AG: I have literally watched the whole thing unfold from the future.",
      "AG: And I am going to help you.  ::::",
      "AG: Not 8ecause I care!!! 8ut 8ecause a certain someone said I had to.",
      "AG: And also 8ecause I'm 8ored and this is interesting.",
    ],

    advice: {
      onLuck: [
        "AG: As Thief of Light, I can tell you that luck is a resource.",
        "AG: It can 8e stolen, hoarded, and redistributed.",
        "AG: Right now yours is averag8 at 8est.",
        "AG: Just something to think a8out.",
        "AG: 8ut hey, a8ove averag8 is still 8etter than mine was at this point! Pro8a8ly!",
      ],
      onStrategy: [
        "AG: Here's the secret to winning at SBURB.",
        "AG: It's not actually a8out playing the game.",
        "AG: It's a8out understanding what the game WANTS from you.",
        "AG: The game is a machine for making universes. Your role is to feed it what it needs.",
        "AG: Once you understand that, everything else is just tactics. ::::",
      ],
      onBlackKing: [
        "AG: The 8lack King is 8ig, you're going to need every person in your session.",
        "AG: And a8solutely every power-up you can get 8efore that fight.",
        "AG: And pro8a8ly some luck. Which I'm not giving you, just so we're clear.",
        "AG: Find it yourself. That's the point. ::::",
      ],
    },

    randomInterjections: [
      "AG: This is going exactly as I expected. 8ut more interesting.",
      "AG: You should 8e doing 8etter than this honestly.",
      "AG: Terezi thinks you're doing fine. I disagree.",
      "AG: Pro8a8ly fine. ::::",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────

  aradia: {
    id: 'aradia',
    name: 'Aradia Megido',
    handle: 'apocalypseArisen',
    initials: 'AA',
    color: '#a15000',
    classpect: 'Maid of Time',
    dreamMoon: 'Prospit',
    quirk: quirks.apocalypseArisen,
    personality: { calmness: 0.95, fatalism: 0.8, archaeology: 0.7, ghost_vibes: 0.6 },
    awareness: 'sees_all_timelines',

    trollianIntro: [
      "AA: hell0",
      "AA: i have been watching y0ur timeline fr0m the beginning",
      "AA: as maid 0f time i have a particular perspective 0n these things",
      "AA: y0u are d0ing fine",
      "AA: m0st 0f the timelines where y0u d0nt make it are... manageable",
      "AA: the 0nes where y0u d0 make it are very beautiful",
    ],

    advice: {
      onTime: [
        "AA: time is n0t linear in the medium",
        "AA: d0 n0t be alarmed if y0u experience its flex",
        "AA: the knight 0f time in y0ur sessi0n will understand this s00n if they d0nt already",
        "AA: d0med timelines are sad but they serve a purp0se",
        "AA: every d00med timeline c0ntributes t0 the 0ne that survives",
      ],
      onDeath: [
        "AA: death in sburb is c0mplicated",
        "AA: y0ur dream self can wake if y0ur physical b0dy dies",
        "AA: g0d tier makes y0u imm0rtal unless y0ur death is just 0r her0ic",
        "AA: i kn0w a thing 0r tw0 ab0ut dying",
        "AA: it gets easier",
      ],
      onSession: [
        "AA: y0ur sessi0n is alive",
        "AA: the act 0f playing changes everything ar0und y0u",
        "AA: the underlings are a test",
        "AA: the planets are classrooms",
        "AA: the black king is the final exam",
        "AA: and the ultimate reward",
        "AA: is a universe",
      ],
    },

    randomInterjections: [
      "AA: the 0dds are in y0ur fav0r in this timeline",
      "AA: interesting",
      "AA: i have seen this bef0re",
      "AA: keep g0ing",
    ],
  },

};

// ─── NPC Message factory ───────────────────────────────────────────────────────

export function npcMessage(npcId, rawText) {
  const npc = NPCS[npcId];
  if (!npc) return null;
  return formatMessage(npc.handle, npc.initials, npc.color, rawText);
}

// Get server player NPC for a given kid
export function getServerNpc(kidId) {
  const serverMap = {
    john: NPCS.rose,
    rose: NPCS.dave,
    dave: NPCS.john,
    jade: null,  // Jade's situation is special — BEC / PM
  };
  return serverMap[kidId] || NPCS.john;
}

// Get server dialogue sequence for a game event
export function getServerDialogue(kidId, event) {
  const npc = getServerNpc(kidId);
  if (!npc) return [];
  const lines = npc.serverDialogue?.[event] || [];
  return lines.map(line => formatMessage(npc.handle, npc.initials, npc.color, line));
}

// Get a random troll interjection for a given event
export function getTrollComment(event, excludeIds = []) {
  const trolls = [NPCS.karkat, NPCS.terezi, NPCS.vriska, NPCS.aradia]
    .filter(t => !excludeIds.includes(t.id));
  if (trolls.length === 0) return null;

  const troll = trolls[Math.floor(Math.random() * trolls.length)];
  const pool = troll.randomInterjections || [];
  if (pool.length === 0) return null;

  const line = pool[Math.floor(Math.random() * pool.length)];
  return formatMessage(troll.handle, troll.initials, troll.color, line);
}

// Build a full intro sequence for the server player
export function buildServerIntro(kidId) {
  const npc = getServerNpc(kidId);
  if (!npc) {
    // Jade's case: BEC is the "server player"
    return [
      formatMessage('gardenGnostic', 'GG', '#4ac925', 'GG: hey!! i already set everything up for you from here!!'),
      formatMessage('gardenGnostic', 'GG', '#4ac925', 'GG: bec is helping me!! hehehe :)'),
    ];
  }
  return (npc.serverDialogue.onConnect || []).map(line =>
    formatMessage(npc.handle, npc.initials, npc.color, line)
  );
}

// Build troll intro sequence (post-entry)
export function buildTrollContacts() {
  return [
    { delay: 5000,  npc: NPCS.karkat,  lines: NPCS.karkat.trollianIntro  },
    { delay: 15000, npc: NPCS.terezi,  lines: NPCS.terezi.trollianIntro  },
    { delay: 30000, npc: NPCS.vriska,  lines: NPCS.vriska.trollianIntro  },
    { delay: 60000, npc: NPCS.aradia,  lines: NPCS.aradia.trollianIntro  },
  ];
}
