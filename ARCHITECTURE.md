# Arquitetura do Sistema - Plantando Futuro

## Visão Geral

**Plantando Futuro** é um serious game educacional que simula a produção agrícola sustentável no Brasil utilizando dados climáticos reais da NASA. O sistema foi desenvolvido 100% com assistência de Inteligência Artificial, combinando tecnologias modernas de desenvolvimento web com APIs científicas para criar uma experiência de aprendizagem imersiva.

## Desenvolvimento com IA

> **Importante**: Todo o código deste projeto foi desenvolvido com assistência de Inteligência Artificial. A arquitetura, lógica de negócio, integração de APIs e interface do usuário foram implementadas através de iterações colaborativas entre humanos e IA, garantindo qualidade, segurança e aderência às melhores práticas de desenvolvimento.

## Stack Tecnológica

### Frontend
- **React 18** - Biblioteca UI com Hooks e Context
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Vite** - Build tool de alta performance
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Zustand** - Gerenciamento de estado leve e performático
- **React Router DOM** - Navegação client-side
- **React Hook Form** - Gerenciamento de formulários
- **Recharts** - Visualização de dados
- **Sonner** - Notificações toast elegantes

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service (BaaS)
  - PostgreSQL (banco de dados relacional)
  - Row Level Security (RLS) para segurança de dados
  - Authentication (email/password, OAuth)
  - Edge Functions (Deno runtime)
- **Deno** - Runtime JavaScript/TypeScript para Edge Functions

### PWA (Progressive Web App)
- **Workbox** - Service Worker para cache offline
- **Web App Manifest** - Instalação como app nativo
- **Ícones adaptativos** - Suporte para Android/iOS

## Arquitetura do Sistema

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

## Fluxo de Dados

### 1. Autenticação e Perfil
```
Usuário → Login/Registro → Supabase Auth → Profile Creation → Seleção de Perfil
```

### 2. Seleção de Cultura e Estado
```
Usuário → Escolhe Setor → Escolhe Cultura → Seleciona Estado no Mapa → 
Calcula Viabilidade (dados climáticos simulados + NASA POWER) → 
Tela Educativa Pré-Plantio
```

### 3. Ciclo de Produção (Core Loop)
```
Início da Produção → ProductionEngine.startProduction()
↓
Loop de Tempo:
├─ Usuário avança tempo (1 dia / 1 semana / 1 mês)
├─ ProductionEngine.advanceTime()
│  ├─ Fetch NASA POWER climate data (temp, precip, humidity, ET)
│  ├─ Fetch NASA FIRMS fire alerts (geofenced by state)
│  ├─ Fetch INMET meteorological alerts
│  ├─ Detect climate anomalies (drought, flood, heat, cold, fire, storm)
│  ├─ Apply impacts to health, water usage, sustainability
│  └─ Generate climate-based tasks
├─ Usuário completa tarefas semanais (irrigação, temperatura, etc)
└─ Atualiza métricas e progresso de estágios de crescimento
↓
Colheita → Cálculo de Score Final → Tela de Resultados
```

### 4. Persistência de Dados
```
localStorage (cache local, fallback)
    ↕
ProductionEngine State
    ↕
Supabase (game_profiles.production_state JSONB)
```

## APIs e Endpoints Utilizados

### 1. NASA POWER API (Climate Data)
**Endpoint**: `https://power.larc.nasa.gov/api/temporal/daily/point`

**Parâmetros**:
- `parameters`: `T2M,PRECTOTCORR,RH2M,EVPTRNS`
  - **T2M**: Temperatura do ar a 2m (°C)
  - **PRECTOTCORR**: Precipitação total corrigida (mm/dia)
  - **RH2M**: Umidade relativa a 2m (%)
  - **EVPTRNS**: Evapotranspiração (mm/dia)
- `community`: `AG` (Agricultural)
- `longitude`: -74.0 a -34.8 (Brasil)
- `latitude`: -33.8 a 5.3 (Brasil)
- `start`: Data início (formato YYYYMMDD)
- `end`: Data fim (formato YYYYMMDD)
- `format`: `JSON`

**Cache**: 24 horas (implementado em `get-nasa-climate-data` Edge Function)

**Uso no Jogo**:
- Cálculo de viabilidade de cultivo
- Simulação realista de produção
- Detecção de anomalias climáticas (seca, enchente, onda de calor)
- Cálculo dinâmico de consumo de água (baseado em ET)

### 2. NASA FIRMS API (Fire Hotspots)
**Endpoint**: `https://firms.modaps.eosdis.nasa.gov/api/country/csv/{MAP_KEY}/VIIRS_SNPP_NRT/BRA/1`

**Parâmetros**:
- `MAP_KEY`: API key armazenada em Supabase Secrets
- Dataset: `VIIRS_SNPP_NRT` (Near Real-Time, atualizado a cada 3-4 horas)
- Country: `BRA` (Brasil)
- Days: `1` (últimas 24 horas)

**Formato de Resposta**: CSV
```
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,...
```

**Geofencing**: Edge Function filtra focos por limites geográficos de cada estado brasileiro

**Cache**: 30 minutos

**Uso no Jogo**:
- Alertas de risco de incêndio em tempo real
- Impacto negativo na saúde da produção (-5 a -25%)
- Aumento de consumo de água para combate (+20 a +100L)
- Redução de sustentabilidade (-3 a -15%)

### 3. INMET API (Meteorological Alerts)
**Endpoint**: `https://apiprevmet3.inmet.gov.br/avisos/ativos`

**Headers**: `Accept: application/json`

**Formato de Resposta**: JSON
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

**Filtragem**: Edge Function mapeia nomes de estados para IDs e filtra alertas relevantes

**Cache**: 30 minutos

**Uso no Jogo**:
- Alertas meteorológicos oficiais do Brasil (chuva intensa, seca, tempestade, geada, etc)
- Impactos variáveis conforme severidade (Perigo, Perigo Potencial, Atenção)
- Integração com sistema de tarefas (gera tarefas urgentes)

## Mecânicas do Jogo

### Sistema de Culturas
- **13 culturas** divididas em **5 setores**:
  - **Agricultura**: Soja, Milho, Café, Cana-de-açúcar
  - **Pecuária**: Bovino, Ave, Suíno
  - **Aquicultura**: Tilápia, Camarão, Tambaqui
  - **Silvicultura**: Eucalipto, Pinus
  - **Horticultura**: Hortaliças, Frutas

### Sistema de Estados
- **27 estados brasileiros** com dados climáticos realistas
- Cada estado tem: temperatura média, precipitação anual, tipo de solo, coordenadas geográficas

### Cálculo de Viabilidade
**Fórmula**:
```typescript
successRate = (tempScore * 0.4) + (rainScore * 0.4) + ((100 - soilPenalty) * 0.2)
```
- **Temperatura**: 40% do peso (compatibilidade com faixa ideal da cultura)
- **Precipitação**: 40% do peso (adequação à necessidade hídrica)
- **Solo**: 20% do peso (compatibilidade entre solo do estado e ideal da cultura)

### Ciclo de Produção (120 dias padrão para Soja)
**Estágios de Crescimento**:
1. **Plantio** (7 dias)
2. **Germinação** (14 dias)
3. **Crescimento Vegetativo** (50 dias)
4. **Floração** (28 dias)
5. **Maturação** (21 dias)

Cada estágio tem:
- Necessidade de água (baixa/média/alta)
- Sensibilidade à temperatura (baixa/média/alta)
- Tarefas específicas geradas automaticamente

### Sistema de Tarefas
**Tarefas Semanais Regulares**:
- 🌊 Irrigação (penalidade: -5 saúde, recompensa: +3)
- 🌡️ Controle de Temperatura (penalidade: -4, recompensa: +2)
- 💧 Verificação de Umidade (penalidade: -3, recompensa: +2)
- 🥕 Aplicação de Nutrientes (penalidade: -4, recompensa: +3)

**Tarefas Baseadas em Clima** (geradas dinamicamente):
- ⚠️ Irrigação Urgente (precipitação < 2mm/dia)
- 🌡️ Controle de Calor (temperatura > máxima ideal)
- ❄️ Proteção contra Frio (temperatura < mínima ideal)
- 💧 Aumentar Umidade (umidade relativa < 40%)

### Métricas de Produção
1. **Saúde da Produção** (0-100%)
   - Afetada por: tarefas incompletas, anomalias climáticas, alertas
   - Recuperada por: conclusão de tarefas, condições ideais

2. **Sustentabilidade** (0-100%)
   - Reduzida por: eventos climáticos extremos, uso excessivo de recursos
   - Aumentada por: conclusão de tarefas, práticas sustentáveis

3. **Consumo de Água** (litros acumulados)
   - Calculado usando evapotranspiração real (NASA POWER)
   - Ajustado por coeficiente da cultura e estágio de crescimento
   - Impactado por alertas de seca e incêndio

### Sistema de Pontuação
**Score Final**:
```typescript
finalScore = (health * 0.4) + (sustainability * 0.3) + ((100 - waterUsage/50) * 0.3)
```

**Medalhas**:
- 🥇 **Ouro**: Score ≥ 80
- 🥈 **Prata**: Score ≥ 60
- 🥉 **Bronze**: Score < 60

## Estratégias de Cache e Performance

### 1. Cache de Dados Climáticos (NASA POWER)
- **Duração**: 24 horas
- **Implementação**: Map<string, {data, timestamp}> em memória (Edge Function)
- **Chave**: `${latitude},${longitude},${startDate},${endDate}`
- **Benefício**: Reduz chamadas à API da NASA, melhora tempo de resposta

### 2. Cache de Alertas (FIRMS + INMET)
- **Duração**: 30 minutos
- **Implementação**: Map<string, {data, timestamp}> em memória
- **Chave**: `stateId`
- **Benefício**: Alertas em tempo real sem sobrecarga de API

### 3. Persistência Híbrida
```
UI State (React)
    ↕
localStorage (immediate save, 100% disponível)
    ↕ (debounced, 500ms)
Supabase (cloud backup, multi-device sync)
```

**Prioridade de Restauração**:
1. Supabase (se conectado e perfil ativo)
2. localStorage (fallback offline)
3. Novo jogo (se nenhum estado encontrado)

## Segurança

### 1. Row Level Security (RLS) Policies
```sql
-- Perfis de jogo: usuários só acessam seus próprios dados
CREATE POLICY "Users can view own profiles" 
ON game_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" 
ON game_profiles FOR UPDATE 
USING (auth.uid() = user_id);
```

### 2. API Keys em Secrets
- `NASA_FIRMS_MAP_KEY`: armazenada em Supabase Secrets
- Nunca exposta no código frontend
- Acessível apenas pelas Edge Functions

### 3. CORS Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## Progressive Web App (PWA)

### Características
- ✅ Instalável em dispositivos móveis e desktop
- ✅ Ícones adaptativos (Android) e maskable (iOS)
- ✅ Splash screen customizada
- ✅ Funcionalidade offline (Service Worker desabilitado durante desenvolvimento)
- ✅ Modo standalone (sem barra de navegador)

### Manifesto
```json
{
  "name": "Plantando Futuro",
  "short_name": "Plantando",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#22C55E",
  "background_color": "#FEFCF3"
}
```

## Internacionalização (i18n)

### Idiomas Suportados
- 🇧🇷 **Português Brasileiro** (pt) - idioma padrão
- 🇺🇸 **Inglês** (en) - tradução completa

### Implementação
```typescript
// Hook customizado com Zustand
const { t, lang, toggleLanguage } = useLanguage();

// Uso
<h1>{t('game_title')}</h1>
```

### Escopo
- Todas as interfaces do usuário
- Mensagens de erro e sucesso
- Descrições de culturas e tarefas
- Alertas climáticos

## Estrutura de Pastas

```
src/
├── components/
│   ├── game/               # Componentes específicos do jogo
│   │   ├── BrazilMap.tsx
│   │   ├── ClimateAlerts.tsx
│   │   ├── CropSelector.tsx
│   │   ├── ProductionChecklist.tsx
│   │   ├── SectorSelector.tsx
│   │   └── TimeControls.tsx
│   ├── layout/             # Componentes de layout
│   │   ├── GameLayout.tsx
│   │   └── PixelButton.tsx
│   └── ui/                 # Componentes UI (shadcn)
├── data/
│   ├── crops.ts            # 13 culturas com metadados completos
│   ├── gameLogic.ts        # Cálculo de viabilidade
│   └── states.ts           # 27 estados brasileiros
├── hooks/
│   ├── useGameState.ts     # Estado global do jogo
│   ├── useGameProfiles.ts  # Sistema multi-perfil
│   ├── useClimateData.ts   # Integração NASA POWER
│   ├── useRealTimeClimateAlerts.ts  # FIRMS + INMET
│   └── useLanguage.ts      # i18n
├── lib/
│   ├── productionEngine.ts # Motor principal do jogo
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
│   └── translations.ts     # Dicionários PT-BR / EN-US
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

## Deploy e Requisitos

### Deploy
- **Plataforma**: Lovable Cloud (frontend + Supabase backend)
- **Build**: Vite (otimizado para produção)
- **Edge Functions**: Auto-deploy via Supabase CLI

### Requisitos do Usuário Final
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Conexão**: Recomendado 3G ou superior (para APIs externas)
- **Armazenamento**: ~5MB para cache offline (PWA)

### Requisitos de Desenvolvimento
- **Node.js**: 18+ (com npm ou bun)
- **Supabase Project**: Configurado com RLS policies
- **NASA FIRMS API Key**: Obter em https://firms.modaps.eosdis.nasa.gov/api/
- **Editor**: VSCode recomendado (com extensões TypeScript, Tailwind CSS)

## Monitoramento e Logs

### Edge Functions Logs
- Disponíveis no Supabase Dashboard
- **URL**: `https://supabase.com/dashboard/project/{project_id}/functions/{function_name}/logs`

### Logs Principais
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

## Roadmap e Extensibilidade

### Funcionalidades Futuras Possíveis
- [ ] Modo multiplayer (cooperativo ou competitivo)
- [ ] Mais culturas e setores (horticultura intensiva, pesca, etc)
- [ ] Sistema de economia (compra de insumos, venda de produção)
- [ ] Conquistas e ranking global
- [ ] Integração com mais APIs (previsão do tempo 7 dias, mercado agrícola)
- [ ] Modo educador (dashboards para professores)
- [ ] Exportação de relatórios PDF

### Arquitetura Modular
O sistema foi projetado para fácil extensão:
- **Novas culturas**: adicionar em `src/data/crops.ts`
- **Novos estados/países**: adicionar em `src/data/states.ts`
- **Novas APIs climáticas**: criar nova Edge Function
- **Novos idiomas**: adicionar em `src/i18n/translations.ts`

---

## Referências e Documentação

### APIs Utilizadas
- [NASA POWER API Docs](https://power.larc.nasa.gov/docs/)
- [NASA FIRMS API Docs](https://firms.modaps.eosdis.nasa.gov/api/)
- [INMET API (não oficial)](https://apiprevmet3.inmet.gov.br/)

### Tecnologias
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Desenvolvido com assistência de Inteligência Artificial**  
**Todos os dados climáticos são fornecidos por fontes científicas verificadas (NASA, INMET)**