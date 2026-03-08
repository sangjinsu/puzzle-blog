'use client';

import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '../model/event-store';
import type { APILogEntry } from '../model/types';

export function useApiLog(): APILogEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
