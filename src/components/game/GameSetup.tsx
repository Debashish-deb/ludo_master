import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerColor } from '@/types/game';
import { useAccessibility } from '@/hooks/useAccessibility';

interface GameSetupProps {
  onStart: (config: {
    mode: 'single' | 'local';
    playerCount: 2 | 3 | 4;
    aiDifficulty?: 'medium' | 'hard' | 'expert';
    humanPlayerColor: PlayerColor;
  }) => void;
}

// Ludo King-style SVG Pawn
const Pawn = ({ color, size = 40 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 60 80" fill="none">
    <ellipse cx="30" cy="72" rx="20" ry="8" fill="rgba(0,0,0,0.3)" />
    <path d="M10 68 Q10 50 18 45 L18 35 Q10 30 10 20 Q10 5 30 5 Q50 5 50 20 Q50 30 42 35 L42 45 Q50 50 50 68 Z" fill={color} />
    <path d="M15 68 Q15 52 20 47 L20 35 Q14 30 14 20 Q14 8 30 8 Q46 8 46 20 Q46 30 40 35 L40 47 Q45 52 45 68 Z" fill="url(#shine)" />
    <defs>
      <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
      </linearGradient>
    </defs>
  </svg>
);

// Ludo King-style SVG Dice
const DiceIcon = ({ size = 50 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <rect x="4" y="4" width="52" height="52" rx="10" fill="white" stroke="#ccc" strokeWidth="2" />
    <circle cx="18" cy="18" r="5" fill="#333" />
    <circle cx="42" cy="18" r="5" fill="#333" />
    <circle cx="30" cy="30" r="5" fill="#333" />
    <circle cx="18" cy="42" r="5" fill="#333" />
    <circle cx="42" cy="42" r="5" fill="#333" />
  </svg>
);

export const GameSetup = ({ onStart }: GameSetupProps) => {
  const [mode, setMode] = useState<'single' | 'local'>('single');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [aiDifficulty, setAiDifficulty] = useState<'medium' | 'hard' | 'expert'>('medium');
  const [humanPlayerColor, setHumanPlayerColor] = useState<PlayerColor>('red');
  const [showSettings, setShowSettings] = useState(false);
  const { colorblindMode, reducedMotion, toggleColorblind, toggleReducedMotion } = useAccessibility();

  const handleStart = () => {
    onStart({
      mode,
      playerCount,
      aiDifficulty: mode === 'single' ? aiDifficulty : undefined,
      humanPlayerColor,
    });
  };

  const pawnColors = {
    red: '#FF4757',
    green: '#2ED573',
    yellow: '#FFA502',
    blue: '#1E90FF',
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center min-h-screen relative overflow-hidden select-none">

      {/* ============ HERO / LOGO ============ */}
      <motion.div
        className="flex flex-col items-center mt-6 mb-4 relative z-10"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        {/* Crown */}
        <motion.span
          className="text-5xl mb-[-8px]"
          animate={{ rotateZ: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          👑
        </motion.span>

        {/* LUDO text blocks */}
        <div className="flex items-center gap-1">
          {['L', 'U', 'D', 'O'].map((letter, i) => {
            const colors = ['#FF4757', '#2ED573', '#FFA502', '#1E90FF'];
            return (
              <motion.div
                key={letter}
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-lg border-b-4"
                style={{
                  backgroundColor: colors[i],
                  borderBottomColor: `color-mix(in srgb, ${colors[i]} 60%, black)`,
                }}
                initial={{ y: -30, opacity: 0, rotateZ: -10 }}
                animate={{ y: 0, opacity: 1, rotateZ: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
              >
                {letter}
              </motion.div>
            );
          })}
        </div>

        {/* Pawns + Dice illustration below logo */}
        <motion.div
          className="flex items-end gap-2 mt-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <Pawn color="#1E90FF" size={32} />
          <Pawn color="#FF4757" size={38} />
          <DiceIcon size={40} />
          <Pawn color="#2ED573" size={38} />
          <Pawn color="#FFA502" size={32} />
        </motion.div>
      </motion.div>

      {/* ============ GAME MODE CARDS ============ */}
      <motion.div
        className="grid grid-cols-2 gap-3 w-full px-4 mb-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Computer Card */}
        <button
          onClick={() => { setMode('single'); setShowSettings(true); }}
          className={cn(
            "rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1",
            mode === 'single' && showSettings
              ? "bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-700 shadow-lg scale-[1.03]"
              : "bg-gradient-to-b from-yellow-400 to-yellow-500 border-yellow-600 hover:shadow-lg"
          )}
        >
          <div className="bg-white/20 rounded-xl p-2">
            <span className="text-3xl">🤖</span>
          </div>
          <span className="text-white font-black text-sm uppercase tracking-wider drop-shadow-md">Computer</span>
        </button>

        {/* Pass N Play Card */}
        <button
          onClick={() => { setMode('local'); setShowSettings(true); }}
          className={cn(
            "rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1",
            mode === 'local' && showSettings
              ? "bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-700 shadow-lg scale-[1.03]"
              : "bg-gradient-to-b from-yellow-400 to-yellow-500 border-yellow-600 hover:shadow-lg"
          )}
        >
          <div className="bg-white/20 rounded-xl p-2">
            <span className="text-3xl">👥</span>
          </div>
          <span className="text-white font-black text-sm uppercase tracking-wider drop-shadow-md">Pass N Play</span>
        </button>
      </motion.div>

      {/* ============ SETTINGS PANEL ============ */}
      {showSettings && (
        <motion.div
          className="w-full px-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Player Count */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3">Players</p>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={cn(
                    "h-14 rounded-xl font-black text-2xl transition-all duration-150 border-b-4 active:border-b-0 active:translate-y-1",
                    playerCount === count
                      ? "bg-white text-blue-700 border-blue-300 shadow-lg"
                      : "bg-blue-600/50 text-white/80 border-blue-800 hover:bg-blue-600"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* AI Difficulty — single player only */}
          {mode === 'single' && (
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3">Difficulty</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'medium' as const, label: '⚡', sub: 'Medium' },
                  { key: 'hard' as const, label: '🔥', sub: 'Hard' },
                  { key: 'expert' as const, label: '💀', sub: 'Expert' },
                ]).map(({ key, label, sub }) => (
                  <button
                    key={key}
                    onClick={() => setAiDifficulty(key)}
                    className={cn(
                      "h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-150 border-b-4 active:border-b-0 active:translate-y-1",
                      aiDifficulty === key
                        ? "bg-emerald-500 text-white border-emerald-700 shadow-lg"
                        : "bg-blue-600/50 text-white/70 border-blue-800 hover:bg-blue-600"
                    )}
                  >
                    <span className="text-xl">{label}</span>
                    <span className="text-[10px] font-bold uppercase">{sub}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Color Selection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3">
              {mode === 'single' ? 'Your Color' : 'Player 1 Color'}
            </p>
            <div className="flex justify-center gap-3">
              {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setHumanPlayerColor(color)}
                  className={cn(
                    'w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center border-4 relative',
                    humanPlayerColor === color
                      ? 'ring-4 ring-white/60 scale-110 border-white/60'
                      : 'opacity-60 hover:opacity-100 border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: pawnColors[color] }}
                  whileTap={{ scale: 0.9 }}
                >
                  {humanPlayerColor === color && (
                    <motion.span
                      className="text-white text-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3">♿ Accessibility</p>
            <div className="space-y-3">
              {/* Colorblind toggle */}
              <button
                onClick={toggleColorblind}
                className="w-full flex items-center justify-between h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-white/80 text-sm font-semibold">Colorblind Mode</span>
                <div className={cn(
                  'w-10 h-6 rounded-full transition-colors duration-200 relative',
                  colorblindMode ? 'bg-green-500' : 'bg-white/20',
                )}>
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                    colorblindMode ? 'translate-x-5' : 'translate-x-1',
                  )} />
                </div>
              </button>
              {/* Reduced motion toggle */}
              <button
                onClick={toggleReducedMotion}
                className="w-full flex items-center justify-between h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-white/80 text-sm font-semibold">Reduced Motion</span>
                <div className={cn(
                  'w-10 h-6 rounded-full transition-colors duration-200 relative',
                  reducedMotion ? 'bg-green-500' : 'bg-white/20',
                )}>
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                    reducedMotion ? 'translate-x-5' : 'translate-x-1',
                  )} />
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============ PLAY BUTTON ============ */}
      <motion.div
        className="w-full px-4 mt-auto pb-8 pt-4"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={handleStart}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 text-white font-black text-2xl uppercase tracking-widest border-b-[6px] border-green-800 active:border-b-0 active:translate-y-1.5 transition-all shadow-[0_0_30px_rgba(46,213,115,0.4)] flex items-center justify-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-3xl">🎲</span>
          PLAY
        </motion.button>
      </motion.div>
    </div>
  );
};
