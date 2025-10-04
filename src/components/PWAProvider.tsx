import { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/registerSW';
import { toast } from 'sonner';

/**
 * Componente que inicializa funcionalidades PWA após React estar pronto
 * Evita conflitos com inicialização de hooks
 */
export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Registra Service Worker após React estar completamente inicializado
    registerServiceWorker();
    
    // Configura listeners de rede
    const handleOnline = () => {
      toast.success('🌐 Conexão restaurada!');
    };

    const handleOffline = () => {
      toast.warning('📡 Você está offline', {
        description: 'Algumas funcionalidades podem estar limitadas',
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return <>{children}</>;
};
