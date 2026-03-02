import type { Stage, StageState, Objective } from '@/entities/stage';
import type { Tile, TileColor } from '@/entities/tile';

export function initStageState(stage: Stage): StageState {
  return {
    stage,
    movesLeft: stage.moves,
    objectives: stage.objectives.map((o) => ({ ...o, current: 0 })),
    status: 'playing',
  };
}

export function useMoveAndTrack(state: StageState, removedTiles: Tile[]): StageState {
  if (state.status !== 'playing') return state;

  // Track removed tiles first
  const objectives = state.objectives.map((obj) => {
    if (obj.type === 'collect_color') {
      const count = removedTiles.filter((t) => t.color === obj.target).length;
      return { ...obj, current: Math.min(obj.current + count, obj.count) };
    }
    if (obj.type === 'collect_item') {
      const count = removedTiles.filter((t) => t.type === obj.target).length;
      return { ...obj, current: Math.min(obj.current + count, obj.count) };
    }
    return obj;
  });

  // Then consume a move
  const movesLeft = state.movesLeft - 1;
  const allComplete = objectives.every((o) => o.current >= o.count);

  if (allComplete) {
    return { ...state, objectives, movesLeft, status: 'cleared' };
  }

  if (movesLeft <= 0) {
    return { ...state, objectives, movesLeft: 0, status: 'failed' };
  }

  return { ...state, objectives, movesLeft };
}

export function isObjectiveComplete(obj: Objective): boolean {
  return obj.current >= obj.count;
}
