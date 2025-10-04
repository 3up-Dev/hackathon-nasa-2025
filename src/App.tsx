import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PWAProvider } from "@/components/PWAProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from './pages/Home';
import CountrySelect from './pages/CountrySelect';
import Tutorial from './pages/Tutorial';
import Registration from './pages/Registration';
import Login from './pages/Login';
import GameMap from './pages/GameMap';
import PrePlantingEducation from './pages/PrePlantingEducation';
import ProductionDashboard from './pages/ProductionDashboard';
import HarvestResults from './pages/HarvestResults';
import Results from './pages/Results';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/select-country" element={<ProtectedRoute><CountrySelect /></ProtectedRoute>} />
              <Route path="/tutorial" element={<ProtectedRoute><Tutorial /></ProtectedRoute>} />
              <Route path="/game" element={<ProtectedRoute><GameMap /></ProtectedRoute>} />
              <Route path="/education" element={<ProtectedRoute><PrePlantingEducation /></ProtectedRoute>} />
              <Route path="/production" element={<ProtectedRoute><ProductionDashboard /></ProtectedRoute>} />
              <Route path="/harvest" element={<ProtectedRoute><HarvestResults /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        
      </PWAProvider>
    </QueryClientProvider>
  );
};

export default App;
