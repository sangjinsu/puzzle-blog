import { describe, test, expect } from 'bun:test';
import { activateItem } from '../model/items';
import type { Board, Tile } from '@/entities/tile';

function makeTile(row: number, col: number, color: string, type: string = 'normal'): Tile {
  return { id: `t-${row}-${col}`, color: color as Tile['color'], type: type as Tile['type'], row, col };
}

function makeFullBoard(rows: number, cols: number): Board {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      makeTile(r, c, colors[(r + c) % colors.length]!)
    )
  );
}

describe('item activation', () => {
  test('horizontal rocket clears entire row', () => {
    const board = makeFullBoard(4, 4);
    const rocket = makeTile(1, 2, 'red', 'rocket_h');
    board[1]![2] = rocket;

    const { board: result, removedTiles } = activateItem(board, rocket);

    // All tiles in row 1 should be removed
    for (let c = 0; c < 4; c++) {
      expect(result[1]![c]).toBeNull();
    }
    expect(removedTiles.length).toBe(4);
    // Other rows should be intact
    expect(result[0]![0]).not.toBeNull();
    expect(result[2]![0]).not.toBeNull();
  });

  test('vertical rocket clears entire column', () => {
    const board = makeFullBoard(4, 4);
    const rocket = makeTile(2, 1, 'blue', 'rocket_v');
    board[2]![1] = rocket;

    const { board: result, removedTiles } = activateItem(board, rocket);

    // All tiles in col 1 should be removed
    for (let r = 0; r < 4; r++) {
      expect(result[r]![1]).toBeNull();
    }
    expect(removedTiles.length).toBe(4);
    // Other columns should be intact
    expect(result[0]![0]).not.toBeNull();
    expect(result[0]![2]).not.toBeNull();
  });

  test('bomb clears 3x3 area', () => {
    const board = makeFullBoard(5, 5);
    const bomb = makeTile(2, 2, 'green', 'bomb');
    board[2]![2] = bomb;

    const { board: result, removedTiles } = activateItem(board, bomb);

    // 3x3 area around (2,2) should be cleared
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        expect(result[2 + dr]![2 + dc]).toBeNull();
      }
    }
    expect(removedTiles.length).toBe(9);
    // Corners should be intact
    expect(result[0]![0]).not.toBeNull();
    expect(result[4]![4]).not.toBeNull();
  });

  test('bomb at edge only clears valid cells', () => {
    const board = makeFullBoard(4, 4);
    const bomb = makeTile(0, 0, 'red', 'bomb');
    board[0]![0] = bomb;

    const { board: result, removedTiles } = activateItem(board, bomb);

    // Only 2x2 area should be cleared (corner)
    expect(result[0]![0]).toBeNull();
    expect(result[0]![1]).toBeNull();
    expect(result[1]![0]).toBeNull();
    expect(result[1]![1]).toBeNull();
    expect(removedTiles.length).toBe(4);
    // Rest should be intact
    expect(result[2]![2]).not.toBeNull();
  });

  test('normal tile activation does nothing', () => {
    const board = makeFullBoard(3, 3);
    const normal = makeTile(1, 1, 'red', 'normal');

    const { board: result, removedTiles } = activateItem(board, normal);
    expect(removedTiles.length).toBe(0);
    expect(result[1]![1]).not.toBeNull();
  });
});
