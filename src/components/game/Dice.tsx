import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerColor } from '@/types/game';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
  playerColor?: string;
}

const DiceDots = ({ value }: { value: number }) => {
  const dotPositions: Record<number, { top: string; left: string }[]> = {
    1: [{ top: '50%', left: '50%' }],
    2: [
      { top: '28%', left: '28%' },
      { top: '72%', left: '72%' },
    ],
    3: [
      { top: '28%', left: '28%' },
      { top: '50%', left: '50%' },
      { top: '72%', left: '72%' },
    ],
    4: [
      { top: '28%', left: '28%' },
      { top: '28%', left: '72%' },
      { top: '72%', left: '28%' },
      { top: '72%', left: '72%' },
    ],
    5: [
      { top: '28%', left: '28%' },
      { top: '28%', left: '72%' },
      { top: '50%', left: '50%' },
      { top: '72%', left: '28%' },
      { top: '72%', left: '72%' },
    ],
    6: [
      { top: '25%', left: '30%' },
      { top: '25%', left: '70%' },
      { top: '50%', left: '30%' },
      { top: '50%', left: '70%' },
      { top: '75%', left: '30%' },
      { top: '75%', left: '70%' },
    ],
  };

  const dots = dotPositions[value] || [];

  return (
    <>
      {dots.map((pos, index) => (
        <motion.div
          key={index}
          className="absolute w-3.5 h-3.5 bg-slate-800 rounded-full"
          style={{
            top: pos.top,
            left: pos.left,
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.04, duration: 0.12 }}
        />
      ))}
    </>
  );
};

const glowColors: Record<string, string> = {
  red: '0 0 20px rgba(255,71,87,0.5)',
  green: '0 0 20px rgba(46,213,115,0.5)',
  yellow: '0 0 20px rgba(255,165,2,0.5)',
  blue: '0 0 20px rgba(30,144,255,0.5)',
};

export const Dice = ({ value, isRolling, onRoll, disabled, playerColor }: DiceProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={cn(
          'relative w-[72px] h-[72px] rounded-2xl cursor-pointer touch-target',
          'bg-gradient-to-br from-white via-gray-50 to-gray-200',
          'border-b-[5px] border-gray-400/60',
          'active:border-b-0 active:translate-y-1',
          'transition-all duration-150',
          isRolling && 'animate-spin cursor-not-allowed',
          disabled && !isRolling && 'opacity-40 cursor-not-allowed grayscale',
        )}
        style={{
          boxShadow: !disabled && playerColor && glowColors[playerColor]
            ? `0 6px 12px rgba(0,0,0,0.3), ${glowColors[playerColor]}`
            : '0 6px 12px rgba(0,0,0,0.3)',
        }}
        whileHover={!disabled && !isRolling ? { scale: 1.08, y: -2 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.92 } : {}}
      >
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Dice dots */}
        {value && !isRolling && <DiceDots value={value} />}

        {/* Rolling spinner */}
        {isRolling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-3xl"
              animate={{ rotateZ: [0, 360] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
            >
              🎲
            </motion.span>
          </div>
        )}

        {/* Tap to roll */}
        {!value && !isRolling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">TAP</span>
          </div>
        )}
      </motion.button>

      {/* Instruction text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {!disabled && !isRolling && (
          <span className="text-white/60 text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10 animate-pulse">
            Tap to Roll
          </span>
        )}
        {isRolling && (
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
            Rolling...
          </span>
        )}
        {disabled && !isRolling && (
          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">
            Move a token
          </span>
        )}
      </motion.div>
    </div>
  );
};
