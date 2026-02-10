import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerColor, Token as TokenType } from '@/types/game';

interface CenterTrianglesProps {
  finishedTokens: Record<PlayerColor, TokenType[]>;
}

const triangleColors: Record<PlayerColor, string> = {
  red: '#FF4757',
  green: '#2ED573',
  yellow: '#FFA502',
  blue: '#1E90FF',
};

export const CenterTriangles = ({ finishedTokens }: CenterTrianglesProps) => {
  const triangles = [
    { color: 'red' as PlayerColor, rotate: 0 },
    { color: 'green' as PlayerColor, rotate: 90 },
    { color: 'yellow' as PlayerColor, rotate: 180 },
    { color: 'blue' as PlayerColor, rotate: 270 },
  ];

  return (
    <div className="w-full h-full relative">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="white" opacity="0.1" />

        {triangles.map(({ color, rotate }) => (
          <motion.polygon
            key={color}
            points="50,50 35,20 65,20"
            fill={triangleColors[color]}
            stroke="white"
            strokeWidth="0.8"
            opacity={0.9}
            transform={`rotate(${rotate} 50 50)`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.3, delay: rotate / 1000 }}
          />
        ))}

        {/* Center home circle */}
        <circle cx="50" cy="50" r="10" fill="white" stroke="#e0e0e0" strokeWidth="1" />
        <circle cx="50" cy="50" r="6" fill="#FFD700" opacity="0.8" />
        <text x="50" y="53" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">★</text>
      </svg>

      {/* Finished tokens count overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="grid grid-cols-2 gap-0.5 text-[7px] font-black">
          {Object.entries(finishedTokens).map(([color, tokens]) =>
            tokens.length > 0 ? (
              <div
                key={color}
                className="bg-white/90 rounded px-1 text-center shadow-sm"
                style={{ color: triangleColors[color as PlayerColor] }}
              >
                {tokens.length}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};
