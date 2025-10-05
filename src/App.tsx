/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Componente principal da aplicação com roteamento e estrutura geral.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * Main application component with routing and general structure.
 */

import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from './pages/HomeV2';
import CountrySelect from './pages/CountrySelect';
const Tutorial = React.lazy(() => import('./pages/Tutorial'));
import Registration from './pages/Registration';
import Login from './pages/Login';
import ProfileManager from './pages/ProfileManager';
import CreateProfile from './pages/CreateProfile';
import GameMap from './pages/GameMap';
import PrePlantingEducation from './pages/PrePlantingEducation';
import ProductionDashboard from './pages/ProductionDashboard';
import HarvestResults from './pages/HarvestResults';
import Results from './pages/Results';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const TestLanding = () => (
  <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
    <h1 style={{ fontFamily: 'Press Start 2P', fontSize: 16, marginBottom: 24 }}>🌱 Plantando o Futuro</h1>
    <div style={{ fontFamily: 'sans-serif', fontSize: 14, lineHeight: 1.6 }}>
      <p style={{ marginBottom: 16 }}>Sistema de produção implementado! 🎉</p>
      
      <div style={{ marginBottom: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
        <h2 style={{ fontSize: 14, marginBottom: 12, fontWeight: 'bold' }}>Funcionalidades:</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>✅ Tela educativa pré-plantio com dados climáticos</li>
          <li>✅ Sistema de tempo e ciclo de produção completo</li>
          <li>✅ Progresso visual por etapas de crescimento</li>
          <li>✅ Sistema de tarefas semanais (irrigação, temperatura, etc.)</li>
          <li>✅ Métricas de saúde, água e sustentabilidade</li>
          <li>✅ Controles de tempo (1 dia, 1 semana, 1 mês)</li>
          <li>✅ Persistência local do progresso</li>
        </ul>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>Testar fluxo completo:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a 
            href="/education?crop=soja&state=sp" 
            style={{ 
              padding: '8px 12px', 
              background: '#4CAF50', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 4,
              textAlign: 'center'
            }}
          >
            1. Tela Educativa (Soja em SP)
          </a>
          <a 
            href="/production?crop=soja&state=sp" 
            style={{ 
              padding: '8px 12px', 
              background: '#2196F3', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 4,
              textAlign: 'center'
            }}
          >
            2. Dashboard de Produção
          </a>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#666', marginTop: 24 }}>
        💡 Dica: Na produção, complete as tarefas antes de avançar o tempo para manter a saúde alta!
      </p>
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<TestLanding />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profiles" element={<ProtectedRoute><ProfileManager /></ProtectedRoute>} />
          <Route path="/profile/new" element={<ProtectedRoute><CreateProfile /></ProtectedRoute>} />
          <Route path="/select-country" element={<ProtectedRoute><CountrySelect /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute><React.Suspense fallback={<div />}><Tutorial /></React.Suspense></ProtectedRoute>} />
          <Route path="/education" element={<PrePlantingEducation />} />
          <Route path="/production" element={<ProductionDashboard />} />
          <Route path="/game" element={<ProductionDashboard />} />
          <Route path="/harvest" element={<ProtectedRoute><HarvestResults /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
