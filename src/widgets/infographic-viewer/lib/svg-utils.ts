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

/** Infographic color palette */
export const INFOGRAPHIC_COLORS = {
  indigo: 'rgba(129,140,248,0.8)',
  emerald: 'rgba(16,185,129,0.8)',
  amber: 'rgba(251,191,36,0.9)',
  muted: 'rgba(255,255,255,0.4)',
  nodeFill: 'rgba(255,255,255,0.08)',
  nodeStroke: 'rgba(129,140,248,0.5)',
  text: 'white',
  textMuted: 'rgba(255,255,255,0.6)',
} as const;
