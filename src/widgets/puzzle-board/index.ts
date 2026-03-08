export { PuzzleBoard } from './ui/PuzzleBoardDOM';
export { DemoContainer } from './ui/DemoContainer';
export {
  createInitialGameState,
  isAdjacent,
  swapTiles,
  processSwap,
} from './model/game-engine';
export type { GameState, ProcessResult, BoardStep } from './model/game-engine';
