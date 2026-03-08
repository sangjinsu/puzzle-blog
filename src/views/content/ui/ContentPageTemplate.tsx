'use client';

import type { ContentPageConfig } from '../model/types';
import { DemoSection } from './DemoSection';
import { ComparisonSection } from './ComparisonSection';
import { KeyTakeaways } from './KeyTakeaways';
import { CodeViewer } from '@/widgets/code-viewer';

interface ContentPageTemplateProps {
  config: ContentPageConfig;
}

export function ContentPageTemplate({ config }: ContentPageTemplateProps) {
  return (
    <div className="flex flex-col gap-10 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{config.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{config.description}</p>
      </div>

      {/* 1. Overview infographic */}
      {config.overviewInfographic && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">개요</h2>
          {config.overviewInfographic}
        </section>
      )}

      {/* 2. Demo + API log */}
      <DemoSection stageId={config.stageId} />

      {/* 3. Server flow infographic */}
      {config.serverFlowInfographic && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">서버 처리 흐름</h2>
          {config.serverFlowInfographic}
        </section>
      )}

      {/* 4. Code viewer */}
      {config.codeSnippets && config.codeSnippets.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">핵심 코드</h2>
          <CodeViewer snippets={config.codeSnippets} />
        </section>
      )}

      {/* 5. Game comparison */}
      {config.comparison && (
        <ComparisonSection
          features={config.comparison.features}
          games={config.comparison.games}
        />
      )}

      {/* 6. Key takeaways */}
      {config.takeaways && config.takeaways.length > 0 && (
        <KeyTakeaways items={config.takeaways} />
      )}
    </div>
  );
}
