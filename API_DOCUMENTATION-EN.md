# Technical API Documentation - Planting Future

> **Note**: This project uses real scientific data from NASA and INMET public APIs to simulate sustainable agricultural production. All integration code was developed with Artificial Intelligence assistance.

## Table of Contents
1. [NASA POWER API - Climate Data](#1-nasa-power-api---climate-data)
2. [NASA FIRMS API - Fire Hotspots](#2-nasa-firms-api---fire-hotspots)
3. [INMET API - Meteorological Alerts](#3-inmet-api---meteorological-alerts)
4. [Edge Functions](#4-edge-functions)
5. [Error Handling](#5-error-handling)
6. [Rate Limits and Best Practices](#6-rate-limits-and-best-practices)

---

## 1. NASA POWER API - Climate Data

### Overview
**NASA POWER** (Prediction Of Worldwide Energy Resources) provides historical and real-time climate data derived from satellites and global weather models. We use the **AG (Agricultural)** community for agricultural data.

### Base Endpoint
```
https://power.larc.nasa.gov/api/temporal/daily/point
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `parameters` | string | Yes | Comma-separated list: `T2M,PRECTOTCORR,RH2M,EVPTRNS` |
| `community` | string | Yes | `AG` (Agricultural) |
| `longitude` | float | Yes | Longitude (-180 to 180) |
| `latitude` | float | Yes | Latitude (-90 to 90) |
| `start` | string | Yes | Start date (format: YYYYMMDD) |
| `end` | string | Yes | End date (format: YYYYMMDD) |
| `format` | string | Yes | `JSON` |

### Climate Parameters Used

#### T2M - Air Temperature at 2 Meters
- **Unit**: °C (Celsius)
- **Description**: Average air temperature measured at 2 meters from surface
- **Game Usage**: Compatibility check with crop's ideal temperature range, heatwave and cold front detection

#### PRECTOTCORR - Corrected Total Precipitation
- **Unit**: mm/day
- **Description**: Corrected daily precipitation based on satellite data
- **Game Usage**: Water adequacy calculation, drought and flood detection

#### RH2M - Relative Humidity at 2 Meters
- **Unit**: % (percentage)
- **Description**: Relative air humidity at 2 meters from surface
- **Game Usage**: Humidity control task generation, disease risk condition detection

#### EVPTRNS - Evapotranspiration
- **Unit**: mm/day
- **Description**: Rate of water loss through soil evaporation and plant transpiration
- **Game Usage**: Realistic calculation of production water consumption

### Request Example

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

### Response Example

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

### Data Processing

```typescript
// Example code (developed with AI)
const temps = Object.values(data.parameters.T2M) as number[];
const precips = Object.values(data.parameters.PRECTOTCORR) as number[];
const humidities = Object.values(data.parameters.RH2M) as number[];
const evapotranspirations = Object.values(data.parameters.EVPTRNS) as number[];

// Filter invalid values (-999 = missing data)
const validTemps = temps.filter(t => t !== -999);
const validPrecips = precips.filter(p => p !== -999 && p >= 0);

// Calculate averages
const avgTemp = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
const totalPrecip = validPrecips.reduce((a, b) => a + b, 0);
```

### Climate Anomaly Detection

```typescript
interface ClimateAnomalies {
  drought: boolean;        // Drought: precipitation < 3mm/day
  flood: boolean;          // Flood: precipitation > 15mm/day
  heatWave: boolean;       // Heatwave: temperature > 33°C
  coldSnap: boolean;       // Cold snap: temperature < 18°C
  fireRisk: boolean;       // Fire risk: temp > 30°C, humidity < 40%, precip < 3mm
  stormRisk: boolean;      // Storm risk: precipitation > 20mm/day
}
```

### Cache
- **Duration**: 24 hours
- **Implementation**: In-memory Map in Edge Function
- **Rationale**: NASA historical data doesn't change, reduces latency and API calls

---

## 2. NASA FIRMS API - Fire Hotspots

### Overview
**FIRMS** (Fire Information for Resource Management System) provides fire hotspot data detected by MODIS and VIIRS satellites in near real-time (3-4 hour delay).

### Base Endpoint
```
https://firms.modaps.eosdis.nasa.gov/api/country/csv/{MAP_KEY}/{SOURCE}/{COUNTRY_CODE}/{DAY_RANGE}
```

### Request Parameters

| Parameter | Value Used | Description |
|-----------|------------|-------------|
| `MAP_KEY` | *Stored in Secrets* | API key obtained at https://firms.modaps.eosdis.nasa.gov/api/ |
| `SOURCE` | `VIIRS_SNPP_NRT` | VIIRS dataset (375m resolution, 3-4h update) |
| `COUNTRY_CODE` | `BRA` | Brazil |
| `DAY_RANGE` | `1` | Last 24 hours |

### Request Example

```bash
curl "https://firms.modaps.eosdis.nasa.gov/api/country/csv/\
{MAP_KEY}/VIIRS_SNPP_NRT/BRA/1"
```

### Response Example (CSV)

```csv
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
-3.5,-62.3,328.5,0.4,0.4,2025-10-05,0315,N,n,2.0NRT,294.2,12.5,D
-3.6,-62.4,335.2,0.4,0.4,2025-10-05,0315,N,h,2.0NRT,298.1,15.3,D
-8.8,-63.5,342.1,0.4,0.4,2025-10-05,0430,N,h,2.0NRT,301.5,18.9,D
```

### Important Fields

| Field | Description |
|-------|-------------|
| `latitude` | Fire hotspot latitude |
| `longitude` | Fire hotspot longitude |
| `brightness` | Brightness (temperature) in Kelvin |
| `acq_date` | Acquisition date (YYYY-MM-DD) |
| `acq_time` | Acquisition time (HHMM UTC) |
| `confidence` | Confidence: `l` (low), `n` (nominal), `h` (high) |
| `frp` | Fire Radiative Power (MW) - fire intensity |

### State Geofencing

```typescript
const STATE_BOUNDARIES: Record<string, { 
  minLat: number; maxLat: number; 
  minLon: number; maxLon: number 
}> = {
  AC: { minLat: -11.0, maxLat: -7.0, minLon: -74.0, maxLon: -66.5 },
  AM: { minLat: -9.8, maxLat: 2.3, minLon: -73.8, maxLon: -56.1 },
  // ... all 27 states
};

// Filtering
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

### Severity Classification

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
- **Duration**: 30 minutes
- **Rationale**: Data updated every 3-4 hours, 30min cache balances freshness and performance

---

## 3. INMET API - Meteorological Alerts

### Overview
**INMET** (National Institute of Meteorology) is Brazil's official source for meteorological alerts. The API provides active alerts for upcoming days.

### Base Endpoint
```
https://apiprevmet3.inmet.gov.br/avisos/ativos
```

### Request

```bash
curl -H "Accept: application/json" \
"https://apiprevmet3.inmet.gov.br/avisos/ativos"
```

### Response Example

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

### Severity Levels

| id_severidade | severidade | Game Impact |
|---------------|------------|-------------|
| 5-6 | Danger | -15 health, -8 sustainability |
| 3-4 | Potential Danger | -10 health, -5 sustainability |
| 1-2 | Attention | -5 health, -3 sustainability |

### State Mapping

```typescript
const STATE_NAMES_TO_IDS: Record<string, string> = {
  'Acre': 'AC',
  'Alagoas': 'AL',
  'Amazonas': 'AM',
  // ... complete mapping of 27 states
};

// Parsing string "Ceará,Maranhão,Piauí" to ['CE', 'MA', 'PI']
const stateNames = alert.estados.split(',').map(s => s.trim());
const affectedStateIds = stateNames
  .map(name => STATE_NAMES_TO_IDS[name])
  .filter(Boolean);
```

### Event Type Detection

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
- **Duration**: 30 minutes
- **Rationale**: Official alerts are updated a few times per day

---

## 4. Edge Functions

### 4.1. get-nasa-climate-data

**File**: `supabase/functions/get-nasa-climate-data/index.ts`

#### Responsibilities
1. Receive geographic coordinates and date range
2. Build NASA POWER API URL
3. Make HTTP request
4. Process JSON response
5. Calculate averages and detect anomalies
6. Implement 24h cache
7. Return formatted data

#### Input
```typescript
{
  latitude: number,
  longitude: number,
  startDate?: string,     // YYYY-MM-DD (optional)
  endDate?: string,       // YYYY-MM-DD (optional)
  daysCount?: number      // alternative to startDate/endDate
}
```

#### Output
```typescript
{
  temperature: number,           // °C (period average)
  precipitation: number,         // mm (accumulated total)
  humidity: number,              // % (average)
  evapotranspiration: number,    // mm/day (average)
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

#### Future Date Handling
```typescript
// NASA has ~2 days delay
const nasaMaxDate = new Date();
nasaMaxDate.setDate(nasaMaxDate.getDate() - 2);

if (endDate > nasaMaxDate) {
  // Shift 1 year back (use historical data)
  startDate.setFullYear(startDate.getFullYear() - 1);
  endDate.setFullYear(endDate.getFullYear() - 1);
}
```

### 4.2. get-brazil-climate-alerts

**File**: `supabase/functions/get-brazil-climate-alerts/index.ts`

#### Responsibilities
1. Receive Brazilian state ID
2. Fetch fire hotspots from NASA FIRMS
3. Filter hotspots by geofencing (state boundaries)
4. Fetch meteorological alerts from INMET
5. Filter relevant alerts for the state
6. Combine alerts from both sources
7. Implement 30min cache
8. Return list of climate events

#### Input
```typescript
{
  stateId: string  // e.g., "SP", "AM", "RS"
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
    health: number,         // -25 to 0 (negative)
    water: number,          // -30 to +100 (liters)
    sustainability: number  // -15 to 0 (negative)
  },
  source?: string,          // "NASA_FIRMS", "INMET"
  detectedAt?: string       // ISO 8601 timestamp
}
```

---

## 5. Error Handling

### NASA POWER API Errors

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Invalid parameters | Validate lat/lon, dates |
| 404 | No data for location/period | Use fallback (simulated data) |
| 429 | Rate limit exceeded | Wait 1min, use cache |
| 500 | NASA internal error | Retry after 5min |

### FIRMS API Errors

| Code | Meaning | Action |
|------|---------|--------|
| 403 | Invalid API key | Check NASA_FIRMS_MAP_KEY secret |
| 429 | Rate limit exceeded | Wait, use cache |

### INMET API Errors

| Code | Meaning | Action |
|------|---------|--------|
| 500 | API unavailable | Proceed without INMET alerts |
| Timeout | Slow server | 10s timeout, proceed |

### Fallback Implementation

```typescript
try {
  const data = await fetchNASAData(lat, lon);
  return data;
} catch (error) {
  console.error('NASA API failed, using simulated data:', error);
  return {
    temperature: state.temp,     // simulated state data
    precipitation: state.rain,
    humidity: 70,
    evapotranspiration: 4.0,
    isRealData: false
  };
}
```

---

## 6. Rate Limits and Best Practices

### NASA POWER API
- **Limit**: ~1000 requests/hour per IP
- **Recommendation**: Use 24h cache, group multiple days in one request

### NASA FIRMS API
- **Limit**: Not officially specified, but recommended not to exceed 100 req/hour
- **Recommendation**: Use 30min cache, data is updated every 3-4h

### INMET API
- **Limit**: Not specified, API can be unstable
- **Recommendation**: 30min cache, implement 10s timeout

### Optimization Strategies

1. **Smart Caching**
   ```typescript
   const cache = new Map<string, { data: any, timestamp: number }>();
   const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h
   
   const cached = cache.get(cacheKey);
   if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
     return cached.data;
   }
   ```

2. **Batch Requests**
   - Request 30 days of data at once instead of 1 day at a time
   - Reduces from 30 calls to 1 call

3. **Retry with Exponential Backoff**
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

## Additional Resources

### Official Documentation
- [NASA POWER API](https://power.larc.nasa.gov/docs/)
- [NASA FIRMS API](https://firms.modaps.eosdis.nasa.gov/api/)
- [INMET (unofficial)](https://apiprevmet3.inmet.gov.br/)

### Testing Tools
- [NASA POWER Data Viewer](https://power.larc.nasa.gov/data-access-viewer/)
- [NASA FIRMS Active Fire Map](https://firms.modaps.eosdis.nasa.gov/map/)

### Obtaining API Keys
- **NASA FIRMS**: https://firms.modaps.eosdis.nasa.gov/api/
- **NASA POWER**: No API key required (educational/research use)

---

**Developed with Artificial Intelligence assistance**  
**Last updated: October 2025**
