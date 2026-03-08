'use client';

import { DemoContainer } from '@/widgets/puzzle-board/ui/DemoContainer';
import { ApiLogPanel } from '@/widgets/api-log-panel';

interface DemoSectionProps {
  stageId?: number;
}

export function DemoSection({ stageId = 1 }: DemoSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-foreground">데모</h2>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="shrink-0">
          <DemoContainer stageId={stageId} />
        </div>
        <div className="min-w-0 flex-1">
          <ApiLogPanel />
        </div>
      </div>
    </section>
  );
}
