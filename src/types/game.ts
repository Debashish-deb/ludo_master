// Ludo Game Types and Constants

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type TokenState = 'home' | 'active' | 'finished';

export interface Token {
  id: string;
  color: PlayerColor;
  position: number; // -1 for home, 0-56 for board, 57+ for home stretch
  state: TokenState;
}

export interface Player {
  id: string;
  color: PlayerColor;
  name: string;
  tokens: Token[];
  isAI: boolean;
  aiDifficulty?: 'medium' | 'hard' | 'expert';
  finishedTokens: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  canRollAgain: boolean;
  selectedTokenId: string | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  rankings: Player[];
  turnCount: number;
}

export interface BoardCell {
  index: number;
  x: number;
  y: number;
  isSafe: boolean;
  isStart: boolean;
  startColor?: PlayerColor;
  isHomeStretch: boolean;
  homeStretchColor?: PlayerColor;
  isCenter: boolean;
}

// Board configuration constants
export const BOARD_SIZE = 15;
export const CELLS_PER_SIDE = 6;
export const TOTAL_PATH_LENGTH = 52;
export const HOME_STRETCH_LENGTH = 6;
export const TOKENS_PER_PLAYER = 4;

// Starting positions for each color (where tokens enter the board)
export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe cell positions (0-indexed on the main path)
export const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

// Home base positions (grid coordinates for the 4 tokens in each base)
export const HOME_BASE_POSITIONS: Record<PlayerColor, { row: number; col: number }[]> = {
  red: [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 4, col: 1 },
    { row: 4, col: 4 },
  ],
  green: [
    { row: 1, col: 10 },
    { row: 1, col: 13 },
    { row: 4, col: 10 },
    { row: 4, col: 13 },
  ],
  yellow: [
    { row: 10, col: 10 },
    { row: 10, col: 13 },
    { row: 13, col: 10 },
    { row: 13, col: 13 },
  ],
  blue: [
    { row: 10, col: 1 },
    { row: 10, col: 4 },
    { row: 13, col: 1 },
    { row: 13, col: 4 },
  ],
};

// Path coordinates for the main board path (52 cells)
export const MAIN_PATH: { row: number; col: number }[] = [
  // Red start and path going right
  { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
  // Going up
  { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
  // Top middle going right
  { row: 0, col: 7 }, { row: 0, col: 8 },
  // Green start and path going down
  { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
  // Going right
  { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 }, { row: 6, col: 14 },
  // Right middle going down
  { row: 7, col: 14 }, { row: 8, col: 14 },
  // Yellow start and path going left
  { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
  // Going down
  { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 },
  // Bottom middle going left
  { row: 14, col: 7 }, { row: 14, col: 6 },
  // Blue start and path going up
  { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 },
  // Going left
  { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 }, { row: 8, col: 0 },
  // Left middle going up
  { row: 7, col: 0 },
];

// Home stretch paths for each color (6 cells leading to center)
export const HOME_STRETCH_PATHS: Record<PlayerColor, { row: number; col: number }[]> = {
  red: [
    { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 },
  ],
  green: [
    { row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 },
  ],
  yellow: [
    { row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7, col: 8 },
  ],
  blue: [
    { row: 13, col: 7 }, { row: 12, col: 7 }, { row: 11, col: 7 }, { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7 },
  ],
};

// Entry points to home stretch (the cell before entering home stretch)
export const HOME_STRETCH_ENTRY: Record<PlayerColor, number> = {
  red: 51,
  green: 12,
  yellow: 25,
  blue: 38,
};

// Player color display names and gradients
export const PLAYER_COLORS: Record<PlayerColor, { name: string; gradient: string; shadow: string }> = {
  red: {
    name: 'Red',
    gradient: 'from-ludo-red to-red-600',
    shadow: 'shadow-red-500/50',
  },
  green: {
    name: 'Green',
    gradient: 'from-ludo-green to-green-600',
    shadow: 'shadow-green-500/50',
  },
  yellow: {
    name: 'Yellow',
    gradient: 'from-ludo-yellow to-yellow-500',
    shadow: 'shadow-yellow-500/50',
  },
  blue: {
    name: 'Blue',
    gradient: 'from-ludo-blue to-blue-600',
    shadow: 'shadow-blue-500/50',
  },
};
