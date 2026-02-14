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
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        {/* Background base */}
        <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

        {/* Glass effect overlays for triangles */}
        <defs>
          <filter id="glass-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {triangles.map(({ color, rotate }) => (
          <motion.polygon
            key={color}
            points="50,50 32,15 68,15"
            fill={triangleColors[color]}
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity={0.4}
            opacity={0.8}
            transform={`rotate(${rotate} 50 50)`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 0.5, delay: rotate / 1000 }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' }}
          />
        ))}

        {/* Center home goal circle */}
        <circle cx="50" cy="50" r="14" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(212, 175, 55, 0.5)" strokeWidth="1" />
        <motion.circle
          cx="50" cy="50" r="10"
          fill="rgba(212, 175, 55, 0.2)"
          animate={{ r: [10, 11, 10], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <text x="50" y="54" textAnchor="middle" fontSize="12" fill="#FFD700" fontWeight="black" style={{ filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.5))' }}>★</text>
      </svg>

      {/* Finished tokens count overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="grid grid-cols-2 gap-0.5 text-[7px] font-black">
          {Object.entries(finishedTokens).map(([color, tokens]) =>
            tokens.length > 0 ? (
              <div
                key={color}
                className="bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-center border border-white/10 shadow-lg"
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
