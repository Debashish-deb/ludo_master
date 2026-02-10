import { cn } from '@/lib/utils';
import type { PlayerColor, Token as TokenType } from '@/types/game';
import { StackedTokens } from './Token';

interface BoardCellProps {
  isSafe: boolean;
  isStart: boolean;
  startColor?: PlayerColor;
  isHomeStretch: boolean;
  homeStretchColor?: PlayerColor;
  tokens: TokenType[];
  selectableTokenIds: string[];
  selectedTokenId: string | null;
  onTokenClick: (tokenId: string) => void;
}

const colorBgClasses: Record<PlayerColor, string> = {
  red: 'bg-red-400/30',
  green: 'bg-green-400/30',
  yellow: 'bg-yellow-300/30',
  blue: 'bg-blue-400/30',
};

const startColorClasses: Record<PlayerColor, string> = {
  red: 'bg-gradient-to-br from-red-400 to-red-600',
  green: 'bg-gradient-to-br from-green-400 to-green-600',
  yellow: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
  blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
};

const homeStretchGradients: Record<PlayerColor, string> = {
  red: 'bg-gradient-to-br from-red-200/50 to-red-300/40',
  green: 'bg-gradient-to-br from-green-200/50 to-green-300/40',
  yellow: 'bg-gradient-to-br from-yellow-200/50 to-yellow-300/40',
  blue: 'bg-gradient-to-br from-blue-200/50 to-blue-300/40',
};

export const BoardCell = ({
  isSafe,
  isStart,
  startColor,
  isHomeStretch,
  homeStretchColor,
  tokens,
  selectableTokenIds,
  selectedTokenId,
  onTokenClick,
}: BoardCellProps) => {
  const getCellBackground = () => {
    if (isStart && startColor) {
      return startColorClasses[startColor];
    }
    if (isHomeStretch && homeStretchColor) {
      return homeStretchGradients[homeStretchColor];
    }
    if (isSafe) {
      return 'bg-amber-100/80';
    }
    return 'bg-white/90';
  };

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center',
        'border border-gray-300/40 rounded-[3px]',
        'transition-colors duration-150',
        getCellBackground()
      )}
    >
      {/* Star icon for safe cells */}
      {isSafe && !isStart && tokens.length === 0 && (
        <span className="text-amber-500/70 text-[10px] drop-shadow-sm">★</span>
      )}

      {/* Arrow for start cells */}
      {isStart && tokens.length === 0 && (
        <span className="text-white/80 text-sm font-black drop-shadow-md">→</span>
      )}

      {/* Tokens on this cell */}
      {tokens.length > 0 && (
        <StackedTokens
          tokens={tokens}
          selectableTokenIds={selectableTokenIds}
          selectedTokenId={selectedTokenId}
          onTokenClick={onTokenClick}
        />
      )}
    </div>
  );
};
