export interface Objective {
  type: 'collect_color' | 'collect_item' | 'clear_obstacle';
  target: string;
  count: number;
  current: number;
}

export interface Stage {
  id: number;
  name: string;
  gridSize: { rows: number; cols: number };
  moves: number;
  objectives: Objective[];
}

export interface StageState {
  stage: Stage;
  movesLeft: number;
  objectives: Objective[];
  status: 'ready' | 'playing' | 'continue_prompt' | 'cleared' | 'failed';
}
