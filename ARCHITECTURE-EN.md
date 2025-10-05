# System Architecture - Planting Future

## Overview

**Planting Future** is an educational serious game that simulates sustainable agricultural production in Brazil using real-time NASA climate data. The system was developed 100% with Artificial Intelligence assistance, combining modern web development technologies with scientific APIs to create an immersive learning experience.

## Development with AI

> **Important**: All code in this project was developed with Artificial Intelligence assistance. The architecture, business logic, API integration, and user interface were implemented through collaborative iterations between humans and AI, ensuring quality, security, and adherence to development best practices.

## Technology Stack

### Frontend
- **React 18** - UI library with Hooks and Context
- **TypeScript** - Static typing for greater reliability
- **Vite** - High-performance build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible and customizable UI components
- **Zustand** - Lightweight and performant state management
- **React Router DOM** - Client-side navigation
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **Sonner** - Elegant toast notifications

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service (BaaS)
  - PostgreSQL (relational database)
  - Row Level Security (RLS) for data security
  - Authentication (email/password, OAuth)
  - Edge Functions (Deno runtime)
- **Deno** - JavaScript/TypeScript runtime for Edge Functions

### PWA (Progressive Web App)
- **Workbox** - Service Worker for offline cache
- **Web App Manifest** - Installation as native app
- **Adaptive icons** - Support for Android/iOS

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  UI Components (shadcn/ui + Custom)                             │
│  ├─ Pages (Home, Game Map, Production Dashboard, Harvest)       │
│  ├─ Game Components (Crop Selector, Climate Alerts, etc)        │
│  └─ Layout Components (GameLayout, PixelButton)                 │
├─────────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                      │
│  ├─ useGameState (sector, crop, indicators, planted states)     │
│  ├─ useGameProfiles (multi-profile system)                      │
│  └─ useLanguage (PT-BR / EN-US)                                 │
├─────────────────────────────────────────────────────────────────┤
│  Production Engine (Core Game Logic)                             │
│  ├─ ProductionEngine class (time advancement, task system)      │
│  ├─ Climate data integration (NASA POWER API)                   │
│  ├─ Real-time alerts (NASA FIRMS + INMET)                       │
│  └─ Metrics calculation (health, water, sustainability)         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                             │
│  ├─ profiles (user data)                                         │
│  └─ game_profiles (game progress, production state)             │
├─────────────────────────────────────────────────────────────────┤
│  Authentication                                                  │
│  └─ Email/Password authentication with RLS policies             │
├─────────────────────────────────────────────────────────────────┤
│  Edge Functions (Deno)                                           │
│  ├─ get-nasa-climate-data (NASA POWER API proxy + cache)        │
│  └─ get-brazil-climate-alerts (NASA FIRMS + INMET proxy)        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL APIs                                │
├─────────────────────────────────────────────────────────────────┤
│  NASA POWER API                                                  │
│  └─ https://power.larc.nasa.gov/api/temporal/daily/point        │
│     Parameters: T2M, PRECTOTCORR, RH2M, EVPTRNS                 │
├─────────────────────────────────────────────────────────────────┤
│  NASA FIRMS (Fire Information)                                   │
│  └─ https://firms.modaps.eosdis.nasa.gov/api/country/csv        │
│     Dataset: VIIRS_SNPP_NRT (Near Real-Time)                    │
├─────────────────────────────────────────────────────────────────┤
│  INMET (Meteorological Alerts)                                   │
│  └─ https://apiprevmet3.inmet.gov.br/avisos/ativos              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication and Profile
```
User → Login/Registration → Supabase Auth → Profile Creation → Profile Selection
```

### 2. Crop and State Selection
```
User → Chooses Sector → Chooses Crop → Selects State on Map → 
Calculates Viability (simulated climate data + NASA POWER) → 
Pre-Planting Educational Screen
```

### 3. Production Cycle (Core Loop)
```
Production Start → ProductionEngine.startProduction()
↓
Time Loop:
├─ User advances time (1 day / 1 week / 1 month)
├─ ProductionEngine.advanceTime()
│  ├─ Fetch NASA POWER climate data (temp, precip, humidity, ET)
│  ├─ Fetch NASA FIRMS fire alerts (geofenced by state)
│  ├─ Fetch INMET meteorological alerts
│  ├─ Detect climate anomalies (drought, flood, heat, cold, fire, storm)
│  ├─ Apply impacts to health, water usage, sustainability
│  └─ Generate climate-based tasks
├─ User completes weekly tasks (irrigation, temperature, etc)
└─ Updates metrics and growth stage progress
↓
Harvest → Final Score Calculation → Results Screen
```

### 4. Data Persistence
```
localStorage (local cache, fallback)
    ↕
ProductionEngine State
    ↕
Supabase (game_profiles.production_state JSONB)
```

## APIs and Endpoints Used

### 1. NASA POWER API (Climate Data)
**Endpoint**: `https://power.larc.nasa.gov/api/temporal/daily/point`

**Parameters**:
- `parameters`: `T2M,PRECTOTCORR,RH2M,EVPTRNS`
  - **T2M**: Air temperature at 2m (°C)
  - **PRECTOTCORR**: Corrected total precipitation (mm/day)
  - **RH2M**: Relative humidity at 2m (%)
  - **EVPTRNS**: Evapotranspiration (mm/day)
- `community`: `AG` (Agricultural)
- `longitude`: -74.0 to -34.8 (Brazil)
- `latitude`: -33.8 to 5.3 (Brazil)
- `start`: Start date (YYYYMMDD format)
- `end`: End date (YYYYMMDD format)
- `format`: `JSON`

**Cache**: 24 hours (implemented in `get-nasa-climate-data` Edge Function)

**Game Usage**:
- Crop viability calculation
- Realistic production simulation
- Climate anomaly detection (drought, flood, heatwave)
- Dynamic water consumption calculation (based on ET)

### 2. NASA FIRMS API (Fire Hotspots)
**Endpoint**: `https://firms.modaps.eosdis.nasa.gov/api/country/csv/{MAP_KEY}/VIIRS_SNPP_NRT/BRA/1`

**Parameters**:
- `MAP_KEY`: API key stored in Supabase Secrets
- Dataset: `VIIRS_SNPP_NRT` (Near Real-Time, updated every 3-4 hours)
- Country: `BRA` (Brazil)
- Days: `1` (last 24 hours)

**Response Format**: CSV
```
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,...
```

**Geofencing**: Edge Function filters hotspots by geographic boundaries of each Brazilian state

**Cache**: 30 minutes

**Game Usage**:
- Real-time fire risk alerts
- Negative impact on production health (-5 to -25%)
- Increased water consumption for fire fighting (+20 to +100L)
- Sustainability reduction (-3 to -15%)

### 3. INMET API (Meteorological Alerts)
**Endpoint**: `https://apiprevmet3.inmet.gov.br/avisos/ativos`

**Headers**: `Accept: application/json`

**Response Format**: JSON
```json
{
  "hoje": [
    {
      "id_severidade": 5,
      "severidade": "Perigo",
      "estados": "Ceará,Maranhão,Piauí",
      "descricao": "Chuva intensa",
      "data_inicio": "2025-10-05T00:00:00Z"
    }
  ],
  "amanha": [...]
}
```

**Filtering**: Edge Function maps state names to IDs and filters relevant alerts

**Cache**: 30 minutes

**Game Usage**:
- Official meteorological alerts for Brazil (heavy rain, drought, storm, frost, etc)
- Variable impacts according to severity (Danger, Potential Danger, Attention)
- Integration with task system (generates urgent tasks)

## Game Mechanics

### Crop System
- **13 crops** divided into **5 sectors**:
  - **Agriculture**: Soybean, Corn, Coffee, Sugarcane
  - **Livestock**: Cattle, Poultry, Swine
  - **Aquaculture**: Tilapia, Shrimp, Tambaqui
  - **Forestry**: Eucalyptus, Pine
  - **Horticulture**: Vegetables, Fruits

### State System
- **27 Brazilian states** with realistic climate data
- Each state has: average temperature, annual precipitation, soil type, geographic coordinates

### Viability Calculation
**Formula**:
```typescript
successRate = (tempScore * 0.4) + (rainScore * 0.4) + ((100 - soilPenalty) * 0.2)
```
- **Temperature**: 40% weight (compatibility with crop's ideal range)
- **Precipitation**: 40% weight (adequacy to water needs)
- **Soil**: 20% weight (compatibility between state soil and crop's ideal)

### Production Cycle (120 days standard for Soybean)
**Growth Stages**:
1. **Planting** (7 days)
2. **Germination** (14 days)
3. **Vegetative Growth** (50 days)
4. **Flowering** (28 days)
5. **Maturation** (21 days)

Each stage has:
- Water requirement (low/medium/high)
- Temperature sensitivity (low/medium/high)
- Specific automatically generated tasks

### Task System
**Regular Weekly Tasks**:
- 🌊 Irrigation (penalty: -5 health, reward: +3)
- 🌡️ Temperature Control (penalty: -4, reward: +2)
- 💧 Humidity Check (penalty: -3, reward: +2)
- 🥕 Nutrient Application (penalty: -4, reward: +3)

**Climate-Based Tasks** (dynamically generated):
- ⚠️ Urgent Irrigation (precipitation < 2mm/day)
- 🌡️ Heat Control (temperature > maximum ideal)
- ❄️ Cold Protection (temperature < minimum ideal)
- 💧 Increase Humidity (relative humidity < 40%)

### Production Metrics
1. **Production Health** (0-100%)
   - Affected by: incomplete tasks, climate anomalies, alerts
   - Recovered by: task completion, ideal conditions

2. **Sustainability** (0-100%)
   - Reduced by: extreme weather events, excessive resource use
   - Increased by: task completion, sustainable practices

3. **Water Consumption** (accumulated liters)
   - Calculated using actual evapotranspiration (NASA POWER)
   - Adjusted by crop coefficient and growth stage
   - Impacted by drought and fire alerts

### Scoring System
**Final Score**:
```typescript
finalScore = (health * 0.4) + (sustainability * 0.3) + ((100 - waterUsage/50) * 0.3)
```

**Medals**:
- 🥇 **Gold**: Score ≥ 80
- 🥈 **Silver**: Score ≥ 60
- 🥉 **Bronze**: Score < 60

## Cache and Performance Strategies

### 1. Climate Data Cache (NASA POWER)
- **Duration**: 24 hours
- **Implementation**: Map<string, {data, timestamp}> in memory (Edge Function)
- **Key**: `${latitude},${longitude},${startDate},${endDate}`
- **Benefit**: Reduces NASA API calls, improves response time

### 2. Alert Cache (FIRMS + INMET)
- **Duration**: 30 minutes
- **Implementation**: Map<string, {data, timestamp}> in memory
- **Key**: `stateId`
- **Benefit**: Real-time alerts without API overload

### 3. Hybrid Persistence
```
UI State (React)
    ↕
localStorage (immediate save, 100% available)
    ↕ (debounced, 500ms)
Supabase (cloud backup, multi-device sync)
```

**Restoration Priority**:
1. Supabase (if connected and active profile)
2. localStorage (offline fallback)
3. New game (if no state found)

## Security

### 1. Row Level Security (RLS) Policies
```sql
-- Game profiles: users only access their own data
CREATE POLICY "Users can view own profiles" 
ON game_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" 
ON game_profiles FOR UPDATE 
USING (auth.uid() = user_id);
```

### 2. API Keys in Secrets
- `NASA_FIRMS_MAP_KEY`: stored in Supabase Secrets
- Never exposed in frontend code
- Accessible only by Edge Functions

### 3. CORS Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## Progressive Web App (PWA)

### Features
- ✅ Installable on mobile and desktop devices
- ✅ Adaptive icons (Android) and maskable (iOS)
- ✅ Custom splash screen
- ✅ Offline functionality (Service Worker disabled during development)
- ✅ Standalone mode (no browser bar)

### Manifest
```json
{
  "name": "Planting Future",
  "short_name": "Planting",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#22C55E",
  "background_color": "#FEFCF3"
}
```

## Internationalization (i18n)

### Supported Languages
- 🇧🇷 **Brazilian Portuguese** (pt) - default language
- 🇺🇸 **English** (en) - complete translation

### Implementation
```typescript
// Custom hook with Zustand
const { t, lang, toggleLanguage } = useLanguage();

// Usage
<h1>{t('game_title')}</h1>
```

### Scope
- All user interfaces
- Error and success messages
- Crop and task descriptions
- Climate alerts

## Folder Structure

```
src/
├── components/
│   ├── game/               # Game-specific components
│   │   ├── BrazilMap.tsx
│   │   ├── ClimateAlerts.tsx
│   │   ├── CropSelector.tsx
│   │   ├── ProductionChecklist.tsx
│   │   ├── SectorSelector.tsx
│   │   └── TimeControls.tsx
│   ├── layout/             # Layout components
│   │   ├── GameLayout.tsx
│   │   └── PixelButton.tsx
│   └── ui/                 # UI components (shadcn)
├── data/
│   ├── crops.ts            # 13 crops with complete metadata
│   ├── gameLogic.ts        # Viability calculation
│   └── states.ts           # 27 Brazilian states
├── hooks/
│   ├── useGameState.ts     # Global game state
│   ├── useGameProfiles.ts  # Multi-profile system
│   ├── useClimateData.ts   # NASA POWER integration
│   ├── useRealTimeClimateAlerts.ts  # FIRMS + INMET
│   └── useLanguage.ts      # i18n
├── lib/
│   ├── productionEngine.ts # Main game engine
│   └── utils.ts
├── pages/
│   ├── HomeV2.tsx
│   ├── Login.tsx
│   ├── Registration.tsx
│   ├── ProfileManager.tsx
│   ├── GameMap.tsx
│   ├── PrePlantingEducation.tsx
│   ├── ProductionDashboard.tsx
│   ├── HarvestResults.tsx
│   └── Results.tsx
├── i18n/
│   └── translations.ts     # PT-BR / EN-US dictionaries
└── integrations/
    └── supabase/
        ├── client.ts
        └── types.ts

supabase/
└── functions/
    ├── get-nasa-climate-data/
    │   └── index.ts
    └── get-brazil-climate-alerts/
        └── index.ts
```

## Deployment and Requirements

### Deployment
- **Platform**: Lovable Cloud (frontend + Supabase backend)
- **Build**: Vite (optimized for production)
- **Edge Functions**: Auto-deploy via Supabase CLI

### End-User Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Connection**: Recommended 3G or higher (for external APIs)
- **Storage**: ~5MB for offline cache (PWA)

### Development Requirements
- **Node.js**: 18+ (with npm or bun)
- **Supabase Project**: Configured with RLS policies
- **NASA FIRMS API Key**: Obtain at https://firms.modaps.eosdis.nasa.gov/api/
- **Editor**: VSCode recommended (with TypeScript, Tailwind CSS extensions)

## Monitoring and Logs

### Edge Functions Logs
- Available in Supabase Dashboard
- **URL**: `https://supabase.com/dashboard/project/{project_id}/functions/{function_name}/logs`

### Main Logs
```typescript
// NASA POWER
console.log('Fetching NASA climate data for:', { latitude, longitude });
console.log('NASA API response received');
console.log('Calculated averages:', { avgTemp, totalPrecip, avgHumidity, avgET });

// FIRMS
console.log(`Found ${fireCount} fire hotspots in ${stateId}`);

// INMET
console.log(`Processing ${todayAlerts.length} alerts from INMET`);
```

## Roadmap and Extensibility

### Possible Future Features
- [ ] Multiplayer mode (cooperative or competitive)
- [ ] More crops and sectors (intensive horticulture, fishing, etc)
- [ ] Economy system (purchase inputs, sell production)
- [ ] Achievements and global ranking
- [ ] Integration with more APIs (7-day weather forecast, agricultural market)
- [ ] Educator mode (dashboards for teachers)
- [ ] PDF report export

### Modular Architecture
The system was designed for easy extension:
- **New crops**: add in `src/data/crops.ts`
- **New states/countries**: add in `src/data/states.ts`
- **New climate APIs**: create new Edge Function
- **New languages**: add in `src/i18n/translations.ts`

---

## References and Documentation

### APIs Used
- [NASA POWER API Docs](https://power.larc.nasa.gov/docs/)
- [NASA FIRMS API Docs](https://firms.modaps.eosdis.nasa.gov/api/)
- [INMET API (unofficial)](https://apiprevmet3.inmet.gov.br/)

### Technologies
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Developed with Artificial Intelligence assistance**  
**All climate data is provided by verified scientific sources (NASA, INMET)**
