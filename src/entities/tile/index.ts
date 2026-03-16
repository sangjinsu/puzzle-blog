export type {
  Tile,
  TileColor,
  TileType,
  Board,
  Position,
  MatchPattern,
  MatchResult,
  GameState,
  ProcessResult,
  BoardStep,
} from './model/types';

export {
  createTile,
  createBoard,
  cloneBoard,
  randomColor,
  generateTileId,
  resetTileIdCounter,
} from './lib/factory';

export { TileIcon } from './ui/TileIcon';
