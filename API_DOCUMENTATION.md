# Documentação Técnica de APIs - Plantando Futuro

> **Nota**: Este projeto utiliza dados científicos reais de APIs públicas da NASA e INMET para simular produção agrícola sustentável. Todo o código de integração foi desenvolvido com assistência de Inteligência Artificial.

## Índice
1. [NASA POWER API - Dados Climáticos](#1-nasa-power-api---dados-climáticos)
2. [NASA FIRMS API - Focos de Incêndio](#2-nasa-firms-api---focos-de-incêndio)
3. [INMET API - Alertas Meteorológicos](#3-inmet-api---alertas-meteorológicos)
4. [Edge Functions](#4-edge-functions)
5. [Tratamento de Erros](#5-tratamento-de-erros)
6. [Rate Limits e Boas Práticas](#6-rate-limits-e-boas-práticas)

---

## 1. NASA POWER API - Dados Climáticos

### Visão Geral
A **NASA POWER** (Prediction Of Worldwide Energy Resources) fornece dados climáticos históricos e em tempo real derivados de satélites e modelos meteorológicos globais. Utilizamos a comunidade **AG (Agricultural)** para dados agrícolas.

### Endpoint Base
```
https://power.larc.nasa.gov/api/temporal/daily/point
```

### Parâmetros da Requisição

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `parameters` | string | Sim | Lista separada por vírgula: `T2M,PRECTOTCORR,RH2M,EVPTRNS` |
| `community` | string | Sim | `AG` (Agricultural) |
| `longitude` | float | Sim | Longitude (-180 a 180) |
| `latitude` | float | Sim | Latitude (-90 a 90) |
| `start` | string | Sim | Data de início (formato: YYYYMMDD) |
| `end` | string | Sim | Data de fim (formato: YYYYMMDD) |
| `format` | string | Sim | `JSON` |

### Parâmetros Climáticos Utilizados

#### T2M - Temperatura do Ar a 2 Metros
- **Unidade**: °C (Celsius)
- **Descrição**: Temperatura média do ar medida a 2 metros da superfície
- **Uso no Jogo**: Verificação de compatibilidade com faixa ideal de temperatura da cultura, detecção de ondas de calor e frentes frias

#### PRECTOTCORR - Precipitação Total Corrigida
- **Unidade**: mm/dia
- **Descrição**: Precipitação diária corrigida baseada em dados de satélite
- **Uso no Jogo**: Cálculo de adequação hídrica, detecção de secas e enchentes

#### RH2M - Umidade Relativa a 2 Metros
- **Unidade**: % (porcentagem)
- **Descrição**: Umidade relativa do ar a 2 metros da superfície
- **Uso no Jogo**: Geração de tarefas de controle de umidade, detecção de condições de risco para doenças

#### EVPTRNS - Evapotranspiração
- **Unidade**: mm/dia
- **Descrição**: Taxa de perda de água por evaporação do solo e transpiração das plantas
- **Uso no Jogo**: Cálculo realista de consumo de água da produção

### Exemplo de Requisição

```bash
curl "https://power.larc.nasa.gov/api/temporal/daily/point?\
parameters=T2M,PRECTOTCORR,RH2M,EVPTRNS&\
community=AG&\
longitude=-46.6333&\
latitude=-23.5505&\
start=20250901&\
end=20250930&\
format=JSON"
```

### Exemplo de Resposta

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-46.6333, -23.5505, 760.5]
  },
  "properties": {
    "parameter": {
      "T2M": {
        "20250901": 21.5,
        "20250902": 22.3,
        "20250903": 20.8,
        ...
      },
      "PRECTOTCORR": {
        "20250901": 0.0,
        "20250902": 5.2,
        "20250903": 12.8,
        ...
      },
      "RH2M": {
        "20250901": 65.0,
        "20250902": 72.0,
        "20250903": 80.0,
        ...
      },
      "EVPTRNS": {
        "20250901": 3.5,
        "20250902": 3.2,
        "20250903": 2.8,
        ...
      }
    }
  },
  "messages": [],
  "parameters": {
    "T2M": {...},
    "PRECTOTCORR": {...},
    "RH2M": {...},
    "EVPTRNS": {...}
  },
  "times": {
    "data": 1.52,
    "process": 0.05
  }
}
```

### Processamento dos Dados

```typescript
// Exemplo de código (desenvolvido com IA)
const temps = Object.values(data.parameters.T2M) as number[];
const precips = Object.values(data.parameters.PRECTOTCORR) as number[];
const humidities = Object.values(data.parameters.RH2M) as number[];
const evapotranspirations = Object.values(data.parameters.EVPTRNS) as number[];

// Filtrar valores inválidos (-999 = dados ausentes)
const validTemps = temps.filter(t => t !== -999);
const validPrecips = precips.filter(p => p !== -999 && p >= 0);

// Calcular médias
const avgTemp = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
const totalPrecip = validPrecips.reduce((a, b) => a + b, 0);
```

### Detecção de Anomalias Climáticas

```typescript
interface ClimateAnomalies {
  drought: boolean;        // Seca: precipitação < 3mm/dia
  flood: boolean;          // Enchente: precipitação > 15mm/dia
  heatWave: boolean;       // Onda de calor: temperatura > 33°C
  coldSnap: boolean;       // Frio intenso: temperatura < 18°C
  fireRisk: boolean;       // Risco de incêndio: temp > 30°C, umidade < 40%, precip < 3mm
  stormRisk: boolean;      // Risco de tempestade: precipitação > 20mm/dia
}
```

### Cache
- **Duração**: 24 horas
- **Implementação**: Map em memória na Edge Function
- **Justificativa**: Dados históricos da NASA não mudam, reduz latência e chamadas à API

---

## 2. NASA FIRMS API - Focos de Incêndio

### Visão Geral
**FIRMS** (Fire Information for Resource Management System) fornece dados de focos de incêndio detectados por satélites MODIS e VIIRS em tempo quase real (3-4 horas de delay).

### Endpoint Base
```
https://firms.modaps.eosdis.nasa.gov/api/country/csv/{MAP_KEY}/{SOURCE}/{COUNTRY_CODE}/{DAY_RANGE}
```

### Parâmetros da Requisição

| Parâmetro | Valor Utilizado | Descrição |
|-----------|-----------------|-----------|
| `MAP_KEY` | *Armazenado em Secrets* | API key obtida em https://firms.modaps.eosdis.nasa.gov/api/ |
| `SOURCE` | `VIIRS_SNPP_NRT` | Dataset VIIRS (resolução 375m, atualização 3-4h) |
| `COUNTRY_CODE` | `BRA` | Brasil |
| `DAY_RANGE` | `1` | Últimas 24 horas |

### Exemplo de Requisição

```bash
curl "https://firms.modaps.eosdis.nasa.gov/api/country/csv/\
{MAP_KEY}/VIIRS_SNPP_NRT/BRA/1"
```

### Exemplo de Resposta (CSV)

```csv
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
-3.5,-62.3,328.5,0.4,0.4,2025-10-05,0315,N,n,2.0NRT,294.2,12.5,D
-3.6,-62.4,335.2,0.4,0.4,2025-10-05,0315,N,h,2.0NRT,298.1,15.3,D
-8.8,-63.5,342.1,0.4,0.4,2025-10-05,0430,N,h,2.0NRT,301.5,18.9,D
```

### Campos Importantes

| Campo | Descrição |
|-------|-----------|
| `latitude` | Latitude do foco de incêndio |
| `longitude` | Longitude do foco de incêndio |
| `brightness` | Brilho (temperatura) em Kelvin |
| `acq_date` | Data de aquisição (YYYY-MM-DD) |
| `acq_time` | Hora de aquisição (HHMM UTC) |
| `confidence` | Confiança: `l` (low), `n` (nominal), `h` (high) |
| `frp` | Fire Radiative Power (MW) - intensidade do fogo |

### Geofencing por Estado

```typescript
const STATE_BOUNDARIES: Record<string, { 
  minLat: number; maxLat: number; 
  minLon: number; maxLon: number 
}> = {
  AC: { minLat: -11.0, maxLat: -7.0, minLon: -74.0, maxLon: -66.5 },
  AM: { minLat: -9.8, maxLat: 2.3, minLon: -73.8, maxLon: -56.1 },
  // ... todos os 27 estados
};

// Filtragem
const stateBounds = STATE_BOUNDARIES[stateId];
for (const line of csvLines) {
  const [latStr, lonStr] = line.split(',');
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  
  if (lat >= stateBounds.minLat && lat <= stateBounds.maxLat &&
      lon >= stateBounds.minLon && lon <= stateBounds.maxLon) {
    fireCount++;
  }
}
```

### Classificação de Severidade

```typescript
if (fireCount >= 10) {
  severity = 'high';    // -20 health, +100L water, -15 sustainability
} else if (fireCount >= 5) {
  severity = 'medium';  // -10 health, +50L water, -8 sustainability
} else if (fireCount >= 1) {
  severity = 'low';     // -5 health, +20L water, -3 sustainability
}
```

### Cache
- **Duração**: 30 minutos
- **Justificativa**: Dados atualizados a cada 3-4 horas, cache de 30min equilibra atualidade e performance

---

## 3. INMET API - Alertas Meteorológicos

### Visão Geral
**INMET** (Instituto Nacional de Meteorologia) é a fonte oficial de alertas meteorológicos do Brasil. A API fornece alertas ativos para os próximos dias.

### Endpoint Base
```
https://apiprevmet3.inmet.gov.br/avisos/ativos
```

### Requisição

```bash
curl -H "Accept: application/json" \
"https://apiprevmet3.inmet.gov.br/avisos/ativos"
```

### Exemplo de Resposta

```json
{
  "hoje": [
    {
      "id": "BR123456",
      "id_severidade": 5,
      "severidade": "Perigo",
      "estados": "Ceará,Maranhão,Piauí",
      "descricao": "Chuva intensa (40-60mm/h)",
      "instrucao": "Evitar áreas de risco, desligue aparelhos elétricos",
      "data_inicio": "2025-10-05T00:00:00Z",
      "data_fim": "2025-10-05T23:59:59Z"
    },
    {
      "id": "BR123457",
      "id_severidade": 3,
      "severidade": "Perigo Potencial",
      "estados": "Rio Grande do Sul,Santa Catarina",
      "descricao": "Geada",
      "data_inicio": "2025-10-06T00:00:00Z"
    }
  ],
  "amanha": [...]
}
```

### Níveis de Severidade

| id_severidade | severidade | Impacto no Jogo |
|---------------|------------|-----------------|
| 5-6 | Perigo | -15 health, -8 sustainability |
| 3-4 | Perigo Potencial | -10 health, -5 sustainability |
| 1-2 | Atenção | -5 health, -3 sustainability |

### Mapeamento de Estados

```typescript
const STATE_NAMES_TO_IDS: Record<string, string> = {
  'Acre': 'AC',
  'Alagoas': 'AL',
  'Amazonas': 'AM',
  // ... mapeamento completo de 27 estados
};

// Parsing de string "Ceará,Maranhão,Piauí" para ['CE', 'MA', 'PI']
const stateNames = alert.estados.split(',').map(s => s.trim());
const affectedStateIds = stateNames
  .map(name => STATE_NAMES_TO_IDS[name])
  .filter(Boolean);
```

### Detecção de Tipo de Evento

```typescript
const alertDescription = alert.descricao.toLowerCase();

let eventType: ClimateEvent['type'];
if (alertDescription.includes('chuva') || alertDescription.includes('precipita')) {
  eventType = alertDescription.includes('intens') ? 'flood' : 'storm';
} else if (alertDescription.includes('seca')) {
  eventType = 'drought';
} else if (alertDescription.includes('calor')) {
  eventType = 'heat';
} else if (alertDescription.includes('frio') || alertDescription.includes('geada')) {
  eventType = 'cold';
} else if (alertDescription.includes('vento')) {
  eventType = 'storm';
}
```

### Cache
- **Duração**: 30 minutos
- **Justificativa**: Alertas oficiais são atualizados algumas vezes ao dia

---

## 4. Edge Functions

### 4.1. get-nasa-climate-data

**Arquivo**: `supabase/functions/get-nasa-climate-data/index.ts`

#### Responsabilidades
1. Receber coordenadas geográficas e intervalo de datas
2. Construir URL da NASA POWER API
3. Fazer requisição HTTP
4. Processar resposta JSON
5. Calcular médias e detectar anomalias
6. Implementar cache de 24h
7. Retornar dados formatados

#### Input
```typescript
{
  latitude: number,
  longitude: number,
  startDate?: string,     // YYYY-MM-DD (opcional)
  endDate?: string,       // YYYY-MM-DD (opcional)
  daysCount?: number      // alternativa a startDate/endDate
}
```

#### Output
```typescript
{
  temperature: number,           // °C (média do período)
  precipitation: number,         // mm (total acumulado)
  humidity: number,              // % (média)
  evapotranspiration: number,    // mm/dia (média)
  anomalies: {
    drought: boolean,
    flood: boolean,
    heatWave: boolean,
    coldSnap: boolean,
    fireRisk: boolean,
    stormRisk: boolean
  },
  isRealData: boolean
}
```

#### Tratamento de Datas Futuras
```typescript
// NASA tem ~2 dias de delay
const nasaMaxDate = new Date();
nasaMaxDate.setDate(nasaMaxDate.getDate() - 2);

if (endDate > nasaMaxDate) {
  // Shift 1 ano para trás (usar dados históricos)
  startDate.setFullYear(startDate.getFullYear() - 1);
  endDate.setFullYear(endDate.getFullYear() - 1);
}
```

### 4.2. get-brazil-climate-alerts

**Arquivo**: `supabase/functions/get-brazil-climate-alerts/index.ts`

#### Responsabilidades
1. Receber ID do estado brasileiro
2. Buscar focos de incêndio na NASA FIRMS
3. Filtrar focos por geofencing (limites do estado)
4. Buscar alertas meteorológicos no INMET
5. Filtrar alertas relevantes para o estado
6. Combinar alertas de ambas as fontes
7. Implementar cache de 30min
8. Retornar lista de eventos climáticos

#### Input
```typescript
{
  stateId: string  // ex: "SP", "AM", "RS"
}
```

#### Output
```typescript
{
  stateId: string,
  alerts: ClimateEvent[],
  lastUpdated: number,  // timestamp
  sources: string[]     // ["NASA_FIRMS", "INMET"]
}

interface ClimateEvent {
  type: 'drought' | 'flood' | 'heat' | 'cold' | 'pest' | 'fire' | 'storm',
  severity: 'low' | 'medium' | 'high',
  description: { pt: string, en: string },
  impact: {
    health: number,         // -25 a 0 (negativo)
    water: number,          // -30 a +100 (litros)
    sustainability: number  // -15 a 0 (negativo)
  },
  source?: string,          // "NASA_FIRMS", "INMET"
  detectedAt?: string       // ISO 8601 timestamp
}
```

---

## 5. Tratamento de Erros

### Erros da NASA POWER API

| Código | Significado | Ação |
|--------|-------------|------|
| 400 | Parâmetros inválidos | Validar lat/lon, datas |
| 404 | Sem dados para localização/período | Usar fallback (dados simulados) |
| 429 | Rate limit excedido | Aguardar 1min, usar cache |
| 500 | Erro interno da NASA | Tentar novamente após 5min |

### Erros da FIRMS API

| Código | Significado | Ação |
|--------|-------------|------|
| 403 | API key inválida | Verificar secret NASA_FIRMS_MAP_KEY |
| 429 | Rate limit excedido | Aguardar, usar cache |

### Erros da INMET API

| Código | Significado | Ação |
|--------|-------------|------|
| 500 | API indisponível | Prosseguir sem alertas INMET |
| Timeout | Servidor lento | Timeout de 10s, prosseguir |

### Implementação de Fallback

```typescript
try {
  const data = await fetchNASAData(lat, lon);
  return data;
} catch (error) {
  console.error('NASA API failed, using simulated data:', error);
  return {
    temperature: state.temp,     // dados simulados do estado
    precipitation: state.rain,
    humidity: 70,
    evapotranspiration: 4.0,
    isRealData: false
  };
}
```

---

## 6. Rate Limits e Boas Práticas

### NASA POWER API
- **Limite**: ~1000 requisições/hora por IP
- **Recomendação**: Usar cache de 24h, agrupar múltiplos dias em uma requisição

### NASA FIRMS API
- **Limite**: Não especificado oficialmente, mas recomenda-se não exceder 100 req/hora
- **Recomendação**: Usar cache de 30min, dados são atualizados a cada 3-4h

### INMET API
- **Limite**: Não especificado, API pode ser instável
- **Recomendação**: Cache de 30min, implementar timeout de 10s

### Estratégias de Otimização

1. **Cache Inteligente**
   ```typescript
   const cache = new Map<string, { data: any, timestamp: number }>();
   const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h
   
   const cached = cache.get(cacheKey);
   if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
     return cached.data;
   }
   ```

2. **Batch Requests**
   - Solicitar 30 dias de dados de uma vez ao invés de 1 dia por vez
   - Reduz de 30 chamadas para 1 chamada

3. **Retry com Exponential Backoff**
   ```typescript
   async function fetchWithRetry(url: string, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         const response = await fetch(url);
         if (response.ok) return response;
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
       }
     }
   }
   ```

4. **Timeouts**
   ```typescript
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 10000);
   
   try {
     const response = await fetch(url, { signal: controller.signal });
   } finally {
     clearTimeout(timeout);
   }
   ```

---

## Recursos Adicionais

### Documentação Oficial
- [NASA POWER API](https://power.larc.nasa.gov/docs/)
- [NASA FIRMS API](https://firms.modaps.eosdis.nasa.gov/api/)
- [INMET (não oficial)](https://apiprevmet3.inmet.gov.br/)

### Ferramentas de Teste
- [NASA POWER Data Viewer](https://power.larc.nasa.gov/data-access-viewer/)
- [NASA FIRMS Active Fire Map](https://firms.modaps.eosdis.nasa.gov/map/)

### Obtendo API Keys
- **NASA FIRMS**: https://firms.modaps.eosdis.nasa.gov/api/
- **NASA POWER**: Nenhuma API key necessária (uso educacional/pesquisa)

---

**Desenvolvido com assistência de Inteligência Artificial**  
**Última atualização: Outubro 2025**