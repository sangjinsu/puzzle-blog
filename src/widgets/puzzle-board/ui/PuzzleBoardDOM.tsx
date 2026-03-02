'use client';

import { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Board, Position, Tile } from '@/entities/tile';
import { TileIcon } from '@/entities/tile';
import { TILE_SIZE, TILE_GAP, ANIMATION_DURATION } from '@/shared/config/constants';
import { isAdjacent, processSwap } from '../model';

interface PuzzleBoardProps {
  board: Board;
  onBoardChange: (board: Board, removedTiles: Tile[]) => void;
  disabled?: boolean;
}

export function PuzzleBoard({ board, onBoardChange, disabled = false }: PuzzleBoardProps) {
  const [selected, setSelected] = useState<Position | null>(null);
  const [animating, setAnimating] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const rows = board.length;
  const cols = rows > 0 ? board[0]!.length : 0;

  const handleTileClick = useCallback(
    (row: number, col: number) => {
      if (animating || disabled) return;

      const pos: Position = { row, col };

      if (!selected) {
        setSelected(pos);
        return;
      }

      if (selected.row === row && selected.col === col) {
        setSelected(null);
        return;
      }

      if (!isAdjacent(selected, pos)) {
        setSelected(pos);
        return;
      }

      // Attempt swap
      setAnimating(true);
      const result = processSwap(board, selected, pos);

      if (!result) {
        // Invalid swap — animate back
        setTimeout(() => {
          setAnimating(false);
          setSelected(null);
        }, ANIMATION_DURATION.swap * 1000);
        setSelected(null);
        return;
      }

      // Animate through steps
      const delay = (ANIMATION_DURATION.swap + ANIMATION_DURATION.remove + ANIMATION_DURATION.fall) * 1000;
      setTimeout(() => {
        onBoardChange(result.board, result.allRemoved);
        setAnimating(false);
        setSelected(null);
      }, delay);
    },
    [board, selected, animating, disabled, onBoardChange]
  );

  // Touch/drag support
  const dragStart = useRef<Position | null>(null);

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      if (animating || disabled) return;
      dragStart.current = { row, col };
    },
    [animating, disabled]
  );

  const handlePointerUp = useCallback(
    (row: number, col: number) => {
      if (!dragStart.current || animating || disabled) return;

      const start = dragStart.current;
      dragStart.current = null;

      if (start.row === row && start.col === col) {
        handleTileClick(row, col);
        return;
      }

      if (isAdjacent(start, { row, col })) {
        setSelected(null);
        setAnimating(true);

        const result = processSwap(board, start, { row, col });

        if (!result) {
          setTimeout(() => {
            setAnimating(false);
          }, ANIMATION_DURATION.swap * 1000);
          return;
        }

        const delay = (ANIMATION_DURATION.swap + ANIMATION_DURATION.remove + ANIMATION_DURATION.fall) * 1000;
        setTimeout(() => {
          onBoardChange(result.board, result.allRemoved);
          setAnimating(false);
        }, delay);
      }
    },
    [board, animating, disabled, handleTileClick, onBoardChange]
  );

  const boardWidth = cols * (TILE_SIZE + TILE_GAP) - TILE_GAP;
  const boardHeight = rows * (TILE_SIZE + TILE_GAP) - TILE_GAP;

  return (
    <div
      ref={boardRef}
      className="relative rounded-xl bg-slate-700/50 p-3 shadow-xl"
      style={{
        width: boardWidth + 24,
        height: boardHeight + 24,
      }}
    >
      <div
        className="relative"
        style={{ width: boardWidth, height: boardHeight }}
      >
        <AnimatePresence mode="popLayout">
          {board.map((row, r) =>
            row.map((tile, c) => {
              if (!tile) return null;

              const isSelected =
                selected?.row === r && selected?.col === c;

              return (
                <motion.div
                  key={tile.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: c * (TILE_SIZE + TILE_GAP),
                    y: r * (TILE_SIZE + TILE_GAP),
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    layout: { duration: ANIMATION_DURATION.fall, type: 'spring', bounce: 0.2 },
                    scale: { duration: ANIMATION_DURATION.spawn },
                    opacity: { duration: ANIMATION_DURATION.spawn },
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
