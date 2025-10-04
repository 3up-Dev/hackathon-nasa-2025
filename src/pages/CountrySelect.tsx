import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { useLanguage } from '@/hooks/useLanguage';

interface Country {
  id: string;
  name: { pt: string; en: string };
  flag: string;
  available: boolean;
}

export default function CountrySelect() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const countries: Country[] = [
    { id: 'brazil', name: { pt: 'Brasil', en: 'Brazil' }, flag: '🇧🇷', available: true },
    { id: 'usa', name: { pt: 'Estados Unidos', en: 'United States' }, flag: '🇺🇸', available: false },
    { id: 'paraguay', name: { pt: 'Paraguai', en: 'Paraguay' }, flag: '🇵🇾', available: false },
    { id: 'india', name: { pt: 'Índia', en: 'India' }, flag: '🇮🇳', available: false },
    { id: 'argentina', name: { pt: 'Argentina', en: 'Argentina' }, flag: '🇦🇷', available: false },
    { id: 'canada', name: { pt: 'Canadá', en: 'Canada' }, flag: '🇨🇦', available: false },
  ];

  const handleCountryClick = (country: Country) => {
    if (!country.available) return;
    navigate('/game');
  };

  return (
    <GameLayout>
      <div className="h-full bg-gradient-to-b from-game-bg to-game-green-400 to-opacity-20 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-game-gray-700 hover:text-game-fg transition-colors"
          >
            <span className="text-xl">←</span>
            <span className="font-sans text-sm">Voltar</span>
          </button>

          {/* Header */}
          <div className="text-center">
            <h1 className="font-pixel text-base text-game-fg mb-2">
              {lang === 'pt' ? 'Escolha o País' : 'Choose Country'}
            </h1>
            <p className="font-sans text-sm text-game-gray-700">
              {lang === 'pt' ? 'Mais países em breve!' : 'More countries coming soon!'}
            </p>
          </div>

          {/* Countries grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => handleCountryClick(country)}
                disabled={!country.available}
                className={`
                  relative p-6 rounded-2xl border-4 transition-all
                  ${
                    country.available
                      ? 'border-game-green-700 bg-white hover:scale-105 hover:shadow-2xl cursor-pointer'
                      : 'border-game-gray-300 bg-game-gray-300 bg-opacity-30 cursor-not-allowed'
                  }
                `}
              >
                {/* Flag */}
                <div
                  className={`text-7xl mb-3 ${
                    country.available ? '' : 'grayscale opacity-40'
                  }`}
                >
                  {country.flag}
                </div>

                {/* Name */}
                <p
                  className={`font-sans text-sm font-semibold ${
                    country.available ? 'text-game-fg' : 'text-game-gray-700'
                  }`}
                >
                  {country.name[lang]}
                </p>

                {/* Lock icon for unavailable */}
                {!country.available && (
                  <div className="absolute top-2 right-2 text-2xl">🔒</div>
                )}

                {/* Available indicator */}
                {country.available && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-game-green-700 rounded-full animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info text */}
          <div className="text-center text-xs font-sans text-game-gray-700 opacity-70 max-w-xs mx-auto">
            {lang === 'pt'
              ? '🌍 Estamos expandindo para mais países! Por enquanto, explore a agricultura brasileira.'
              : '🌍 We are expanding to more countries! For now, explore Brazilian agriculture.'}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
