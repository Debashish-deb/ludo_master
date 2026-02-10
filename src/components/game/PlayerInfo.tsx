import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Player, PlayerColor } from '@/types/game';

interface PlayerInfoProps {
  player: Player;
  isCurrentTurn: boolean;
  diceValue: number | null;
}

const colorBgClasses: Record<PlayerColor, string> = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-500',
};

const colorBorderClasses: Record<PlayerColor, string> = {
  red: 'border-red-400',
  green: 'border-green-400',
  yellow: 'border-yellow-400',
  blue: 'border-blue-400',
};

export const PlayerInfo = ({ player, isCurrentTurn }: PlayerInfoProps) => {
  const finishedCount = player.tokens.filter((t) => t.state === 'finished').length;
  const activeCount = player.tokens.filter((t) => t.state === 'active').length;
  const homeCount = player.tokens.filter((t) => t.state === 'home').length;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-all',
        isCurrentTurn
          ? cn(colorBorderClasses[player.color], 'bg-white/15 shadow-lg backdrop-blur-sm')
          : 'border-white/10 bg-white/5'
      )}
      animate={isCurrentTurn ? { scale: 1.03 } : { scale: 1 }}
    >
      {/* Player color indicator */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md',
          colorBgClasses[player.color]
        )}
      >
        {player.isAI ? '🤖' : player.name.charAt(0)}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-white text-sm truncate block">
          {player.name}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <span>🏠{homeCount}</span>
          <span>🎯{activeCount}</span>
          <span>🏆{finishedCount}/4</span>
        </div>
      </div>

      {/* Current turn indicator */}
      {isCurrentTurn && (
        <motion.div
          className={cn('w-2.5 h-2.5 rounded-full', colorBgClasses[player.color])}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.div>
  );
};

interface PlayersListProps {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
}

export const PlayersList = ({ players, currentPlayerIndex, diceValue }: PlayersListProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-sm">
      {players.map((player, index) => (
        <PlayerInfo
          key={player.id}
          player={player}
          isCurrentTurn={index === currentPlayerIndex}
          diceValue={index === currentPlayerIndex ? diceValue : null}
        />
      ))}
    </div>
  );
};
