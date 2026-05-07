import type { HeroQuest } from '~/types/heroQuests';

export const HERO_QUESTS: HeroQuest[] = [
  {
    id: 'quest_valerius',
    name: 'The Blind Oracle',
    description: 'A mysterious figure has been spotted at the edge of the Thornwood, claiming to see the future of your guild.',
    triggerCondition: {
      minRenown: 50,
      minContracts: 10,
    },
    rewardMercenaryId: 'merc_legend_valerius',
    stages: [
      {
        id: 'valerius_1',
        title: 'A Vision in the Woods',
        narrative: 'Your scouts find a man sitting perfectly still in a clearing. His eyes are covered by a thick silk band. Without turning, he says: "I have been waiting for the Banner of Coin. Your greed is a beacon, but your destiny is clouded."',
        choices: [
          {
            label: 'Ask for his name',
            outcome: {
              text: '"I am Valerius. I seek a guild that can survive the coming dark. Prove your wisdom, and I shall guide your hands."',
              nextStageId: 'valerius_2',
              success: true,
            },
          },
          {
            label: 'Offer him gold for a prophecy',
            outcome: {
              text: 'He laughs, a dry, rasping sound. "Gold? I have seen kingdoms rise and fall into dust. Gold is just heavy stone. I seek a legacy, not a coin."',
              nextStageId: 'valerius_2',
              success: true,
            },
          },
        ],
      },
      {
        id: 'valerius_2',
        title: 'The Trial of Sight',
        narrative: '"A merchant train is being ambushed two miles east of here," Valerius says calmly. "If you send your best to save them, I will know your heart is true. But beware, the ambush is not what it seems."',
        choices: [
          {
            label: 'Negotiate the release (Negotiation check)',
            requirement: { type: 'skill', stat: 'negotiation', value: 20 },
            outcome: {
              text: 'Using silvered words and guild reputation, you resolve the conflict without a single blade drawn. Valerius nods as you return. "You lead with more than just gold. I shall join you."',
              success: true,
            },
          },
          {
            label: 'Observe from the shadows (Intellect check)',
            requirement: { type: 'stat', stat: 'intellect', value: 7 },
            outcome: {
              text: 'You realize the "merchants" are actually imperial spies. By intervening correctly, you secure a political favor and the respect of the Oracle. "You see what others miss," Valerius remarks.',
              success: true,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'quest_saria',
    name: 'Ghost in the Machine',
    description: 'Strange malfunctions are reported in the City Below. Objects are moving on their own, and shadows are stretching where they shouldn\'t.',
    triggerCondition: {
      minRenown: 150,
      minContracts: 30,
    },
    rewardMercenaryId: 'merc_legend_saria',
    stages: [
      {
        id: 'saria_1',
        title: 'The Shifting Rifts',
        narrative: 'Deep in the clockwork sectors of the City Below, you find a young woman flicking in and out of existence. She looks terrified, her form blurring like smoke.',
        choices: [
          {
            label: 'Perform an Arcane anchor (Arcana check)',
            requirement: { type: 'skill', stat: 'arcana', value: 15 },
            outcome: {
              text: 'Using a combination of arcane theory and quick thinking, you manage to ground her form. She gasps, her eyes clearing. "Thank you. The rifts... they were pulling me under."',
              nextStageId: 'saria_2',
              success: true,
            },
          },
          {
            label: 'Catch her with quick reflexes (Agility check)',
            requirement: { type: 'stat', stat: 'agility', value: 8 },
            outcome: {
              text: 'You grab her arm just as she starts to fade. The physical contact seems to anchor her. She looks at you with a mix of shock and relief. "You... you have a strong grip on this world."',
              nextStageId: 'saria_2',
              success: true,
            },
          },
        ],
      },
      {
        id: 'saria_2',
        title: 'The Void-Walker\'s Oath',
        narrative: '"My name is Saria," she whispers. "I have seen the gaps between worlds. I can help your guild reach places no ordinary man can go, but the void will always be part of me. Do you accept the risk?"',
        choices: [
          {
            label: 'Offer her a place in the guild',
            outcome: {
              text: 'She bows her head. "Then I shall be your shadow. Let us see what secrets we can find in the dark."',
              success: true,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'quest_grom',
    name: 'The Iron Wall',
    description: 'A massive gladiator is causing a stir in the regional pits, refusing to join any guild that can\'t survive his "test".',
    triggerCondition: {
      minRenown: 300,
      minContracts: 50,
    },
    rewardMercenaryId: 'merc_legend_grom',
    stages: [
      {
        id: 'grom_1',
        title: 'The Challenge',
        narrative: 'Grom stands seven feet tall, covered in scars. "You want my shield? Then let your best fighter take a hit from my hammer. If they stand, we talk."',
        choices: [
          {
            label: 'Face him head-on (Strength check)',
            requirement: { type: 'stat', stat: 'strength', value: 9 },
            outcome: {
              text: 'The hammer blow rings out like a mountain cracking. Your mercenary doesn\'t budge. Grom grins. "Solid. I like solid."',
              success: true,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'quest_lyra',
    name: 'Shadows of the Past',
    description: 'A series of high-profile thefts in the City Below has left a trail that only a master tracker could follow.',
    triggerCondition: {
      minRenown: 400,
      minContracts: 60,
    },
    rewardMercenaryId: 'merc_legend_lyra',
    stages: [
      {
        id: 'lyra_1',
        title: 'The Rooftop Chase',
        narrative: 'You corner a hooded figure on the spires of the Clocktower. She moves like smoke, always one step ahead.',
        choices: [
          {
            label: 'Intercept her path (Agility check)',
            requirement: { type: 'stat', stat: 'agility', value: 9 },
            outcome: {
              text: 'You predict her leap and catch her mid-air. She laughs, pulling back her hood. "Not bad for a guildmaster. I might have a use for you."',
              success: true,
            },
          },
        ],
      },
    ],
  },
];
