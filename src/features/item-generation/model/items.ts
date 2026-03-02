import type { Board, Tile, MatchResult, TileType } from '@/entities/tile';
import { cloneBoard } from '@/entities/tile';

export function generateItem(board: Board, match: MatchResult): Board {
  if (!match.itemGenerated || !match.itemPosition) return board;

  const newBoard = cloneBoard(board);
  const { row, col } = match.itemPosition;
  const tile = newBoard[row]?.[col];

  if (tile) {
    newBoard[row]![col] = {
      ...tile,
      type: match.itemGenerated,
    };
  }

  return newBoard;
}

export function activateItem(board: Board, tile: Tile): { board: Board; removedTiles: Tile[] } {
  const newBoard = cloneBoard(board);
  const removed: Tile[] = [];
  const rows = newBoard.length;
  if (rows === 0) return { board: newBoard, removedTiles: removed };
  const cols = newBoard[0]!.length;

  switch (tile.type) {
    case 'rocket_h': {
      // Remove entire row
      const row = tile.row;
      for (let c = 0; c < cols; c++) {
        const t = newBoard[row]?.[c];
        if (t) {
          removed.push(t);
          newBoard[row]![c] = null;
        }
      }
      break;
    }

    case 'rocket_v': {
      // Remove entire column
      const col = tile.col;
      for (let r = 0; r < rows; r++) {
        const t = newBoard[r]?.[col];
        if (t) {
          removed.push(t);
          newBoard[r]![col] = null;
        }
      }
      break;
    }

    case 'bomb': {
      // Remove 3x3 area
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = tile.row + dr;
          const c = tile.col + dc;
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            const t = newBoard[r]?.[c];
            if (t) {
              removed.push(t);
              newBoard[r]![c] = null;
            }
          }
        }
      }
      break;
    }

    default:
      break;
  }

  return { board: newBoard, removedTiles: removed };
}

export function getItemEffect(type: TileType): string {
  switch (type) {
    case 'rocket_h': return 'row_clear';
    case 'rocket_v': return 'col_clear';
    case 'bomb': return 'area_blast';
    default: return 'none';
  }
}
