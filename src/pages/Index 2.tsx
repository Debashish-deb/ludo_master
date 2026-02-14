import { useState, useEffect } from 'react';
import { GameSetup } from '@/components/game/GameSetup';
import { GameScreen } from '@/components/game/GameScreen';
import type { PlayerColor, GameState } from '@/types/game';
import { loadSavedGame, clearSavedGame } from '@/hooks/useGameState';
import type { GameConfig } from '@/hooks/useGameState';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [restoredState, setRestoredState] = useState<GameState | undefined>();
  const [showResume, setShowResume] = useState(false);
  const [savedData, setSavedData] = useState<{ state: GameState; config: GameConfig } | null>(null);

  // Check for saved game on mount
  useEffect(() => {
    const saved = loadSavedGame();
    if (saved && saved.state.gameStatus === 'playing') {
      setSavedData(saved);
      setShowResume(true);
    }
  }, []);

  const handleStartGame = (config: GameConfig) => {
    clearSavedGame();
    setRestoredState(undefined);
    setGameConfig(config);
  };

  const handleResumeGame = () => {
    if (savedData) {
      setGameConfig(savedData.config);
      setRestoredState(savedData.state);
      setShowResume(false);
    }
  };

  const handleDeclineResume = () => {
    clearSavedGame();
    setShowResume(false);
    setSavedData(null);
  };

  const handleExitGame = () => {
    setGameConfig(null);
    setRestoredState(undefined);
  };

  // Resume prompt
  if (showResume && savedData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center space-y-4 max-w-sm w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-5xl">🎮</div>
          <h2 className="text-2xl font-black text-white">Game Found!</h2>
          <p className="text-white/60 text-sm">
            You have an unfinished game.
            <br />
            Turn {savedData.state.turnCount + 1} •{' '}
            {savedData.config.mode === 'single' ? 'vs AI' : 'Local multiplayer'}
          </p>
          <div className="flex flex-col gap-2">
            <motion.button
              onClick={handleResumeGame}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white font-bold text-lg uppercase tracking-wider border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
              whileTap={{ scale: 0.97 }}
            >
              ▶ Resume Game
            </motion.button>
            <button
              onClick={handleDeclineResume}
              className="w-full h-10 rounded-xl bg-white/10 text-white/70 text-sm font-bold border border-white/10 hover:bg-white/15 transition-colors"
            >
              Start New Game
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {gameConfig ? (
        <GameScreen config={gameConfig} onExit={handleExitGame} restoredState={restoredState} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <GameSetup onStart={handleStartGame} />
        </div>
      )}
    </div>
  );
};

export default Index;
