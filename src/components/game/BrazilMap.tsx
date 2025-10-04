import { useState, useRef } from 'react';
import { brazilStates } from '@/data/states';
import { useGameState } from '@/hooks/useGameState';

interface BrazilMapProps {
  onStateClick: (stateId: string) => void;
}

export const BrazilMap = ({ onStateClick }: BrazilMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { plantedStates } = useGameState();

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.3, 1));
    if (zoom <= 1.3) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - pan.x, 
        y: e.touches[0].clientY - pan.y 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const regionColors = {
    north: '#9CCC65',
    northeast: '#FFB74D',
    centerwest: '#FFD54F',
    southeast: '#4FC3F7',
    south: '#81C784',
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-2 border-game-gray-300"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-2 border-game-gray-300"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        <svg
          viewBox="0 0 500 600"
          className="w-full h-full max-h-[500px]"
          style={{ 
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
        {/* Simplified Brazil map - using rectangles positioned to approximate states */}
        {brazilStates.map((state) => {
          const isHovered = hoveredState === state.id;
          const isPlanted = plantedStates.includes(state.id);
          const baseColor = regionColors[state.region];
          
          // Simplified positioning (you would use actual SVG paths for production)
          const positions: Record<string, { x: number; y: number; w: number; h: number }> = {
            // North
            RR: { x: 180, y: 20, w: 50, h: 60 },
            AP: { x: 240, y: 30, w: 40, h: 50 },
            AM: { x: 100, y: 60, w: 100, h: 80 },
            PA: { x: 210, y: 85, w: 90, h: 80 },
            RO: { x: 120, y: 145, w: 50, h: 50 },
            AC: { x: 60, y: 145, w: 55, h: 50 },
            TO: { x: 260, y: 170, w: 60, h: 80 },
            // Northeast
            MA: { x: 310, y: 100, w: 70, h: 60 },
            PI: { x: 340, y: 165, w: 60, h: 70 },
            CE: { x: 385, y: 130, w: 55, h: 50 },
            RN: { x: 430, y: 135, w: 40, h: 35 },
            PB: { x: 435, y: 175, w: 35, h: 30 },
            PE: { x: 415, y: 205, w: 50, h: 40 },
            AL: { x: 430, y: 250, w: 30, h: 30 },
            SE: { x: 410, y: 275, w: 30, h: 25 },
            BA: { x: 335, y: 240, w: 90, h: 120 },
            // Center-West
            MT: { x: 180, y: 200, w: 85, h: 100 },
            MS: { x: 180, y: 305, w: 70, h: 80 },
            GO: { x: 260, y: 255, w: 70, h: 80 },
            DF: { x: 285, y: 285, w: 15, h: 15 },
            // Southeast
            MG: { x: 300, y: 330, w: 80, h: 90 },
            ES: { x: 385, y: 360, w: 35, h: 50 },
            RJ: { x: 360, y: 415, w: 40, h: 35 },
            SP: { x: 280, y: 425, w: 75, h: 60 },
            // South
            PR: { x: 245, y: 480, w: 65, h: 50 },
            SC: { x: 270, y: 535, w: 55, h: 40 },
            RS: { x: 235, y: 545, w: 60, h: 50 },
          };

          const pos = positions[state.id] || { x: 250, y: 300, w: 40, h: 40 };

          return (
            <g key={state.id}>
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                fill={baseColor}
                stroke={isHovered ? '#2E7D32' : isPlanted ? '#1B5E20' : '#fff'}
                strokeWidth={isHovered ? 3 : isPlanted ? 2 : 1}
                opacity={isPlanted ? 0.8 : 0.6}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredState(state.id)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => onStateClick(state.id)}
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${pos.x + pos.w / 2}px ${pos.y + pos.h / 2}px`,
                }}
              />
              <text
                x={pos.x + pos.w / 2}
                y={pos.y + pos.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-pixel pointer-events-none"
                fontSize="10"
                fill="#1B1B1B"
              >
                {state.id}
              </text>
              {isPlanted && (
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y - 5}
                  textAnchor="middle"
                  fontSize="16"
                  className="pointer-events-none"
                >
                  🌱
                </text>
              )}
            </g>
          );
        })}
        </svg>
      </div>
    </div>
  );
};
