export type Sector = 'agricultura' | 'pecuaria' | 'aquicultura' | 'silvicultura' | 'horticultura';

export interface Crop {
  id: string;
  name: { pt: string; en: string };
  sector: Sector;
  icon: string;
  color: string;
  idealTemp: [number, number];
  idealRain: [number, number];
  idealSoil: string[];
  waterConsumption: 'low' | 'medium' | 'high';
}

export const crops: Crop[] = [
  // Agricultura
  {
    id: 'soja',
    name: { pt: 'Soja', en: 'Soy' },
    sector: 'agricultura',
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
    sector: 'agricultura',
    icon: '🌽',
    color: '#FBC02D',
    idealTemp: [18, 30],
    idealRain: [800, 1600],
    idealSoil: ['latossolo', 'argiloso', 'arenoso'],
    waterConsumption: 'medium',
  },
  {
    id: 'cafe',
    name: { pt: 'Café', en: 'Coffee' },
    sector: 'agricultura',
    icon: '☕',
    color: '#8D6E63',
    idealTemp: [18, 24],
    idealRain: [1000, 1800],
    idealSoil: ['latossolo', 'argiloso'],
    waterConsumption: 'medium',
  },
  {
    id: 'cana',
    name: { pt: 'Cana', en: 'Sugarcane' },
    sector: 'agricultura',
    icon: '🎋',
    color: '#7CB342',
    idealTemp: [20, 32],
    idealRain: [1200, 1800],
    idealSoil: ['latossolo', 'argiloso'],
    waterConsumption: 'high',
  },
  // Pecuária
  {
    id: 'bovino',
    name: { pt: 'Bovino', en: 'Cattle' },
    sector: 'pecuaria',
    icon: '🐄',
    color: '#8D6E63',
    idealTemp: [15, 30],
    idealRain: [800, 1600],
    idealSoil: ['latossolo', 'argiloso', 'arenoso'],
    waterConsumption: 'medium',
  },
  {
    id: 'ave',
    name: { pt: 'Ave', en: 'Poultry' },
    sector: 'pecuaria',
    icon: '🐔',
    color: '#F4A460',
    idealTemp: [18, 28],
    idealRain: [800, 1400],
    idealSoil: ['latossolo', 'argiloso', 'arenoso'],
    waterConsumption: 'low',
  },
  {
    id: 'suino',
    name: { pt: 'Suíno', en: 'Swine' },
    sector: 'pecuaria',
    icon: '🐷',
    color: '#E57373',
    idealTemp: [16, 27],
    idealRain: [800, 1400],
    idealSoil: ['latossolo', 'argiloso', 'arenoso'],
    waterConsumption: 'medium',
  },
  // Aquicultura
  {
    id: 'tilapia',
    name: { pt: 'Tilápia', en: 'Tilapia' },
    sector: 'aquicultura',
    icon: '🐟',
    color: '#42A5F5',
    idealTemp: [22, 30],
    idealRain: [1000, 2000],
    idealSoil: ['hidromórfico', 'aluvial'],
    waterConsumption: 'high',
  },
  {
    id: 'camarao',
    name: { pt: 'Camarão', en: 'Shrimp' },
    sector: 'aquicultura',
    icon: '🦐',
    color: '#FF7043',
    idealTemp: [25, 32],
    idealRain: [1200, 2200],
    idealSoil: ['hidromórfico', 'aluvial'],
    waterConsumption: 'high',
  },
  {
    id: 'tambaqui',
    name: { pt: 'Tambaqui', en: 'Tambaqui' },
    sector: 'aquicultura',
    icon: '🐠',
    color: '#26A69A',
    idealTemp: [24, 32],
    idealRain: [1500, 2500],
    idealSoil: ['hidromórfico', 'aluvial'],
    waterConsumption: 'high',
  },
  // Silvicultura
  {
    id: 'eucalipto',
    name: { pt: 'Eucalipto', en: 'Eucalyptus' },
    sector: 'silvicultura',
    icon: '🌲',
    color: '#558B2F',
    idealTemp: [18, 28],
    idealRain: [1000, 1600],
    idealSoil: ['latossolo', 'argiloso'],
    waterConsumption: 'medium',
  },
  {
    id: 'pinus',
    name: { pt: 'Pinus', en: 'Pine' },
    sector: 'silvicultura',
    icon: '🌲',
    color: '#689F38',
    idealTemp: [12, 24],
    idealRain: [1000, 1400],
    idealSoil: ['latossolo', 'argiloso'],
    waterConsumption: 'low',
  },
  // Horticultura
  {
    id: 'hortalica',
    name: { pt: 'Hortaliça', en: 'Vegetables' },
    sector: 'horticultura',
    icon: '🥬',
    color: '#66BB6A',
    idealTemp: [15, 28],
    idealRain: [800, 1400],
    idealSoil: ['argiloso', 'latossolo'],
    waterConsumption: 'medium',
  },
  {
    id: 'frutas',
    name: { pt: 'Frutas', en: 'Fruits' },
    sector: 'horticultura',
    icon: '🍎',
    color: '#EF5350',
    idealTemp: [18, 30],
    idealRain: [1000, 1600],
    idealSoil: ['latossolo', 'argiloso'],
    waterConsumption: 'medium',
  },
];
