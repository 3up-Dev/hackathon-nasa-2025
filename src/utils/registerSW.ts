// Registro do Service Worker com Workbox
import { Workbox } from 'workbox-window';
import { toast } from 'sonner';

let wb: Workbox | undefined;

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      wb = new Workbox('/sw.js');

      // Detecta quando há uma nova versão esperando
      wb.addEventListener('waiting', () => {
        toast.info(
          '🔄 Nova versão disponível!',
          {
            description: 'Clique para atualizar',
            action: {
              label: 'Atualizar',
              onClick: () => {
                wb?.messageSkipWaiting();
                window.location.reload();
              },
            },
            duration: 10000,
          }
        );
      });

      // Detecta quando o SW toma controle
      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      // Registra o service worker
      await wb.register();
      console.log('✅ Service Worker registrado com sucesso!');

      // Verifica atualizações periodicamente (a cada 1 hora)
      setInterval(() => {
        wb?.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  } else {
    console.warn('⚠️ Service Workers não são suportados neste navegador');
  }
};

// Função para limpar cache (útil para desenvolvimento/debugging)
export const clearCache = async () => {
  if (wb) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      toast.success('Cache limpo com sucesso!');
    }
  }
};

// Hook para verificar se está online/offline
export const useNetworkStatus = (
  onOnline?: () => void,
  onOffline?: () => void
) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      toast.success('🌐 Conexão restaurada!');
      onOnline?.();
    });

    window.addEventListener('offline', () => {
      toast.warning('📡 Você está offline', {
        description: 'Algumas funcionalidades podem estar limitadas',
      });
      onOffline?.();
    });
  }
};
