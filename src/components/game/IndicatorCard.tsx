import { cn } from '@/lib/utils';

interface IndicatorCardProps {
  icon: string;
  label: string;
  value: number;
  color: 'green' | 'blue' | 'brown';
}

export const IndicatorCard = ({ icon, label, value, color }: IndicatorCardProps) => {
  const colorClasses = {
    green: 'bg-game-green-700',
    blue: 'bg-game-blue',
    brown: 'bg-game-brown',
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-md border-2 border-game-gray-300">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="font-sans text-xs font-semibold text-game-fg">{label}</span>
      </div>
      <div className="relative h-2 bg-game-gray-300 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 rounded-full', colorClasses[color])}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="font-pixel text-[10px] text-game-gray-700">{value}%</span>
      </div>
    </div>
  );
};
