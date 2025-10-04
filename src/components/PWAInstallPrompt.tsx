import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PixelButton } from './layout/PixelButton';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      
      // Mostra toast informativo após 5 segundos
      setTimeout(() => {
        toast.info('💡 Instale o app na sua tela inicial!', {
          description: 'Acesse mais rápido e use offline',
          duration: 8000,
        });
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detecta se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA já está instalado! 🎉');
      setShowInstallButton(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('✨ App instalado com sucesso!');
        setShowInstallButton(false);
      } else {
        toast.info('Você pode instalar o app a qualquer momento');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      toast.error('Erro ao instalar o app');
    }
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white border-4 border-game-green-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📱</div>
          <div className="flex-1">
            <h3 className="font-pixel text-xs text-game-fg mb-2">
              Instalar App
            </h3>
            <p className="font-sans text-xs text-game-gray-700 mb-3">
              Adicione à tela inicial para acesso rápido e uso offline!
            </p>
            <div className="flex gap-2">
              <PixelButton
                onClick={handleInstallClick}
                variant="primary"
                className="text-xs py-1 px-3"
              >
                Instalar
              </PixelButton>
              <PixelButton
                onClick={() => setShowInstallButton(false)}
                variant="secondary"
                className="text-xs py-1 px-3"
              >
                Depois
              </PixelButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
