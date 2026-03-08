import type { Board, Tile, MatchResult, Position, GameState, ProcessResult, BoardStep } from '@/entities/tile';
import { createBoard, cloneBoard } from '@/entities/tile';
import { detectMatches } from '@/features/match-detection';
import { applyGravity, removeTiles } from '@/features/gravity';
import { generateItem, activateItem } from '@/features/item-generation';

export type { GameState, ProcessResult, BoardStep };

export function createInitialGameState(rows = 7, cols = 7): GameState {
  return {
    board: createBoard(rows, cols),
    selected: null,
    animating: false,
    lastMatches: [],
    lastRemoved: [],
    score: 0,
  };
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function swapTiles(board: Board, a: Position, b: Position): Board {
  const newBoard = cloneBoard(board);
  const tileA = newBoard[a.row]?.[a.col];
  const tileB = newBoard[b.row]?.[b.col];

  if (!tileA || !tileB) return board;

  newBoard[a.row]![a.col] = { ...tileB, row: a.row, col: a.col };
  newBoard[b.row]![b.col] = { ...tileA, row: b.row, col: b.col };

  return newBoard;
}

export function processSwap(
  board: Board,
  from: Position,
  to: Position
): ProcessResult | null {
  const swapped = swapTiles(board, from, to);
  const tileFrom = swapped[from.row]?.[from.col];
  const tileTo = swapped[to.row]?.[to.col];

  // Check if either swapped tile is a special item
  const fromIsItem = tileTo && tileTo.type !== 'normal';
  const toIsItem = tileFrom && tileFrom.type !== 'normal';

  let currentBoard = swapped;
  const allRemoved: Tile[] = [];
  const allMatches: MatchResult[] = [];
  const steps: BoardStep[] = [{ type: 'swap', board: swapped }];

  // Activate items on swap
  if (fromIsItem && tileTo) {
    const { board: afterItem, removedTiles } = activateItem(currentBoard, tileTo);
    currentBoard = afterItem;
    allRemoved.push(...removedTiles);
    steps.push({ type: 'item_activate', board: currentBoard, removed: removedTiles });
  }
  if (toIsItem && tileFrom) {
    const { board: afterItem, removedTiles } = activateItem(currentBoard, tileFrom);
    currentBoard = afterItem;
    allRemoved.push(...removedTiles);
    steps.push({ type: 'item_activate', board: currentBoard, removed: removedTiles });
  }

  // Apply gravity after item activation so destroyed tiles get refilled
  if (allRemoved.length > 0) {
    const { board: afterGravity } = applyGravity(currentBoard);
    currentBoard = afterGravity;
    steps.push({ type: 'gravity', board: currentBoard });
  }

  // Check initial matches
  const initialMatches = detectMatches(currentBoard);

  // If no matches and no items activated, swap is invalid
  if (initialMatches.length === 0 && allRemoved.length === 0) {
    return null;
  }

  // Process matches and cascades
  let matches = initialMatches;
  while (matches.length > 0) {
    allMatches.push(...matches);

    // Collect all matched tiles
    const matchedTiles: Tile[] = [];
    for (const match of matches) {
      matchedTiles.push(...match.tiles);
    }
    allRemoved.push(...matchedTiles);

    // Generate items from matches (before removal so tile exists at position)
    for (const match of matches) {
      if (match.itemGenerated && match.itemPosition) {
        currentBoard = generateItem(currentBoard, match);
        // Exclude the item tile from removal
        const itemKey = `${match.itemPosition.row},${match.itemPosition.col}`;
        const idx = matchedTiles.findIndex(
          (t) => `${t.row},${t.col}` === itemKey
        );
        if (idx !== -1) {
          matchedTiles.splice(idx, 1);
        }
      }
    }

    // Remove matched tiles (excluding item tiles)
    currentBoard = removeTiles(currentBoard, matchedTiles);

    steps.push({ type: 'match', board: currentBoard, removed: matchedTiles, matches });

    // Apply gravity
    const { board: afterGravity } = applyGravity(currentBoard);
    currentBoard = afterGravity;
    steps.push({ type: 'gravity', board: currentBoard });

    // Check for cascade matches
    matches = detectMatches(currentBoard);
    if (matches.length > 0) {
      steps.push({ type: 'cascade', board: currentBoard, matches });
    }
  }

  return {
    board: currentBoard,
    allRemoved,
    matchResults: allMatches,
    steps,
  };
}
