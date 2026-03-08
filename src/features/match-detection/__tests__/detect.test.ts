import { describe, test, expect } from 'bun:test';
import { detectMatches, hasAnyMatch } from '../model/detect';
import type { Board, Tile } from '@/entities/tile';

function makeTile(row: number, col: number, color: string, type = 'normal'): Tile {
  return { id: `t-${row}-${col}`, color: color as Tile['color'], type: type as Tile['type'], row, col };
}

function makeBoard(colors: string[][]): Board {
  return colors.map((row, r) =>
    row.map((color, c) => makeTile(r, c, color))
  );
}

describe('detectMatches', () => {
  test('detects horizontal 3-match', () => {
    const board = makeBoard([
      ['red', 'red', 'red', 'blue', 'green', 'yellow', 'orange'],
      ['blue', 'green', 'yellow', 'orange', 'red', 'blue', 'green'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['yellow', 'orange', 'red', 'blue', 'green', 'yellow', 'orange'],
      ['orange', 'red', 'blue', 'green', 'yellow', 'orange', 'red'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['blue', 'green', 'yellow', 'orange', 'red', 'blue', 'green'],
    ]);

    const matches = detectMatches(board);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0]!.pattern).toBe('three');
    expect(matches[0]!.tiles.length).toBe(3);
  });

  test('detects vertical 3-match', () => {
    const board = makeBoard([
      ['red', 'blue', 'green', 'yellow', 'orange', 'blue', 'green'],
      ['red', 'green', 'yellow', 'orange', 'blue', 'green', 'yellow'],
      ['red', 'yellow', 'orange', 'blue', 'green', 'yellow', 'orange'],
      ['blue', 'orange', 'red', 'green', 'yellow', 'orange', 'red'],
      ['green', 'red', 'blue', 'yellow', 'orange', 'red', 'blue'],
      ['yellow', 'blue', 'green', 'orange', 'red', 'blue', 'green'],
      ['orange', 'green', 'yellow', 'red', 'blue', 'green', 'yellow'],
    ]);

    const matches = detectMatches(board);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const vertMatch = matches.find((m) => m.tiles.every((t) => t.col === 0));
    expect(vertMatch).toBeDefined();
    expect(vertMatch!.tiles.length).toBe(3);
  });

  test('detects horizontal 4-match and generates rocket_v', () => {
    const board = makeBoard([
      ['red', 'red', 'red', 'red', 'green', 'yellow', 'orange'],
      ['blue', 'green', 'yellow', 'orange', 'red', 'blue', 'green'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['yellow', 'orange', 'red', 'blue', 'green', 'yellow', 'orange'],
      ['orange', 'red', 'blue', 'green', 'yellow', 'orange', 'red'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['blue', 'green', 'yellow', 'orange', 'red', 'blue', 'green'],
    ]);

    const matches = detectMatches(board);
    const fourMatch = matches.find((m) => m.tiles.length === 4);
    expect(fourMatch).toBeDefined();
    expect(fourMatch!.pattern).toBe('four_h');
    expect(fourMatch!.itemGenerated).toBe('rocket_v');
  });

  test('detects vertical 4-match and generates rocket_h', () => {
    const board = makeBoard([
      ['red', 'blue', 'green', 'yellow', 'orange', 'blue', 'green'],
      ['red', 'green', 'yellow', 'orange', 'blue', 'green', 'yellow'],
      ['red', 'yellow', 'orange', 'blue', 'green', 'yellow', 'orange'],
      ['red', 'orange', 'red', 'green', 'yellow', 'orange', 'red'],
      ['green', 'red', 'blue', 'yellow', 'orange', 'red', 'blue'],
      ['yellow', 'blue', 'green', 'orange', 'red', 'blue', 'green'],
      ['orange', 'green', 'yellow', 'red', 'blue', 'green', 'yellow'],
    ]);

    const matches = detectMatches(board);
    const fourMatch = matches.find((m) => m.tiles.length === 4);
    expect(fourMatch).toBeDefined();
    expect(fourMatch!.pattern).toBe('four_v');
    expect(fourMatch!.itemGenerated).toBe('rocket_h');
  });

  test('detects 2x2 square match and generates bomb', () => {
    const board = makeBoard([
      ['red', 'red', 'green', 'yellow', 'orange', 'blue', 'green'],
      ['red', 'red', 'yellow', 'orange', 'blue', 'green', 'yellow'],
      ['green', 'yellow', 'orange', 'blue', 'green', 'yellow', 'orange'],
      ['yellow', 'orange', 'red', 'green', 'yellow', 'orange', 'red'],
      ['orange', 'red', 'blue', 'yellow', 'orange', 'red', 'blue'],
      ['blue', 'green', 'yellow', 'orange', 'red', 'blue', 'green'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
    ]);

    const matches = detectMatches(board);
    const squareMatch = matches.find((m) => m.pattern === 'square');
    expect(squareMatch).toBeDefined();
    expect(squareMatch!.itemGenerated).toBe('bomb');
  });

  test('returns empty array for no matches', () => {
    const board = makeBoard([
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
    ]);

    const matches = detectMatches(board);
    expect(matches.length).toBe(0);
  });

  test('hasAnyMatch returns correct boolean', () => {
    const noMatchBoard = makeBoard([
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
    ]);
    expect(hasAnyMatch(noMatchBoard)).toBe(false);

    const matchBoard = makeBoard([
      ['red', 'red', 'red', 'yellow', 'orange', 'blue', 'green'],
      ['blue', 'green', 'yellow', 'orange', 'red', 'blue', 'green'],
      ['green', 'yellow', 'orange', 'red', 'blue', 'green', 'yellow'],
      ['yellow', 'orange', 'red', 'blue', 'green', 'yellow', 'orange'],
      ['orange', 'red', 'blue', 'green', 'yellow', 'orange', 'red'],
      ['red', 'blue', 'green', 'yellow', 'orange', 'red', 'blue'],
      ['blue', 'green', 'yellow', 'orange', 'red', 'blue', 'green'],
    ]);
    expect(hasAnyMatch(matchBoard)).toBe(true);
  });
});
