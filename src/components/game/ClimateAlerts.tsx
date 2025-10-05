/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { AlertTriangle, Flame, CloudRain, Sun, Snowflake, Bug, Satellite, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClimateEvent } from '@/lib/productionEngine';
import { PixelButton } from '@/components/layout/PixelButton';

interface ClimateAlertsProps {
  events: ClimateEvent[];
  lang: 'pt' | 'en';
  stateName?: string;
  lastUpdated?: Date | null;
  isLoading?: boolean;
  onRefresh?: () => void;
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

export function ClimateAlerts({ events, lang, stateName, lastUpdated, isLoading, onRefresh }: ClimateAlertsProps) {
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-pixel text-sm text-game-fg flex items-center gap-2">
          <Satellite className="w-4 h-4" />
          {lang === 'pt' ? '🌍 Alertas Climáticos' : '🌍 Climate Alerts'}
        </h3>
        
        {onRefresh && (
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="font-sans text-[10px] text-game-gray-600">
                {formatTime(lastUpdated)}
              </span>
            )}
            <PixelButton 
              variant="ghost" 
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-[10px] ml-1">
                {lang === 'pt' ? 'Atualizar' : 'Refresh'}
              </span>
            </PixelButton>
          </div>
        )}
      </div>
      
      {events.length === 0 ? (
        <div className="bg-game-green-700/10 border-2 border-game-green-700 rounded-lg p-4 text-center">
          <p className="font-sans text-xs text-game-gray-700">
            {lang === 'pt' 
              ? `✓ Sem alertas climáticos no momento para ${stateName || 'esta região'}` 
              : `✓ No climate alerts at this time for ${stateName || 'this region'}`
            }
          </p>
        </div>
      ) : (
        <>
          <p className="font-sans text-[10px] text-game-gray-600">
            {lang === 'pt' 
              ? `${events.length} alerta(s) ativo(s) para ${stateName || 'esta região'}`
              : `${events.length} active alert(s) for ${stateName || 'this region'}`
            }
          </p>
        </>
      )}
      
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