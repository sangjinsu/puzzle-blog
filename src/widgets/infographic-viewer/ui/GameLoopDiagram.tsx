'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { getInfographicColors } from '../lib/svg-utils';

const NODES = [
  { id: 'input', label: 'Player Input', x: 60, y: 60 },
  { id: 'validate', label: 'Validate Swap', x: 220, y: 60 },
  { id: 'detect', label: 'Detect Matches', x: 380, y: 60 },
  { id: 'generate', label: 'Generate Items', x: 540, y: 60 },
  { id: 'remove', label: 'Remove Tiles', x: 700, y: 60 },
  { id: 'gravity', label: 'Apply Gravity', x: 700, y: 220 },
  { id: 'cascades', label: 'Check Cascades', x: 540, y: 220 },
  { id: 'score', label: 'Update Score', x: 220, y: 220 },
] as const;

const NODE_W = 120;
const NODE_H = 44;

interface Arrow {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  color: string;
  dashed?: boolean;
}

const cx = (node: (typeof NODES)[number]) => node.x + NODE_W / 2;
const cy = (node: (typeof NODES)[number]) => node.y + NODE_H / 2;

const getNode = (id: string) => NODES.find((n) => n.id === id)!;

function makeArrow(
  fromId: string,
  toId: string,
  color: string,
  label?: string,
  dashed?: boolean
): Arrow {
  const from = getNode(fromId);
  const to = getNode(toId);
  return {
    id: `${fromId}-${toId}`,
    x1: cx(from),
    y1: cy(from),
    x2: cx(to),
    y2: cy(to),
    label,
    color,
    dashed,
  };
}

const INDIGO = 'rgba(129,140,248,0.8)';
const AMBER = 'rgba(251,191,36,0.9)';

const ARROWS: Arrow[] = [
  makeArrow('input', 'validate', INDIGO),
  makeArrow('validate', 'detect', INDIGO),
  makeArrow('detect', 'generate', INDIGO),
  makeArrow('generate', 'remove', INDIGO),
  {
    id: 'remove-gravity',
    x1: cx(getNode('remove')),
    y1: getNode('remove').y + NODE_H,
    x2: cx(getNode('gravity')),
    y2: getNode('gravity').y,
    color: INDIGO,
  },
  makeArrow('gravity', 'cascades', INDIGO),
  {
    id: 'cascades-detect',
    x1: cx(getNode('cascades')),
    y1: getNode('cascades').y,
    x2: cx(getNode('detect')),
    y2: getNode('detect').y + NODE_H,
    color: AMBER,
    label: 'cascade',
    dashed: true,
  },
  makeArrow('cascades', 'score', INDIGO, 'done'),
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const arrowVariants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: { opacity: 1, pathLength: 1, transition: { duration: 0.4, ease: 'easeInOut' as const } },
};

function arrowPath(arrow: Arrow): string {
  const { x1, y1, x2, y2, id } = arrow;
  if (id === 'cascades-detect') {
    const midY = Math.min(y1, y2) - 48;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

export function GameLoopDiagram() {
  const { resolvedTheme } = useTheme();
  const colors = getInfographicColors(resolvedTheme === 'dark');

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-muted p-4">
      <motion.svg
        viewBox="0 0 840 310"
        className="w-full min-w-[600px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Game loop cycle diagram"
      >
        <defs>
          <marker
            id="arrow-indigo"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={INDIGO} />
          </marker>
          <marker
            id="arrow-amber"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={AMBER} />
          </marker>
        </defs>

        {/* Arrows */}
        {ARROWS.map((arrow) => (
          <motion.path
            key={arrow.id}
            d={arrowPath(arrow)}
            stroke={arrow.color}
            strokeWidth={1.8}
            strokeDasharray={arrow.dashed ? '6 4' : undefined}
            fill="none"
            markerEnd={`url(#arrow-${arrow.color === AMBER ? 'amber' : 'indigo'})`}
            variants={arrowVariants}
          />
        ))}

        {/* Arrow labels */}
        {ARROWS.filter((a) => a.label).map((arrow) => {
          const midX = (arrow.x1 + arrow.x2) / 2;
          const midY =
            arrow.id === 'cascades-detect'
              ? Math.min(arrow.y1, arrow.y2) - 56
              : (arrow.y1 + arrow.y2) / 2 - 8;
          return (
            <motion.text
              key={`label-${arrow.id}`}
              x={midX}
              y={midY}
              textAnchor="middle"
              fontSize={10}
              fill={arrow.color}
              fontFamily="monospace"
              variants={itemVariants}
            >
              {arrow.label}
            </motion.text>
          );
        })}

        {/* Nodes */}
        {NODES.map((node) => (
          <motion.g key={node.id} variants={itemVariants}>
            <rect
              x={node.x}
              y={node.y}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              ry={8}
              fill={colors.nodeFill}
              stroke={colors.nodeStroke}
              strokeWidth={1.5}
            />
            <text
              x={node.x + NODE_W / 2}
              y={node.y + NODE_H / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fill={colors.text}
              fontFamily="system-ui, sans-serif"
              fontWeight={500}
            >
              {node.label}
            </text>
          </motion.g>
        ))}

        {/* Legend */}
        <motion.g variants={itemVariants}>
          <line x1={30} y1={290} x2={70} y2={290} stroke={INDIGO} strokeWidth={1.8} />
          <text x={76} y={294} fontSize={10} fill={colors.textMuted} fontFamily="system-ui">
            normal flow
          </text>
          <line
            x1={170}
            y1={290}
            x2={210}
            y2={290}
            stroke={AMBER}
            strokeWidth={1.8}
            strokeDasharray="6 4"
          />
          <text x={216} y={294} fontSize={10} fill={colors.textMuted} fontFamily="system-ui">
            cascade loop
          </text>
        </motion.g>
      </motion.svg>
    </div>
  );
}
