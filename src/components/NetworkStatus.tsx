import { useEffect, useState } from 'react';

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="text-xl">📡</span>
          <p className="font-sans text-sm font-medium">
            Você está offline - Algumas funcionalidades podem estar limitadas
          </p>
        </div>
      </div>
    </div>
  );
};
