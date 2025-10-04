import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

const registrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  }, 'Você deve ter pelo menos 13 anos'),
  email: z.string().trim().email('E-mail inválido').max(255),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
});

export default function Registration() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/game`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este e-mail já está cadastrado');
        } else {
          toast.error('Erro ao criar conta: ' + authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar usuário');
        setLoading(false);
        return;
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        full_name: validatedData.fullName,
        birth_date: validatedData.birthDate,
        email: validatedData.email,
        phone: validatedData.phone,
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast.error('Erro ao criar perfil');
        setLoading(false);
        return;
      }

      toast.success('Conta criada com sucesso!');
      navigate('/game');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        toast.error('Erro ao criar conta');
      }
      setLoading(false);
    }
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg overflow-y-auto">
        <div className="max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-game-gray-300">
            <h2 className="font-pixel text-lg text-game-fg mb-6 text-center">
              Criar Conta
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="font-sans text-sm text-game-fg">
                  Nome Completo *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="birthDate" className="font-sans text-sm text-game-fg">
                  Data de Nascimento *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="mt-1"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-sans text-sm text-game-fg">
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="font-sans text-sm text-game-fg">
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="(00) 00000-0000"
                  required
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="password" className="font-sans text-sm text-game-fg">
                  Senha *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-game-gray-700 mt-1">
                  Mínimo de 6 caracteres
                </p>
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
