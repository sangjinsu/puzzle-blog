'use client';

import type { TileColor, TileType } from '../model/types';

const COLOR_MAP: Record<TileColor, { bg: string; border: string; icon: string }> = {
  red: { bg: 'bg-red-400', border: 'border-red-500', icon: '🔴' },
  blue: { bg: 'bg-blue-400', border: 'border-blue-500', icon: '🔵' },
  green: { bg: 'bg-emerald-400', border: 'border-emerald-500', icon: '🟢' },
  yellow: { bg: 'bg-amber-400', border: 'border-amber-500', icon: '🟡' },
  orange: { bg: 'bg-orange-400', border: 'border-orange-500', icon: '🟠' },
};

const ITEM_ICON: Record<TileType, string> = {
  normal: '',
  rocket_h: '🚀',
  rocket_v: '🚀',
  bomb: '💣',
};

interface TileIconProps {
  color: TileColor;
  type: TileType;
  size?: number;
  selected?: boolean;
}

export function TileIcon({ color, type, size = 48, selected = false }: TileIconProps) {
  const colorInfo = COLOR_MAP[color];
  const isItem = type !== 'normal';
  const itemIcon = ITEM_ICON[type];

  return (
    <div
      className={`
        ${colorInfo.bg} ${colorInfo.border}
        flex items-center justify-center rounded-lg border-2
        transition-shadow
        ${selected ? 'ring-3 ring-white shadow-lg scale-110' : ''}
        ${isItem ? 'ring-2 ring-amber-300' : ''}
      `}
      style={{ width: size, height: size }}
    >
      {isItem ? (
        <span
          className={`text-lg ${type === 'rocket_v' ? 'rotate-90' : ''}`}
          role="img"
          aria-label={type}
        >
          {itemIcon}
        </span>
      ) : (
        <div
          className={`rounded-full ${colorInfo.bg} opacity-80`}
          style={{ width: size * 0.5, height: size * 0.5 }}
        />
      )}
    </div>
  );
}
