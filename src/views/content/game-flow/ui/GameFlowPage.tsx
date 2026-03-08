'use client';

import { ContentPageTemplate } from '@/views/content/ui/ContentPageTemplate';
import { gameFlowConfig } from '../model/config';
import { GameLoopDiagram } from '@/widgets/infographic-viewer/ui/GameLoopDiagram';
import { SwapSequenceDiagram } from '@/widgets/infographic-viewer/ui/SwapSequenceDiagram';

const config = {
  ...gameFlowConfig,
  overviewInfographic: <GameLoopDiagram />,
  serverFlowInfographic: <SwapSequenceDiagram />,
};

export function GameFlowPage() {
  return <ContentPageTemplate config={config} />;
}
