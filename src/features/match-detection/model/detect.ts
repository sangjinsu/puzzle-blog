import type { Board, Tile, MatchResult, Position, TileType } from '@/entities/tile';

function getTile(board: Board, row: number, col: number): Tile | null {
  return board[row]?.[col] ?? null;
}

function findHorizontalRuns(board: Board): Tile[][] {
  const runs: Tile[][] = [];
  const rows = board.length;

  for (let r = 0; r < rows; r++) {
    const cols = board[r]!.length;
    let runStart = 0;

    for (let c = 1; c <= cols; c++) {
      const current = getTile(board, r, c);
      const prev = getTile(board, r, runStart);

      if (current && prev && current.color === prev.color) {
        continue;
      }

      const runLength = c - runStart;
      if (runLength >= 3 && prev) {
        const run: Tile[] = [];
        for (let i = runStart; i < c; i++) {
          const t = getTile(board, r, i);
          if (t) run.push(t);
        }
        runs.push(run);
      }
      runStart = c;
    }
  }

  return runs;
}

function findVerticalRuns(board: Board): Tile[][] {
  const runs: Tile[][] = [];
  const rows = board.length;
  if (rows === 0) return runs;
  const cols = board[0]!.length;

  for (let c = 0; c < cols; c++) {
    let runStart = 0;

    for (let r = 1; r <= rows; r++) {
      const current = getTile(board, r, c);
      const prev = getTile(board, runStart, c);

      if (current && prev && current.color === prev.color) {
        continue;
      }

      const runLength = r - runStart;
      if (runLength >= 3 && prev) {
        const run: Tile[] = [];
        for (let i = runStart; i < r; i++) {
          const t = getTile(board, i, c);
          if (t) run.push(t);
        }
        runs.push(run);
      }
      runStart = r;
    }
  }

  return runs;
}

function findSquareMatches(board: Board): Tile[][] {
  const matches: Tile[][] = [];
  const rows = board.length;
  if (rows === 0) return matches;
  const cols = board[0]!.length;

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const tl = getTile(board, r, c);
      const tr = getTile(board, r, c + 1);
      const bl = getTile(board, r + 1, c);
      const br = getTile(board, r + 1, c + 1);

      if (tl && tr && bl && br &&
          tl.color === tr.color &&
          tl.color === bl.color &&
          tl.color === br.color) {
        matches.push([tl, tr, bl, br]);
      }
    }
  }

  return matches;
}

function tileSetKey(tile: Tile): string {
  return `${tile.row},${tile.col}`;
}

function mergeTileSets(sets: Tile[][]): Tile[][] {
  // Merge overlapping tile groups
  const merged: Tile[][] = [];
  const visited = new Set<number>();

  for (let i = 0; i < sets.length; i++) {
    if (visited.has(i)) continue;

    const group = new Map<string, Tile>();
    for (const t of sets[i]!) {
      group.set(tileSetKey(t), t);
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (let j = i + 1; j < sets.length; j++) {
        if (visited.has(j)) continue;

        const overlap = sets[j]!.some((t) => group.has(tileSetKey(t)));
        if (overlap) {
          for (const t of sets[j]!) {
            group.set(tileSetKey(t), t);
          }
          visited.add(j);
          changed = true;
        }
      }
    }

    visited.add(i);
    merged.push(Array.from(group.values()));
  }

  return merged;
}

function classifyMatch(tiles: Tile[]): { pattern: MatchResult['pattern']; itemGenerated?: TileType; itemPosition?: Position } {
  const positions = new Set(tiles.map((t) => tileSetKey(t)));
  const rows = new Set(tiles.map((t) => t.row));
  const cols = new Set(tiles.map((t) => t.col));

  // Check for T or L shape (5+ tiles spanning both rows and cols)
  if (tiles.length >= 5 && rows.size >= 2 && cols.size >= 2) {
    const center = findIntersectionTile(tiles);
    return {
      pattern: isLShape(tiles) ? 'L' : 'T',
      itemGenerated: 'bomb',
      itemPosition: center ? { row: center.row, col: center.col } : { row: tiles[0]!.row, col: tiles[0]!.col },
    };
  }

  // Check for square (2x2)
  if (tiles.length === 4 && rows.size === 2 && cols.size === 2) {
    return {
      pattern: 'square',
      itemGenerated: 'bomb',
      itemPosition: { row: tiles[0]!.row, col: tiles[0]!.col },
    };
  }

  // 4-match horizontal
  if (tiles.length === 4 && rows.size === 1) {
    return {
      pattern: 'four_h',
      itemGenerated: 'rocket_v',
      itemPosition: { row: tiles[1]!.row, col: tiles[1]!.col },
    };
  }

  // 4-match vertical
  if (tiles.length === 4 && cols.size === 1) {
    return {
      pattern: 'four_v',
      itemGenerated: 'rocket_h',
      itemPosition: { row: tiles[1]!.row, col: tiles[1]!.col },
    };
  }

  // 5+ in a line
  if (tiles.length >= 5 && rows.size === 1) {
    return {
      pattern: 'four_h',
      itemGenerated: 'rocket_v',
      itemPosition: { row: tiles[2]!.row, col: tiles[2]!.col },
    };
  }

  if (tiles.length >= 5 && cols.size === 1) {
    return {
      pattern: 'four_v',
      itemGenerated: 'rocket_h',
      itemPosition: { row: tiles[2]!.row, col: tiles[2]!.col },
    };
  }

  // Default: 3-match
  return { pattern: 'three' };
}

function findIntersectionTile(tiles: Tile[]): Tile | null {
  // Find the tile that shares both row and column with other tiles
  for (const tile of tiles) {
    const sameRow = tiles.filter((t) => t.row === tile.row && t.col !== tile.col);
    const sameCol = tiles.filter((t) => t.col === tile.col && t.row !== tile.row);
    if (sameRow.length >= 1 && sameCol.length >= 1) {
      return tile;
    }
  }
  return null;
}

function isLShape(tiles: Tile[]): boolean {
  const center = findIntersectionTile(tiles);
  if (!center) return false;

  const sameRow = tiles.filter((t) => t.row === center.row);
  const sameCol = tiles.filter((t) => t.col === center.col);

  // L-shape: center is at the end of one arm
  const rowMin = Math.min(...sameRow.map((t) => t.col));
  const rowMax = Math.max(...sameRow.map((t) => t.col));
  const colMin = Math.min(...sameCol.map((t) => t.row));
  const colMax = Math.max(...sameCol.map((t) => t.row));

  const centerAtRowEdge = center.col === rowMin || center.col === rowMax;
  const centerAtColEdge = center.row === colMin || center.row === colMax;

  return centerAtRowEdge || centerAtColEdge;
}

export function detectMatches(board: Board): MatchResult[] {
  const hRuns = findHorizontalRuns(board);
  const vRuns = findVerticalRuns(board);
  const squares = findSquareMatches(board);

  const allSets = [...hRuns, ...vRuns, ...squares];
  if (allSets.length === 0) return [];

  const merged = mergeTileSets(allSets);

  return merged.map((tiles) => {
    const { pattern, itemGenerated, itemPosition } = classifyMatch(tiles);
    return {
      tiles,
      pattern,
      itemGenerated,
      itemPosition,
    };
  });
}

export function hasAnyMatch(board: Board): boolean {
  return detectMatches(board).length > 0;
}

export function hasValidMoves(board: Board): boolean {
  const rows = board.length;
  if (rows === 0) return false;
  const cols = board[0]!.length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Try swap right
      if (c < cols - 1) {
        const swapped = swapInBoard(board, r, c, r, c + 1);
        if (hasAnyMatch(swapped)) return true;
      }
      // Try swap down
      if (r < rows - 1) {
        const swapped = swapInBoard(board, r, c, r + 1, c);
        if (hasAnyMatch(swapped)) return true;
      }
    }
  }

  return false;
}

function swapInBoard(board: Board, r1: number, c1: number, r2: number, c2: number): Board {
  const newBoard = board.map((row) => row.map((t) => (t ? { ...t } : null)));
  const t1 = newBoard[r1]?.[c1];
  const t2 = newBoard[r2]?.[c2];
  if (!t1 || !t2) return newBoard;

  newBoard[r1]![c1] = { ...t2, row: r1, col: c1 };
  newBoard[r2]![c2] = { ...t1, row: r2, col: c2 };
  return newBoard;
}
