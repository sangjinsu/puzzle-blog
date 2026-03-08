'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useApiLog, clearEntries, setPaused, isPaused } from '@/features/game-events';
import { ApiLogHeader } from './ApiLogHeader';
import { ApiLogEntry } from './ApiLogEntry';

interface ApiLogPanelProps {
  className?: string;
}

export function ApiLogPanel({ className }: ApiLogPanelProps) {
  const entries = useApiLog();
  const [paused, setPausedState] = useState(() => isPaused());
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(entries.length);

  // Auto-scroll to top when new entries arrive
  useEffect(() => {
    if (entries.length > prevCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevCountRef.current = entries.length;
  }, [entries.length]);

  function handlePauseToggle() {
    const next = !paused;
    setPaused(next);
    setPausedState(next);
  }

  function handleClear() {
    clearEntries();
  }

  return (
    <div className={cn('glass flex flex-col rounded-xl overflow-hidden', className)}>
      <ApiLogHeader
        count={entries.length}
        paused={paused}
        onPauseToggle={handlePauseToggle}
        onClear={handleClear}
      />

      {/* Scrollable log list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0"
      >
        <AnimatePresence initial={false}>
          {entries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-16 text-xs text-muted-foreground"
            >
              No API calls yet
            </motion.div>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <ApiLogEntry entry={entry} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
