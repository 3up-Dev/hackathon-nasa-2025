import React, { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/registerSW';

/**
 * Componente que inicializa funcionalidades PWA
 */
export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Registra Service Worker
    registerServiceWorker();
  }, []);

  return <>{children}</>;
};
