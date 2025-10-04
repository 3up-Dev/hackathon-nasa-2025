import * as React from 'react';
import { cn } from '@/lib/utils';

interface SimpleProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export const SimpleProgress = ({ value, className, indicatorClassName }: SimpleProgressProps) => {
  const clampedValue = Math.min(100, Math.max(0, value || 0));

  return (
    <div
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-game-gray-300',
        className
      )}
    >
      <div
        className={cn('h-full bg-game-green-700 transition-all duration-500', indicatorClassName)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
