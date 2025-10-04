import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAProvider } from "@/components/PWAProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import Home from './pages/Home';
import CountrySelect from './pages/CountrySelect';
import Tutorial from './pages/Tutorial';
import Registration from './pages/Registration';
import Login from './pages/Login';
import GameMap from './pages/GameMap';
import Results from './pages/Results';
import NotFound from './pages/NotFound';

const App = () => (
  <PWAProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkStatus />
      <PWAInstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select-country" element={<CountrySelect />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/game" element={<GameMap />} />
          <Route path="/results" element={<Results />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </PWAProvider>
);

export default App;
