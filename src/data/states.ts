export interface BrazilState {
  id: string;
  name: string;
  temp: number;
  rain: number;
  soil: string;
  region: 'north' | 'northeast' | 'centerwest' | 'southeast' | 'south';
}

export const brazilStates: BrazilState[] = [
  // North
  { id: 'AC', name: 'Acre', temp: 26, rain: 2000, soil: 'latossolo', region: 'north' },
  { id: 'AM', name: 'Amazonas', temp: 27, rain: 2400, soil: 'latossolo', region: 'north' },
  { id: 'RR', name: 'Roraima', temp: 27, rain: 1700, soil: 'latossolo', region: 'north' },
  { id: 'PA', name: 'Pará', temp: 26, rain: 2300, soil: 'latossolo', region: 'north' },
  { id: 'AP', name: 'Amapá', temp: 26, rain: 2500, soil: 'latossolo', region: 'north' },
  { id: 'TO', name: 'Tocantins', temp: 26, rain: 1700, soil: 'latossolo', region: 'north' },
  { id: 'RO', name: 'Rondônia', temp: 26, rain: 2200, soil: 'latossolo', region: 'north' },
  
  // Northeast
  { id: 'MA', name: 'Maranhão', temp: 27, rain: 1600, soil: 'latossolo', region: 'northeast' },
  { id: 'PI', name: 'Piauí', temp: 28, rain: 1000, soil: 'arenoso', region: 'northeast' },
  { id: 'CE', name: 'Ceará', temp: 27, rain: 800, soil: 'arenoso', region: 'northeast' },
  { id: 'RN', name: 'Rio Grande do Norte', temp: 27, rain: 700, soil: 'arenoso', region: 'northeast' },
  { id: 'PB', name: 'Paraíba', temp: 26, rain: 700, soil: 'arenoso', region: 'northeast' },
  { id: 'PE', name: 'Pernambuco', temp: 26, rain: 900, soil: 'arenoso', region: 'northeast' },
  { id: 'AL', name: 'Alagoas', temp: 25, rain: 1200, soil: 'latossolo', region: 'northeast' },
  { id: 'SE', name: 'Sergipe', temp: 25, rain: 1300, soil: 'latossolo', region: 'northeast' },
  { id: 'BA', name: 'Bahia', temp: 24, rain: 1100, soil: 'latossolo', region: 'northeast' },
  
  // Center-West
  { id: 'MT', name: 'Mato Grosso', temp: 26, rain: 1750, soil: 'latossolo', region: 'centerwest' },
  { id: 'MS', name: 'Mato Grosso do Sul', temp: 24, rain: 1500, soil: 'latossolo', region: 'centerwest' },
  { id: 'GO', name: 'Goiás', temp: 23, rain: 1600, soil: 'latossolo', region: 'centerwest' },
  { id: 'DF', name: 'Distrito Federal', temp: 22, rain: 1500, soil: 'latossolo', region: 'centerwest' },
  
  // Southeast
  { id: 'SP', name: 'São Paulo', temp: 21, rain: 1400, soil: 'latossolo', region: 'southeast' },
  { id: 'RJ', name: 'Rio de Janeiro', temp: 23, rain: 1200, soil: 'argiloso', region: 'southeast' },
  { id: 'MG', name: 'Minas Gerais', temp: 21, rain: 1500, soil: 'latossolo', region: 'southeast' },
  { id: 'ES', name: 'Espírito Santo', temp: 23, rain: 1200, soil: 'argiloso', region: 'southeast' },
  
  // South
  { id: 'PR', name: 'Paraná', temp: 19, rain: 1600, soil: 'latossolo', region: 'south' },
  { id: 'SC', name: 'Santa Catarina', temp: 18, rain: 1500, soil: 'argiloso', region: 'south' },
  { id: 'RS', name: 'Rio Grande do Sul', temp: 17, rain: 1400, soil: 'argiloso', region: 'south' },
];
