import type { Board, Tile } from '@/entities/tile';
import { createTile, cloneBoard } from '@/entities/tile';

export function applyGravity(board: Board): { board: Board; moved: boolean } {
  const newBoard = cloneBoard(board);
  const rows = newBoard.length;
  if (rows === 0) return { board: newBoard, moved: false };
  const cols = newBoard[0]!.length;
  let moved = false;

  for (let c = 0; c < cols; c++) {
    // Compact column downward
    let writePos = rows - 1;

    for (let r = rows - 1; r >= 0; r--) {
      const tile = newBoard[r]![c];
      if (tile) {
        if (r !== writePos) {
          newBoard[writePos]![c] = { ...tile, row: writePos, col: c };
          newBoard[r]![c] = null;
          moved = true;
        }
        writePos--;
      }
    }

    // Fill empty cells at top with new tiles
    for (let r = writePos; r >= 0; r--) {
      newBoard[r]![c] = createTile(r, c);
      moved = true;
    }
  }

  return { board: newBoard, moved };
}

export function removeTiles(board: Board, tiles: Tile[]): Board {
  const newBoard = cloneBoard(board);
  for (const tile of tiles) {
    if (newBoard[tile.row]) {
      newBoard[tile.row]![tile.col] = null;
    }
  }
  return newBoard;
}
