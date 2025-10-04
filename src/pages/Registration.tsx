import * as React from 'react';
import { useState, useEffect } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const registrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  birthDate: z.date().refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 13;
  }, 'Você deve ter pelo menos 13 anos'),
  email: z.string().trim().email('E-mail inválido').max(255),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
});

export default function Registration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = '/tutorial';
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        window.location.href = '/tutorial';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value.replace(/(\d{0,2})/, '($1');
      } else if (value.length <= 6) {
        value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
      } else if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
    } else {
      value = value.substring(0, 11);
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!birthDate) {
        setError('Selecione sua data de nascimento');
        setLoading(false);
        return;
      }

      // Parse birth date
      const parsedBirthDate = new Date(birthDate);

      // Validate form data
      const validatedData = registrationSchema.parse({
        ...formData,
        birthDate: parsedBirthDate,
      });

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

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: validatedData.fullName,
          birth_date: format(validatedData.birthDate, 'yyyy-MM-dd'),
          email: validatedData.email,
          phone: validatedData.phone,
        });

      if (profileError) {
        throw profileError;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao criar conta');
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
          onClick={() => (window.location.href = '/login')}
          className="absolute top-4 left-4 z-50 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform"
          aria-label="Voltar"
        >
          ←
        </button>

        <div className="flex flex-col items-center justify-center min-h-full p-6">
          <div className="w-full max-w-md mx-auto">
            <h1 className="font-pixel text-base md:text-lg text-game-fg text-center mb-6">
              Criar Conta
            </h1>

            {/* Decorative elements */}
            <div className="flex gap-4 mb-6 text-3xl md:text-4xl opacity-70 justify-center">
              <span className="animate-bounce delay-0">🌾</span>
              <span className="animate-bounce delay-100">🌽</span>
              <span className="animate-bounce delay-200">🌿</span>
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
                  Conta criada com sucesso! Redirecionando para login...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
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
                  disabled={loading}
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
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1"
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  disabled={loading}
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
                  disabled={loading}
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
                  onChange={handlePhoneChange}
                  className="mt-1"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  disabled={loading}
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
                  disabled={loading}
                  minLength={6}
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

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => (window.location.href = '/login')}
                  className="font-sans text-sm text-game-gray-700 hover:text-game-fg transition-colors"
                  disabled={loading}
                >
                  Já tem conta? Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
