'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import type { CodeSnippet } from '../model/types';
import { CodeBlock } from './CodeBlock';

interface CodeViewerProps {
  snippets: CodeSnippet[];
  className?: string;
}

export function CodeViewer({ snippets, className }: CodeViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (snippets.length === 0) return null;

  const activeSnippet = snippets[activeIndex] ?? snippets[0];

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden glass border border-border shadow-lg',
        className
      )}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border px-3 pt-2 overflow-x-auto">
        {snippets.map((snippet, index) => (
          <button
            key={snippet.language}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors whitespace-nowrap',
              index === activeIndex
                ? 'bg-primary/20 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {snippet.label}
          </button>
        ))}
      </div>

      {/* Active code block */}
      <CodeBlock
        code={activeSnippet!.code}
        language={activeSnippet!.language}
        className="rounded-none border-0"
      />
    </div>
  );
}
