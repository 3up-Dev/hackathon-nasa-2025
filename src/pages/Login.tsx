import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        navigate('/select-country');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg overflow-auto">
        <div className="flex flex-col items-center justify-center min-h-full p-6">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-game-gray-700 hover:text-game-fg transition-colors"
              >
                <span className="text-xl">←</span>
                <span className="font-sans text-sm">Voltar</span>
              </button>
              
              <h1 className="font-pixel text-base md:text-lg text-game-fg flex-1 text-center">
                Entrar
              </h1>
            </div>

            {/* Decorative elements */}
            <div className="flex gap-4 mb-6 text-3xl md:text-4xl opacity-70 justify-center">
              <span className="animate-bounce delay-0">🌾</span>
              <span className="animate-bounce delay-100">🌽</span>
              <span className="animate-bounce delay-200">🌿</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="email" className="font-pixel text-xs text-game-fg">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="font-pixel text-xs text-game-fg">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="pt-4 space-y-3">
                <PixelButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </PixelButton>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/registration')}
                    className="font-sans text-sm text-game-gray-700 hover:text-game-fg transition-colors"
                  >
                    Não tem conta? Criar conta
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
