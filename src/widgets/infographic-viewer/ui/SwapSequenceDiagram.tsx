'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { getInfographicColors } from '../lib/svg-utils';

const ACTORS = [
  { id: 'client', label: 'Client', x: 100 },
  { id: 'server', label: 'Game Server', x: 350 },
  { id: 'db', label: 'Database', x: 600 },
] as const;

type ActorId = (typeof ACTORS)[number]['id'];

const LIFELINE_TOP = 80;
const LIFELINE_BOTTOM = 490;
const ACTOR_BOX_W = 120;
const ACTOR_BOX_H = 36;

interface Message {
  id: string;
  from: ActorId;
  to: ActorId;
  label: string;
  y: number;
  isResponse: boolean;
  isSelf?: boolean;
}

const INDIGO = 'rgba(129,140,248,0.9)';
const EMERALD = 'rgba(16,185,129,0.9)';

const MESSAGES: Message[] = [
  {
    id: 'req-swap',
    from: 'client',
    to: 'server',
    label: 'POST /api/game/swap { from, to }',
    y: 140,
    isResponse: false,
  },
  {
    id: 'validate',
    from: 'server',
    to: 'server',
    label: 'Validate swap',
    y: 200,
    isResponse: false,
    isSelf: true,
  },
  {
    id: 'detect',
    from: 'server',
    to: 'server',
    label: 'Detect matches',
    y: 250,
    isResponse: false,
    isSelf: true,
  },
  {
    id: 'update-db',
    from: 'server',
    to: 'db',
    label: 'UPDATE board_state',
    y: 310,
    isResponse: false,
  },
  {
    id: 'db-ok',
    from: 'db',
    to: 'server',
    label: 'OK',
    y: 370,
    isResponse: true,
  },
  {
    id: 'res-client',
    from: 'server',
    to: 'client',
    label: '200 { board, removed, items }',
    y: 430,
    isResponse: true,
  },
];

const getActor = (id: ActorId) => ACTORS.find((a) => a.id === id)!;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
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

function MessageArrow({ msg, colors }: { msg: Message; colors: ReturnType<typeof getInfographicColors> }) {
  if (msg.isSelf) {
    const serverX = getActor('server').x;
    const loopW = 50;
    const loopH = 30;
    const top = msg.y - loopH / 2;
    return (
      <motion.g variants={arrowVariants} style={{ originX: `${serverX}px` }}>
        <path
          d={`M ${serverX} ${top} Q ${serverX + loopW + 20} ${top}, ${serverX + loopW} ${msg.y} Q ${serverX + loopW + 20} ${msg.y + loopH}, ${serverX} ${msg.y + loopH / 2}`}
          stroke={colors.selfColor}
          strokeWidth={1.5}
          fill="none"
          markerEnd="url(#arrow-self)"
        />
        <text
          x={serverX + loopW + 26}
          y={msg.y + 4}
          fontSize={11}
          fill={colors.selfText}
          fontFamily="'JetBrains Mono', monospace"
        >
          {msg.label}
        </text>
      </motion.g>
    );
  }

  const fromX = getActor(msg.from).x;
  const toX = getActor(msg.to).x;
  const color = msg.isResponse ? EMERALD : INDIGO;
  const markerId = msg.isResponse ? 'arrow-emerald' : 'arrow-indigo';
  const dash = msg.isResponse ? '6 3' : undefined;

  return (
    <motion.g variants={arrowVariants} style={{ originX: `${fromX}px` }}>
      <line
        x1={fromX}
        y1={msg.y}
        x2={toX}
        y2={msg.y}
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray={dash}
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={(fromX + toX) / 2}
        y={msg.y - 8}
        textAnchor="middle"
        fontSize={11}
        fill={colors.msgText}
        fontFamily="'JetBrains Mono', monospace"
      >
        {msg.label}
      </text>
    </motion.g>
  );
}

export function SwapSequenceDiagram() {
  const { resolvedTheme } = useTheme();
  const colors = getInfographicColors(resolvedTheme === 'dark');

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-muted p-4">
      <motion.svg
        viewBox="0 0 700 510"
        className="w-full min-w-[560px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Swap sequence diagram"
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
            id="arrow-emerald"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={EMERALD} />
          </marker>
          <marker
            id="arrow-self"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={colors.selfColor} />
          </marker>
        </defs>

        {/* Lifelines */}
        {ACTORS.map((actor) => (
          <motion.line
            key={`lifeline-${actor.id}`}
            x1={actor.x}
            y1={LIFELINE_TOP}
            x2={actor.x}
            y2={LIFELINE_BOTTOM}
            stroke={colors.lifeline}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            variants={fadeIn}
          />
        ))}

        {/* Actor boxes */}
        {ACTORS.map((actor) => (
          <motion.g key={`actor-${actor.id}`} variants={fadeIn}>
            <rect
              x={actor.x - ACTOR_BOX_W / 2}
              y={LIFELINE_TOP - ACTOR_BOX_H - 4}
              width={ACTOR_BOX_W}
              height={ACTOR_BOX_H}
              rx={8}
              ry={8}
              fill={colors.nodeFill}
              stroke={colors.actorStroke}
              strokeWidth={1.5}
            />
            <text
              x={actor.x}
              y={LIFELINE_TOP - ACTOR_BOX_H / 2 - 4 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fill={colors.text}
              fontWeight={600}
              fontFamily="system-ui, sans-serif"
            >
              {actor.label}
            </text>
          </motion.g>
        ))}

        {/* Messages */}
        {MESSAGES.map((msg) => (
          <MessageArrow key={msg.id} msg={msg} colors={colors} />
        ))}

        {/* Step numbers */}
        {MESSAGES.filter((m) => !m.isSelf).map((msg, i) => {
          const fromX = getActor(msg.from).x;
          const toX = getActor(msg.to).x;
          const labelX = fromX < toX ? fromX + 10 : toX + 10;
          return (
            <motion.text
              key={`step-${msg.id}`}
              x={labelX}
              y={msg.y + 18}
              fontSize={9}
              fill={colors.textSubtle}
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
