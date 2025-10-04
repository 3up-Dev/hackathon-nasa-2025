import { AlertTriangle, Flame, CloudRain, Sun, Snowflake, Bug } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClimateEvent } from '@/lib/productionEngine';

interface ClimateAlertsProps {
  events: ClimateEvent[];
  lang: 'pt' | 'en';
}

const getEventIcon = (type: ClimateEvent['type']) => {
  switch (type) {
    case 'fire':
      return Flame;
    case 'drought':
      return Sun;
    case 'flood':
      return CloudRain;
    case 'heat':
      return Sun;
    case 'cold':
      return Snowflake;
    case 'pest':
      return Bug;
    default:
      return AlertTriangle;
  }
};

const getSeverityColor = (severity: ClimateEvent['severity']) => {
  switch (severity) {
    case 'high':
      return 'border-game-brown bg-game-brown/10';
    case 'medium':
      return 'border-game-gold bg-game-gold/10';
    case 'low':
      return 'border-game-green-700 bg-game-green-700/10';
  }
};

const getSeverityText = (severity: ClimateEvent['severity'], lang: 'pt' | 'en') => {
  const texts = {
    pt: { high: 'ALTA', medium: 'MÉDIA', low: 'BAIXA' },
    en: { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' }
  };
  return texts[lang][severity];
};

export function ClimateAlerts({ events, lang }: ClimateAlertsProps) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-sm text-game-fg">
        {lang === 'pt' ? '🌍 Alertas Climáticos NASA' : '🌍 NASA Climate Alerts'}
      </h3>
      
      {events.map((event, index) => {
        const Icon = getEventIcon(event.type);
        const severityColor = getSeverityColor(event.severity);
        const severityText = getSeverityText(event.severity, lang);
        
        return (
          <Alert
            key={`${event.type}-${index}`}
            className={`${severityColor} border-4 animate-in slide-in-from-top-2 duration-500`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Icon className="h-5 w-5" />
            <AlertTitle className="font-pixel text-xs mb-1">
              {lang === 'pt' ? 'ALERTA CLIMÁTICO' : 'CLIMATE ALERT'} - {severityText}
            </AlertTitle>
            <AlertDescription className="font-sans text-xs space-y-1">
              <p className="font-medium">{event.description[lang]}</p>
              <div className="flex gap-3 text-[10px] text-game-gray-700">
                {event.impact.health !== 0 && (
                  <span>
                    Saúde: {event.impact.health > 0 ? '+' : ''}{event.impact.health}
                  </span>
                )}
                {event.impact.water !== 0 && (
                  <span>
                    Água: {event.impact.water > 0 ? '+' : ''}{event.impact.water}L
                  </span>
                )}
                {event.impact.sustainability !== 0 && (
                  <span>
                    Sust.: {event.impact.sustainability > 0 ? '+' : ''}{event.impact.sustainability}
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}