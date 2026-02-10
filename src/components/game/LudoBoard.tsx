import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GameState, PlayerColor, Token as TokenType } from '@/types/game';
import {
  BOARD_SIZE,
  MAIN_PATH,
  HOME_STRETCH_PATHS,
  SAFE_POSITIONS,
  START_POSITIONS,
} from '@/types/game';
import { HomeBase } from './HomeBase';
import { BoardCell } from './BoardCell';
import { CenterTriangles } from './CenterTriangles';
import { StackedTokens } from './Token';

interface LudoBoardProps {
  gameState: GameState;
  selectableTokenIds: string[];
  onTokenClick: (tokenId: string) => void;
}

export const LudoBoard = ({
  gameState,
  selectableTokenIds,
  onTokenClick,
}: LudoBoardProps) => {
  // Calculate which tokens are on which board position
  const tokenPositions = useMemo(() => {
    const positions: Map<string, TokenType[]> = new Map();

    gameState.players.forEach((player) => {
      player.tokens.forEach((token) => {
        if (token.state === 'active') {
          // Main path position
          if (token.position >= 0 && token.position < 52) {
            // Convert player-relative position to absolute position
            const startPos = START_POSITIONS[player.color];
            const absolutePos = (startPos + token.position) % 52;
            const key = `main-${absolutePos}`;
            const existing = positions.get(key) || [];
            positions.set(key, [...existing, token]);
          }
          // Home stretch position
          else if (token.position >= 52 && token.position < 58) {
            const homeStretchIndex = token.position - 52;
            const key = `home-${player.color}-${homeStretchIndex}`;
            const existing = positions.get(key) || [];
            positions.set(key, [...existing, token]);
          }
        }
      });
    });

    return positions;
  }, [gameState.players]);

  // Get finished tokens for center display
  const finishedTokens = useMemo(() => {
    const finished: Record<PlayerColor, TokenType[]> = {
      red: [],
      green: [],
      yellow: [],
      blue: [],
    };

    gameState.players.forEach((player) => {
      finished[player.color] = player.tokens.filter(
        (t) => t.state === 'finished'
      );
    });

    return finished;
  }, [gameState.players]);

  // Render a single board cell
  const renderCell = (row: number, col: number) => {
    // Check if this is a home base area
    const isRedBase = row < 6 && col < 6;
    const isGreenBase = row < 6 && col > 8;
    const isYellowBase = row > 8 && col > 8;
    const isBlueBase = row > 8 && col < 6;
    const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

    // Skip home base and center cells - they're rendered separately
    if (isRedBase || isGreenBase || isYellowBase || isBlueBase || isCenter) {
      return null;
    }

    // Find if this cell is on the main path
    const mainPathIndex = MAIN_PATH.findIndex(
      (p) => p.row === row && p.col === col
    );

    // Find if this cell is on any home stretch
    let homeStretchColor: PlayerColor | undefined;
    let homeStretchIndex = -1;
    for (const color of ['red', 'green', 'yellow', 'blue'] as PlayerColor[]) {
      const idx = HOME_STRETCH_PATHS[color].findIndex(
        (p) => p.row === row && p.col === col
      );
      if (idx >= 0) {
        homeStretchColor = color;
        homeStretchIndex = idx;
        break;
      }
    }

    // Get tokens on this cell
    let tokens: TokenType[] = [];
    if (mainPathIndex >= 0) {
      tokens = tokenPositions.get(`main-${mainPathIndex}`) || [];
    } else if (homeStretchColor && homeStretchIndex >= 0) {
      tokens =
        tokenPositions.get(`home-${homeStretchColor}-${homeStretchIndex}`) || [];
    }

    // Determine cell properties
    const isSafe = mainPathIndex >= 0 && SAFE_POSITIONS.includes(mainPathIndex);
    const isStart = Object.entries(START_POSITIONS).some(
      ([, pos]) => pos === mainPathIndex
    );
    const startColor = isStart
      ? (Object.entries(START_POSITIONS).find(
        ([, pos]) => pos === mainPathIndex
      )?.[0] as PlayerColor)
      : undefined;

    return (
      <BoardCell
        key={`${row}-${col}`}
        isSafe={isSafe}
        isStart={isStart}
        startColor={startColor}
        isHomeStretch={!!homeStretchColor}
        homeStretchColor={homeStretchColor}
        tokens={tokens}
        selectableTokenIds={selectableTokenIds}
        selectedTokenId={gameState.selectedTokenId}
        onTokenClick={onTokenClick}
      />
    );
  };

  // Get player tokens for home bases
  const getPlayerTokens = (color: PlayerColor): TokenType[] => {
    const player = gameState.players.find((p) => p.color === color);
    return player?.tokens || [];
  };

  return (
    <motion.div
      className={cn(
        'relative aspect-square w-full max-w-[min(100vw-2rem,500px)]',
        'bg-white rounded-[2rem] p-3',
        'shadow-[0_0_0_12px_#5d4037,0_0_0_16px_#3e2723,0_20px_50px_rgba(0,0,0,0.5)]', // Wood border effect
        'border-4 border-[#8d6e63]'
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Wood grain feel background (subtle) */}
      <div className="absolute inset-0 rounded-[1.5rem] bg-[#fff8e1] opacity-50 pointer-events-none" />

      {/* Main board grid */}
      <div
        className="grid w-full h-full gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {/* Render each cell of the 15x15 grid */}
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
          const row = Math.floor(index / BOARD_SIZE);
          const col = index % BOARD_SIZE;

          // Home bases (6x6 corners)
          if (row < 6 && col < 6) {
            // Red base - only render once at (0,0)
            if (row === 0 && col === 0) {
              return (
                <div
                  key={`base-red`}
                  className="col-span-6 row-span-6"
                  style={{ gridColumn: '1 / 7', gridRow: '1 / 7' }}
                >
                  <HomeBase
                    color="red"
                    tokens={getPlayerTokens('red')}
                    selectableTokenIds={selectableTokenIds}
                    selectedTokenId={gameState.selectedTokenId}
                    onTokenClick={onTokenClick}
                  />
                </div>
              );
            }
            return null;
          }

          if (row < 6 && col > 8) {
            // Green base - only render once at (0,9)
            if (row === 0 && col === 9) {
              return (
                <div
                  key={`base-green`}
                  className="col-span-6 row-span-6"
                  style={{ gridColumn: '10 / 16', gridRow: '1 / 7' }}
                >
                  <HomeBase
                    color="green"
                    tokens={getPlayerTokens('green')}
                    selectableTokenIds={selectableTokenIds}
                    selectedTokenId={gameState.selectedTokenId}
                    onTokenClick={onTokenClick}
                  />
                </div>
              );
            }
            return null;
          }

          if (row > 8 && col > 8) {
            // Yellow base - only render once at (9,9)
            if (row === 9 && col === 9) {
              return (
                <div
                  key={`base-yellow`}
                  className="col-span-6 row-span-6"
                  style={{ gridColumn: '10 / 16', gridRow: '10 / 16' }}
                >
                  <HomeBase
                    color="yellow"
                    tokens={getPlayerTokens('yellow')}
                    selectableTokenIds={selectableTokenIds}
                    selectedTokenId={gameState.selectedTokenId}
                    onTokenClick={onTokenClick}
                  />
                </div>
              );
            }
            return null;
          }

          if (row > 8 && col < 6) {
            // Blue base - only render once at (9,0)
            if (row === 9 && col === 0) {
              return (
                <div
                  key={`base-blue`}
                  className="col-span-6 row-span-6"
                  style={{ gridColumn: '1 / 7', gridRow: '10 / 16' }}
                >
                  <HomeBase
                    color="blue"
                    tokens={getPlayerTokens('blue')}
                    selectableTokenIds={selectableTokenIds}
                    selectedTokenId={gameState.selectedTokenId}
                    onTokenClick={onTokenClick}
                  />
                </div>
              );
            }
            return null;
          }

          // Center (3x3)
          if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
            // Only render once at (6,6)
            if (row === 6 && col === 6) {
              return (
                <div
                  key={`center`}
                  className="col-span-3 row-span-3"
                  style={{ gridColumn: '7 / 10', gridRow: '7 / 10' }}
                >
                  <CenterTriangles finishedTokens={finishedTokens} />
                </div>
              );
            }
            return null;
          }

          // Regular path cells
          return (
            <div key={`cell-${row}-${col}`}>
              {renderCell(row, col)}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
