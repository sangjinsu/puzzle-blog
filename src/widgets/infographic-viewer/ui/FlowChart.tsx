'use client';

import { motion } from 'framer-motion';
import type { FlowNode, FlowEdge } from '../model/types';

const INDIGO = 'rgba(129,140,248,0.8)';
const AMBER = 'rgba(251,191,36,0.9)';
const EMERALD = 'rgba(16,185,129,0.9)';

const NODE_W = 140;
const NODE_H = 44;
const NODE_SPACING_Y = 140;
const SVG_PADDING_X = 60;
const SVG_PADDING_Y = 40;

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

interface ComputedNode extends FlowNode {
  cx: number;
  cy: number;
}

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

function computeNodes(nodes: FlowNode[], svgWidth: number): ComputedNode[] {
  const centerX = svgWidth / 2;
  return nodes.map((node, i) => ({
    ...node,
    cx: centerX,
    cy: SVG_PADDING_Y + NODE_H / 2 + i * NODE_SPACING_Y,
  }));
}

function nodeStroke(type: FlowNode['type']): string {
  switch (type) {
    case 'decision': return AMBER;
    case 'start':
    case 'end':    return EMERALD;
    default:       return INDIGO;
  }
}

function NodeShape({ node }: { node: ComputedNode }) {
  const stroke = nodeStroke(node.type);
  const fill = 'rgba(255,255,255,0.08)';

  if (node.type === 'start' || node.type === 'end') {
    // Pill shape
    return (
      <g>
        <rect
          x={node.cx - NODE_W / 2}
          y={node.cy - NODE_H / 2}
          width={NODE_W}
          height={NODE_H}
          rx={NODE_H / 2}
          ry={NODE_H / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.8}
        />
        <text
          x={node.cx}
          y={node.cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="white"
          fontWeight={600}
          fontFamily="system-ui, sans-serif"
        >
          {node.label}
        </text>
      </g>
    );
  }

  if (node.type === 'decision') {
    // Diamond: rotated square, half-diagonal = NODE_W/2
    const hw = NODE_W / 2;
    const hh = NODE_H / 2 + 8;
    const points = `${node.cx},${node.cy - hh} ${node.cx + hw},${node.cy} ${node.cx},${node.cy + hh} ${node.cx - hw},${node.cy}`;
    return (
      <g>
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.8}
        />
        <text
          x={node.cx}
          y={node.cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fill="white"
          fontWeight={500}
          fontFamily="system-ui, sans-serif"
        >
          {node.label}
        </text>
      </g>
    );
  }

  // Process: rounded rectangle
  return (
    <g>
      <rect
        x={node.cx - NODE_W / 2}
        y={node.cy - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={8}
        ry={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={node.cx}
        y={node.cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fill="white"
        fontWeight={500}
        fontFamily="system-ui, sans-serif"
      >
        {node.label}
      </text>
    </g>
  );
}

function edgePath(from: ComputedNode, to: ComputedNode): string {
  const fromBottomY = from.type === 'decision' ? from.cy + (NODE_H / 2 + 8) : from.cy + NODE_H / 2;
  const toTopY = to.type === 'decision' ? to.cy - (NODE_H / 2 + 8) : to.cy - NODE_H / 2;
  return `M ${from.cx} ${fromBottomY} L ${to.cx} ${toTopY}`;
}

export function FlowChart({ nodes, edges }: Props) {
  const SVG_WIDTH = 360;
  const computed = computeNodes(nodes, SVG_WIDTH);
  const nodeMap: Record<string, ComputedNode> = {};
  computed.forEach((n) => { nodeMap[n.id] = n; });

  const lastNode = computed[computed.length - 1];
  const svgHeight = lastNode
    ? lastNode.cy + NODE_H / 2 + SVG_PADDING_Y
    : SVG_PADDING_Y * 2;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <motion.svg
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        className="w-full max-w-sm mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Flow chart diagram"
      >
        <defs>
          <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={INDIGO} />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodeMap[edge.from];
          const toNode = nodeMap[edge.to];
          if (!fromNode || !toNode) return null;
          const d = edgePath(fromNode, toNode);
          const midX = (fromNode.cx + toNode.cx) / 2 + 8;
          const midY = (fromNode.cy + toNode.cy) / 2;
          return (
            <motion.g key={`edge-${i}`} variants={arrowVariants}>
              <motion.path
                d={d}
                stroke={INDIGO}
                strokeWidth={1.8}
                fill="none"
                markerEnd="url(#flow-arrow)"
              />
              {edge.label && (
                <text
                  x={midX}
                  y={midY}
                  fontSize={10}
                  fill="rgba(255,255,255,0.6)"
                  fontFamily="monospace"
                >
                  {edge.label}
                </text>
              )}
            </motion.g>
          );
        })}

        {/* Nodes */}
        {computed.map((node) => (
          <motion.g key={node.id} variants={itemVariants}>
            <NodeShape node={node} />
          </motion.g>
        ))}
      </motion.svg>
    </div>
  );
}
