import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAProvider } from "@/components/PWAProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { IOSInstallPrompt } from "@/components/IOSInstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
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

const App = () => (
  <PWAProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkStatus />
      <PWAInstallPrompt />
      <IOSInstallPrompt />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </PWAProvider>
);

export default App;
