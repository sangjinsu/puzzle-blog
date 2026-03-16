export const GRID_ROWS = 7;
export const GRID_COLS = 7;
export const TILE_COLORS = ['red', 'blue', 'green', 'yellow', 'orange'] as const;
export const TILE_SIZE = 48;
export const TILE_GAP = 4;

export const ANIMATION_DURATION = {
  swap: 0.25,
  remove: 0.35,
  fall: 0.3,
  spawn: 0.2,
  item: 0.4,
} as const;

export const COLORS = {
  primary: '#6366F1',
  secondary: '#F59E0B',
  surface: '#F8FAFC',
  text: '#1E293B',
  accent: '#10B981',
} as const;
