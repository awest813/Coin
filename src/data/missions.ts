import type { MissionTemplate } from '~/types/mission';

export const MISSION_TEMPLATES: MissionTemplate[] = [
  // ── Escort ───────────────────────────────────────────────────────────────────
  {
    id: 'mission_caravan',
    name: 'Caravan Escort',
    description:
      'A merchant needs armed escort through the Thornwood pass. Bandits have been bold lately.',
    tags: ['combat', 'escort'],
    difficulty: 7,
    durationLabel: '2 days',
    reward: {
      gold: 80,
      renown: 5,
      possibleItems: ['iron_sword', 'leather_armor', 'road_rations', 'lucky_charm', 'padded_tunic'],
    },
    flavorText: {
      success:
        'The merchant arrived safely, purse intact. He tipped the party extra and promised a good word around the docks.',
      partial:
        'The caravan made it through, but Thornwood had surprises. Goods were lost, tempers were frayed.',
      failure:
        'The bandits were better organized than expected. The merchant escaped, barely. No payment.',
    },
    eventSnippets: [
      'A wheel broke on a muddy stretch. The delay cost two hours and some nerves.',
      'One of the merchant\'s guards tried to start a fight with Bram. He regretted it.',
      'The pass was silent. Too silent. The party moved quickly.',
      'A toll collector at the bridge demanded double. Presence carried the day.',
    ],
  },
  {
    id: 'mission_noble_coach',
    name: 'Noble\'s Coach',
    description:
      "Lady Auren Veth is traveling to her summer estate. Her last escort quit without explanation.",
    tags: ['escort', 'social'],
    difficulty: 9,
    durationLabel: '3 days',
    reward: {
      gold: 110,
      renown: 8,
      possibleItems: ['sigil_badge', 'lucky_charm', 'scouts_cloak', 'silver_dagger'],
    },
    flavorText: {
      success:
        "Lady Veth arrived in excellent spirits. She wrote a letter of recommendation to the city watch — useful.",
      partial:
        "The lady arrived safely but complained vigorously about the accommodations en route. No bonus, barely polite.",
      failure:
        "An ambush near the ford scattered the party. The lady found her own way. She will not forget.",
    },
    eventSnippets: [
      'Lady Veth asked probing questions about guild politics. Oryn handled it diplomatically.',
      'A hired assassin was spotted tailing the coach. He was discouraged from continuing.',
      'The horses spooked at a ditch fire. A calm presence settled them.',
    ],
  },
  // ── Exploration / Ruin ────────────────────────────────────────────────────────
  {
    id: 'mission_ruin',
    name: 'Ruin Survey',
    description:
      'Locate a collapsed watchtower east of Greyfen. Map the site, recover any surviving records.',
    tags: ['exploration', 'ruin'],
    difficulty: 5,
    durationLabel: '3 days',
    reward: {
      gold: 50,
      renown: 8,
      possibleItems: ['grimoire_fragment', 'banner_shard', 'runed_amulet', 'road_rations', 'worn_map'],
    },
    flavorText: {
      success:
        'The tower held its secrets loosely. Records recovered, site mapped. The client was pleased.',
      partial:
        'Some records were damaged by water. The map is rough but usable. Half pay rendered.',
      failure:
        'The route was impassable after heavy rain. The party returned empty-handed and muddy.',
    },
    eventSnippets: [
      'Oryn found something written in the old tongue. He wouldn\'t say what.',
      'The stonework shifted while they searched. Everyone held their breath.',
      'A colony of bats made the lower floor unpleasant. They mapped around it.',
      'Someone had already been here recently. Footprints in the dust led nowhere.',
    ],
  },
  {
    id: 'mission_lost_cache',
    name: 'The Lost Cache',
    description:
      'A dying mercenary whispered a location. Somewhere south of the Ashfen marsh, there is buried treasure.',
    tags: ['exploration', 'ruin'],
    difficulty: 10,
    durationLabel: '4 days',
    reward: {
      gold: 140,
      renown: 10,
      possibleItems: ['blessed_blade', 'runed_amulet', 'cursed_ring', 'oracle_lens', 'eclipse_sword'],
    },
    flavorText: {
      success:
        'The cache was real. Whatever the old mercenary did to earn this haul, it was significant.',
      partial:
        'Part of the cache had been found by someone else. What remained was still worth the journey.',
      failure:
        'The marsh swallowed half the supplies and the only copy of the directions. Nothing to show for it.',
    },
    eventSnippets: [
      'The marsh at night made strange sounds. No one slept well.',
      'Something large moved in the reeds. The party kept their torches high.',
      'A false trail led them east for a full day before Caden corrected course.',
    ],
  },
  // ── Stealth / Social ─────────────────────────────────────────────────────────
  {
    id: 'mission_informant',
    name: 'Extract the Informant',
    description:
      "A city contact needs quiet extraction from a noble's estate before dawn. Discretion is essential.",
    tags: ['stealth', 'social'],
    difficulty: 11,
    durationLabel: '1 day',
    reward: {
      gold: 120,
      renown: 12,
      possibleItems: ['silver_dagger', 'scouts_cloak', 'lucky_charm', 'runed_amulet', 'shadow_knife'],
    },
    flavorText: {
      success:
        'The informant was out before the watch changed. Clean, quiet, professional. Word will spread.',
      partial:
        'The contact was extracted but not cleanly. Raised voices, a broken window. The noble will ask questions.',
      failure:
        'The whole affair fell apart at the gate. The informant is lying low. The client is furious.',
    },
    eventSnippets: [
      'A guard changed his route unexpectedly. Syla waited fifteen minutes pressed against a wall.',
      'The informant refused to leave without a locked box. The box slowed things down.',
      'Somebody sneezed at the worst moment. They ran.',
      'Oryn bluffed their way past a guard using a borrowed writ.',
    ],
  },
  {
    id: 'mission_bribe_chain',
    name: 'The Bribe Chain',
    description:
      'A guild intermediary needs someone to carry a sealed package through three checkpoints. No questions.',
    tags: ['stealth', 'social'],
    difficulty: 8,
    durationLabel: '1 day',
    reward: {
      gold: 90,
      renown: 7,
      possibleItems: ['sigil_badge', 'scouts_cloak', 'lucky_charm', 'shadow_knife'],
    },
    flavorText: {
      success:
        'Three checkpoints, three palms crossed with coin. The package arrived. No one talked.',
      partial:
        'Two of three checkpoints cooperated. The third required improvisation — and a cover story.',
      failure:
        'Someone opened the package. Someone screamed. The party exited the city district quickly.',
    },
    eventSnippets: [
      'One official seemed genuinely curious. Petra chatted him into distraction.',
      'The package smelled strange. Nobody mentioned it.',
      'A checkpoint guard recognized Voss. That required additional negotiation.',
    ],
  },
  // ── Combat ───────────────────────────────────────────────────────────────────
  {
    id: 'mission_bandit_camp',
    name: 'Clear the Bandit Camp',
    description:
      'A camp of twelve armed brigands has been raiding the south road for two weeks. Clear them out.',
    tags: ['combat', 'bounty'],
    difficulty: 13,
    durationLabel: '2 days',
    reward: {
      gold: 150,
      renown: 14,
      possibleItems: ['chain_mail', 'soldier_sword', 'reinforced_shield', 'iron_sword', 'padded_tunic'],
    },
    flavorText: {
      success:
        'The camp is ash and empty boots. Seven captured, five fled. The road is clear. Good clean work.',
      partial:
        'The camp was cleared but reinforcements arrived early. The party held — just. Two injured, no fatalities.',
      failure:
        'The "twelve brigands" turned out to be thirty. A tactical withdrawal was the only wise option.',
    },
    eventSnippets: [
      'Bram charged the barricade before anyone gave the signal. It worked.',
      'A lookout spotted them early. The surprise was ruined; the fight was harder.',
      'One of the bandits asked to surrender. The party obliged, eventually.',
      'Aldric took a slash across the forearm. He mentioned it only once.',
    ],
  },
  {
    id: 'mission_dungeon_beast',
    name: 'The Dungeon Below Fairholt',
    description:
      "Something has moved into the old cellar dungeon under the abandoned keep. The locals won't go near it.",
    tags: ['combat', 'hunt'],
    difficulty: 15,
    durationLabel: '2 days',
    reward: {
      gold: 180,
      renown: 18,
      possibleItems: ['blessed_blade', 'warlord_helm', 'phantom_leathers', 'silver_dagger', 'runed_amulet'],
    },
    flavorText: {
      success:
        'Whatever it was, it won\'t bother Fairholt again. The locals cheered. The mercs accepted payment in near-silence.',
      partial:
        'The beast was driven off, not killed. It will return. The locals paid half and looked worried.',
      failure:
        'It turned out to be two beasts. The party withdrew at speed. Fairholt\'s problem remains Fairholt\'s problem.',
    },
    eventSnippets: [
      'The dungeon smelled of old iron and something worse. No one said it out loud.',
      'Nim felt watched from the moment they entered. She was probably right.',
      'A torch extinguished without wind. Everyone re-lit theirs immediately.',
      'Helga\'s shield arm was still sore from the last job. She didn\'t mention it until the second floor.',
    ],
  },
  // ── Hunt / Bounty ─────────────────────────────────────────────────────────────
  {
    id: 'mission_wolf_pack',
    name: 'Wolves of the Crestwood',
    description:
      "An unusual wolf pack has been taking livestock near Crestwood village. The headman is offering silver.",
    tags: ['hunt', 'exploration'],
    difficulty: 6,
    durationLabel: '2 days',
    reward: {
      gold: 65,
      renown: 6,
      possibleItems: ['hunting_bow', 'leather_armor', 'road_rations', 'scouts_cloak', 'worn_map'],
    },
    flavorText: {
      success:
        'The pack was tracked to a den in the old quarry. Caden handled the rest. The headman paid double.',
      partial:
        'Three wolves were driven off, but the pack leader escaped. Livestock losses will continue. Partial fee.',
      failure:
        'The wolves were not where the tracks led. The trail went cold. The headman did not pay.',
    },
    eventSnippets: [
      'Caden read the tracks before anyone else had finished breakfast.',
      'The quarry den had pups in it. The party made a judgment call.',
      'One wolf circled the camp at night. No one attacked it.',
    ],
  },
  {
    id: 'mission_deserter_hunt',
    name: 'Bring in the Deserter',
    description:
      'A former soldier turned deserter is wanted by the city watch. Bring him in, alive if possible.',
    tags: ['bounty', 'social'],
    difficulty: 8,
    durationLabel: '2 days',
    reward: {
      gold: 95,
      renown: 9,
      possibleItems: ['iron_sword', 'soldier_sword', 'padded_tunic', 'sigil_badge'],
    },
    flavorText: {
      success:
        'The man was found, talked down, and delivered intact. He seemed almost relieved.',
      partial:
        "He was found but not cooperative. A minor brawl, a dislocated shoulder (his), and a long walk back.",
      failure:
        'He had better friends and better hiding spots than the watch knew. The trail ended in a stable with empty straw.',
    },
    eventSnippets: [
      'He was hiding in a sympathetic farmer\'s root cellar. The farmer needed convincing.',
      'Voss recognized him. The conversation got complicated.',
      'Petra offered him a meal first. He talked more than expected.',
      'He tried to run. Caden cut the route off before it became a problem.',
    ],
  },
  {
    id: 'mission_river_toll',
    name: 'The Unlicensed Toll',
    description:
      'Someone is extorting river merchants with an unofficial bridge toll. Stop it, quietly or otherwise.',
    tags: ['combat', 'social'],
    difficulty: 9,
    durationLabel: '1 day',
    reward: {
      gold: 100,
      renown: 10,
      possibleItems: ['iron_sword', 'chain_mail', 'soldiers_sword', 'lucky_charm', 'leather_armor'],
    },
    flavorText: {
      success:
        'The toll operation was dismantled. Three men arrested, one fled, one convinced it was a bad career choice.',
      partial:
        'The bridge is clear but the leader escaped downstream. The merchants sent half the agreed fee.',
      failure:
        "It was an organized racket with watchers posted. The guild's arrival was expected. A trap.",
    },
    eventSnippets: [
      'A merchant recognized Aldric from a previous contract and vouched for them immediately.',
      'The toll keeper tried to negotiate. Presence won the exchange.',
      'Someone upstream had tipped them off. The bridge was already abandoned when they arrived.',
    ],
  },
  {
    id: 'mission_haunted_manor',
    name: 'The Urvane Manor',
    description:
      'A noble family refuses to sell a property until someone clears whatever is wrong with it. That means your guild.',
    tags: ['exploration', 'ruin', 'hunt'],
    difficulty: 12,
    durationLabel: '3 days',
    reward: {
      gold: 130,
      renown: 15,
      possibleItems: ['runed_amulet', 'blessed_blade', 'oracle_lens', 'cursed_ring', 'grimoire_fragment'],
    },
    flavorText: {
      success:
        'Whatever haunted Urvane Manor is gone. The property sold within the week. The family sent a generous bonus.',
      partial:
        'The manor is quieter. Not entirely quiet. The family accepted the partial result and reduced payment.',
      failure:
        "The party left after the second night. No one said exactly why. The family is still not selling.",
    },
    eventSnippets: [
      'Nim spent four hours alone on the top floor. She came back calm. No explanation.',
      'The candles blew out in sequence, room to room, moving toward them.',
      'Oryn found a hidden ledger behind a false wall. The contents were disturbing.',
      'Someone heard their own name whispered, somewhere behind the wallpaper.',
    ],
  },
];
