import type { Material } from '~/types/crafting';

export const MATERIALS: Material[] = [
  // ── Common ──────────────────────────────────────────────────────────────────
  {
    id: 'iron_scraps',
    name: 'Iron Scraps',
    description: 'Broken blades, bent nails, leftover slag. Useful at a forge.',
    rarity: 'common',
    icon: '🔩',
    value: 3,
  },
  {
    id: 'tanned_hide',
    name: 'Tanned Hide',
    description: 'Cured animal hide, ready to cut and stitch.',
    rarity: 'common',
    icon: '🐂',
    value: 4,
  },
  {
    id: 'herbs_bundle',
    name: 'Herbs Bundle',
    description: 'A tied bundle of healing and tonic herbs. Smells sharp.',
    rarity: 'common',
    icon: '🌿',
    value: 3,
  },
  {
    id: 'tallow_candles',
    name: 'Tallow Candles',
    description: 'Fat-rendered candles. Smoky, but they burn long.',
    rarity: 'common',
    icon: '🕯️',
    value: 2,
  },
  {
    id: 'rough_cloth',
    name: 'Rough Cloth',
    description: 'Unbleached linen, strong enough for bandages or backing.',
    rarity: 'common',
    icon: '🧵',
    value: 2,
  },
  {
    id: 'wolf_pelt',
    name: 'Wolf Pelt',
    description: 'A quality hide from a large wolf. Warm and weather-resistant.',
    rarity: 'common',
    icon: '🐺',
    value: 8,
  },
  {
    id: 'bone_fragment',
    name: 'Bone Fragment',
    description: 'Old bones from a ruin site. Useful for alchemical work.',
    rarity: 'common',
    icon: '🦴',
    value: 3,
  },
  {
    id: 'swamp_reed',
    name: 'Swamp Reed',
    description: 'Hollow reeds from the Ashfen. Useful in certain preparations.',
    rarity: 'common',
    icon: '🌾',
    value: 2,
  },
  // ── Uncommon ─────────────────────────────────────────────────────────────────
  {
    id: 'refined_steel',
    name: 'Refined Steel',
    description: 'Smelted and worked into a clean billet. Forge-ready.',
    rarity: 'uncommon',
    icon: '⚙️',
    value: 20,
  },
  {
    id: 'silver_dust',
    name: 'Silver Dust',
    description: 'Fine ground silver, used in weapon coatings and wards.',
    rarity: 'uncommon',
    icon: '✨',
    value: 25,
  },
  {
    id: 'monster_gland',
    name: 'Monster Gland',
    description: 'A gland harvested from a dangerous creature. Potent reagent.',
    rarity: 'uncommon',
    icon: '🫀',
    value: 30,
  },
  {
    id: 'ancient_ink',
    name: 'Ancient Ink',
    description: 'Dark ink recovered from old ruins. Retains unusual properties.',
    rarity: 'uncommon',
    icon: '🖋️',
    value: 22,
  },
  // ── Rare ─────────────────────────────────────────────────────────────────────
  {
    id: 'moonstone_shard',
    name: 'Moonstone Shard',
    description: 'A pale shard of moonstone, faintly luminescent at night.',
    rarity: 'rare',
    icon: '🌙',
    value: 80,
  },
  {
    id: 'dragonscale_fragment',
    name: 'Dragonscale Fragment',
    description: 'A single scale from something very old and very dangerous.',
    rarity: 'rare',
    icon: '🐉',
    value: 120,
  },
];

export const MATERIALS_MAP: Record<string, Material> = Object.fromEntries(
  MATERIALS.map((m) => [m.id, m])
);
