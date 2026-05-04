export interface DioramaProp {
  id: string;
  name: string;
  description: string;
  icon: string;
  costRenown: number;
  position: [number, number, number]; // [x, y, z] in the 3D scene
  modelType: 'statue' | 'pit' | 'fountain' | 'flag';
}

export const DIORAMA_PROPS: DioramaProp[] = [
  {
    id: 'prop_statue_founder',
    name: 'Statue of the Founder',
    description: 'A grand obsidian statue that inspires all who enter the hall.',
    icon: '🗿',
    costRenown: 100,
    position: [0, 0, 5],
    modelType: 'statue',
  },
  {
    id: 'prop_training_pits',
    name: 'Gladiatorial Pits',
    description: 'Sunken pits for more intensive (and dangerous) training.',
    icon: '🕳️',
    costRenown: 250,
    position: [-5, -0.5, -5],
    modelType: 'pit',
  },
  {
    id: 'prop_eternal_hearth',
    name: 'Eternal Hearth',
    description: 'A massive fire pit in the tavern that never goes out.',
    icon: '🔥',
    costRenown: 150,
    position: [5, 0, -2],
    modelType: 'fountain',
  },
  {
    id: 'prop_guild_banners',
    name: 'Imperial Banners',
    description: 'Silk banners that snap in the wind, showing the world your reach.',
    icon: '🚩',
    costRenown: 50,
    position: [-8, 5, 0],
    modelType: 'flag',
  },
];

export type WeatherType = 'clear' | 'rain' | 'snow' | 'night' | 'storm';
