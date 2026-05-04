import type { GuildPolicy } from '~/types/guild';

export const GUILD_POLICIES: GuildPolicy[] = [
  {
    id: 'aggressive_recruiting',
    name: 'Aggressive Recruiting',
    description: 'Prioritize hiring experienced veterans over raw recruits.',
    icon: '🎖️',
    effects: {
      positive: 'Recruits have higher base stats (+1 to all)',
      negative: 'Hiring cost increased by 50%',
    },
  },
  {
    id: 'safety_first',
    name: 'Safety First',
    description: 'Ensure every mission is planned with survival as the primary goal.',
    icon: '🛡️',
    effects: {
      positive: 'Injury and fatigue chance reduced by 50%',
      negative: 'Mission duration increased by 25%',
    },
  },
  {
    id: 'profit_maximization',
    name: 'Profit Maximization',
    description: 'Squeeze every coin out of every contract, no matter the toll on the mercs.',
    icon: '⚖️',
    effects: {
      positive: 'Gold gain from missions increased by 30%',
      negative: 'Mercenary morale decays 2x faster after missions',
    },
  },
  {
    id: 'rigorous_training',
    name: 'Rigorous Training',
    description: 'Push your mercenaries to their absolute limits in the training pits.',
    icon: '🏋️',
    effects: {
      positive: 'Training progress speed doubled',
      negative: 'Training supply cost doubled',
    },
  },
  {
    id: 'frugal_operations',
    name: 'Frugal Operations',
    description: 'Cut unnecessary expenses to keep the guild lean and profitable.',
    icon: '📉',
    effects: {
      positive: 'Room maintenance and consumable usage cost -50%',
      negative: 'Renown gain from missions reduced by 20%',
    },
  },
];

export const POLICIES_MAP = GUILD_POLICIES.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, GuildPolicy>);
