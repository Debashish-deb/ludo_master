import { useState, useCallback, useEffect } from 'react';
import type { GameState, Player, PlayerColor, Token } from '@/types/game';
import {
  TOKENS_PER_PLAYER,
  TOTAL_PATH_LENGTH,
  HOME_STRETCH_LENGTH,
  SAFE_POSITIONS,
  START_POSITIONS,
  HOME_STRETCH_ENTRY,
} from '@/types/game';

type GameMode = 'single' | 'local';
type AIDifficulty = 'medium' | 'hard' | 'expert';

interface GameConfig {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  aiDifficulty?: AIDifficulty;
  humanPlayerColor: PlayerColor;
}

const PLAYER_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

// Initialize tokens for a player
const createTokens = (color: PlayerColor): Token[] => {
  return Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: `${color}-${i}`,
    color,
    position: -1, // -1 means in home base
    state: 'home' as const,
  }));
};

// Create initial game state
const createInitialState = (config: GameConfig): GameState => {
  const activePlayers = PLAYER_ORDER.slice(0, config.playerCount);
  
  const players: Player[] = activePlayers.map((color) => ({
    id: `player-${color}`,
    color,
    name: color === config.humanPlayerColor ? 'You' : `Player ${color}`,
    tokens: createTokens(color),
    isAI: config.mode === 'single' && color !== config.humanPlayerColor,
    aiDifficulty: config.mode === 'single' && color !== config.humanPlayerColor 
      ? config.aiDifficulty 
      : undefined,
    finishedTokens: 0,
  }));

  return {
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    isRolling: false,
    canRollAgain: false,
    selectedTokenId: null,
    gameStatus: 'waiting',
    winner: null,
    rankings: [],
    turnCount: 0,
  };
};

export const useGameState = (config: GameConfig) => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState(config)
  );

  // Get the current player
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Check if a position is safe
  const isSafePosition = useCallback((position: number): boolean => {
    return SAFE_POSITIONS.includes(position % TOTAL_PATH_LENGTH);
  }, []);

  // Get the absolute board position for a token
  const getAbsolutePosition = useCallback((token: Token, playerColor: PlayerColor): number => {
    if (token.position < 0) return -1;
    const startPos = START_POSITIONS[playerColor];
    return (startPos + token.position) % TOTAL_PATH_LENGTH;
  }, []);

  // Check if a token can move with the given dice value
  const canTokenMove = useCallback((token: Token, diceValue: number, playerColor: PlayerColor): boolean => {
    // Token in home - needs 6 to come out
    if (token.state === 'home') {
      return diceValue === 6;
    }

    // Token already finished
    if (token.state === 'finished') {
      return false;
    }

    // Token is active - check if it can move
    const newPosition = token.position + diceValue;
    
    // Check if entering home stretch
    const entryPoint = TOTAL_PATH_LENGTH - 1; // Relative position for home stretch entry
    if (token.position <= entryPoint && newPosition > entryPoint) {
      // Calculate home stretch position
      const homeStretchPos = newPosition - TOTAL_PATH_LENGTH;
      // Must land exactly or before the last home stretch cell
      return homeStretchPos <= HOME_STRETCH_LENGTH;
    }

    // Regular movement on main path
    if (token.position < TOTAL_PATH_LENGTH) {
      return newPosition <= TOTAL_PATH_LENGTH + HOME_STRETCH_LENGTH;
    }

    // Already in home stretch
    const finalPosition = token.position + diceValue;
    return finalPosition <= TOTAL_PATH_LENGTH + HOME_STRETCH_LENGTH;
  }, []);

  // Get all movable tokens for current player
  const getMovableTokens = useCallback((): Token[] => {
    if (!gameState.diceValue) return [];
    
    return currentPlayer.tokens.filter((token) =>
      canTokenMove(token, gameState.diceValue!, currentPlayer.color)
    );
  }, [gameState.diceValue, currentPlayer, canTokenMove]);

  // Check if there are any opponent tokens at a position that can be captured
  const getCapturableTokens = useCallback((absolutePosition: number, attackerColor: PlayerColor): Token[] => {
    // Can't capture on safe positions
    if (isSafePosition(absolutePosition)) return [];

    const capturableTokens: Token[] = [];
    
    gameState.players.forEach((player) => {
      if (player.color === attackerColor) return;
      
      player.tokens.forEach((token) => {
        if (token.state !== 'active') return;
        
        const tokenAbsPos = getAbsolutePosition(token, player.color);
        if (tokenAbsPos === absolutePosition) {
          capturableTokens.push(token);
        }
      });
    });

    return capturableTokens;
  }, [gameState.players, isSafePosition, getAbsolutePosition]);

  // Roll the dice
  const rollDice = useCallback(() => {
    if (gameState.isRolling || gameState.gameStatus !== 'playing') return;

    setGameState((prev) => ({ ...prev, isRolling: true }));

    // Simulate dice roll animation
    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      
      setGameState((prev) => ({
        ...prev,
        diceValue: value,
        isRolling: false,
        canRollAgain: value === 6,
      }));
    }, 600);
  }, [gameState.isRolling, gameState.gameStatus]);

  // Move a token
  const moveToken = useCallback((tokenId: string) => {
    if (!gameState.diceValue) return;

    const token = currentPlayer.tokens.find((t) => t.id === tokenId);
    if (!token || !canTokenMove(token, gameState.diceValue, currentPlayer.color)) return;

    setGameState((prev) => {
      const newPlayers = [...prev.players];
      const playerIndex = prev.currentPlayerIndex;
      const player = { ...newPlayers[playerIndex] };
      const tokenIndex = player.tokens.findIndex((t) => t.id === tokenId);
      const updatedToken = { ...player.tokens[tokenIndex] };

      // Handle token coming out of home
      if (updatedToken.state === 'home' && prev.diceValue === 6) {
        updatedToken.state = 'active';
        updatedToken.position = 0;
      }
      // Handle regular movement
      else if (updatedToken.state === 'active') {
        const newPosition = updatedToken.position + prev.diceValue!;
        
        // Check if token reached home
        if (newPosition >= TOTAL_PATH_LENGTH + HOME_STRETCH_LENGTH) {
          updatedToken.state = 'finished';
          updatedToken.position = TOTAL_PATH_LENGTH + HOME_STRETCH_LENGTH;
          player.finishedTokens += 1;
        } else {
          updatedToken.position = newPosition;
        }
      }

      // Check for captures (only on main path, not in home stretch)
      let captured = false;
      if (updatedToken.state === 'active' && updatedToken.position < TOTAL_PATH_LENGTH) {
        const absolutePos = getAbsolutePosition(updatedToken, player.color);
        const capturableTokens = getCapturableTokens(absolutePos, player.color);
        
        if (capturableTokens.length > 0) {
          captured = true;
          // Send captured tokens back to home
          capturableTokens.forEach((capturedToken) => {
            const capturedPlayerIndex = newPlayers.findIndex(
              (p) => p.color === capturedToken.color
            );
            if (capturedPlayerIndex >= 0) {
              const capturedPlayer = { ...newPlayers[capturedPlayerIndex] };
              const capturedTokenIndex = capturedPlayer.tokens.findIndex(
                (t) => t.id === capturedToken.id
              );
              if (capturedTokenIndex >= 0) {
                capturedPlayer.tokens = [...capturedPlayer.tokens];
                capturedPlayer.tokens[capturedTokenIndex] = {
                  ...capturedPlayer.tokens[capturedTokenIndex],
                  state: 'home',
                  position: -1,
                };
                newPlayers[capturedPlayerIndex] = capturedPlayer;
              }
            }
          });
        }
      }

      // Update the token
      player.tokens = [...player.tokens];
      player.tokens[tokenIndex] = updatedToken;
      newPlayers[playerIndex] = player;

      // Check for win condition
      const hasWon = player.finishedTokens === TOKENS_PER_PLAYER;
      let newRankings = [...prev.rankings];
      let newWinner = prev.winner;
      let newGameStatus = prev.gameStatus;

      if (hasWon && !newRankings.find((p) => p.id === player.id)) {
        newRankings = [...newRankings, player];
        
        if (newRankings.length === 1) {
          newWinner = player;
        }
        
        // Game ends when all but one player has finished
        if (newRankings.length >= newPlayers.length - 1) {
          newGameStatus = 'finished';
        }
      }

      // Determine next turn
      // Player gets another turn if: rolled 6, captured a token, or finished a token
      const finishedThisTurn = updatedToken.state === 'finished' && 
        player.tokens.filter((t) => t.state === 'finished').length > 
        prev.players[playerIndex].tokens.filter((t) => t.state === 'finished').length;
      
      const getAnotherTurn = prev.diceValue === 6 || captured || finishedThisTurn;
      
      // Find next player (skip finished players)
      let nextPlayerIndex = prev.currentPlayerIndex;
      if (!getAnotherTurn) {
        do {
          nextPlayerIndex = (nextPlayerIndex + 1) % newPlayers.length;
        } while (
          newPlayers[nextPlayerIndex].finishedTokens === TOKENS_PER_PLAYER &&
          nextPlayerIndex !== prev.currentPlayerIndex
        );
      }

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: getAnotherTurn ? null : null,
        canRollAgain: false,
        selectedTokenId: null,
        gameStatus: newGameStatus,
        winner: newWinner,
        rankings: newRankings,
        turnCount: prev.turnCount + 1,
      };
    });
  }, [gameState.diceValue, currentPlayer, canTokenMove, getAbsolutePosition, getCapturableTokens]);

  // Start the game
  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameStatus: 'playing',
    }));
  }, []);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(createInitialState(config));
  }, [config]);

  // Auto-select token if only one can move
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !gameState.diceValue || gameState.isRolling) return;
    
    const movableTokens = getMovableTokens();
    
    // If no tokens can move, skip turn after a delay
    if (movableTokens.length === 0) {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          let nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
          // Skip finished players
          while (
            prev.players[nextPlayerIndex].finishedTokens === TOKENS_PER_PLAYER &&
            nextPlayerIndex !== prev.currentPlayerIndex
          ) {
            nextPlayerIndex = (nextPlayerIndex + 1) % prev.players.length;
          }
          
          return {
            ...prev,
            currentPlayerIndex: nextPlayerIndex,
            diceValue: null,
            canRollAgain: false,
            turnCount: prev.turnCount + 1,
          };
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Auto-select if only one token can move
    if (movableTokens.length === 1) {
      setGameState((prev) => ({
        ...prev,
        selectedTokenId: movableTokens[0].id,
      }));
    }
  }, [gameState.diceValue, gameState.isRolling, gameState.gameStatus, getMovableTokens]);

  // AI turn handling
  useEffect(() => {
    if (
      gameState.gameStatus !== 'playing' ||
      !currentPlayer.isAI ||
      gameState.isRolling
    ) {
      return;
    }

    // AI rolls dice
    if (!gameState.diceValue) {
      const timer = setTimeout(() => {
        rollDice();
      }, 800);
      return () => clearTimeout(timer);
    }

    // AI selects and moves token
    const movableTokens = getMovableTokens();
    if (movableTokens.length > 0) {
      const timer = setTimeout(() => {
        // Simple AI: pick the best token based on difficulty
        const selectedToken = selectAIToken(
          movableTokens,
          currentPlayer.aiDifficulty || 'medium',
          gameState
        );
        moveToken(selectedToken.id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    gameState.gameStatus,
    gameState.diceValue,
    gameState.isRolling,
    currentPlayer,
    rollDice,
    getMovableTokens,
    moveToken,
    gameState,
  ]);

  return {
    gameState,
    currentPlayer,
    rollDice,
    moveToken,
    startGame,
    resetGame,
    getMovableTokens,
    canRoll: gameState.gameStatus === 'playing' && 
             !gameState.diceValue && 
             !gameState.isRolling &&
             !currentPlayer.isAI,
  };
};

// AI token selection logic
function selectAIToken(
  movableTokens: Token[],
  difficulty: AIDifficulty,
  gameState: GameState
): Token {
  if (movableTokens.length === 1) {
    return movableTokens[0];
  }

  // Score each token based on various factors
  const scoredTokens = movableTokens.map((token) => {
    let score = 0;

    // Prefer tokens already on the board
    if (token.state === 'active') {
      score += 10;
    }

    // Prefer tokens closer to home
    if (token.state === 'active') {
      score += token.position;
    }

    // Hard/Expert: Prioritize captures (simplified for now)
    if (difficulty !== 'medium' && token.state === 'active') {
      score += 5;
    }

    // Expert: Avoid risky positions
    if (difficulty === 'expert' && token.state === 'home') {
      // Prefer to bring out tokens when it's safer
      score -= 5;
    }

    return { token, score };
  });

  // Sort by score and add some randomness for lower difficulties
  scoredTokens.sort((a, b) => b.score - a.score);

  // Add randomness based on difficulty
  const randomFactor = difficulty === 'medium' ? 0.4 : difficulty === 'hard' ? 0.2 : 0.1;
  if (Math.random() < randomFactor && scoredTokens.length > 1) {
    return scoredTokens[1].token;
  }

  return scoredTokens[0].token;
}
