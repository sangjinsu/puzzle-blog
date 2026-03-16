'use client';

import { useState } from 'react';
import { DemoContainer } from '@/widgets/puzzle-board/ui/DemoContainer';
import { SequenceDiagram } from '@/widgets/infographic-viewer/ui/SequenceDiagram';
import { CodeViewer } from '@/widgets/code-viewer';
import { KeyTakeaways } from '@/views/content/ui/KeyTakeaways';
import { ComparisonSection } from '@/views/content/ui/ComparisonSection';
import { GlassPanel } from '@/shared/ui/glass-panel';
import { cn } from '@/shared/lib/utils';
import { lifeConfig } from '../model/config';

const config = lifeConfig;

export function LifePage() {
  const [activeTab, setActiveTab] = useState(0);
  const activeSection = config.apiSections[activeTab]!;

  return (
    <div className="flex flex-col gap-10 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{config.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{config.description}</p>
      </div>

      {/* 상단: Demo(좌) + 핵심 정리(우) */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="shrink-0">
          <DemoContainer stageId={config.stageId} />
        </div>
        <div className="min-w-0 flex-1">
          <KeyTakeaways items={config.takeaways} />
        </div>
      </div>

      {/* API 탭 */}
      <div className="flex flex-col gap-0">
        {/* 탭 바 */}
        <div className="flex items-center gap-1 border-b border-border">
          {config.apiSections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(i)}
              className={cn(
                'px-4 py-2 text-sm font-semibold rounded-t-md transition-colors',
                i === activeTab
                  ? 'bg-primary/20 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {section.tabLabel}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <GlassPanel className="flex flex-col gap-6 rounded-t-none p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{activeSection.title}</h2>
            <p className="mt-2 text-muted-foreground">{activeSection.description}</p>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1">
              <SequenceDiagram actors={activeSection.actors} messages={activeSection.messages} />
            </div>
            <div className="min-w-0 flex-1">
              <CodeViewer snippets={activeSection.codeSnippets} />
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* 게임 비교 */}
      {config.comparison.games.length > 0 ? (
        <ComparisonSection
          features={config.comparison.features}
          games={config.comparison.games}
        />
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">게임 비교</h2>
          <GlassPanel className="flex items-center justify-center p-16">
            <div className="text-center">
              <span className="text-5xl">🚧</span>
              <p className="mt-4 text-lg text-muted-foreground">작성중입니다</p>
            </div>
          </GlassPanel>
        </section>
      )}
    </div>
  );
}
