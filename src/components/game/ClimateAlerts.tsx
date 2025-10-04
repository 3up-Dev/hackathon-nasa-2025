import { AlertTriangle, Flame, CloudRain, Sun, Snowflake, Bug, Satellite } from 'lucide-react';
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

const getSourceBadge = (source: string | undefined, lang: 'pt' | 'en') => {
  if (source === 'NASA_FIRMS') {
    return {
      label: '🔴 AO VIVO',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      animate: true,
    };
  }
  if (source === 'INMET') {
    return {
      label: '🔴 AO VIVO',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      animate: true,
    };
  }
  return {
    label: '📊 NASA',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    animate: false,
  };
};

const getSourceLink = (source: string | undefined) => {
  if (source === 'NASA_FIRMS') {
    return {
      url: 'https://firms.modaps.eosdis.nasa.gov/map/',
      label: 'Ver mapa de queimadas',
    };
  }
  if (source === 'INMET') {
    return {
      url: 'https://portal.inmet.gov.br/',
      label: 'Ver alertas oficiais',
    };
  }
  return null;
};

export function ClimateAlerts({ events, lang }: ClimateAlertsProps) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-sm text-game-fg flex items-center gap-2">
        <Satellite className="w-4 h-4" />
        {lang === 'pt' ? '🌍 Alertas Climáticos' : '🌍 Climate Alerts'}
      </h3>
      
      {events.map((event, index) => {
        const Icon = getEventIcon(event.type);
        const severityColor = getSeverityColor(event.severity);
        const severityText = getSeverityText(event.severity, lang);
        const sourceBadge = getSourceBadge(event.source, lang);
        const sourceLink = getSourceLink(event.source);
        
        return (
          <Alert
            key={`${event.type}-${event.source}-${index}`}
            className={`${severityColor} border-4 animate-in slide-in-from-top-2 duration-500 ${
              event.severity === 'high' && sourceBadge.animate ? 'animate-pulse' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <AlertTitle className="font-pixel text-xs mb-0">
                  {lang === 'pt' ? 'ALERTA CLIMÁTICO' : 'CLIMATE ALERT'} - {severityText}
                </AlertTitle>
              </div>
              <span className={`px-2 py-1 ${sourceBadge.bgColor} ${sourceBadge.textColor} text-[10px] font-pixel rounded flex-shrink-0`}>
                {sourceBadge.label}
              </span>
            </div>
            
            <AlertDescription className="font-sans text-xs space-y-2">
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
              
              {sourceLink && (
                <a
                  href={sourceLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-game-green-700 hover:underline inline-flex items-center gap-1"
                >
                  {sourceLink.label} →
                </a>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}