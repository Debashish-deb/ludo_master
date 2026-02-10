import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerColor, Token as TokenType } from '@/types/game';

interface TokenProps {
  token: TokenType;
  isSelectable: boolean;
  isSelected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  showIndex?: boolean;
}

const tokenGradients: Record<PlayerColor, string> = {
  red: 'from-red-400 via-red-500 to-red-700',
  green: 'from-green-400 via-green-500 to-green-700',
  yellow: 'from-yellow-300 via-yellow-400 to-yellow-600',
  blue: 'from-blue-400 via-blue-500 to-blue-700',
};

const tokenShadowColors: Record<PlayerColor, string> = {
  red: '0 4px 0 #991b1b, 0 6px 8px rgba(0,0,0,0.4)',
  green: '0 4px 0 #166534, 0 6px 8px rgba(0,0,0,0.4)',
  yellow: '0 4px 0 #a16207, 0 6px 8px rgba(0,0,0,0.4)',
  blue: '0 4px 0 #1e40af, 0 6px 8px rgba(0,0,0,0.4)',
};

const tokenGlowColors: Record<PlayerColor, string> = {
  red: '0 0 14px rgba(255,71,87,0.7)',
  green: '0 0 14px rgba(46,213,115,0.7)',
  yellow: '0 0 14px rgba(255,165,2,0.7)',
  blue: '0 0 14px rgba(30,144,255,0.7)',
};

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
};

export const Token = ({
  token,
  isSelectable,
  isSelected,
  onClick,
  size = 'md',
  showIndex = false,
}: TokenProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={!isSelectable}
      className={cn(
        'relative rounded-full game-element touch-target',
        `bg-gradient-to-br ${tokenGradients[token.color]}`,
        'border-2 border-white/30',
        sizeClasses[size],
        'transition-all duration-200',
        isSelectable && 'cursor-pointer',
        !isSelectable && 'cursor-default',
      )}
      style={{
        boxShadow: isSelected
          ? `${tokenShadowColors[token.color]}, ${tokenGlowColors[token.color]}`
          : tokenShadowColors[token.color],
      }}
      whileHover={isSelectable ? { scale: 1.15, y: -3 } : {}}
      whileTap={isSelectable ? { scale: 0.9, y: 0 } : {}}
      animate={
        isSelectable
          ? { scale: [1, 1.12, 1], y: [0, -3, 0] }
          : isSelected
            ? { scale: 1.15 }
            : { scale: 1 }
      }
      transition={
        isSelectable
          ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
          : { duration: 0.2 }
      }
      layout
    >
      {/* Glossy highlight */}
      <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/50 via-white/10 to-transparent pointer-events-none" />

      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 w-[35%] h-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 pointer-events-none" />

      {/* Token index */}
      {showIndex && (
        <span className="absolute -bottom-1 -right-1 text-[8px] bg-white text-black rounded-full w-3 h-3 flex items-center justify-center font-bold shadow-sm">
          {token.id.split('-').pop()}
        </span>
      )}
    </motion.button>
  );
};

// Stacked tokens display for when multiple tokens are on the same cell
interface StackedTokensProps {
  tokens: TokenType[];
  selectableTokenIds: string[];
  selectedTokenId: string | null;
  onTokenClick: (tokenId: string) => void;
}

export const StackedTokens = ({
  tokens,
  selectableTokenIds,
  selectedTokenId,
  onTokenClick,
}: StackedTokensProps) => {
  if (tokens.length === 0) return null;

  if (tokens.length === 1) {
    return (
      <Token
        token={tokens[0]}
        isSelectable={selectableTokenIds.includes(tokens[0].id)}
        isSelected={selectedTokenId === tokens[0].id}
        onClick={() => onTokenClick(tokens[0].id)}
        size="md"
      />
    );
  }

  // Stack multiple tokens with slight offset
  return (
    <div className="relative w-8 h-8">
      {tokens.map((token, index) => (
        <motion.div
          key={token.id}
          className="absolute"
          style={{
            top: index * -3,
            left: index * 3,
            zIndex: index,
          }}
        >
          <Token
            token={token}
            isSelectable={selectableTokenIds.includes(token.id)}
            isSelected={selectedTokenId === token.id}
            onClick={() => onTokenClick(token.id)}
            size="sm"
          />
        </motion.div>
      ))}
      {/* Count badge */}
      <div className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md z-20 border border-gray-300">
        {tokens.length}
      </div>
    </div>
  );
};
