'use client';

import { useCallback, useRef, useState } from 'react';
import type { Board, BoardStep, Position, ProcessResult } from '@/entities/tile';
import { ANIMATION_DURATION } from '@/shared/config/constants';
import { isAdjacent, processSwap } from '../model';

function stepDelay(type: BoardStep['type']): number {
  switch (type) {
    case 'swap': return ANIMATION_DURATION.swap * 1000;
    case 'match':
    case 'item_activate': return ANIMATION_DURATION.remove * 1000 + 100;
    case 'gravity': return ANIMATION_DURATION.fall * 1000 + 80;
    case 'cascade': return 120;
  }
}

interface UsePuzzleInteractionProps {
  board: Board;
  setBoard: (board: Board) => void;
  onBoardChange: (result: ProcessResult) => void;
  disabled?: boolean;
}

interface PuzzleInteraction {
  selected: Position | null;
  animating: boolean;
  handlePointerDown: (row: number, col: number) => void;
  handlePointerUp: (row: number, col: number) => void;
}

export function usePuzzleInteraction({
  board,
  setBoard,
  onBoardChange,
  disabled = false,
}: UsePuzzleInteractionProps): PuzzleInteraction {
  const [selected, setSelected] = useState<Position | null>(null);
  const [animating, setAnimating] = useState(false);
  const dragStart = useRef<Position | null>(null);

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
        setTimeout(() => {
          setAnimating(false);
          setSelected(null);
        }, ANIMATION_DURATION.swap * 1000);
        setSelected(null);
        return;
      }

      const swapResult = result;
      let idx = 0;
      function playNext() {
        if (idx >= swapResult.steps.length) {
          onBoardChange(swapResult);
          setAnimating(false);
          setSelected(null);
          return;
        }
        const step = swapResult.steps[idx]!;
        setBoard(step.board);
        idx++;
        setTimeout(playNext, stepDelay(step.type));
      }
      playNext();
    },
    [board, selected, animating, disabled, onBoardChange, setBoard]
  );

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

        const dragResult = result;
        let idx = 0;
        function playNext() {
          if (idx >= dragResult.steps.length) {
            onBoardChange(dragResult);
            setAnimating(false);
            return;
          }
          const step = dragResult.steps[idx]!;
          setBoard(step.board);
          idx++;
          setTimeout(playNext, stepDelay(step.type));
        }
        playNext();
      }
    },
    [board, animating, disabled, handleTileClick, onBoardChange, setBoard]
  );

  return { selected, animating, handlePointerDown, handlePointerUp };
}
