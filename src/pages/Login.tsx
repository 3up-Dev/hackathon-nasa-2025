/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

// Login page - Updated version without React Router hooks
import * as React from 'react';
import { useState, useEffect } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

export default function Login() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Check if user has profiles
        const { data: profiles } = await supabase
          .from('game_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        
        if (profiles && profiles.length > 0) {
          window.location.href = '/profiles';
        } else {
          window.location.href = '/tutorial';
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if user has profiles
        const { data: profiles } = await supabase
          .from('game_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        
        if (profiles && profiles.length > 0) {
          window.location.href = '/profiles';
        } else {
          window.location.href = '/tutorial';
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        setSuccess(true);
        // Check if user has profiles
        const { data: profiles } = await supabase
          .from('game_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1);
        
        setTimeout(() => {
          if (profiles && profiles.length > 0) {
            window.location.href = '/profiles';
          } else {
            window.location.href = '/tutorial';
          }
        }, 500);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg overflow-auto">
        {/* Back button */}
        <button
          onClick={() => (window.location.href = '/')}
          className="absolute top-4 left-4 z-50 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform"
          aria-label="Voltar"
        >
          ←
        </button>

        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>

        <div className="flex flex-col items-center justify-center min-h-full p-6">
          <div className="w-full max-w-md mx-auto">
            <h1 className="font-pixel text-base md:text-lg text-game-fg text-center mb-6">
              {t('login_title')}
            </h1>

            {/* Decorative elements */}
            <div className="flex gap-4 mb-6 text-3xl md:text-4xl opacity-70 justify-center">
              <span className="animate-bounce delay-0">🌾</span>
              <span className="animate-bounce delay-100">🌽</span>
              <span className="animate-bounce delay-200">🌿</span>
              <span className="animate-bounce delay-300">🐄</span>
              <span className="animate-bounce delay-0">🐟</span>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-game-brown/20 border-2 border-game-brown rounded-lg">
                <p className="font-sans text-sm text-game-brown text-center">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 p-3 bg-game-green-400/20 border-2 border-game-green-700 rounded-lg">
                <p className="font-sans text-sm text-game-green-700 text-center">
                  {t('login_success')}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="email" className="font-pixel text-xs text-game-fg">
                  {t('login_email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="font-pixel text-xs text-game-fg">
                  {t('login_password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div className="pt-4 space-y-3">
                <PixelButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? t('login_loading') : t('login_button')}
                </PixelButton>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => (window.location.href = '/registration')}
                    className="font-sans text-sm text-game-gray-700 hover:text-game-fg transition-colors"
                    disabled={loading}
                  >
                    {t('login_no_account')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
