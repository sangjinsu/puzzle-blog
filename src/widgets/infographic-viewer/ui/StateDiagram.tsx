'use client';

import { motion } from 'framer-motion';
import type { StateNode, StateTransition } from '../model/types';

interface StateDiagramProps {
  states: StateNode[];
  transitions: StateTransition[];
}

const INDIGO = 'rgba(129,140,248,0.8)';
const INDIGO_FILL = 'rgba(99,102,241,0.25)';
const AMBER = 'rgba(251,191,36,0.9)';

const NODE_W = 120;
const NODE_H = 44;
const NODE_GAP = 80;
const PAD = 24;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

const lineVariants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.45, ease: 'easeInOut' as const },
  },
};

function nodeX(index: number) {
  return PAD + index * (NODE_W + NODE_GAP);
}

const NODE_Y = 60;

function nodeCX(index: number) {
  return nodeX(index) + NODE_W / 2;
}

const nodeCY = NODE_Y + NODE_H / 2;

function getStateIndex(states: StateNode[], id: string) {
  return states.findIndex((s) => s.id === id);
}

function buildPath(
  fromIdx: number,
  toIdx: number,
  allTransitions: StateTransition[],
  transIndex: number,
  total: number
): string {
  const x1 = nodeCX(fromIdx);
  const y1 = nodeCY;
  const x2 = nodeCX(toIdx);
  const y2 = nodeCY;

  if (fromIdx === toIdx) {
    // Self-loop: arc above the node
    const cx = x1;
    const topY = NODE_Y - 36;
    return `M ${x1 - 14} ${NODE_Y} C ${x1 - 28} ${topY}, ${x1 + 28} ${topY}, ${x1 + 14} ${NODE_Y}`;
  }

  // Check if there's a reverse transition — offset this one
  const hasReverse = allTransitions.some((t) => {
    return t.from === allTransitions[transIndex]?.to && t.to === allTransitions[transIndex]?.from;
  });

  const mx = (x1 + x2) / 2;
  const offset = hasReverse ? (fromIdx < toIdx ? -30 : 30) : 0;
  const cy = y1 + offset;
  return `M ${x1} ${y1} Q ${mx} ${cy}, ${x2} ${y2}`;
}

export function StateDiagram({ states, transitions }: StateDiagramProps) {
  const totalW = states.length * (NODE_W + NODE_GAP) - NODE_GAP + PAD * 2;
  const svgH = 180;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <motion.svg
        viewBox={`0 0 ${totalW} ${svgH}`}
        className="w-full"
        style={{ minWidth: Math.max(totalW, 400) }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="State Diagram"
      >
        <defs>
          <marker id="state-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={INDIGO} />
          </marker>
        </defs>

        {/* Transitions */}
        {transitions.map((trans, tIdx) => {
          const fromIdx = getStateIndex(states, trans.from);
          const toIdx = getStateIndex(states, trans.to);
          if (fromIdx < 0 || toIdx < 0) return null;

          const d = buildPath(fromIdx, toIdx, transitions, tIdx, transitions.length);

          // Label position: midpoint of curve, shifted up
          const x1 = nodeCX(fromIdx);
          const x2 = nodeCX(toIdx);
          const isSelf = fromIdx === toIdx;
          const labelX = isSelf ? x1 : (x1 + x2) / 2;
          const hasReverse = transitions.some((t) => t.from === trans.to && t.to === trans.from);
          const offset = hasReverse ? (fromIdx < toIdx ? -30 : 30) : 0;
          const labelY = isSelf ? NODE_Y - 52 : nodeCY + offset - 10;

          return (
            <motion.g key={`${trans.from}-${trans.to}-${tIdx}`} variants={lineVariants}>
              <motion.path
                d={d}
                stroke={INDIGO}
                strokeWidth={1.6}
                fill="none"
                markerEnd="url(#state-arrow)"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fontSize={10}
                fill={AMBER}
                fontFamily="system-ui, sans-serif"
                fontWeight={600}
              >
                {trans.label}
              </text>
            </motion.g>
          );
        })}

        {/* State nodes */}
        {states.map((state, sIdx) => {
          const sx = nodeX(sIdx);
          const sy = NODE_Y;
          const cx = nodeCX(sIdx);
          const cy = nodeCY;

          return (
            <motion.g key={state.id} variants={nodeVariants}>
              {/* Initial state indicator */}
              {state.isInitial && (
                <>
                  <circle cx={sx - 16} cy={cy} r={6} fill={INDIGO} />
                  <line
                    x1={sx - 10}
                    y1={cy}
                    x2={sx}
                    y2={cy}
                    stroke={INDIGO}
                    strokeWidth={1.5}
                    markerEnd="url(#state-arrow)"
                  />
                </>
              )}

              {/* Node rect */}
              <rect
                x={sx}
                y={sy}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={INDIGO_FILL}
                stroke={INDIGO}
                strokeWidth={state.isFinal ? 0 : 1.5}
              />

              {/* Final state: double ring border */}
              {state.isFinal && (
                <>
                  <rect
                    x={sx}
                    y={sy}
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    fill="none"
                    stroke={INDIGO}
                    strokeWidth={1.5}
                  />
                  <rect
                    x={sx + 4}
                    y={sy + 4}
                    width={NODE_W - 8}
                    height={NODE_H - 8}
                    rx={7}
                    fill="none"
                    stroke={INDIGO}
                    strokeWidth={1.5}
                  />
                </>
              )}

              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fill="white"
                fontFamily="system-ui, sans-serif"
                fontWeight={600}
              >
                {state.label}
              </text>
            </motion.g>
          );
        })}

        {/* Legend */}
        <motion.g variants={nodeVariants} transform={`translate(${PAD}, ${svgH - 22})`}>
          <circle cx={5} cy={5} r={5} fill={INDIGO} />
          <text x={14} y={9} fontSize={9} fill="rgba(255,255,255,0.5)" fontFamily="system-ui">
            Initial
          </text>
          <rect x={50} y={0} width={20} height={10} rx={2} fill="none" stroke={INDIGO} strokeWidth={1.2} />
          <rect x={52} y={2} width={16} height={6} rx={1} fill="none" stroke={INDIGO} strokeWidth={1.2} />
          <text x={74} y={9} fontSize={9} fill="rgba(255,255,255,0.5)" fontFamily="system-ui">
            Final
          </text>
        </motion.g>
      </motion.svg>
    </div>
  );
}
