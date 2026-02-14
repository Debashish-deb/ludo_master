import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Player, PlayerColor, Token } from '@/types/game';
import {
  TOKENS_PER_PLAYER,
  TOTAL_PATH_LENGTH,
  HOME_STRETCH_LENGTH,
  SAFE_POSITIONS,
  START_POSITIONS,
  HOME_STRETCH_ENTRY,
  MAX_CONSECUTIVE_SIXES,
} from '@/types/game';

type GameMode = 'single' | 'local';
type AIDifficulty = 'medium' | 'hard' | 'expert';

export interface GameConfig {
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
    position: -1,
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
    aiDifficulty:
      config.mode === 'single' && color !== config.humanPlayerColor
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
    consecutiveSixes: 0,
    lastCaptureEvent: null,
    lastFinishEvent: null,
  };
};

// ─── PERSISTENCE HELPERS ────────────────────────────────────────────
const SAVE_KEY = 'ludo_saved_game';

const saveGame = (state: GameState, config: GameConfig) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ state, config, ts: Date.now() }));
  } catch { /* quota exceeded, silently ignore */ }
};

export const loadSavedGame = (): { state: GameState; config: GameConfig } | null => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Reject saves older than 24 hours
    if (Date.now() - data.ts > 86_400_000) {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return { state: data.state, config: data.config };
  } catch {
    return null;
  }
};

export const clearSavedGame = () => {
  localStorage.removeItem(SAVE_KEY);
};

// ─── HELPERS ────────────────────────────────────────────────────────

/** Absolute board position for a token on the main path */
const getAbsolutePosition = (token: Token, playerColor: PlayerColor): number => {
  if (token.position < 0 || token.position >= TOTAL_PATH_LENGTH) return -1;
  return (START_POSITIONS[playerColor] + token.position) % TOTAL_PATH_LENGTH;
};

/** Check if a main-path position is safe */
const isSafePosition = (position: number): boolean =>
  SAFE_POSITIONS.includes(position % TOTAL_PATH_LENGTH);

/**
 * Check if 2+ tokens of the SAME color occupy a position — this is a BLOCK.
 * Blocks cannot be captured and opponents cannot pass them.
 */
const isBlockAtPosition = (
  absolutePos: number,
  players: Player[],
  excludeColor?: PlayerColor,
): { blocked: boolean; blockColor: PlayerColor | null } => {
  for (const player of players) {
    if (excludeColor && player.color === excludeColor) continue;
    const count = player.tokens.filter((t) => {
      if (t.state !== 'active' || t.position >= TOTAL_PATH_LENGTH) return false;
      const abs = getAbsolutePosition(t, player.color);
      return abs === absolutePos;
    }).length;
    if (count >= 2) return { blocked: true, blockColor: player.color };
  }
  return { blocked: false, blockColor: null };
};

/**
 * Check if travel path from `fromRel` to `fromRel + steps` on the main path
 * is blocked by an opponent block.
 */
const isPathBlocked = (
  fromRelative: number,
  steps: number,
  playerColor: PlayerColor,
  players: Player[],
): boolean => {
  for (let i = 1; i <= steps; i++) {
    const relPos = fromRelative + i;
    // Only check main path (positions < 52)
    if (relPos >= TOTAL_PATH_LENGTH) break;
    const absPos = (START_POSITIONS[playerColor] + relPos) % TOTAL_PATH_LENGTH;
    const { blocked, blockColor } = isBlockAtPosition(absPos, players);
    if (blocked && blockColor !== playerColor) return true;
  }
  return false;
};

// ─── HOOK ───────────────────────────────────────────────────────────

export const useGameState = (config: GameConfig, restoredState?: GameState) => {
  const [gameState, setGameState] = useState<GameState>(
    () => restoredState ?? createInitialState(config),
  );

  // Persist every state change
  const persistRef = useRef(config);
  persistRef.current = config;
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      saveGame(gameState, persistRef.current);
    } else if (gameState.gameStatus === 'finished') {
      clearSavedGame();
    }
  }, [gameState]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // ─── CAN TOKEN MOVE ──────────────────────────────────────────────

  const canTokenMove = useCallback(
    (token: Token, diceValue: number, playerColor: PlayerColor): boolean => {
      if (token.state === 'finished') return false;

      // Token in home — needs 6 to come out
      if (token.state === 'home') {
        if (diceValue !== 6) return false;
        // Check if start cell is blocked by opponent block
        const startAbs = START_POSITIONS[playerColor];
        const { blocked, blockColor } = isBlockAtPosition(
          startAbs,
          gameState.players,
          playerColor,
        );
        if (blocked && blockColor !== playerColor) return false;
        return true;
      }

      // Active token
      const newPosition = token.position + diceValue;

      // If entirely on main path and would stay on main path, check for blocks
      if (token.position < TOTAL_PATH_LENGTH && newPosition < TOTAL_PATH_LENGTH) {
        if (isPathBlocked(token.position, diceValue, playerColor, gameState.players))
          return false;
        // Also check destination for opponent block
        const destAbs = (START_POSITIONS[playerColor] + newPosition) % TOTAL_PATH_LENGTH;
        const { blocked, blockColor } = isBlockAtPosition(
          destAbs,
          gameState.players,
          playerColor,
        );
        if (blocked && blockColor !== playerColor) return false;
      }

      // Entering or inside home stretch
      if (newPosition >= TOTAL_PATH_LENGTH) {
        const homeStretchPos = newPosition - TOTAL_PATH_LENGTH;
        // EXACT match needed to finish (position 6 = finished)
        if (homeStretchPos > HOME_STRETCH_LENGTH) return false;
        return true;
      }

      return true;
    },
    [gameState.players],
  );

  // ─── MOVABLE TOKENS ──────────────────────────────────────────────

  const getMovableTokens = useCallback((): Token[] => {
    if (!gameState.diceValue) return [];
    return currentPlayer.tokens.filter((token) =>
      canTokenMove(token, gameState.diceValue!, currentPlayer.color),
    );
  }, [gameState.diceValue, currentPlayer, canTokenMove]);

  // ─── CAPTURABLE TOKENS ───────────────────────────────────────────

  const getCapturableTokens = useCallback(
    (absolutePosition: number, attackerColor: PlayerColor): Token[] => {
      if (isSafePosition(absolutePosition)) return [];

      // If destination has an opponent BLOCK (2+ tokens), cannot capture
      const { blocked, blockColor } = isBlockAtPosition(
        absolutePosition,
        gameState.players,
        attackerColor,
      );
      if (blocked && blockColor !== attackerColor) return [];

      const capturableTokens: Token[] = [];
      gameState.players.forEach((player) => {
        if (player.color === attackerColor) return;
        player.tokens.forEach((token) => {
          if (token.state !== 'active' || token.position >= TOTAL_PATH_LENGTH) return;
          if (getAbsolutePosition(token, player.color) === absolutePosition) {
            capturableTokens.push(token);
          }
        });
      });
      return capturableTokens;
    },
    [gameState.players],
  );

  // ─── ROLL DICE ────────────────────────────────────────────────────

  const rollDice = useCallback(() => {
    if (gameState.isRolling || gameState.gameStatus !== 'playing') return;

    setGameState((prev) => ({ ...prev, isRolling: true, lastCaptureEvent: null, lastFinishEvent: null }));

    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;

      setGameState((prev) => {
        const newSixes = value === 6 ? prev.consecutiveSixes + 1 : 0;

        // ─── TRIPLE-6 PENALTY ──────────────────────────────────────
        if (newSixes >= MAX_CONSECUTIVE_SIXES) {
          // Penalty: lose turn, send last active token back home
          const player = prev.players[prev.currentPlayerIndex];
          const newPlayers = [...prev.players];
          const updatedPlayer = { ...player, tokens: [...player.tokens] };

          // Find the last token that was active (furthest on board)
          const activeTokens = updatedPlayer.tokens
            .filter((t) => t.state === 'active')
            .sort((a, b) => b.position - a.position);

          if (activeTokens.length > 0) {
            const victimIdx = updatedPlayer.tokens.findIndex(
              (t) => t.id === activeTokens[0].id,
            );
            updatedPlayer.tokens[victimIdx] = {
              ...updatedPlayer.tokens[victimIdx],
              state: 'home',
              position: -1,
            };
          }
          newPlayers[prev.currentPlayerIndex] = updatedPlayer;

          // Advance to next player
          let next = (prev.currentPlayerIndex + 1) % newPlayers.length;
          while (
            newPlayers[next].finishedTokens === TOKENS_PER_PLAYER &&
            next !== prev.currentPlayerIndex
          ) {
            next = (next + 1) % newPlayers.length;
          }

          return {
            ...prev,
            players: newPlayers,
            diceValue: value,
            isRolling: false,
            canRollAgain: false,
            consecutiveSixes: 0,
            currentPlayerIndex: next,
            turnCount: prev.turnCount + 1,
          };
        }

        return {
          ...prev,
          diceValue: value,
          isRolling: false,
          canRollAgain: value === 6,
          consecutiveSixes: newSixes,
        };
      });
    }, 600);
  }, [gameState.isRolling, gameState.gameStatus]);

  // ─── MOVE TOKEN ───────────────────────────────────────────────────

  const moveToken = useCallback(
    (tokenId: string) => {
      if (!gameState.diceValue) return;

      const token = currentPlayer.tokens.find((t) => t.id === tokenId);
      if (!token || !canTokenMove(token, gameState.diceValue, currentPlayer.color)) return;

      setGameState((prev) => {
        const newPlayers = [...prev.players];
        const playerIndex = prev.currentPlayerIndex;
        const player = { ...newPlayers[playerIndex] };
        const tokenIndex = player.tokens.findIndex((t) => t.id === tokenId);
        const updatedToken = { ...player.tokens[tokenIndex] };

        let captured = false;
        let captureEvent: GameState['lastCaptureEvent'] = null;
        let finishEvent: GameState['lastFinishEvent'] = null;

        // ── Move token ──────────────────────────────────────────────
        if (updatedToken.state === 'home' && prev.diceValue === 6) {
          updatedToken.state = 'active';
          updatedToken.position = 0;
        } else if (updatedToken.state === 'active') {
          const newPosition = updatedToken.position + prev.diceValue!;

          if (newPosition >= TOTAL_PATH_LENGTH + HOME_STRETCH_LENGTH) {
            // EXACT finish — already validated by canTokenMove
            updatedToken.state = 'finished';
            updatedToken.position = TOTAL_PATH_LENGTH + HOME_STRETCH_LENGTH;
            player.finishedTokens += 1;
            finishEvent = { color: player.color, tokenId };
          } else {
            updatedToken.position = newPosition;
          }
        }

        // ── Capture check (main path only) ──────────────────────────
        if (
          updatedToken.state === 'active' &&
          updatedToken.position < TOTAL_PATH_LENGTH
        ) {
          const absolutePos = getAbsolutePosition(updatedToken, player.color);
          const capturableTokens = getCapturableTokens(absolutePos, player.color);

          if (capturableTokens.length > 0) {
            captured = true;
            captureEvent = {
              attackerColor: player.color,
              victimColor: capturableTokens[0].color,
              position: absolutePos,
            };

            capturableTokens.forEach((capturedToken) => {
              const cpIdx = newPlayers.findIndex((p) => p.color === capturedToken.color);
              if (cpIdx >= 0) {
                const cp = { ...newPlayers[cpIdx], tokens: [...newPlayers[cpIdx].tokens] };
                const ctIdx = cp.tokens.findIndex((t) => t.id === capturedToken.id);
                if (ctIdx >= 0) {
                  cp.tokens[ctIdx] = { ...cp.tokens[ctIdx], state: 'home', position: -1 };
                  newPlayers[cpIdx] = cp;
                }
              }
            });
          }
        }

        // ── Update token ────────────────────────────────────────────
        player.tokens = [...player.tokens];
        player.tokens[tokenIndex] = updatedToken;
        newPlayers[playerIndex] = player;

        // ── Win check ───────────────────────────────────────────────
        const hasWon = player.finishedTokens === TOKENS_PER_PLAYER;
        let newRankings = [...prev.rankings];
        let newWinner = prev.winner;
        let newGameStatus = prev.gameStatus;

        if (hasWon && !newRankings.find((p) => p.id === player.id)) {
          newRankings = [...newRankings, player];
          if (newRankings.length === 1) newWinner = player;
          if (newRankings.length >= newPlayers.length - 1) newGameStatus = 'finished';
        }

        // ── Next turn logic ─────────────────────────────────────────
        const finishedThisTurn =
          updatedToken.state === 'finished' &&
          player.tokens.filter((t) => t.state === 'finished').length >
          prev.players[playerIndex].tokens.filter((t) => t.state === 'finished').length;

        const getAnotherTurn = prev.diceValue === 6 || captured || finishedThisTurn;

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
          diceValue: null,
          canRollAgain: false,
          selectedTokenId: null,
          gameStatus: newGameStatus,
          winner: newWinner,
          rankings: newRankings,
          turnCount: prev.turnCount + 1,
          consecutiveSixes: getAnotherTurn ? prev.consecutiveSixes : 0,
          lastCaptureEvent: captureEvent,
          lastFinishEvent: finishEvent,
        };
      });
    },
    [gameState.diceValue, currentPlayer, canTokenMove, getCapturableTokens],
  );

  // ─── START / RESET ────────────────────────────────────────────────

  const startGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, gameStatus: 'playing' }));
  }, []);

  const resetGame = useCallback(() => {
    clearSavedGame();
    setGameState(createInitialState(config));
  }, [config]);

  // ─── AUTO-SELECT / SKIP TURN ──────────────────────────────────────

  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !gameState.diceValue || gameState.isRolling)
      return;

    const movableTokens = getMovableTokens();

    if (movableTokens.length === 0) {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          let next = (prev.currentPlayerIndex + 1) % prev.players.length;
          while (
            prev.players[next].finishedTokens === TOKENS_PER_PLAYER &&
            next !== prev.currentPlayerIndex
          ) {
            next = (next + 1) % prev.players.length;
          }
          return {
            ...prev,
            currentPlayerIndex: next,
            diceValue: null,
            canRollAgain: false,
            consecutiveSixes: 0,
            turnCount: prev.turnCount + 1,
          };
        });
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (movableTokens.length === 1) {
      setGameState((prev) => ({ ...prev, selectedTokenId: movableTokens[0].id }));
    }
  }, [gameState.diceValue, gameState.isRolling, gameState.gameStatus, getMovableTokens]);

  // ─── AI TURN ──────────────────────────────────────────────────────

  useEffect(() => {
    if (
      gameState.gameStatus !== 'playing' ||
      !currentPlayer.isAI ||
      gameState.isRolling
    )
      return;

    if (!gameState.diceValue) {
      // AI thinking delay scales with difficulty
      const delay =
        currentPlayer.aiDifficulty === 'expert'
          ? 1200
          : currentPlayer.aiDifficulty === 'hard'
            ? 1000
            : 800;
      const timer = setTimeout(() => rollDice(), delay);
      return () => clearTimeout(timer);
    }

    const movableTokens = getMovableTokens();
    if (movableTokens.length > 0) {
      const moveDelay =
        currentPlayer.aiDifficulty === 'expert'
          ? 1500
          : currentPlayer.aiDifficulty === 'hard'
            ? 1000
            : 700;

      const timer = setTimeout(() => {
        const selectedToken = selectAIToken(
          movableTokens,
          currentPlayer.aiDifficulty || 'medium',
          gameState,
        );
        moveToken(selectedToken.id);
      }, moveDelay);
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
    canRoll:
      gameState.gameStatus === 'playing' &&
      !gameState.diceValue &&
      !gameState.isRolling &&
      !currentPlayer.isAI,
  };
};

// ─── IMPROVED AI ────────────────────────────────────────────────────

function selectAIToken(
  movableTokens: Token[],
  difficulty: AIDifficulty,
  gameState: GameState,
): Token {
  if (movableTokens.length === 1) return movableTokens[0];

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const diceValue = gameState.diceValue || 0;

  const scoredTokens = movableTokens.map((token) => {
    let score = 0;

    // ── Bringing a token out from home (on a 6) ─────────────────
    if (token.state === 'home') {
      score += 15; // It's generally good to get pieces out
      // Expert: check if start position is risky
      if (difficulty === 'expert') {
        const startAbs = START_POSITIONS[currentPlayer.color];
        // Check if near opponent tokens
        for (const opp of gameState.players) {
          if (opp.color === currentPlayer.color) continue;
          for (const ot of opp.tokens) {
            if (ot.state !== 'active' || ot.position >= TOTAL_PATH_LENGTH) continue;
            const oppAbs = getAbsolutePosition(ot, opp.color);
            const dist = (startAbs - oppAbs + TOTAL_PATH_LENGTH) % TOTAL_PATH_LENGTH;
            if (dist <= 6) score -= 20; // Risky — opponent can reach
          }
        }
      }
      return { token, score };
    }

    // ── Active token scoring ────────────────────────────────────
    const newPos = token.position + diceValue;
    const newAbsPos =
      newPos < TOTAL_PATH_LENGTH
        ? (START_POSITIONS[currentPlayer.color] + newPos) % TOTAL_PATH_LENGTH
        : -1;

    // CAPTURE opportunity — highest priority
    if (newAbsPos >= 0 && !isSafePosition(newAbsPos)) {
      for (const opp of gameState.players) {
        if (opp.color === currentPlayer.color) continue;
        for (const ot of opp.tokens) {
          if (ot.state !== 'active' || ot.position >= TOTAL_PATH_LENGTH) continue;
          if (getAbsolutePosition(ot, opp.color) === newAbsPos) {
            score += difficulty === 'medium' ? 30 : 60; // Big reward for capture
          }
        }
      }
    }

    // Landing on safe position
    if (newAbsPos >= 0 && isSafePosition(newAbsPos)) {
      score += 20;
    }

    // Entering home stretch — very valuable
    if (newPos >= TOTAL_PATH_LENGTH && token.position < TOTAL_PATH_LENGTH) {
      score += 40;
    }

    // Finishing — highest value
    if (newPos >= TOTAL_PATH_LENGTH + HOME_STRETCH_LENGTH) {
      score += 100;
    }

    // Progress bonus — tokens further along are more valuable to advance
    score += token.position * 0.5;

    // Block formation — landing on a cell with own token
    if (newAbsPos >= 0) {
      const ownCount = currentPlayer.tokens.filter((t) => {
        if (t.id === token.id || t.state !== 'active' || t.position >= TOTAL_PATH_LENGTH)
          return false;
        return getAbsolutePosition(t, currentPlayer.color) === newAbsPos;
      }).length;
      if (ownCount >= 1) score += 25; // Forming a block
    }

    // Risk assessment — check if destination is reachable by opponent
    if (difficulty !== 'medium' && newAbsPos >= 0 && !isSafePosition(newAbsPos)) {
      for (const opp of gameState.players) {
        if (opp.color === currentPlayer.color) continue;
        for (const ot of opp.tokens) {
          if (ot.state !== 'active' || ot.position >= TOTAL_PATH_LENGTH) continue;
          const oppAbs = getAbsolutePosition(ot, opp.color);
          const dist = (newAbsPos - oppAbs + TOTAL_PATH_LENGTH) % TOTAL_PATH_LENGTH;
          if (dist <= 6) {
            score -= difficulty === 'expert' ? 35 : 15;
          }
        }
      }
    }

    // Escape — if current position is risky, moving away is good
    if (difficulty !== 'medium') {
      const curAbsPos = getAbsolutePosition(token, currentPlayer.color);
      if (curAbsPos >= 0 && !isSafePosition(curAbsPos)) {
        for (const opp of gameState.players) {
          if (opp.color === currentPlayer.color) continue;
          for (const ot of opp.tokens) {
            if (ot.state !== 'active' || ot.position >= TOTAL_PATH_LENGTH) continue;
            const oppAbs = getAbsolutePosition(ot, opp.color);
            const dist = (curAbsPos - oppAbs + TOTAL_PATH_LENGTH) % TOTAL_PATH_LENGTH;
            if (dist <= 6) score += 10; // Escaping danger
          }
        }
      }
    }

    return { token, score };
  });

  scoredTokens.sort((a, b) => b.score - a.score);

  // Randomness based on difficulty
  const randomFactor =
    difficulty === 'medium' ? 0.4 : difficulty === 'hard' ? 0.15 : 0.05;
  if (Math.random() < randomFactor && scoredTokens.length > 1) {
    return scoredTokens[1].token;
  }

  return scoredTokens[0].token;
}
