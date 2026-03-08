import type { ProcessResult, BoardStep, Tile } from '@/entities/tile';
import type { HttpMethod, ApiStatus } from './types';
import { addEntry } from './event-store';

interface SimulatedApi {
  method: HttpMethod;
  endpoint: string;
  status: ApiStatus;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  duration: number;
  stepType: string;
}

function tileSummary(tiles: Tile[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tiles) {
    counts[t.color] = (counts[t.color] ?? 0) + 1;
  }
  return counts;
}

function stepToApi(step: BoardStep, index: number): SimulatedApi {
  switch (step.type) {
    case 'swap':
      return {
        method: 'POST',
        endpoint: '/api/game/swap',
        status: 200,
        request: { action: 'swap_tiles' },
        response: { success: true, boardUpdated: true },
        duration: 12 + Math.floor(Math.random() * 8),
        stepType: 'swap',
      };

    case 'match':
      return {
        method: 'POST',
        endpoint: '/api/game/validate-match',
        status: 200,
        request: {
          matchCount: step.matches?.length ?? 0,
          patterns: step.matches?.map((m) => m.pattern) ?? [],
        },
        response: {
          valid: true,
          removed: step.removed?.length ?? 0,
          removedByColor: step.removed ? tileSummary(step.removed) : {},
          itemsGenerated: step.matches
            ?.filter((m) => m.itemGenerated)
            .map((m) => ({ type: m.itemGenerated, position: m.itemPosition })) ?? [],
        },
        duration: 18 + Math.floor(Math.random() * 12),
        stepType: 'match',
      };

    case 'item_activate':
      return {
        method: 'POST',
        endpoint: '/api/game/activate-item',
        status: 200,
        request: {
          removedCount: step.removed?.length ?? 0,
        },
        response: {
          activated: true,
          tilesDestroyed: step.removed?.length ?? 0,
          destroyedByColor: step.removed ? tileSummary(step.removed) : {},
        },
        duration: 15 + Math.floor(Math.random() * 10),
        stepType: 'item_activate',
      };

    case 'gravity':
      return {
        method: 'POST',
        endpoint: '/api/game/apply-gravity',
        status: 200,
        request: { step: index },
        response: {
          tilesDropped: true,
          newTilesSpawned: true,
        },
        duration: 8 + Math.floor(Math.random() * 6),
        stepType: 'gravity',
      };

    case 'cascade':
      return {
        method: 'POST',
        endpoint: '/api/game/cascade',
        status: 200,
        request: {
          cascadeMatches: step.matches?.length ?? 0,
        },
        response: {
          cascadeDetected: true,
          matchCount: step.matches?.length ?? 0,
          patterns: step.matches?.map((m) => m.pattern) ?? [],
        },
        duration: 20 + Math.floor(Math.random() * 15),
        stepType: 'cascade',
      };
  }
}

export function simulateApiFromResult(result: ProcessResult): void {
  for (let i = 0; i < result.steps.length; i++) {
    const step = result.steps[i]!;
    const api = stepToApi(step, i);
    addEntry(api);
  }
}
