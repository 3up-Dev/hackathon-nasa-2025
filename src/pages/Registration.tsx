import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const registrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13;
  }, 'Você deve ter pelo menos 13 anos'),
  email: z.string().trim().email('E-mail inválido').max(255),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
});

export default function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = registrationSchema.parse(formData);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: validatedData.fullName,
          birth_date: validatedData.birthDate,
          email: validatedData.email,
          phone: validatedData.phone,
        });

      if (profileError) throw profileError;

      toast.success('Conta criada com sucesso!');
      navigate('/game');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar conta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg overflow-auto">
        <div className="flex flex-col items-center justify-center min-h-full p-8">
          <div className="w-full max-w-md">
            <button
              onClick={() => navigate('/tutorial')}
              className="flex items-center gap-2 mb-6 text-game-gray-700 hover:text-game-fg transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="font-sans text-sm">Voltar</span>
            </button>
            
            <h1 className="font-pixel text-lg text-game-fg mb-8 text-center">
              Criar Conta
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="font-pixel text-xs text-game-fg">
                  Nome Completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="birthDate" className="font-pixel text-xs text-game-fg">
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="mt-1"
                />
              </div>

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
                <Label htmlFor="phone" className="font-pixel text-xs text-game-fg">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="(00) 00000-0000"
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

              <div className="pt-4">
                <PixelButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Conta'}
                </PixelButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
