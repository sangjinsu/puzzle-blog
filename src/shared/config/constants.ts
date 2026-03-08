export const GRID_ROWS = 7;
export const GRID_COLS = 7;
export const TILE_COLORS = ['red', 'blue', 'green', 'yellow', 'orange'] as const;
export const TILE_SIZE = 48;
export const TILE_GAP = 4;

export const ANIMATION_DURATION = {
  swap: 0.25,
  remove: 0.2,
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

// 3D rendering constants
export const TILE_3D_SIZE = 1;
export const TILE_3D_GAP = 0.12;
export const TILE_3D_HEIGHT = 0.3;
export const TILE_3D_RADIUS = 0.15;
export const CAMERA_ZOOM = 45;

export const TILE_3D_COLORS: Record<string, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  orange: '#F97316',
} as const;
