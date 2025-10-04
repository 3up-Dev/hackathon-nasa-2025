import { useEffect } from 'react';
import { registerServiceWorker, useNetworkStatus } from '@/utils/registerSW';

/**
 * Componente que inicializa funcionalidades PWA após React estar pronto
 * Evita conflitos com inicialização de hooks
 */
export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Registra Service Worker após React estar completamente inicializado
    registerServiceWorker();
    
    // Configura listeners de rede
    useNetworkStatus();
  }, []);

  return <>{children}</>;
};
