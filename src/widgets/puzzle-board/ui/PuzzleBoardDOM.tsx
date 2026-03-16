'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Board, ProcessResult } from '@/entities/tile';
import { TileIcon } from '@/entities/tile';
import { TILE_SIZE, TILE_GAP, ANIMATION_DURATION } from '@/shared/config/constants';
import { usePuzzleInteraction } from '../hooks/usePuzzleInteraction';

interface PuzzleBoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  onBoardChange: (result: ProcessResult) => void;
  disabled?: boolean;
}

export function PuzzleBoard({ board, setBoard, onBoardChange, disabled = false }: PuzzleBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  const rows = board.length;
  const cols = rows > 0 ? board[0]!.length : 0;

  const { selected, handlePointerDown, handlePointerUp } = usePuzzleInteraction({
    board,
    setBoard,
    onBoardChange,
    disabled,
  });

  const boardWidth = cols * (TILE_SIZE + TILE_GAP) - TILE_GAP;
  const boardHeight = rows * (TILE_SIZE + TILE_GAP) - TILE_GAP;

  return (
    <div
      ref={boardRef}
      className="relative rounded-xl bg-slate-200/80 dark:bg-slate-700/50 p-3 shadow-xl"
      style={{
        width: boardWidth + 24,
        height: boardHeight + 24,
      }}
    >
      <div
        className="relative"
        style={{ width: boardWidth, height: boardHeight }}
      >
        <AnimatePresence mode="sync">
          {board.map((row, r) =>
            row.map((tile, c) => {
              if (!tile) return null;

              const isSelected =
                selected?.row === r && selected?.col === c;

              return (
                <motion.div
                  key={tile.id}
                  initial={{
                    scale: 0.5,
                    opacity: 0,
                    x: c * (TILE_SIZE + TILE_GAP),
                    y: -(TILE_SIZE + TILE_GAP),
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: c * (TILE_SIZE + TILE_GAP),
                    y: r * (TILE_SIZE + TILE_GAP),
                  }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: ANIMATION_DURATION.remove } }}
                  transition={{
                    x: { duration: ANIMATION_DURATION.fall, type: 'spring', bounce: 0.15 },
                    y: { duration: ANIMATION_DURATION.fall, type: 'spring', bounce: 0.15 },
                    scale: { duration: ANIMATION_DURATION.spawn },
                    opacity: { duration: ANIMATION_DURATION.spawn * 0.5 },
                  }}
                  className="absolute cursor-pointer select-none"
                  style={{ width: TILE_SIZE, height: TILE_SIZE }}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerUp={() => handlePointerUp(r, c)}
                >
                  <TileIcon
                    color={tile.color}
                    type={tile.type}
                    size={TILE_SIZE}
                    selected={isSelected}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
