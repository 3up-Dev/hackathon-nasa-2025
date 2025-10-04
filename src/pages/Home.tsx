import * as React from 'react';
import { useEffect, useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center h-full bg-gradient-to-b from-game-bg to-game-green-400 to-opacity-20">
          <div className="text-4xl animate-pulse">🌱</div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-game-bg to-game-green-400 to-opacity-20 p-8">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="text-8xl mb-4 animate-pulse">🌱</div>
          <h1 className="font-pixel text-lg text-game-fg text-center leading-relaxed px-4">
            Plantando o Futuro
          </h1>
        </div>

        {/* Decorative elements */}
        <div className="flex gap-4 mb-12 text-5xl opacity-70">
          <span className="animate-bounce delay-0">🌾</span>
          <span className="animate-bounce delay-100">🌽</span>
          <span className="animate-bounce delay-200">🌿</span>
          <span className="animate-bounce delay-300">🐄</span>
          <span className="animate-bounce delay-0">🐟</span>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-xs space-y-4">
          {user ? (
            <>
              <PixelButton
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/tutorial'}
                className="w-full"
              >
                Continuar Jogo
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="lg"
                onClick={handleLogout}
                className="w-full"
              >
                Sair
              </PixelButton>
            </>
          ) : (
            <>
              <PixelButton
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                Entrar
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '/registration'}
                className="w-full"
              >
                Criar Conta
              </PixelButton>
            </>
          )}
        </div>

        {/* Footer decoration */}
        <div className="absolute bottom-8 text-xs font-sans text-game-gray-700 opacity-50">
          Hackathon NASA 2025
        </div>
      </div>
    </GameLayout>
  );
}
