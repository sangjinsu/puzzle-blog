export type TileColor = 'red' | 'blue' | 'green' | 'yellow' | 'orange';

export type TileType = 'normal' | 'rocket_h' | 'rocket_v' | 'bomb';

export interface Tile {
  id: string;
  color: TileColor;
  type: TileType;
  row: number;
  col: number;
}

export type Board = (Tile | null)[][];

export interface Position {
  row: number;
  col: number;
}

export type MatchPattern = 'three' | 'four_h' | 'four_v' | 'square' | 'T' | 'L';

export interface MatchResult {
  tiles: Tile[];
  pattern: MatchPattern;
  itemGenerated?: TileType;
  itemPosition?: Position;
}

// Game engine types (shared across widgets and features)
export interface GameState {
  board: Board;
  selected: Position | null;
  animating: boolean;
  lastMatches: MatchResult[];
  lastRemoved: Tile[];
  score: number;
}

export interface ProcessResult {
  board: Board;
  allRemoved: Tile[];
  matchResults: MatchResult[];
  steps: BoardStep[];
}

export interface BoardStep {
  type: 'swap' | 'match' | 'item_activate' | 'gravity' | 'cascade';
  board: Board;
  removed?: Tile[];
  matches?: MatchResult[];
}
