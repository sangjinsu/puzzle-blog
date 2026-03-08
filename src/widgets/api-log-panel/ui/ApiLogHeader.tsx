'use client';

import { Trash2, Pause, Play } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { clearEntries, setPaused, isPaused } from '@/features/game-events';

interface ApiLogHeaderProps {
  count: number;
  paused: boolean;
  onPauseToggle: () => void;
  onClear: () => void;
  className?: string;
}

export function ApiLogHeader({ count, paused, onPauseToggle, onClear, className }: ApiLogHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-2 border-b border-white/10', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">API Log</span>
        <span className="text-xs text-muted-foreground bg-white/10 rounded-full px-2 py-0.5 font-mono">
          {count}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onPauseToggle}
          title={paused ? 'Resume' : 'Pause'}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors',
            paused
              ? 'text-amber-400 hover:bg-amber-400/10'
              : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
          )}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          <span>{paused ? 'Resume' : 'Pause'}</span>
        </button>
        <button
          onClick={onClear}
          title="Clear"
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}
