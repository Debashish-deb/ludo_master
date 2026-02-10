import { useState } from 'react';
import { GameSetup } from '@/components/game/GameSetup';
import { GameScreen } from '@/components/game/GameScreen';
import type { PlayerColor } from '@/types/game';

interface GameConfig {
  mode: 'single' | 'local';
  playerCount: 2 | 3 | 4;
  aiDifficulty?: 'medium' | 'hard' | 'expert';
  humanPlayerColor: PlayerColor;
}

const Index = () => {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
  };

  const handleExitGame = () => {
    setGameConfig(null);
  };

  return (
    <div className="min-h-screen">
      {gameConfig ? (
        <GameScreen config={gameConfig} onExit={handleExitGame} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <GameSetup onStart={handleStartGame} />
        </div>
      )}
    </div>
  );
};

export default Index;
