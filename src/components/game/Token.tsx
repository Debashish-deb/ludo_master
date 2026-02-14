import { motion, AnimatePresence, TargetAndTransition } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerColor, Token as TokenType } from '@/types/game';

// ═══════════════════════════════════════════════════════════════
// TOKEN COMPONENT - Premium 3D Game Piece
// ═══════════════════════════════════════════════════════════════

interface TokenProps {
  token: TokenType;
  isSelectable: boolean;
  isSelected: boolean;
  onClick: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIndex?: boolean;
  colorblindMode?: boolean;
  isMoving?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COLORBLIND ACCESSIBILITY SYMBOLS
// ═══════════════════════════════════════════════════════════════

const colorblindSymbols: Record<PlayerColor, { symbol: string; label: string }> = {
  red: { symbol: '●', label: 'Circle' },
  green: { symbol: '▲', label: 'Triangle' },
  yellow: { symbol: '■', label: 'Square' },
  blue: { symbol: '◆', label: 'Diamond' },
};

// ═══════════════════════════════════════════════════════════════
// PREMIUM THEME CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const tokenTheme: Record<PlayerColor, {
  gradient: string;
  gradientHover: string;
  shadow: string;
  shadowHover: string;
  shadowActive: string;
  glow: string;
  glowPulse: string;
  border: string;
  highlight: string;
}> = {
  red: {
    gradient: 'from-red-400 via-red-500 to-red-700',
    gradientHover: 'from-red-300 via-red-400 to-red-600',
    shadow: '0 5px 0 #7f1d1d, 0 8px 16px rgba(0,0,0,0.4)',
    shadowHover: '0 8px 0 #7f1d1d, 0 12px 24px rgba(0,0,0,0.5)',
    shadowActive: '0 2px 0 #7f1d1d, 0 4px 8px rgba(0,0,0,0.4)',
    glow: '0 0 20px rgba(239,68,68,0.5)',
    glowPulse: '0 0 30px rgba(239,68,68,0.8)',
    border: 'border-red-300/50',
    highlight: 'from-red-200/60 via-transparent to-transparent',
  },
  green: {
    gradient: 'from-green-400 via-green-500 to-green-700',
    gradientHover: 'from-green-300 via-green-400 to-green-600',
    shadow: '0 5px 0 #14532d, 0 8px 16px rgba(0,0,0,0.4)',
    shadowHover: '0 8px 0 #14532d, 0 12px 24px rgba(0,0,0,0.5)',
    shadowActive: '0 2px 0 #14532d, 0 4px 8px rgba(0,0,0,0.4)',
    glow: '0 0 20px rgba(34,197,94,0.5)',
    glowPulse: '0 0 30px rgba(34,197,94,0.8)',
    border: 'border-green-300/50',
    highlight: 'from-green-200/60 via-transparent to-transparent',
  },
  yellow: {
    gradient: 'from-yellow-300 via-yellow-400 to-yellow-600',
    gradientHover: 'from-yellow-200 via-yellow-300 to-yellow-500',
    shadow: '0 5px 0 #854d0e, 0 8px 16px rgba(0,0,0,0.4)',
    shadowHover: '0 8px 0 #854d0e, 0 12px 24px rgba(0,0,0,0.5)',
    shadowActive: '0 2px 0 #854d0e, 0 4px 8px rgba(0,0,0,0.4)',
    glow: '0 0 20px rgba(250,204,21,0.5)',
    glowPulse: '0 0 30px rgba(250,204,21,0.8)',
    border: 'border-yellow-300/50',
    highlight: 'from-yellow-100/80 via-transparent to-transparent',
  },
  blue: {
    gradient: 'from-blue-400 via-blue-500 to-blue-700',
    gradientHover: 'from-blue-300 via-blue-400 to-blue-600',
    shadow: '0 5px 0 #1e3a8a, 0 8px 16px rgba(0,0,0,0.4)',
    shadowHover: '0 8px 0 #1e3a8a, 0 12px 24px rgba(0,0,0,0.5)',
    shadowActive: '0 2px 0 #1e3a8a, 0 4px 8px rgba(0,0,0,0.4)',
    glow: '0 0 20px rgba(59,130,246,0.5)',
    glowPulse: '0 0 30px rgba(59,130,246,0.8)',
    border: 'border-blue-300/50',
    highlight: 'from-blue-200/60 via-transparent to-transparent',
  },
};

// ═══════════════════════════════════════════════════════════════
// SIZE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const sizeConfig = {
  xs: { class: 'w-4 h-4', symbol: 'text-[5px]', index: 'text-[6px] w-2.5 h-2.5' },
  sm: { class: 'w-6 h-6', symbol: 'text-[7px]', index: 'text-[7px] w-3 h-3' },
  md: { class: 'w-9 h-9', symbol: 'text-[10px]', index: 'text-[8px] w-3.5 h-3.5' },
  lg: { class: 'w-12 h-12', symbol: 'text-[14px]', index: 'text-[10px] w-4 h-4' },
  xl: { class: 'w-16 h-16', symbol: 'text-[18px]', index: 'text-[12px] w-5 h-5' },
};

// ═══════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════

const selectableAnimation: TargetAndTransition = {
  y: [0, -4, 0],
  scale: [1, 1.08, 1],
  transition: {
    duration: 1.2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const selectedAnimation: TargetAndTransition = {
  scale: 1.12,
  y: -2,
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};

const movingAnimation: TargetAndTransition = {
  y: [0, -15, 0],
  scale: [1, 1.15, 1],
  transition: { duration: 0.4, ease: 'easeOut' },
};

// ═══════════════════════════════════════════════════════════════
// PREMIUM TOKEN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const Token = ({
  token,
  isSelectable,
  isSelected,
  onClick,
  size = 'md',
  showIndex = false,
  colorblindMode = false,
  isMoving = false,
}: TokenProps) => {
  const theme = tokenTheme[token.color];
  const sizeCfg = sizeConfig[size];

  // Determine animation state
  const getAnimation = (): TargetAndTransition => {
    if (isMoving) return movingAnimation;
    if (isSelectable) return selectableAnimation;
    if (isSelected) return selectedAnimation;
    return { scale: 1, y: 0 };
  };

  // Determine shadow based on state
  const getShadow = () => {
    if (isSelected) return `${theme.shadowHover}, ${theme.glow}`;
    if (isSelectable) return `${theme.shadow}, ${theme.glowPulse}`;
    return theme.shadow;
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={!isSelectable}
      className={cn(
        'relative rounded-full game-element',
        'flex items-center justify-center',
        'transition-colors duration-200',
        sizeCfg.class,
        isSelectable && 'cursor-pointer',
        !isSelectable && 'cursor-default',
      )}
      style={{
        boxShadow: getShadow(),
        transform: 'translateZ(0)', // GPU acceleration
      }}
      animate={getAnimation()}
      whileHover={isSelectable ? {
        scale: 1.15,
        y: -4,
        transition: { type: 'spring', stiffness: 400 },
      } : {}}
      whileTap={isSelectable ? {
        scale: 0.92,
        y: 1,
        boxShadow: theme.shadowActive,
      } : {}}
      layout
    >
      {/* ═══════════════════════════════════════════════════════
         TOKEN BASE - Gradient background
         ═══════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br',
          isSelectable || isSelected ? theme.gradientHover : theme.gradient,
          'border-2',
          theme.border,
        )}
      />

      {/* ═══════════════════════════════════════════════════════
         3D DEPTH EFFECT - Bottom shadow layer
         ═══════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════
         GLOSSY HIGHLIGHT - Top shine
         ═══════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'absolute inset-[3px] rounded-full bg-gradient-to-br pointer-events-none',
          theme.highlight,
        )}
      />

      {/* ═══════════════════════════════════════════════════════
         CENTER CONTENT - Symbol or shine dot
         ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10">
        {colorblindMode ? (
          // Colorblind mode: Show geometric symbol
          <span
            className={cn(
              'font-black text-white drop-shadow-lg leading-none',
              'flex items-center justify-center',
              sizeCfg.symbol,
            )}
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
            title={colorblindSymbols[token.color].label}
          >
            {colorblindSymbols[token.color].symbol}
          </span>
        ) : (
          // Normal mode: Glossy center dot
          <div
            className="rounded-full bg-white/70"
            style={{
              width: size === 'xs' ? '30%' : size === 'sm' ? '32%' : '35%',
              height: size === 'xs' ? '30%' : size === 'sm' ? '32%' : '35%',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
         SELECTION INDICATOR - Ring around token
         ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute -inset-1 rounded-full border-2 border-white/60"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              boxShadow: `0 0 15px ${token.color === 'red' ? 'rgba(239,68,68,0.6)' :
                token.color === 'green' ? 'rgba(34,197,94,0.6)' :
                  token.color === 'yellow' ? 'rgba(250,204,21,0.6)' :
                    'rgba(59,130,246,0.6)'}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
         TOKEN INDEX BADGE - Small number indicator
         ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showIndex && (
          <motion.span
            className={cn(
              'absolute -bottom-0.5 -right-0.5',
              'bg-white text-gray-900 rounded-full',
              'flex items-center justify-center font-black shadow-lg',
              'border border-gray-200',
              sizeCfg.index,
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {token.id.split('-').pop()}
          </motion.span>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
         SELECTABLE PULSE EFFECT - Subtle glow ring
         ═══════════════════════════════════════════════════════ */}
      {isSelectable && !isSelected && (
        <motion.div
          className="absolute -inset-2 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 0 0px ${token.color === 'red' ? 'rgba(239,68,68,0.4)' :
                token.color === 'green' ? 'rgba(34,197,94,0.4)' :
                  token.color === 'yellow' ? 'rgba(250,204,21,0.4)' :
                    'rgba(59,130,246,0.4)'}`,
              `0 0 0 8px ${token.color === 'red' ? 'rgba(239,68,68,0)' :
                token.color === 'green' ? 'rgba(34,197,94,0)' :
                  token.color === 'yellow' ? 'rgba(250,204,21,0)' :
                    'rgba(59,130,246,0)'}`,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════
// STACKED TOKENS COMPONENT - Multiple tokens on same cell
// ═══════════════════════════════════════════════════════════════

interface StackedTokensProps {
  tokens: TokenType[];
  selectableTokenIds: string[];
  selectedTokenId: string | null;
  onTokenClick: (tokenId: string) => void;
  colorblindMode?: boolean;
  maxVisible?: number;
}

export const StackedTokens = ({
  tokens,
  selectableTokenIds,
  selectedTokenId,
  onTokenClick,
  colorblindMode = false,
  maxVisible = 4,
}: StackedTokensProps) => {
  if (tokens.length === 0) return null;

  // Single token - no stacking needed
  if (tokens.length === 1) {
    return (
      <Token
        token={tokens[0]}
        isSelectable={selectableTokenIds.includes(tokens[0].id)}
        isSelected={selectedTokenId === tokens[0].id}
        onClick={() => onTokenClick(tokens[0].id)}
        size="md"
        colorblindMode={colorblindMode}
      />
    );
  }

  // Multiple tokens - stack with offset
  const visibleTokens = tokens.slice(0, maxVisible);
  const remainingCount = tokens.length - maxVisible;

  return (
    <div className="relative w-10 h-10">
      {visibleTokens.map((token, index) => {
        const isSelectable = selectableTokenIds.includes(token.id);
        const isSelected = selectedTokenId === token.id;

        return (
          <motion.div
            key={token.id}
            className="absolute"
            style={{
              top: index * -4,
              left: index * 4,
              zIndex: index + 1,
            }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: index * 0.05,
              type: 'spring',
              stiffness: 400,
            }}
            whileHover={isSelectable ? { zIndex: 10, scale: 1.1 } : {}}
          >
            <Token
              token={token}
              isSelectable={isSelectable}
              isSelected={isSelected}
              onClick={() => onTokenClick(token.id)}
              size="sm"
              colorblindMode={colorblindMode}
            />
          </motion.div>
        );
      })}

      {/* Count badge for remaining tokens */}
      <AnimatePresence>
        {remainingCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              +{remainingCount}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total count badge */}
      <motion.div
        className="absolute -bottom-1 -right-1 z-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <div className="bg-white/90 text-gray-900 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-gray-200">
          {tokens.length}
        </div>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TOKEN GROUP COMPONENT - For home base display
// ═══════════════════════════════════════════════════════════════

interface TokenGroupProps {
  tokens: TokenType[];
  color: PlayerColor;
  selectableTokenIds: string[];
  selectedTokenId: string | null;
  onTokenClick: (tokenId: string) => void;
  colorblindMode?: boolean;
  layout?: 'grid' | 'row';
}

export const TokenGroup = ({
  tokens,
  color,
  selectableTokenIds,
  selectedTokenId,
  onTokenClick,
  colorblindMode = false,
  layout = 'grid',
}: TokenGroupProps) => {
  const homeTokens = tokens.filter((t) => t.state === 'home');

  if (layout === 'row') {
    return (
      <div className="flex items-center gap-2">
        {homeTokens.map((token, index) => (
          <motion.div
            key={token.id}
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
          >
            <Token
              token={token}
              isSelectable={selectableTokenIds.includes(token.id)}
              isSelected={selectedTokenId === token.id}
              onClick={() => onTokenClick(token.id)}
              size="lg"
              colorblindMode={colorblindMode}
            />
          </motion.div>
        ))}
        {homeTokens.length === 0 && (
          <div className="text-white/30 text-sm italic">No tokens in home</div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((slotIndex) => {
        const token = homeTokens.find((t) =>
          parseInt(t.id.split('-').pop() || '0') === slotIndex
        );

        return (
          <motion.div
            key={slotIndex}
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center',
              'border-2 border-dashed transition-all duration-200',
              token
                ? 'border-transparent bg-transparent'
                : 'border-white/20 bg-white/5',
            )}
            whileHover={token ? { scale: 1.05 } : {}}
          >
            {token ? (
              <Token
                token={token}
                isSelectable={selectableTokenIds.includes(token.id)}
                isSelected={selectedTokenId === token.id}
                onClick={() => onTokenClick(token.id)}
                size="lg"
                colorblindMode={colorblindMode}
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-white/10" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default Token;