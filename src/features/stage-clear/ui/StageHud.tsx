'use client';

import type { StageState } from '@/entities/stage';

interface StageHudProps {
  stageState: StageState;
}

export function StageHud({ stageState }: StageHudProps) {
  const { movesLeft } = stageState;

  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2">
      <span className="text-sm text-muted-foreground">남은 이동</span>
      <span
        className={`text-2xl font-bold ${
          movesLeft <= 5 ? 'text-destructive' : 'text-primary'
        }`}
      >
        {movesLeft}
      </span>
    </div>
  );
}
