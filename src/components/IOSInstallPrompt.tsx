import { useEffect, useState } from 'react';
import { Share } from 'lucide-react';
import { PixelButton } from './layout/PixelButton';

/**
 * Componente que mostra instruções de instalação para iOS/Safari
 * iOS não suporta o evento beforeinstallprompt, então precisamos de instruções manuais
 */
export const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detecta se é iOS e Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Verifica se já foi instalado ou se o usuário já dispensou
    const wasDismissed = localStorage.getItem('ios-install-prompt-dismissed');
    
    // Mostra apenas se for iOS Safari, não estiver instalado, e não foi dispensado
    if (isIOS && isSafari && !isInStandaloneMode && !wasDismissed) {
      // Espera 3 segundos antes de mostrar
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salva que o usuário dispensou (válido por 7 dias)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('ios-install-prompt-dismissed', expiryDate.toISOString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white border-4 border-game-green-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">📱</div>
          <div className="flex-1">
            <h3 className="font-pixel text-xs text-game-fg mb-2">
              Instalar App
            </h3>
            <p className="font-sans text-xs text-game-gray-700 mb-3">
              Para instalar no seu iPhone:
            </p>
            
            {/* Instruções visuais */}
            <div className="bg-game-bg/10 rounded-lg p-3 mb-3 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="bg-blue-500 text-white rounded p-1 flex-shrink-0">
                  <Share className="w-3 h-3" />
                </div>
                <span className="font-sans text-game-gray-700">
                  1. Toque no botão <strong>Compartilhar</strong>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <div className="bg-game-green-700 text-white rounded p-1 flex-shrink-0 text-center font-bold" style={{ minWidth: '24px' }}>
                  +
                </div>
                <span className="font-sans text-game-gray-700">
                  2. Role e toque em <strong>"Adicionar à Tela Inicial"</strong>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <div className="bg-game-green-700 text-white rounded p-1 flex-shrink-0 text-center" style={{ minWidth: '24px' }}>
                  ✓
                </div>
                <span className="font-sans text-game-gray-700">
                  3. Toque em <strong>"Adicionar"</strong>
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <PixelButton
                onClick={handleDismiss}
                variant="secondary"
                className="text-xs py-1 px-3 flex-1"
              >
                Entendi
              </PixelButton>
            </div>
          </div>
          
          {/* Botão fechar */}
          <button
            onClick={handleDismiss}
            className="text-game-gray-700 hover:text-game-fg transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
