import { motion, AnimatePresence } from 'framer-motion';
import { LudoBoard } from './LudoBoard';
import { Dice } from './Dice';
import { PlayersList } from './PlayerInfo';
import { useGameState } from '@/hooks/useGameState';
import type { PlayerColor } from '@/types/game';
import { Trophy, RotateCcw, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameScreenProps {
  config: {
    mode: 'single' | 'local';
    playerCount: 2 | 3 | 4;
    aiDifficulty?: 'medium' | 'hard' | 'expert';
    humanPlayerColor: PlayerColor;
  };
  onExit: () => void;
}

const playerBgColors: Record<PlayerColor, string> = {
  red: 'from-red-500/30 to-red-700/20',
  green: 'from-green-500/30 to-green-700/20',
  yellow: 'from-yellow-500/30 to-yellow-700/20',
  blue: 'from-blue-500/30 to-blue-700/20',
};

export const GameScreen = ({ config, onExit }: GameScreenProps) => {
  const {
    gameState,
    currentPlayer,
    rollDice,
    moveToken,
    startGame,
    resetGame,
    getMovableTokens,
    canRoll,
  } = useGameState(config);

  const movableTokens = getMovableTokens();
  const selectableTokenIds = movableTokens.map((t) => t.id);

  const handleTokenClick = (tokenId: string) => {
    if (selectableTokenIds.includes(tokenId)) {
      moveToken(tokenId);
    }
  };

  // Start screen
  if (gameState.gameStatus === 'waiting') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center space-y-4">
          <h1 className="text-3xl font-black text-white">Ready to Play!</h1>
          <p className="text-white/70 text-sm">
            {config.mode === 'single'
              ? `You're ${config.humanPlayerColor} vs ${config.playerCount - 1} AI`
              : `${config.playerCount} players • Pass & play`}
          </p>
          <motion.button
            onClick={startGame}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 text-white font-black text-xl uppercase tracking-wider border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
            whileTap={{ scale: 0.97 }}
          >
            🎲 Start Game
          </motion.button>
          <button
            onClick={onExit}
            className="text-white/50 text-sm hover:text-white/80 transition-colors mt-2"
          >
            ← Back to Menu
          </button>
        </div>
      </motion.div>
    );
  }

  // Win screen
  if (gameState.gameStatus === 'finished' && gameState.winner) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-4 gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotateZ: -180 }}
            animate={{ scale: 1, rotateZ: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto drop-shadow-lg" />
          </motion.div>
          <h1 className="text-4xl font-black text-white">
            {gameState.winner.name} Wins! 🎉
          </h1>
          <div className="text-white/60 text-sm space-y-1">
            <p>Completed in {gameState.turnCount} turns</p>
            {gameState.rankings.length > 1 && (
              <p>
                {gameState.rankings.map((p, i) => `${i + 1}. ${p.name}`).join(' • ')}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <motion.button
              onClick={resetGame}
              className="px-6 h-12 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white font-bold border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" /> Again
            </motion.button>
            <motion.button
              onClick={onExit}
              className="px-6 h-12 rounded-xl bg-white/10 text-white font-bold border border-white/20 active:bg-white/20 transition-all flex items-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-4 h-4" /> Menu
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Main game screen
  return (
    <div className="flex flex-col min-h-screen safe-area-inset">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <button onClick={onExit} className="text-white/70 hover:text-white transition-colors p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white/60 text-xs font-bold uppercase tracking-wider">
          Turn {gameState.turnCount + 1}
        </div>
        <button onClick={resetGame} className="text-white/70 hover:text-white transition-colors p-2">
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Turn indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer.id}
          className={cn(
            "text-center py-2 text-white font-bold text-sm bg-gradient-to-r",
            playerBgColors[currentPlayer.color]
          )}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
        >
          {currentPlayer.name}{currentPlayer.isAI ? ' 🤖' : "'s turn"}
        </motion.div>
      </AnimatePresence>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-3">
        {/* Game board */}
        <div className="flex-shrink-0 w-full flex justify-center">
          <LudoBoard
            gameState={gameState}
            selectableTokenIds={selectableTokenIds}
            onTokenClick={handleTokenClick}
          />
        </div>

        {/* Dice + instruction */}
        <div className="flex flex-col items-center gap-2">
          <Dice
            value={gameState.diceValue}
            isRolling={gameState.isRolling}
            onRoll={rollDice}
            disabled={!canRoll}
            playerColor={currentPlayer.color}
          />

          {gameState.diceValue && !currentPlayer.isAI && (
            <motion.p
              className="text-xs text-center text-white/60 bg-black/20 px-3 py-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {movableTokens.length > 0
                ? `Tap a token to move ${gameState.diceValue} spaces`
                : "No moves available"}
            </motion.p>
          )}
        </div>

        {/* Players list */}
        <PlayersList
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          diceValue={gameState.diceValue}
        />
      </main>
    </div>
  );
};
