/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Dados das 13 culturas organizadas por 5 setores produtivos.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * Data for 13 crops organized by 5 production sectors.
 */

export type Sector = 'agricultura' | 'pecuaria' | 'aquicultura' | 'silvicultura' | 'horticultura';

export interface CropStage {
  name: { pt: string; en: string };
  daysToComplete: number;
  waterNeeds: 'low' | 'medium' | 'high';
  tempSensitivity: 'low' | 'medium' | 'high';
}

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
  growthDays: number;
  stages: CropStage[];
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
    growthDays: 120,
    stages: [
      { name: { pt: 'Plantio', en: 'Planting' }, daysToComplete: 7, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Germinação', en: 'Germination' }, daysToComplete: 14, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento', en: 'Growth' }, daysToComplete: 50, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Floração', en: 'Flowering' }, daysToComplete: 28, waterNeeds: 'medium', tempSensitivity: 'high' },
      { name: { pt: 'Maturação', en: 'Maturation' }, daysToComplete: 21, waterNeeds: 'low', tempSensitivity: 'medium' },
    ],
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
    growthDays: 150,
    stages: [
      { name: { pt: 'Plantio', en: 'Planting' }, daysToComplete: 7, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Germinação', en: 'Germination' }, daysToComplete: 10, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento', en: 'Growth' }, daysToComplete: 60, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Floração', en: 'Flowering' }, daysToComplete: 35, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Maturação', en: 'Maturation' }, daysToComplete: 38, waterNeeds: 'medium', tempSensitivity: 'low' },
    ],
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
    growthDays: 1095,
    stages: [
      { name: { pt: 'Plantio de Mudas', en: 'Seedling Planting' }, daysToComplete: 180, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento Vegetativo', en: 'Vegetative Growth' }, daysToComplete: 365, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Primeira Floração', en: 'First Flowering' }, daysToComplete: 365, waterNeeds: 'medium', tempSensitivity: 'high' },
      { name: { pt: 'Maturação dos Frutos', en: 'Fruit Maturation' }, daysToComplete: 185, waterNeeds: 'medium', tempSensitivity: 'medium' },
    ],
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
    growthDays: 365,
    stages: [
      { name: { pt: 'Plantio', en: 'Planting' }, daysToComplete: 30, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Brotação', en: 'Sprouting' }, daysToComplete: 60, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento', en: 'Growth' }, daysToComplete: 180, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Maturação', en: 'Maturation' }, daysToComplete: 95, waterNeeds: 'medium', tempSensitivity: 'low' },
    ],
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
    growthDays: 730,
    stages: [
      { name: { pt: 'Nascimento', en: 'Birth' }, daysToComplete: 1, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento', en: 'Growth' }, daysToComplete: 365, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Engorda', en: 'Fattening' }, daysToComplete: 364, waterNeeds: 'medium', tempSensitivity: 'low' },
    ],
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
    growthDays: 42,
    stages: [
      { name: { pt: 'Nascimento', en: 'Hatching' }, daysToComplete: 1, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento Inicial', en: 'Early Growth' }, daysToComplete: 14, waterNeeds: 'medium', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento Final', en: 'Final Growth' }, daysToComplete: 27, waterNeeds: 'medium', tempSensitivity: 'medium' },
    ],
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
    growthDays: 180,
    stages: [
      { name: { pt: 'Nascimento', en: 'Birth' }, daysToComplete: 1, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento', en: 'Growth' }, daysToComplete: 90, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Terminação', en: 'Finishing' }, daysToComplete: 89, waterNeeds: 'medium', tempSensitivity: 'low' },
    ],
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
    growthDays: 180,
    stages: [
      { name: { pt: 'Alevinagem', en: 'Fingerling' }, daysToComplete: 30, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Recria', en: 'Juvenile' }, daysToComplete: 60, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Engorda', en: 'Fattening' }, daysToComplete: 90, waterNeeds: 'high', tempSensitivity: 'medium' },
    ],
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
    growthDays: 120,
    stages: [
      { name: { pt: 'Pós-Larva', en: 'Post-Larvae' }, daysToComplete: 20, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Juvenil', en: 'Juvenile' }, daysToComplete: 40, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Engorda', en: 'Fattening' }, daysToComplete: 60, waterNeeds: 'high', tempSensitivity: 'medium' },
    ],
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
    growthDays: 270,
    stages: [
      { name: { pt: 'Alevinagem', en: 'Fingerling' }, daysToComplete: 45, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Recria', en: 'Juvenile' }, daysToComplete: 90, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Engorda', en: 'Fattening' }, daysToComplete: 135, waterNeeds: 'high', tempSensitivity: 'medium' },
    ],
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
    growthDays: 2555,
    stages: [
      { name: { pt: 'Plantio', en: 'Planting' }, daysToComplete: 180, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento Inicial', en: 'Early Growth' }, daysToComplete: 730, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Crescimento Médio', en: 'Mid Growth' }, daysToComplete: 1095, waterNeeds: 'medium', tempSensitivity: 'low' },
      { name: { pt: 'Maturação', en: 'Maturation' }, daysToComplete: 550, waterNeeds: 'low', tempSensitivity: 'low' },
    ],
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
    growthDays: 5475,
    stages: [
      { name: { pt: 'Plantio', en: 'Planting' }, daysToComplete: 365, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento Inicial', en: 'Early Growth' }, daysToComplete: 1460, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Crescimento Médio', en: 'Mid Growth' }, daysToComplete: 2190, waterNeeds: 'low', tempSensitivity: 'low' },
      { name: { pt: 'Maturação', en: 'Maturation' }, daysToComplete: 1460, waterNeeds: 'low', tempSensitivity: 'low' },
    ],
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
    growthDays: 60,
    stages: [
      { name: { pt: 'Plantio', en: 'Planting' }, daysToComplete: 7, waterNeeds: 'high', tempSensitivity: 'medium' },
      { name: { pt: 'Germinação', en: 'Germination' }, daysToComplete: 10, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento', en: 'Growth' }, daysToComplete: 30, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Colheita', en: 'Harvest' }, daysToComplete: 13, waterNeeds: 'low', tempSensitivity: 'low' },
    ],
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
    growthDays: 730,
    stages: [
      { name: { pt: 'Plantio de Mudas', en: 'Seedling Planting' }, daysToComplete: 90, waterNeeds: 'high', tempSensitivity: 'high' },
      { name: { pt: 'Crescimento', en: 'Growth' }, daysToComplete: 365, waterNeeds: 'medium', tempSensitivity: 'medium' },
      { name: { pt: 'Floração', en: 'Flowering' }, daysToComplete: 180, waterNeeds: 'medium', tempSensitivity: 'high' },
      { name: { pt: 'Frutificação', en: 'Fruiting' }, daysToComplete: 95, waterNeeds: 'medium', tempSensitivity: 'medium' },
    ],
  },
];
