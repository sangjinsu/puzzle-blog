import type { ReactNode } from 'react';
import type { CodeSnippet } from '@/widgets/code-viewer';

export interface ComparisonGame {
  name: string;
  features: Record<string, string | boolean>;
}

export interface ContentPageConfig {
  title: string;
  description: string;
  stageId?: number;
  overviewInfographic?: ReactNode;
  serverFlowInfographic?: ReactNode;
  codeSnippets?: CodeSnippet[];
  comparison?: {
    features: string[];
    games: ComparisonGame[];
  };
  takeaways?: string[];
}
