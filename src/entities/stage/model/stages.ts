import type { Stage } from './types';

export const STAGES: Stage[] = [
  {
    id: 1,
    name: '첫 번째 퍼즐',
    gridSize: { rows: 9, cols: 9 },
    moves: 20,
    objectives: [
      { type: 'collect_color', target: 'red', count: 15, current: 0 },
      { type: 'collect_color', target: 'blue', count: 15, current: 0 },
    ],
  },
  {
    id: 2,
    name: '폭탄 만들기',
    gridSize: { rows: 9, cols: 9 },
    moves: 25,
    objectives: [
      { type: 'collect_color', target: 'green', count: 20, current: 0 },
      { type: 'collect_color', target: 'yellow', count: 20, current: 0 },
      { type: 'collect_color', target: 'purple', count: 10, current: 0 },
    ],
  },
  {
    id: 3,
    name: '로켓 마스터',
    gridSize: { rows: 9, cols: 9 },
    moves: 30,
    objectives: [
      { type: 'collect_color', target: 'red', count: 30, current: 0 },
      { type: 'collect_color', target: 'blue', count: 30, current: 0 },
      { type: 'collect_color', target: 'green', count: 30, current: 0 },
    ],
  },
];

export function getStage(id: number): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}
