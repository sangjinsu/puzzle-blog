export type TileColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

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
