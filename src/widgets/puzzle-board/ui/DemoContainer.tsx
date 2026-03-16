'use client';

import { useCallback, useState } from 'react';
import type { Board, ProcessResult } from '@/entities/tile';
import { createBoard } from '@/entities/tile';
import type { StageState } from '@/entities/stage';
import { getStage } from '@/entities/stage';
import { initStageState, startGame, useMoveAndTrack, continueGame, declineContinue, forceSuccess, forceFailure, StageHud, GameOverlay } from '@/features/stage-clear';
import { simulateApiFromResult } from '@/features/game-events';
import { Button } from '@/shared/ui/button';
import { PuzzleBoard } from './PuzzleBoardDOM';

interface DemoContainerProps {
  stageId?: number;
  overlay?: React.ReactNode;
  onProcessResult?: (result: ProcessResult) => void;
}

const BOARD_WIDTH = 7 * (48 + 4) - 4 + 24; // 388px

function buildInitialBoard(stageId: number): Board {
  const stage = getStage(stageId);
  const rows = stage?.gridSize.rows ?? 7;
  const cols = stage?.gridSize.cols ?? 7;
  return createBoard(rows, cols);
}

function buildInitialStageState(stageId: number): StageState {
  const stage = getStage(stageId);
  if (!stage) {
    // Fallback: create a minimal stage state
    return {
      stage: {
        id: stageId,
        name: `Stage ${stageId}`,
        gridSize: { rows: 7, cols: 7 },
        moves: 20,
        objectives: [],
      },
      movesLeft: 20,
      objectives: [],
      status: 'ready',
    };
  }
  return initStageState(stage);
}

export function DemoContainer({
  stageId = 1,
  overlay,
  onProcessResult,
}: DemoContainerProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [stageState, setStageState] = useState<StageState>(() =>
    buildInitialStageState(stageId)
  );

  const handleBoardChange = useCallback(
    (result: ProcessResult) => {
      simulateApiFromResult(result);
      onProcessResult?.(result);

      // Collect all removed tiles across all steps
      const removedTiles = result.steps.flatMap((step) => step.removed ?? []);
      setStageState((prev) => useMoveAndTrack(prev, removedTiles));
      setBoard(result.board);
    },
    [onProcessResult]
  );

  const handleStart = useCallback(() => {
    setBoard(buildInitialBoard(stageId));
    setStageState((prev) => startGame(prev));
  }, [stageId]);

  const handleRestart = useCallback(() => {
    setBoard(null);
    setStageState(buildInitialStageState(stageId));
  }, [stageId]);

  const handleContinue = useCallback(() => {
    setStageState((prev) => continueGame(prev));
  }, []);

  const handleDecline = useCallback(() => {
    setStageState((prev) => declineContinue(prev));
  }, []);

  const isDisabled = stageState.status !== 'playing';

  return (
    <div className="mx-auto flex flex-col gap-4" style={{ width: BOARD_WIDTH }}>
      <StageHud stageState={stageState} />

      {stageState.status === 'playing' && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => setStageState(forceSuccess)}>
            성공
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStageState(forceFailure)}>
            실패
          </Button>
        </div>
      )}

      <div className="relative">
        {board ? (
          <PuzzleBoard
            board={board}
            setBoard={setBoard}
            onBoardChange={handleBoardChange}
            disabled={isDisabled}
          />
        ) : (
          <div
            className="rounded-xl bg-muted/30"
            style={{ width: BOARD_WIDTH, height: BOARD_WIDTH }}
          />
        )}

        <GameOverlay
          status={stageState.status}
          onStart={handleStart}
          onRestart={handleRestart}
          onContinue={handleContinue}
          onDecline={handleDecline}
        />

        {overlay}
      </div>
    </div>
  );
}
