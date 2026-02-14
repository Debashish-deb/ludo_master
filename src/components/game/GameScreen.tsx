import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants, type Transition } from 'framer-motion';
import { LudoBoard } from './LudoBoard';
import { Dice } from './Dice';
import { PlayersList } from './PlayerInfo';
import { CaptureEffect } from './CaptureEffect';
import { WinCelebration } from './WinCelebration';
import { useGameState } from '@/hooks/useGameState';
import type { GameConfig } from '@/hooks/useGameState';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { useAccessibility } from '@/hooks/useAccessibility';
import type { PlayerColor, GameState } from '@/types/game';
import {
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Trophy,
  Zap,
  Users,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameScreenProps {
  config: GameConfig;
  onExit: () => void;
  restoredState?: GameState;
}

// ═══════════════════════════════════════════════════════════════
// PLAYER COLOR CONFIGURATION - Premium theme mapping
// ═══════════════════════════════════════════════════════════════

const playerThemeConfig: Record<PlayerColor, {
  gradient: string;
  glow: string;
  accent: string;
  icon: string;
  neon: string;
}> = {
  red: {
    gradient: 'from-red-500/40 via-red-600/30 to-red-700/20',
    glow: 'shadow-red-500/30',
    accent: 'text-red-400',
    icon: '🔴',
    neon: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
  },
  green: {
    gradient: 'from-green-500/40 via-green-600/30 to-green-700/20',
    glow: 'shadow-green-500/30',
    accent: 'text-green-400',
    icon: '🟢',
    neon: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]',
  },
  yellow: {
    gradient: 'from-yellow-400/40 via-yellow-500/30 to-yellow-600/20',
    glow: 'shadow-yellow-400/30',
    accent: 'text-yellow-300',
    icon: '🟡',
    neon: 'shadow-[0_0_30px_rgba(250,204,21,0.4)]',
  },
  blue: {
    gradient: 'from-blue-500/40 via-blue-600/30 to-blue-700/20',
    glow: 'shadow-blue-500/30',
    accent: 'text-blue-400',
    icon: '🔵',
    neon: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
  },
};

// ═══════════════════════════════════════════════════════════════
// ANIMATION VARIANTS - Premium motion presets
// ═══════════════════════════════════════════════════════════════

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 } as Transition
  },
  exit: { opacity: 0, y: -10, scale: 0.98 }
};

const turnIndicatorVariants: Variants = {
  enter: { opacity: 0, x: -30, filter: 'blur(4px)' },
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 400, damping: 30 } as Transition
  },
  exit: { opacity: 0, x: 30, filter: 'blur(4px)' }
};

const pulseGlowVariants: Variants = {
  pulse: {
    boxShadow: [
      '0 0 20px rgba(255,255,255,0.1)',
      '0 0 40px rgba(255,255,255,0.2)',
      '0 0 20px rgba(255,255,255,0.1)'
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};

// ═══════════════════════════════════════════════════════════════
// START SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════

const StartScreen = ({
  config,
  onStart,
  onExit,
  playSound
}: {
  config: GameConfig;
  onStart: () => void;
  onExit: () => void;
  playSound: (sound: string) => void;
}) => {
  const isVsAI = config.mode === 'single';
  const playerColor = config.humanPlayerColor;
  const theme = playerThemeConfig[playerColor];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Premium Glass Card */}
      <motion.div
        className="glass-card-premium w-full max-w-sm p-8 text-center space-y-6 relative overflow-hidden"
        variants={itemVariants}
      >
        {/* Decorative glow orb */}
        <div className={cn(
          "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30",
          theme.gradient.split(' ')[0].replace('from-', 'bg-')
        )} />

        {/* Game Mode Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {isVsAI ? <Bot className="w-4 h-4 text-purple-400" /> : <Users className="w-4 h-4 text-blue-400" />}
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
            {isVsAI ? 'VS Computer' : 'Pass & Play'}
          </span>
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-black text-gradient-gold mb-2">
            Ready to Play!
          </h1>
          <p className="text-white/60 text-sm">
            {isVsAI
              ? <>You're playing as <span className={cn("font-bold", theme.accent)}>{playerColor}</span> against {config.playerCount - 1} AI opponent{config.playerCount > 2 ? 's' : ''}</>
              : <>{config.playerCount} players • Take turns passing the device</>
            }
          </p>
        </motion.div>

        {/* Player Preview */}
        <motion.div
          className="flex justify-center gap-3 py-4"
          variants={itemVariants}
        >
          {Array.from({ length: config.playerCount }).map((_, i) => {
            const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
            const color = colors[i];
            const isHuman = color === playerColor;
            return (
              <motion.div
                key={color}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                  "border-2 transition-all duration-300",
                  isHuman
                    ? cn("border-white/50 shadow-lg", playerThemeConfig[color].neon)
                    : "border-white/10 opacity-60"
                )}
                style={{
                  background: `linear-gradient(135deg, hsl(var(--ludo-${color}) / 0.3), hsl(var(--ludo-${color}-dark) / 0.2))`
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
              >
                {isHuman ? '👤' : '🤖'}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Start Button */}
        <motion.button
          onClick={() => { playSound('buttonClick'); onStart(); }}
          className="btn-premium btn-gold w-full h-16 text-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          variants={itemVariants}
        >
          <span className="mr-2">🎲</span>
          START GAME
        </motion.button>

        {/* Back Button */}
        <motion.button
          onClick={onExit}
          className="text-white/40 hover:text-white/70 text-sm font-medium transition-colors flex items-center justify-center gap-1"
          whileHover={{ x: -3 }}
          variants={itemVariants}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TURN INDICATOR COMPONENT
// ═══════════════════════════════════════════════════════════════

const TurnIndicator = ({
  player,
  consecutiveSixes
}: {
  player: { id: string; name: string; color: PlayerColor; isAI: boolean };
  consecutiveSixes: number;
}) => {
  const theme = playerThemeConfig[player.color];

  return (
    <motion.div
      key={player.id}
      className={cn(
        "relative py-3 px-4 overflow-hidden",
        "bg-gradient-to-r",
        theme.gradient
      )}
      variants={turnIndicatorVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {/* Animated background glow */}
      <motion.div
        className={cn(
          "absolute inset-0 opacity-50",
          theme.gradient.split(' ')[0].replace('from-', 'bg-')
        )}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-3">
        {/* Player Icon */}
        <motion.div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-lg",
            "bg-white/20 border border-white/30"
          )}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {player.isAI ? '🤖' : '👤'}
        </motion.div>

        {/* Player Name */}
        <span className={cn("font-black text-lg tracking-wide", theme.accent)}>
          {player.name}
        </span>

        {/* Turn Badge */}
        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/80 text-xs font-bold uppercase">
          Turn
        </span>

        {/* Consecutive Sixes Indicator */}
        {consecutiveSixes > 0 && (
          <motion.div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/30 border border-yellow-400/50"
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Zap className="w-3 h-3 text-yellow-300" />
            <span className="text-yellow-300 text-xs font-bold">×{consecutiveSixes}</span>
          </motion.div>
        )}
      </div>

      {/* Bottom glow line */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5",
          theme.gradient.split(' ')[0].replace('from-', 'bg-')
        )}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN GAME SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const GameScreen = ({ config, onExit, restoredState }: GameScreenProps) => {
  const {
    gameState,
    currentPlayer,
    rollDice,
    moveToken,
    startGame,
    resetGame,
    getMovableTokens,
    canRoll,
  } = useGameState(config, restoredState);

  const { play, muted, toggleMute } = useSoundEffects();
  const haptics = useHaptics();
  const { colorblindMode } = useAccessibility();

  // Refs for tracking state changes
  const prevDiceRef = useRef(gameState.diceValue);
  const prevTurnRef = useRef(gameState.turnCount);
  const prevPlayerRef = useRef(gameState.currentPlayerIndex);
  const prevStatusRef = useRef(gameState.gameStatus);

  // UI State
  const [showCapture, setShowCapture] = useState(false);
  const [showMoveHint, setShowMoveHint] = useState(false);
  const [diceRollComplete, setDiceRollComplete] = useState(false);

  // ═════════════════════════════════════════════════════════════
  // SCREEN WAKE LOCK - Keep screen on during gameplay
  // ═════════════════════════════════════════════════════════════
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && gameState.gameStatus === 'playing') {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {
        // Non-critical feature
      }
    };
    requestWakeLock();
    return () => { wakeLock?.release().catch(() => { }); };
  }, [gameState.gameStatus]);

  // ═════════════════════════════════════════════════════════════
  // SOUND EFFECT TRIGGERS
  // ═════════════════════════════════════════════════════════════
  useEffect(() => {
    // Dice roll complete
    if (gameState.diceValue && !prevDiceRef.current && !gameState.isRolling) {
      play('diceRoll');
      haptics.mediumTap();
      setDiceRollComplete(true);
      setTimeout(() => setShowMoveHint(true), 400);
    }
    prevDiceRef.current = gameState.diceValue;
  }, [gameState.diceValue, gameState.isRolling, play, haptics]);

  useEffect(() => {
    // Turn change
    if (prevPlayerRef.current !== gameState.currentPlayerIndex) {
      play('turnChange');
      setShowMoveHint(false);
      setDiceRollComplete(false);
    }
    prevPlayerRef.current = gameState.currentPlayerIndex;
    prevTurnRef.current = gameState.turnCount;
  }, [gameState.currentPlayerIndex, gameState.turnCount, play]);

  useEffect(() => {
    // Capture event
    if (gameState.lastCaptureEvent) {
      setShowCapture(true);
      play('tokenCapture');
      haptics.heavyTap();
    }
  }, [gameState.lastCaptureEvent, play, haptics]);

  useEffect(() => {
    // Token finish
    if (gameState.lastFinishEvent) {
      play('tokenFinish');
      haptics.success();
    }
  }, [gameState.lastFinishEvent, play, haptics]);

  useEffect(() => {
    // Win celebration
    if (gameState.gameStatus === 'finished' && prevStatusRef.current !== 'finished') {
      play('win');
      haptics.success();
    }
    prevStatusRef.current = gameState.gameStatus;
  }, [gameState.gameStatus, play, haptics]);

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════
  const movableTokens = getMovableTokens();
  const selectableTokenIds = movableTokens.map((t) => t.id);

  const handleTokenClick = useCallback((tokenId: string) => {
    if (selectableTokenIds.includes(tokenId)) {
      play('tokenMove');
      haptics.lightTap();
      moveToken(tokenId);
      setShowMoveHint(false);
    }
  }, [selectableTokenIds, moveToken, play, haptics]);

  const handleRoll = useCallback(() => {
    if (canRoll) {
      play('buttonClick');
      haptics.mediumTap();
      rollDice();
    }
  }, [canRoll, rollDice, play, haptics]);

  const handleExit = useCallback(() => {
    play('buttonClick');
    onExit();
  }, [onExit, play]);

  const handleReset = useCallback(() => {
    play('buttonClick');
    resetGame();
  }, [resetGame, play]);

  // ═════════════════════════════════════════════════════════════
  // RENDER: START SCREEN
  // ═════════════════════════════════════════════════════════════
  if (gameState.gameStatus === 'waiting') {
    return (
      <StartScreen
        config={config}
        onStart={startGame}
        onExit={handleExit}
        playSound={play}
      />
    );
  }

  // ═════════════════════════════════════════════════════════════
  // RENDER: WIN SCREEN
  // ═════════════════════════════════════════════════════════════
  if (gameState.gameStatus === 'finished' && gameState.winner) {
    return (
      <WinCelebration
        winner={gameState.winner}
        turnCount={gameState.turnCount}
        rankings={gameState.rankings}
        onPlayAgain={handleReset}
        onExit={handleExit}
      />
    );
  }

  // ═════════════════════════════════════════════════════════════
  // RENDER: MAIN GAME SCREEN
  // ═════════════════════════════════════════════════════════════
  return (
    <motion.div
      className="flex flex-col min-h-screen safe-area-inset overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ═════════════════════════════════════════════════════════
         CAPTURE EFFECT OVERLAY
         ═════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCapture && gameState.lastCaptureEvent && (
          <CaptureEffect
            attackerColor={gameState.lastCaptureEvent.attackerColor}
            onComplete={() => setShowCapture(false)}
          />
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════
         PREMIUM HEADER
         ═════════════════════════════════════════════════════════ */}
      <motion.header
        className="flex items-center justify-between px-4 py-3 glass-card border-0 border-b border-white/10 z-10"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Exit Button */}
        <motion.button
          onClick={handleExit}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Exit</span>
        </motion.button>

        {/* Turn Counter Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white/80">
            Turn <span className="text-white">{gameState.turnCount + 1}</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
          <motion.button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.header>

      {/* ═════════════════════════════════════════════════════════
         TURN INDICATOR
         ═════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <TurnIndicator
          player={currentPlayer}
          consecutiveSixes={gameState.consecutiveSixes}
        />
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════
         MAIN GAME AREA
         ═════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-4">

        {/* Game Board Container */}
        <motion.div
          className="flex-shrink-0 w-full flex justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <LudoBoard
            gameState={gameState}
            selectableTokenIds={selectableTokenIds}
            onTokenClick={handleTokenClick}
            colorblindMode={colorblindMode}
          />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
           DICE AREA WITH PREMIUM FEEDBACK
           ═══════════════════════════════════════════════════════ */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Dice Component */}
          <Dice
            value={gameState.diceValue}
            isRolling={gameState.isRolling}
            onRoll={handleRoll}
            disabled={!canRoll}
            playerColor={currentPlayer.color}
          />

          {/* Move Hint / Status Message */}
          <AnimatePresence mode="wait">
            {gameState.isRolling ? (
              <motion.div
                key="rolling"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Rolling...
              </motion.div>
            ) : showMoveHint && gameState.diceValue && !currentPlayer.isAI ? (
              <motion.div
                key="move-hint"
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium text-center",
                  "bg-gradient-to-r from-white/20 to-white/10 border border-white/20"
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {movableTokens.length > 0 ? (
                  <span className="text-white/90">
                    Tap a <span className="text-green-400 font-bold">token</span> to move{' '}
                    <span className="text-yellow-400 font-black text-lg">{gameState.diceValue}</span> spaces
                  </span>
                ) : (
                  <span className="text-white/60">
                    No valid moves available
                  </span>
                )}
              </motion.div>
            ) : currentPlayer.isAI && gameState.diceValue ? (
              <motion.div
                key="ai-thinking"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="flex gap-0.5"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                </motion.div>
                AI is thinking...
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
           PLAYERS LIST
           ═══════════════════════════════════════════════════════ */}
        <motion.div
          className="w-full max-w-md"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <PlayersList
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            diceValue={gameState.diceValue}
          />
        </motion.div>
      </main>
    </motion.div>
  );
};

export default GameScreen;