export interface TutorialTip {
  id: string;
  category: 'mechanics' | 'narrative' | 'progression' | 'social';
  title: string;
  content: string;
  screen?: string;
  condition?: (state: Record<string, unknown>) => boolean;
  priority: number;
}

export const TUTORIAL_TIPS: TutorialTip[] = [
  // ── Dashboard Tips ────────────────────────────────────────────────────────
  {
    id: 'tip_dashboard_welcome',
    category: 'narrative',
    title: 'Welcome, Guildmaster',
    content: 'Your guild awaits your command. Assign mercs to contracts to earn gold and renown. The realm is vast, and opportunities are plentiful.',
    screen: 'dashboard',
    priority: 100,
  },
  {
    id: 'tip_dashboard_resources',
    category: 'mechanics',
    title: 'Resources',
    content: 'Gold pays for hires and upgrades. Supplies keep your mercs field-ready. Renown unlocks new regions and attracts better recruits.',
    screen: 'dashboard',
    priority: 50,
  },
  {
    id: 'tip_dashboard_morale',
    category: 'mechanics',
    title: 'Guild Morale',
    content: 'High morale boosts mission success. Low morale increases injury risk. Keep your mercs happy with the Tavern.',
    screen: 'dashboard',
    condition: (state) => (state.guildMorale as number) < 50,
    priority: 80,
  },
  {
    id: 'tip_dashboard_rank',
    category: 'progression',
    title: 'Guild Rank',
    content: 'Complete contracts to rise through five ranks. Higher ranks unlock more concurrent missions and grant access to powerful policies.',
    screen: 'dashboard',
    condition: (state) => (state.completedContracts as number) < 5,
    priority: 70,
  },
  // ── Roster Tips ─────────────────────────────────────────────────────────────
  {
    id: 'tip_roster_stats',
    category: 'mechanics',
    title: 'Mercenary Stats',
    content: 'Strength powers combat. Agility aids stealth and exploration. Intellect helps with ruins and relics. Presence excels in social contracts.',
    screen: 'roster',
    priority: 90,
  },
  {
    id: 'tip_roster_traits',
    category: 'mechanics',
    title: 'Traits Matter',
    content: 'Each merc has unique traits like Brave, Stealthy, or Scholarly. Match traits to mission tags for bonus scores.',
    screen: 'roster',
    priority: 60,
  },
  {
    id: 'tip_roster_bonds',
    category: 'social',
    title: 'Bonds & Rivalries',
    content: 'Mercs who serve together develop bonds—or rivalries. Bonds boost mission scores. Rivalries can cause complications.',
    screen: 'roster',
    priority: 40,
  },
  {
    id: 'tip_roster_training',
    category: 'progression',
    title: 'Training',
    content: 'Mercs can train stats over time. Enable training from the roster screen. Higher Tavern levels speed training.',
    screen: 'roster',
    condition: (state) => (state.mercenaries as Array<{ isTraining?: boolean }>).some(m => !m.isTraining),
    priority: 30,
  },
  // ── Mission Board Tips ─────────────────────────────────────────────────────
  {
    id: 'tip_missions_assign',
    category: 'mechanics',
    title: 'Deploying Mercs',
    content: 'Select available mercs and assign consumables before deploying. Bandages reduce injury chance. Rations prevent fatigue.',
    screen: 'missions',
    priority: 90,
  },
  {
    id: 'tip_missions_difficulty',
    category: 'mechanics',
    title: 'Assess Difficulty',
    content: 'Higher difficulty means higher rewards—but greater risk of failure. Build your party score to exceed difficulty.',
    screen: 'missions',
    priority: 50,
  },
  {
    id: 'tip_missions_tags',
    category: 'mechanics',
    title: 'Match Tags',
    content: 'Mission tags like Combat, Stealth, or Exploration determine which traits and stats provide bonuses. Read descriptions carefully.',
    screen: 'missions',
    priority: 40,
  },
  {
    id: 'tip_missions_region',
    category: 'progression',
    title: 'Regional Missions',
    content: 'Some missions only appear in certain regions. Unlock new regions by reaching rank thresholds and renown goals.',
    screen: 'missions',
    condition: (state) => (state.unlockedRegions as string[]).length < 3,
    priority: 30,
  },
  // ── Hiring Tips ─────────────────────────────────────────────────────────────
  {
    id: 'tip_hiring_refresh',
    category: 'mechanics',
    title: 'Recruit Selection',
    content: 'New recruits appear regularly. Refresh the list for a fee. Better stats cost more, but serve longer.',
    screen: 'hiring',
    priority: 80,
  },
  {
    id: 'tip_hiring_roster',
    category: 'progression',
    title: 'Roster Capacity',
    content: 'Your Barracks limit how many mercs you can maintain. Upgrade to house more fighters.',
    screen: 'hiring',
    condition: (state) => (state.rosterSize as number) >= (state.rosterCap as number) - 1,
    priority: 60,
  },
  // ── Workshop Tips ─────────────────────────────────────────────────────────
  {
    id: 'tip_workshop_crafting',
    category: 'mechanics',
    title: 'Crafting Gear',
    content: 'The Workshop creates weapons, armor, and consumables. Higher Forge levels unlock advanced recipes.',
    screen: 'workshop',
    priority: 80,
  },
  {
    id: 'tip_workshop_materials',
    category: 'mechanics',
    title: 'Materials',
    content: 'Missions yield materials used for crafting. Different contracts produce different materials.',
    screen: 'workshop',
    priority: 50,
  },
  // ── World Map Tips ─────────────────────────────────────────────────────────
  {
    id: 'tip_worldmap_influence',
    category: 'progression',
    title: 'Regional Influence',
    content: 'Succeeding in a region builds influence there. At milestones, you unlock powerful perks exclusive to that region.',
    screen: 'worldmap',
    priority: 90,
  },
  {
    id: 'tip_worldmap_perks',
    category: 'mechanics',
    title: 'Influence Perks',
    content: 'Each region has unique perks at different influence thresholds. Plan your missions to maximize regional benefits.',
    screen: 'worldmap',
    condition: (state) => Object.values(state.regionalInfluence as Record<string, { influence: number }>).some(r => r.influence > 10),
    priority: 60,
  },
  // ── Expedition Tips ────────────────────────────────────────────────────────
  {
    id: 'tip_expeditions_stages',
    category: 'narrative',
    title: 'Multi-Stage Expeditions',
    content: 'Expeditions are longer, multi-stage missions with greater rewards. Mercs may face injuries or fatigue along the way.',
    screen: 'expeditions',
    priority: 90,
  },
  {
    id: 'tip_expeditions_prep',
    category: 'mechanics',
    title: 'Preparation',
    content: 'Expeditions benefit from extra preparation. Assign multiple consumables to improve outcomes at each stage.',
    screen: 'expeditions',
    priority: 50,
  },
  // ── Reliquary Tips ─────────────────────────────────────────────────────────
  {
    id: 'tip_reliquary_artifacts',
    category: 'progression',
    title: 'Artifacts',
    content: 'Rare artifacts provide permanent bonuses to your entire guild. They are difficult to forge but incredibly powerful.',
    screen: 'reliquary',
    priority: 90,
  },
  // ── Policies Tips ─────────────────────────────────────────────────────────
  {
    id: 'tip_policies_tradeoffs',
    category: 'mechanics',
    title: 'Policy Trade-offs',
    content: 'Guild Policies provide powerful bonuses but come with costs. Choose policies that complement your playstyle.',
    screen: 'policies',
    priority: 80,
  },
  // ── General Narrative Tips ────────────────────────────────────────────────
  {
    id: 'tip_narrative_bonds',
    category: 'social',
    title: 'Bonds Deepen',
    content: 'Mercs who complete missions together grow closer—or become rivals. Watch how relationships evolve over time.',
    priority: 60,
  },
  {
    id: 'tip_narrative_events',
    category: 'narrative',
    title: 'Guild Events',
    content: 'Between missions, events unfold. Your choices affect morale, loyalty, and the stories that define your guild.',
    priority: 50,
  },
  {
    id: 'tip_narrative_chronicles',
    category: 'narrative',
    title: 'Your Legacy',
    content: 'Chronicles record your guild\'s greatest achievements. They are the stories future generations will remember.',
    priority: 40,
  },
];

export function getTipsForScreen(screen: string, gameState: Record<string, unknown>): TutorialTip[] {
  return TUTORIAL_TIPS
    .filter(tip => !tip.screen || tip.screen === screen)
    .filter(tip => !tip.condition || tip.condition(gameState))
    .sort((a, b) => b.priority - a.priority);
}

export function getRandomTip(gameState: Record<string, unknown>): TutorialTip | undefined {
  const applicableTips = TUTORIAL_TIPS.filter(tip => !tip.condition || tip.condition(gameState));
  if (applicableTips.length === 0) return undefined;
  return applicableTips[Math.floor(Math.random() * applicableTips.length)];
}