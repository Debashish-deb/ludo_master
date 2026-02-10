import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerColor, Token as TokenType } from '@/types/game';
import { Token } from './Token';

interface HomeBaseProps {
  color: PlayerColor;
  tokens: TokenType[];
  selectableTokenIds: string[];
  selectedTokenId: string | null;
  onTokenClick: (tokenId: string) => void;
}

const baseColors: Record<PlayerColor, {
  bg: string;
  border: string;
  inner: string;
  slot: string;
}> = {
  red: {
    bg: 'bg-red-500/25',
    border: 'border-red-500/40',
    inner: 'bg-red-500/10',
    slot: 'border-red-400/30 bg-red-500/5',
  },
  green: {
    bg: 'bg-green-500/25',
    border: 'border-green-500/40',
    inner: 'bg-green-500/10',
    slot: 'border-green-400/30 bg-green-500/5',
  },
  yellow: {
    bg: 'bg-yellow-500/25',
    border: 'border-yellow-500/40',
    inner: 'bg-yellow-500/10',
    slot: 'border-yellow-400/30 bg-yellow-500/5',
  },
  blue: {
    bg: 'bg-blue-500/25',
    border: 'border-blue-500/40',
    inner: 'bg-blue-500/10',
    slot: 'border-blue-400/30 bg-blue-500/5',
  },
};

export const HomeBase = ({
  color,
  tokens,
  selectableTokenIds,
  selectedTokenId,
  onTokenClick,
}: HomeBaseProps) => {
  const colors = baseColors[color];
  const homeTokens = tokens.filter(t => t.state === 'home');

  return (
    <motion.div
      className={cn(
        'w-full h-full rounded-2xl p-2',
        colors.bg,
        'border-2',
        colors.border,
        'shadow-inner'
      )}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          'w-full h-full rounded-xl flex items-center justify-center',
          colors.inner,
          'border',
          colors.border
        )}
      >
        <div className="grid grid-cols-2 gap-2 p-2">
          {[0, 1, 2, 3].map((index) => {
            const token = homeTokens.find(
              (t) => t.id === `${color}-${index}`
            );

            return (
              <div
                key={index}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'border-2 border-dashed',
                  colors.slot
                )}
              >
                {token && (
                  <Token
                    token={token}
                    isSelectable={selectableTokenIds.includes(token.id)}
                    isSelected={selectedTokenId === token.id}
                    onClick={() => onTokenClick(token.id)}
                    size="lg"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
