import * as React from 'react';

/**
 * Componente que apenas passa children sem usar hooks
 */
export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
