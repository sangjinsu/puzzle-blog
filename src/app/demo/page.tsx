'use client';

import { useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Board, ProcessResult } from '@/entities/tile';
import { createBoard } from '@/entities/tile';
import type { StageState } from '@/entities/stage';
import { STAGES, getStage } from '@/entities/stage';
import { initStageState, startGame, useMoveAndTrack, continueGame, declineContinue, StageHud, GameOverlay } from '@/features/stage-clear';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

const PuzzleBoard3D = dynamic(
  () => import('@/widgets/puzzle-board/ui/PuzzleBoard3D').then((m) => m.PuzzleBoard3D),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64 text-muted-foreground">Loading 3D...</div> }
);

type View = 'select' | 'game';

export default function DemoPage() {
  const [view, setView] = useState<View>('select');
  const [board, setBoard] = useState<Board | null>(null);
  const [stageState, setStageState] = useState<StageState | null>(null);

  const startStage = useCallback((stageId: number) => {
    const stage = getStage(stageId);
    if (!stage) return;
    setBoard(createBoard(stage.gridSize.rows, stage.gridSize.cols));
    setStageState(initStageState(stage));
    setView('game');
  }, []);

  const handleStart = useCallback(() => {
    setStageState((prev) => (prev ? startGame(prev) : prev));
  }, []);

  const handleBoardChange = useCallback(
    (result: ProcessResult) => {
      setBoard(result.board);
      setStageState((prev) => (prev ? useMoveAndTrack(prev, result.allRemoved) : prev));
    },
    []
  );

  const handleRestart = useCallback(() => {
    if (!stageState) return;
    startStage(stageState.stage.id);
  }, [stageState, startStage]);

  const handleContinue = useCallback(() => {
    setStageState((prev) => (prev ? continueGame(prev) : prev));
  }, []);

  const handleDecline = useCallback(() => {
    setStageState((prev) => (prev ? declineContinue(prev) : prev));
  }, []);

  const handleStageSelect = useCallback(() => {
    setView('select');
    setStageState(null);
  }, []);

  if (view === 'select') {
    return (
      <main className="flex min-h-screen flex-col items-center gap-8 p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">← 홈</Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">
            스테이지 선택
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAGES.map((stage) => (
            <Card
              key={stage.id}
              className="cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
              onClick={() => startStage(stage.id)}
            >
              <CardContent className="flex flex-col gap-2 p-6">
                <span className="text-4xl font-bold text-primary/70">
                  {stage.id}
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {stage.name}
                </span>
                <div className="flex flex-wrap gap-1">
                  {stage.objectives.map((obj, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {obj.target} ×{obj.count}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {stage.moves} 이동
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-4">
      <div className="flex w-full max-w-lg items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleStageSelect}>
          ← 스테이지 선택
        </Button>
      </div>

      {stageState && <StageHud stageState={stageState} />}

      <div className="relative">
        {board ? (
          <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>}>
            <PuzzleBoard3D
              board={board}
              setBoard={setBoard}
              onBoardChange={handleBoardChange}
              disabled={!stageState || stageState.status !== 'playing'}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-64 rounded-xl bg-muted/30" style={{ width: 400 }} />
        )}

        {stageState && (
          <GameOverlay
            status={stageState.status}
            onStart={handleStart}
            onRestart={handleRestart}
            onContinue={handleContinue}
            onDecline={handleDecline}
          />
        )}
      </div>
    </main>
  );
}
