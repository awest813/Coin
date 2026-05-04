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
    rewardMercenaryId: 'valerius',
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
            label: 'Send a rescue party (Presence check)',
            requirement: { stat: 'presence', value: 7 },
            outcome: {
              text: 'Your party arrives just in time. Through sheer authority, they rally the merchants and repel the bandits. Valerius nods as you return. "You lead not just with gold, but with will. I shall join you."',
              success: true,
            },
          },
          {
            label: 'Observe from the shadows (Intellect check)',
            requirement: { stat: 'intellect', value: 7 },
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
    rewardMercenaryId: 'saria',
    stages: [
      {
        id: 'saria_1',
        title: 'The Shifting Rifts',
        narrative: 'Deep in the clockwork sectors of the City Below, you find a young woman flicking in and out of existence. She looks terrified, her form blurring like smoke.',
        choices: [
          {
            label: 'Try to stabilize her (Intellect check)',
            requirement: { stat: 'intellect', value: 8 },
            outcome: {
              text: 'Using a combination of ancient theory and quick thinking, you manage to ground her form. She gasps, her eyes clearing. "Thank you. The rifts... they were pulling me under."',
              nextStageId: 'saria_2',
              success: true,
            },
          },
          {
            label: 'Catch her with quick reflexes (Agility check)',
            requirement: { stat: 'agility', value: 8 },
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
];
