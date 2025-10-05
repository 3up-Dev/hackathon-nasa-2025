/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

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
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2000, 0, 1));
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 111 }, (_, i) => new Date().getFullYear() - i);

  const handleMonthChange = (month: string) => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(parseInt(month));
    setCalendarMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(calendarMonth);
    newDate.setFullYear(parseInt(year));
    setCalendarMonth(newDate);
  };

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
        setError(t('register_date_error'));
        setLoading(false);
        return;
      }

      // Validate form data
      const validatedData = registrationSchema.parse({
        ...formData,
        birthDate: birthDate,
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

      // Create profile (username will be auto-generated by trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: validatedData.fullName,
          birth_date: format(validatedData.birthDate, 'yyyy-MM-dd'),
          email: validatedData.email,
          phone: validatedData.phone,
        } as any);

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

        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>

        <div className="flex flex-col items-center justify-center min-h-full p-6">
          <div className="w-full max-w-md mx-auto">
            <h1 className="font-pixel text-base md:text-lg text-game-fg text-center mb-6">
              {t('register_title')}
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
                  {t('register_success')}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="fullName" className="font-pixel text-xs text-game-fg">
                  {t('register_fullname')}
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
                  {t('register_birthdate')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "dd/MM/yyyy") : <span>{t('register_select_date')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 space-y-2">
                      <div className="flex gap-2">
                        <Select
                          value={calendarMonth.getMonth().toString()}
                          onValueChange={handleMonthChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={calendarMonth.getFullYear().toString()}
                          onValueChange={handleYearChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className={cn("pointer-events-auto")}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

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
                <Label htmlFor="phone" className="font-pixel text-xs text-game-fg">
                  {t('register_phone')}
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
                  {t('register_password')}
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
                  {loading ? t('register_loading') : t('register_button')}
                </PixelButton>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => (window.location.href = '/login')}
                  className="font-sans text-sm text-game-gray-700 hover:text-game-fg transition-colors"
                  disabled={loading}
                >
                  {t('register_has_account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
