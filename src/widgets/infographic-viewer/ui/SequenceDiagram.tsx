'use client';

import { motion } from 'framer-motion';
import type { SequenceActor, SequenceMessage } from '../model/types';

const INDIGO = 'rgba(129,140,248,0.9)';
const EMERALD = 'rgba(16,185,129,0.9)';
const SELF_COLOR = 'rgba(200,200,255,0.6)';

const LIFELINE_TOP = 80;
const ACTOR_BOX_W = 120;
const ACTOR_BOX_H = 36;
const MSG_START_Y = 140;
const MSG_SPACING = 60;
const SVG_PADDING = 60;
const SELF_LOOP_W = 54;
const SELF_LOOP_H = 30;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const arrowVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

interface ComputedMessage extends SequenceMessage {
  _y: number;
  _fromX: number;
  _toX: number;
}

interface Props {
  actors: SequenceActor[];
  messages: SequenceMessage[];
}

function computeLayout(actors: SequenceActor[], messages: SequenceMessage[], svgWidth: number) {
  const usableWidth = svgWidth - SVG_PADDING * 2;
  const actorXMap: Record<string, number> = {};
  actors.forEach((actor, i) => {
    const x = SVG_PADDING + (actors.length === 1 ? usableWidth / 2 : (i / (actors.length - 1)) * usableWidth);
    actorXMap[actor.id] = x;
  });

  const computed: ComputedMessage[] = messages.map((msg, i) => ({
    ...msg,
    _y: MSG_START_Y + i * MSG_SPACING,
    _fromX: actorXMap[msg.from] ?? SVG_PADDING,
    _toX: actorXMap[msg.to] ?? SVG_PADDING,
  }));

  const lifelineBottom = MSG_START_Y + messages.length * MSG_SPACING + 40;
  const svgHeight = lifelineBottom + 20;

  return { actorXMap, computed, lifelineBottom, svgHeight };
}

function MessageArrow({ msg }: { msg: ComputedMessage }) {
  if (msg.isSelf) {
    const ax = msg._fromX;
    const top = msg._y - SELF_LOOP_H / 2;
    const bottom = msg._y + SELF_LOOP_H / 2;
    return (
      <motion.g variants={arrowVariants} style={{ originX: `${ax}px` }}>
        <path
          d={`M ${ax} ${top} Q ${ax + SELF_LOOP_W + 20} ${top}, ${ax + SELF_LOOP_W} ${msg._y} Q ${ax + SELF_LOOP_W + 20} ${bottom}, ${ax} ${bottom}`}
          stroke={SELF_COLOR}
          strokeWidth={1.5}
          fill="none"
          markerEnd="url(#seq-arrow-self)"
        />
        <text
          x={ax + SELF_LOOP_W + 26}
          y={msg._y + 4}
          fontSize={11}
          fill="rgba(255,255,255,0.7)"
          fontFamily="'JetBrains Mono', monospace"
        >
          {msg.label}
        </text>
      </motion.g>
    );
  }

  const color = msg.isResponse ? EMERALD : INDIGO;
  const markerId = msg.isResponse ? 'seq-arrow-emerald' : 'seq-arrow-indigo';
  const dash = msg.isResponse ? '6 3' : undefined;
  const midX = (msg._fromX + msg._toX) / 2;

  return (
    <motion.g variants={arrowVariants} style={{ originX: `${msg._fromX}px` }}>
      <line
        x1={msg._fromX}
        y1={msg._y}
        x2={msg._toX}
        y2={msg._y}
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray={dash}
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={midX}
        y={msg._y - 8}
        textAnchor="middle"
        fontSize={11}
        fill="rgba(255,255,255,0.8)"
        fontFamily="'JetBrains Mono', monospace"
      >
        {msg.label}
      </text>
    </motion.g>
  );
}

export function SequenceDiagram({ actors, messages }: Props) {
  const SVG_WIDTH = 700;
  const { actorXMap, computed, lifelineBottom, svgHeight } = computeLayout(actors, messages, SVG_WIDTH);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <motion.svg
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        className="w-full min-w-[560px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Sequence diagram"
      >
        <defs>
          <marker id="seq-arrow-indigo" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={INDIGO} />
          </marker>
          <marker id="seq-arrow-emerald" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={EMERALD} />
          </marker>
          <marker id="seq-arrow-self" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={SELF_COLOR} />
          </marker>
        </defs>

        {/* Lifelines */}
        {actors.map((actor) => {
          const ax = actorXMap[actor.id] ?? SVG_PADDING;
          return (
            <motion.line
              key={`lifeline-${actor.id}`}
              x1={ax}
              y1={LIFELINE_TOP}
              x2={ax}
              y2={lifelineBottom}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              variants={fadeIn}
            />
          );
        })}

        {/* Actor boxes */}
        {actors.map((actor) => {
          const ax = actorXMap[actor.id] ?? SVG_PADDING;
          return (
            <motion.g key={`actor-${actor.id}`} variants={fadeIn}>
              <rect
                x={ax - ACTOR_BOX_W / 2}
                y={LIFELINE_TOP - ACTOR_BOX_H - 4}
                width={ACTOR_BOX_W}
                height={ACTOR_BOX_H}
                rx={8}
                ry={8}
                fill="rgba(255,255,255,0.08)"
                stroke="rgba(129,140,248,0.45)"
                strokeWidth={1.5}
              />
              <text
                x={ax}
                y={LIFELINE_TOP - ACTOR_BOX_H / 2 - 4 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fill="white"
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
              >
                {actor.label}
              </text>
            </motion.g>
          );
        })}

        {/* Messages */}
        {computed.map((msg, i) => (
          <MessageArrow key={`msg-${i}`} msg={msg} />
        ))}

        {/* Step numbers */}
        {computed
          .filter((m) => !m.isSelf)
          .map((msg, i) => {
            const labelX = msg._fromX < msg._toX ? msg._fromX + 10 : msg._toX + 10;
            return (
              <motion.text
                key={`step-${i}`}
                x={labelX}
                y={msg._y + 18}
                fontSize={9}
                fill="rgba(255,255,255,0.35)"
                fontFamily="system-ui"
                variants={fadeIn}
              >
                {i + 1}
              </motion.text>
            );
          })}
      </motion.svg>
    </div>
  );
}
