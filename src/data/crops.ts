export interface Crop {
  id: string;
  name: { pt: string; en: string };
  icon: string;
  color: string;
  idealTemp: [number, number];
  idealRain: [number, number];
  idealSoil: string[];
  waterConsumption: 'low' | 'medium' | 'high';
}

export const crops: Crop[] = [
  {
    id: 'soja',
    name: { pt: 'Soja', en: 'Soy' },
    icon: '🌿',
    color: '#66BB6A',
    idealTemp: [20, 30],
    idealRain: [1000, 2000],
    idealSoil: ['latossolo', 'argiloso'],
    waterConsumption: 'high',
  },
  {
    id: 'milho',
    name: { pt: 'Milho', en: 'Corn' },
    icon: '🌽',
    color: '#FBC02D',
    idealTemp: [18, 30],
    idealRain: [800, 1600],
    idealSoil: ['latossolo', 'argiloso', 'arenoso'],
    waterConsumption: 'medium',
  },
  {
    id: 'trigo',
    name: { pt: 'Trigo', en: 'Wheat' },
    icon: '🌾',
    color: '#F4A460',
    idealTemp: [10, 25],
    idealRain: [600, 800],
    idealSoil: ['argiloso', 'latossolo'],
    waterConsumption: 'low',
  },
  {
    id: 'arroz',
    name: { pt: 'Arroz', en: 'Rice' },
    icon: '🍚',
    color: '#9CCC65',
    idealTemp: [20, 30],
    idealRain: [1200, 2500],
    idealSoil: ['hidromórfico', 'aluvial'],
    waterConsumption: 'high',
  },
  {
    id: 'cafe',
    name: { pt: 'Café', en: 'Coffee' },
    icon: '☕',
    color: '#8D6E63',
    idealTemp: [18, 24],
    idealRain: [1000, 1800],
    idealSoil: ['latossolo', 'argiloso'],
    waterConsumption: 'medium',
  },
];
