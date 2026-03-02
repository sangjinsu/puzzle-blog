import { describe, test, expect } from 'bun:test';
import { applyGravity, removeTiles } from '../model/gravity';
import type { Board, Tile } from '@/entities/tile';

function makeTile(row: number, col: number, color: string): Tile {
  return { id: `t-${row}-${col}`, color: color as Tile['color'], type: 'normal', row, col };
}

describe('gravity', () => {
  test('tiles fall down to fill gaps', () => {
    const board: Board = [
      [null, makeTile(0, 1, 'blue')],
      [makeTile(1, 0, 'red'), makeTile(1, 1, 'green')],
    ];

    const { board: result, moved } = applyGravity(board);
    expect(moved).toBe(true);
    // Column 0: tile should fall from row 1 to row 1 (already at bottom), new tile at row 0
    expect(result[1]![0]).not.toBeNull();
    expect(result[0]![0]).not.toBeNull();
    // Column 1: both rows filled, blue should be at row 0 or moved
    expect(result[0]![1]).not.toBeNull();
    expect(result[1]![1]).not.toBeNull();
  });

  test('empty cells are filled with new tiles', () => {
    const board: Board = [
      [null, null],
      [null, null],
    ];

    const { board: result, moved } = applyGravity(board);
    expect(moved).toBe(true);
    expect(result[0]![0]).not.toBeNull();
    expect(result[0]![1]).not.toBeNull();
    expect(result[1]![0]).not.toBeNull();
    expect(result[1]![1]).not.toBeNull();
  });

  test('no movement when board is full', () => {
    const board: Board = [
      [makeTile(0, 0, 'red'), makeTile(0, 1, 'blue')],
      [makeTile(1, 0, 'green'), makeTile(1, 1, 'yellow')],
    ];

    const { moved } = applyGravity(board);
    expect(moved).toBe(false);
  });

  test('removeTiles removes specified tiles', () => {
    const t1 = makeTile(0, 0, 'red');
    const t2 = makeTile(0, 1, 'blue');
    const t3 = makeTile(1, 0, 'green');
    const t4 = makeTile(1, 1, 'yellow');
    const board: Board = [[t1, t2], [t3, t4]];

    const result = removeTiles(board, [t1, t4]);
    expect(result[0]![0]).toBeNull();
    expect(result[0]![1]).not.toBeNull();
    expect(result[1]![0]).not.toBeNull();
    expect(result[1]![1]).toBeNull();
  });
});
