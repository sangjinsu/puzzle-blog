import { TILE_COLORS, GRID_ROWS, GRID_COLS } from '@/shared/config/constants';
import type { Tile, TileColor, Board } from '../model/types';

let tileIdCounter = 0;

export function generateTileId(): string {
  return `tile-${++tileIdCounter}-${Date.now()}`;
}

export function resetTileIdCounter(): void {
  tileIdCounter = 0;
}

export function randomColor(): TileColor {
  return TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)]!;
}

export function createTile(row: number, col: number, color?: TileColor): Tile {
  return {
    id: generateTileId(),
    color: color ?? randomColor(),
    type: 'normal',
    row,
    col,
  };
}

function hasMatch(board: Board, row: number, col: number): boolean {
  const tile = board[row]?.[col];
  if (!tile) return false;

  // Check horizontal match (left 2)
  if (
    col >= 2 &&
    board[row]?.[col - 1]?.color === tile.color &&
    board[row]?.[col - 2]?.color === tile.color
  ) {
    return true;
  }

  // Check vertical match (up 2)
  if (
    row >= 2 &&
    board[row - 1]?.[col]?.color === tile.color &&
    board[row - 2]?.[col]?.color === tile.color
  ) {
    return true;
  }

  return false;
}

export function createBoard(rows: number = GRID_ROWS, cols: number = GRID_COLS): Board {
  const board: Board = [];

  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      let tile = createTile(r, c);
      board[r]![c] = tile;
      let attempts = 0;

      while (hasMatch(board, r, c) && attempts < 50) {
        tile = createTile(r, c);
        board[r]![c] = tile;
        attempts++;
      }
    }
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((tile) => (tile ? { ...tile } : null))
  );
}
