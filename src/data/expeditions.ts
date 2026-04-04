import type { ExpeditionTemplate } from '~/types/expedition';

export const EXPEDITION_TEMPLATES: ExpeditionTemplate[] = [
  // 1. The Sunken Vault — flooded ruins, 3 stages
  {
    id: 'exp_sunken_vault',
    name: 'The Sunken Vault',
    description:
      'Ruins of an old counting house, half-submerged in the Ashfen. Treasure sealed in the vault. Water sealed everywhere else.',
    region: 'Ashfen Marsh',
    baseDifficulty: 8,
    durationLabel: '5 days',
    stages: [
      {
        type: 'travel',
        label: 'Into the Marsh',
        description: 'Navigate the Ashfen to the vault site. The terrain is treacherous.',
        difficultyMod: 0,
        eventPool: [
          'The path through the reeds vanished at midday. Caden found a new one before dark.',
          'Waist-deep water for two hours. Everyone was cold and irritable.',
          'A floating body was discovered. Not recent. Not alone.',
          'The smell changed as they approached. Old iron and standing water.',
        ],
      },
      {
        type: 'hazard',
        label: 'The Flooded Chambers',
        description: 'The lower floors are submerged. Anything worth having is underwater.',
        difficultyMod: 3,
        eventPool: [
          'The ceiling held — barely. Cracks spread as they moved.',
          'Something swam past the torch light and did not surface.',
          'A locked chest was found two fathoms down. Getting it up took an hour.',
          'Air pockets, held breath, silence. Nobody mentioned drowning.',
        ],
      },
      {
        type: 'objective',
        label: 'The Vault',
        description: 'The counting house vault. Sealed with an iron wheel mechanism.',
        difficultyMod: 2,
        eventPool: [
          'The wheel turned. Whatever was inside had been waiting for someone.',
          'The vault was empty. Someone had been here before. Recently.',
          'Old coin and a sealed ledger, still dry after decades of flooding.',
          'The door jammed halfway. They pried it open with a camp axe.',
        ],
      },
    ],
    reward: {
      gold: 200,
      renown: 18,
      possibleItems: ['runed_amulet', 'oracle_lens', 'blessed_blade', 'grimoire_fragment', 'silver_dagger'],
      possibleMaterials: ['iron_scraps', 'ancient_ink', 'bone_fragment', 'swamp_reed'],
    },
  },
  // 2. Stonepeak Descent — mountain ruins, 4 stages
  {
    id: 'exp_stonepeak_descent',
    name: 'Stonepeak Descent',
    description:
      'The Grey Mountains hold ruins that pre-date the kingdom. What\'s down there is old. What guards it is older.',
    region: 'Grey Mountains',
    baseDifficulty: 12,
    durationLabel: '7 days',
    stages: [
      {
        type: 'travel',
        label: 'The Mountain Pass',
        description: 'Ascend into the Grey Mountains through narrow switchback passes.',
        difficultyMod: 1,
        eventPool: [
          'The pass was narrower than the map suggested. They went single file for half a day.',
          'Altitude made the torch burn strange colors. Everyone pretended not to notice.',
          'A rockslide closed the route behind them. No way back the same way.',
          'The cold at night was severe. Rations ran lower than expected.',
        ],
      },
      {
        type: 'hazard',
        label: 'The Outer Halls',
        description: 'The first level of the ruins — still partially intact, but unstable.',
        difficultyMod: 2,
        eventPool: [
          'Carved figures in the walls watched the passage. They hadn\'t moved. Probably.',
          'The floor gave way into a lower chamber nobody knew was there.',
          'Wind from somewhere deeper extinguished every torch simultaneously.',
          'Old traps — stone-and-wire — some still functional.',
        ],
      },
      {
        type: 'objective',
        label: 'The Inner Sanctum',
        description: 'The central chamber, sealed since the old kingdom. Treasure and danger in equal measure.',
        difficultyMod: 4,
        eventPool: [
          'The sanctum held a weapon rack still full. Most were rust. Two were not.',
          'Something had been living there. It was not there now. The evidence suggested recently.',
          'A mosaic on the floor mapped something. Oryn copied it carefully.',
          'The seal cracked as they opened it. The air inside was cold and wrong.',
        ],
      },
      {
        type: 'escape',
        label: 'The Retreat',
        description: 'Whatever woke up in there wants the party to stay. Leave fast.',
        difficultyMod: 3,
        eventPool: [
          'Running in the dark with something behind. Everyone made it to the pass. Barely.',
          'A collapse blocked the main route. They found another.',
          'The pursuit stopped at the old boundary stones. Nobody asked why.',
          'The mountain was quiet on the way down. Suspiciously quiet.',
        ],
      },
    ],
    reward: {
      gold: 350,
      renown: 30,
      possibleItems: ['eclipse_sword', 'warlord_helm', 'phantom_leathers', 'blessed_blade', 'cursed_ring'],
      possibleMaterials: ['refined_steel', 'ancient_ink', 'bone_fragment', 'moonstone_shard'],
    },
    requiredContracts: 5,
  },
  // 3. The Haunted Road — cursed highway, 3 stages
  {
    id: 'exp_haunted_road',
    name: 'The Haunted Road',
    description:
      'An old trade road through Thornwood has become unusable. Merchants report strange deaths, stranger disappearances.',
    region: 'Thornwood',
    baseDifficulty: 9,
    durationLabel: '4 days',
    stages: [
      {
        type: 'travel',
        label: 'The Empty Road',
        description: 'The road is deserted. Completely. Even birds avoid it.',
        difficultyMod: 0,
        eventPool: [
          'No birds. No insects. Just wind through trees that shouldn\'t be bending.',
          'Abandoned carts at the mile markers. Personal effects still inside.',
          'A campfire, still smoking. No one around it. Food on the fire.',
          'The sound of steps that didn\'t match their own.',
        ],
      },
      {
        type: 'hazard',
        label: 'The Afflicted Stretch',
        description: 'The middle section of road where disappearances cluster.',
        difficultyMod: 3,
        eventPool: [
          'Nim saw something at the treeline. It was there, and then it wasn\'t.',
          'A traveler was found alive, but would not say how long they\'d been there.',
          'The road itself seemed to loop. They passed the same milestone three times.',
          'Something moved the markers overnight. The map was wrong by morning.',
        ],
      },
      {
        type: 'objective',
        label: 'The Source',
        description: 'Find and break whatever is making the road impassable.',
        difficultyMod: 4,
        eventPool: [
          'A cairn, off the path, with a ward scratched in the stones. They took it apart.',
          'The ward was broken. The road went quiet in a different way afterward.',
          'An old relic, half-buried. It looked like it had been deliberately placed.',
          'Whatever it was, it didn\'t fight back. That felt worse somehow.',
        ],
      },
    ],
    reward: {
      gold: 220,
      renown: 20,
      possibleItems: ['runed_amulet', 'cursed_ring', 'blessed_blade', 'oracle_lens'],
      possibleMaterials: ['bone_fragment', 'ancient_ink', 'silver_dust', 'herbs_bundle'],
    },
  },
  // 4. Relic Hunt: The Old Fort — ancient fort, 4 stages
  {
    id: 'exp_old_fort',
    name: 'Relic Hunt: The Old Fort',
    description:
      'A border fort abandoned after a battle decades ago. The losing side left in a hurry. They left things behind.',
    region: 'Pale Border',
    baseDifficulty: 11,
    durationLabel: '6 days',
    stages: [
      {
        type: 'travel',
        label: 'The Border Crossing',
        description: 'The Pale Border is officially neutral. Patrols from three factions operate here.',
        difficultyMod: 1,
        eventPool: [
          'A patrol stopped them at a checkpoint. Papers were examined closely.',
          'Someone else was following their trail. They never saw a face.',
          'The border garrison was more relaxed than expected. A shared meal and they were through.',
          'Night crossing. Cold, quiet, successful.',
        ],
      },
      {
        type: 'hazard',
        label: 'The Outer Walls',
        description: 'The fort walls are crumbling. The outer yard is guarded by old traps and new squatters.',
        difficultyMod: 2,
        eventPool: [
          'Squatters had moved into the eastern tower. They were negotiated with.',
          'A rusted portcullis dropped without warning. Everyone scrambled clear.',
          'Old powder store. They went around it very carefully.',
          'The walls had been patched recently. Someone used this fort not long ago.',
        ],
      },
      {
        type: 'objective',
        label: 'The Armory',
        description: 'The battle relics are in the sealed armory. Pry it open and recover them.',
        difficultyMod: 3,
        eventPool: [
          'The armory door had three locks. Two yielded quickly. The third did not.',
          'Weapons still racked and oiled. Whatever army left them, they were disciplined.',
          'A war banner, intact. A merc folded it without speaking.',
          'A sealed strongbox, untouched. The contents were worth the trouble.',
        ],
      },
      {
        type: 'escape',
        label: 'Out Before Dawn',
        description: 'A faction patrol is moving toward the fort. Get out before they arrive.',
        difficultyMod: 2,
        eventPool: [
          'They moved fast through the outer yard. The patrol reached the gate as the last merc cleared the wall.',
          'A wrong turn in the dark cost fifteen minutes. They ran the last mile.',
          'The patrol stopped at the treeline. Never advanced. Lucky.',
          'Someone dropped a piece of kit. Nobody went back for it.',
        ],
      },
    ],
    reward: {
      gold: 280,
      renown: 25,
      possibleItems: ['soldier_sword', 'chain_mail', 'reinforced_shield', 'warlord_helm', 'sigil_badge'],
      possibleMaterials: ['refined_steel', 'iron_scraps', 'tanned_hide', 'ancient_ink'],
    },
    requiredContracts: 3,
  },
  // 5. Whisper Market — underground network, 3 stages (social-heavy)
  {
    id: 'exp_whisper_market',
    name: 'Whisper Market',
    description:
      'An underground trading network operates beneath the city. Getting in requires the right words. Getting what you need requires the right coin.',
    region: 'City Below',
    baseDifficulty: 7,
    durationLabel: '3 days',
    stages: [
      {
        type: 'travel',
        label: 'Finding the Door',
        description: 'The Whisper Market has no address. It has a rumor. Follow it.',
        difficultyMod: 0,
        eventPool: [
          'Three wrong turns, one right bribe. They found the entrance in a wine cellar.',
          'A contact sold them directions. Half of them were correct.',
          'A street informant recognized Voss. She arranged access without negotiation.',
          'The entrance was hidden in plain sight. Obvious once seen. Before that, invisible.',
        ],
      },
      {
        type: 'objective',
        label: 'The Market',
        description: 'Navigate the Whisper Market, gather intelligence, and acquire the target goods.',
        difficultyMod: 2,
        eventPool: [
          'The market had everything. Most of it was stolen. All of it was for sale.',
          'A vendor recognized guild sigils and raised prices. Petra lowered them again.',
          'Old contacts, current prices. The reunion was efficient and mutually beneficial.',
          'A rival agent was operating in the same space. They pretended not to see each other.',
        ],
      },
      {
        type: 'escape',
        label: 'Clean Exit',
        description: 'Leave the market without bringing trouble out with you.',
        difficultyMod: 1,
        eventPool: [
          'Three different people followed them up. Only one made it past the street.',
          'A city warden patrol outside. They used the other exit.',
          'Clean departure. Nobody tailed. Suspiciously clean.',
          'The wine cellar was occupied on the way back out. Awkward, but manageable.',
        ],
      },
    ],
    reward: {
      gold: 180,
      renown: 22,
      possibleItems: ['shadow_knife', 'scouts_cloak', 'sigil_badge', 'lucky_charm', 'oracle_lens'],
      possibleMaterials: ['silver_dust', 'ancient_ink', 'monster_gland'],
    },
    requiredRenown: 50,
  },
];
