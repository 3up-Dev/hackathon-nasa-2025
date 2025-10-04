export interface BrazilState {
  id: string;
  name: string;
  temp: number;
  rain: number;
  soil: string;
  region: 'north' | 'northeast' | 'centerwest' | 'southeast' | 'south';
  lat: number;
  lon: number;
}

export const brazilStates: BrazilState[] = [
  // North
  { id: 'AC', name: 'Acre', temp: 26, rain: 2000, soil: 'latossolo', region: 'north', lat: -8.77, lon: -70.55 },
  { id: 'AM', name: 'Amazonas', temp: 27, rain: 2400, soil: 'latossolo', region: 'north', lat: -3.47, lon: -62.96 },
  { id: 'RR', name: 'Roraima', temp: 27, rain: 1700, soil: 'latossolo', region: 'north', lat: 2.82, lon: -60.67 },
  { id: 'PA', name: 'Pará', temp: 26, rain: 2300, soil: 'latossolo', region: 'north', lat: -3.79, lon: -52.48 },
  { id: 'AP', name: 'Amapá', temp: 26, rain: 2500, soil: 'latossolo', region: 'north', lat: 1.41, lon: -51.77 },
  { id: 'TO', name: 'Tocantins', temp: 26, rain: 1700, soil: 'latossolo', region: 'north', lat: -10.25, lon: -48.25 },
  { id: 'RO', name: 'Rondônia', temp: 26, rain: 2200, soil: 'latossolo', region: 'north', lat: -8.76, lon: -63.90 },
  
  // Northeast
  { id: 'MA', name: 'Maranhão', temp: 27, rain: 1600, soil: 'latossolo', region: 'northeast', lat: -2.55, lon: -44.30 },
  { id: 'PI', name: 'Piauí', temp: 28, rain: 1000, soil: 'arenoso', region: 'northeast', lat: -5.09, lon: -42.80 },
  { id: 'CE', name: 'Ceará', temp: 27, rain: 800, soil: 'arenoso', region: 'northeast', lat: -3.71, lon: -38.54 },
  { id: 'RN', name: 'Rio Grande do Norte', temp: 27, rain: 700, soil: 'arenoso', region: 'northeast', lat: -5.22, lon: -36.52 },
  { id: 'PB', name: 'Paraíba', temp: 26, rain: 700, soil: 'arenoso', region: 'northeast', lat: -7.06, lon: -35.55 },
  { id: 'PE', name: 'Pernambuco', temp: 26, rain: 900, soil: 'arenoso', region: 'northeast', lat: -8.28, lon: -35.07 },
  { id: 'AL', name: 'Alagoas', temp: 25, rain: 1200, soil: 'latossolo', region: 'northeast', lat: -9.71, lon: -35.73 },
  { id: 'SE', name: 'Sergipe', temp: 25, rain: 1300, soil: 'latossolo', region: 'northeast', lat: -10.90, lon: -37.07 },
  { id: 'BA', name: 'Bahia', temp: 24, rain: 1100, soil: 'latossolo', region: 'northeast', lat: -12.96, lon: -38.51 },
  
  // Center-West
  { id: 'MT', name: 'Mato Grosso', temp: 26, rain: 1750, soil: 'latossolo', region: 'centerwest', lat: -12.64, lon: -55.42 },
  { id: 'MS', name: 'Mato Grosso do Sul', temp: 24, rain: 1500, soil: 'latossolo', region: 'centerwest', lat: -20.51, lon: -54.54 },
  { id: 'GO', name: 'Goiás', temp: 23, rain: 1600, soil: 'latossolo', region: 'centerwest', lat: -15.83, lon: -49.32 },
  { id: 'DF', name: 'Distrito Federal', temp: 22, rain: 1500, soil: 'latossolo', region: 'centerwest', lat: -15.83, lon: -47.86 },
  
  // Southeast
  { id: 'SP', name: 'São Paulo', temp: 21, rain: 1400, soil: 'latossolo', region: 'southeast', lat: -23.55, lon: -46.64 },
  { id: 'RJ', name: 'Rio de Janeiro', temp: 23, rain: 1200, soil: 'argiloso', region: 'southeast', lat: -22.91, lon: -43.17 },
  { id: 'MG', name: 'Minas Gerais', temp: 21, rain: 1500, soil: 'latossolo', region: 'southeast', lat: -18.10, lon: -44.38 },
  { id: 'ES', name: 'Espírito Santo', temp: 23, rain: 1200, soil: 'argiloso', region: 'southeast', lat: -19.19, lon: -40.34 },
  
  // South
  { id: 'PR', name: 'Paraná', temp: 19, rain: 1600, soil: 'latossolo', region: 'south', lat: -25.25, lon: -52.02 },
  { id: 'SC', name: 'Santa Catarina', temp: 18, rain: 1500, soil: 'argiloso', region: 'south', lat: -27.33, lon: -49.44 },
  { id: 'RS', name: 'Rio Grande do Sul', temp: 17, rain: 1400, soil: 'argiloso', region: 'south', lat: -30.01, lon: -51.22 },
];
