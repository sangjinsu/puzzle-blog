/** Calculate the center point of a rectangle */
export function rectCenter(x: number, y: number, w: number, h: number) {
  return { cx: x + w / 2, cy: y + h / 2 };
}

/** Create an SVG path for a straight arrow between two points */
export function straightArrow(x1: number, y1: number, x2: number, y2: number): string {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

/** Create an SVG path for a curved arrow (quadratic bezier) */
export function curvedArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curvature = 40
): string {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 - curvature;
  return `M ${x1} ${y1} Q ${midX} ${midY}, ${x2} ${y2}`;
}

/** Distribute N items evenly across a given width with padding */
export function distributeEvenly(count: number, totalWidth: number, padding = 60): number[] {
  if (count <= 1) return [totalWidth / 2];
  const usable = totalWidth - padding * 2;
  const step = usable / (count - 1);
  return Array.from({ length: count }, (_, i) => padding + i * step);
}

/** Common Framer Motion stagger container variants */
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
} as const;

/** Common Framer Motion fade-in item variants */
export const fadeInItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
} as const;

/** Common Framer Motion scale-in item variants */
export const scaleInItem = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
} as const;

/** Infographic color palette — theme-aware */
export function getInfographicColors(isDark: boolean) {
  return {
    indigo: 'rgba(129,140,248,0.8)',
    emerald: 'rgba(16,185,129,0.8)',
    amber: 'rgba(251,191,36,0.9)',
    muted: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
    nodeFill: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)',
    nodeStroke: 'rgba(129,140,248,0.5)',
    text: isDark ? '#E2E8F0' : '#1E293B',
    textMuted: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    textSubtle: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    lifeline: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    legendText: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    columnType: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    columnFill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
    altRowFill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)',
    cardFill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.06)',
    headerFill: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)',
    selfColor: isDark ? 'rgba(200,200,255,0.6)' : 'rgba(99,102,241,0.5)',
    indigoFill: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)',
    actorStroke: isDark ? 'rgba(129,140,248,0.45)' : 'rgba(99,102,241,0.5)',
    msgText: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
    selfText: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
  } as const;
}

/** Legacy constant — kept for backward compatibility */
export const INFOGRAPHIC_COLORS = getInfographicColors(true);
