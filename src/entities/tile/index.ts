export type {
  Tile,
  TileColor,
  TileType,
  Board,
  Position,
  MatchPattern,
  MatchResult,
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
export { Tile3D } from './ui/Tile3D';
