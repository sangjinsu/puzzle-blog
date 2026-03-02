'use client';

import type { StageState } from '@/entities/stage';
import { isObjectiveComplete } from '../model/stage-logic';
import { Card } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';

const COLOR_LABELS: Record<string, { label: string; emoji: string }> = {
  red: { label: '빨강', emoji: '🔴' },
  blue: { label: '파랑', emoji: '🔵' },
  green: { label: '초록', emoji: '🟢' },
  yellow: { label: '노랑', emoji: '🟡' },
  purple: { label: '보라', emoji: '🟣' },
};

interface StageHudProps {
  stageState: StageState;
}

export function StageHud({ stageState }: StageHudProps) {
  const { stage, movesLeft, objectives } = stageState;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Stage {stage.id}: {stage.name}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">남은 이동</span>
          <span
            className={`text-2xl font-bold ${
              movesLeft <= 5 ? 'text-destructive' : 'text-primary'
            }`}
          >
            {movesLeft}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {objectives.map((obj, i) => {
          const info = COLOR_LABELS[obj.target] ?? {
            label: obj.target,
            emoji: '⬜',
          };
          const complete = isObjectiveComplete(obj);
          const progress = Math.min(obj.current / obj.count, 1);

          return (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                complete ? 'bg-emerald-100' : 'bg-muted'
              }`}
            >
              <span>{info.emoji}</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{info.label}</span>
                  {complete && <Badge variant="success">완료</Badge>}
                </div>
                <Progress
                  value={progress * 100}
                  className="h-1.5 w-16"
                  indicatorClassName={complete ? 'bg-emerald-400' : 'bg-primary'}
                />
                <span className="text-xs text-muted-foreground">
                  {obj.current}/{obj.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
