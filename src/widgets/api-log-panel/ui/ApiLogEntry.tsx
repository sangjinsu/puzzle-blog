'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { APILogEntry } from '@/features/game-events';

interface ApiLogEntryProps {
  entry: APILogEntry;
}

const METHOD_STYLES: Record<string, string> = {
  POST: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  GET: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  PUT: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const STATUS_STYLES: Record<number, string> = {
  200: 'text-emerald-400',
  400: 'text-red-400',
  409: 'text-amber-400',
};

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ApiLogEntry({ entry }: ApiLogEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const hasBody = entry.request !== undefined || entry.response !== undefined;

  return (
    <div
      className={cn(
        'glass-subtle rounded-lg overflow-hidden transition-colors',
        hasBody && 'cursor-pointer hover:bg-white/5'
      )}
      onClick={() => hasBody && setExpanded((v) => !v)}
    >
      {/* Summary row */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Method badge */}
        <span
          className={cn(
            'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wide',
            METHOD_STYLES[entry.method] ?? 'bg-white/10 text-foreground'
          )}
        >
          {entry.method}
        </span>

        {/* Endpoint */}
        <span className="flex-1 truncate text-xs font-mono text-foreground">{entry.endpoint}</span>

        {/* Status */}
        <span
          className={cn(
            'shrink-0 text-xs font-mono font-semibold',
            STATUS_STYLES[entry.status] ?? 'text-muted-foreground'
          )}
        >
          {entry.status}
        </span>

        {/* Duration */}
        <span className="shrink-0 text-[10px] text-muted-foreground font-mono">{entry.duration}ms</span>

        {/* Timestamp */}
        <span className="shrink-0 text-[10px] text-muted-foreground font-mono">{formatTime(entry.timestamp)}</span>

        {/* Expand chevron */}
        {hasBody && (
          <ChevronDown
            className={cn(
              'shrink-0 h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        )}
      </div>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && hasBody && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-3 py-2 space-y-2">
              {entry.request !== undefined && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Request
                  </p>
                  <pre className="text-[10px] font-mono text-foreground/80 whitespace-pre-wrap break-all bg-black/20 rounded p-2 max-h-32 overflow-y-auto">
                    {JSON.stringify(entry.request, null, 2)}
                  </pre>
                </div>
              )}
              {entry.response !== undefined && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Response
                  </p>
                  <pre className="text-[10px] font-mono text-foreground/80 whitespace-pre-wrap break-all bg-black/20 rounded p-2 max-h-32 overflow-y-auto">
                    {JSON.stringify(entry.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
