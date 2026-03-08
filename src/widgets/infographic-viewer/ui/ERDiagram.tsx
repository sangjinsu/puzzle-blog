'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import type { ERTable, ERRelation } from '../model/types';
import { getInfographicColors } from '../lib/svg-utils';

interface ERDiagramProps {
  tables: ERTable[];
  relations: ERRelation[];
}

const INDIGO = 'rgba(129,140,248,0.8)';
const AMBER = 'rgba(251,191,36,0.9)';
const EMERALD = 'rgba(16,185,129,0.9)';

const TABLE_W = 200;
const COL_H = 28;
const HEADER_H = 36;
const TABLE_GAP = 48;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

const lineVariants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.5, ease: 'easeInOut' as const },
  },
};

function tableHeight(table: ERTable) {
  return HEADER_H + table.columns.length * COL_H + 8;
}

function tableX(index: number) {
  return index * (TABLE_W + TABLE_GAP) + 20;
}

function tableY() {
  return 20;
}

function tableCenterX(index: number) {
  return tableX(index) + TABLE_W / 2;
}

function tableCenterY(table: ERTable) {
  return tableY() + tableHeight(table) / 2;
}

function getTableIndex(tables: ERTable[], name: string) {
  return tables.findIndex((t) => t.name === name);
}

function KeyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1.3" />
      <line x1="6.5" y1="6.5" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path
        d="M4 7L3 8a2.5 2.5 0 003.5 0l2-2a2.5 2.5 0 00-3.5-3.5L4 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M7 4l1-1A2.5 2.5 0 004.5 6.5L5.5 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ERDiagram({ tables, relations }: ERDiagramProps) {
  const { resolvedTheme } = useTheme();
  const colors = getInfographicColors(resolvedTheme === 'dark');

  const totalW = tables.length * (TABLE_W + TABLE_GAP) - TABLE_GAP + 40;
  const maxTableH = Math.max(...tables.map(tableHeight));
  const svgH = maxTableH + 120;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-muted p-4">
      <motion.svg
        viewBox={`0 0 ${totalW} ${svgH}`}
        className="w-full"
        style={{ minWidth: Math.max(totalW, 400) }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="ER Diagram"
      >
        <defs>
          <marker id="er-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={INDIGO} />
          </marker>
        </defs>

        {/* Relations */}
        {relations.map((rel) => {
          const fromIdx = getTableIndex(tables, rel.from);
          const toIdx = getTableIndex(tables, rel.to);
          if (fromIdx < 0 || toIdx < 0) return null;

          const fromTable = tables[fromIdx]!;
          const toTable = tables[toIdx]!;

          const x1 = fromIdx < toIdx ? tableX(fromIdx) + TABLE_W : tableX(fromIdx);
          const y1 = tableCenterY(fromTable);
          const x2 = fromIdx < toIdx ? tableX(toIdx) : tableX(toIdx) + TABLE_W;
          const y2 = tableCenterY(toTable);
          const mx = (x1 + x2) / 2;

          return (
            <motion.g key={`${rel.from}-${rel.to}`} variants={lineVariants}>
              <motion.path
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                stroke={INDIGO}
                strokeWidth={1.8}
                fill="none"
                markerEnd="url(#er-arrow)"
              />
              <text
                x={mx}
                y={(y1 + y2) / 2 - 8}
                textAnchor="middle"
                fontSize={10}
                fill={AMBER}
                fontFamily="system-ui, sans-serif"
                fontWeight={600}
              >
                {rel.type}
              </text>
              {rel.label && (
                <text
                  x={mx}
                  y={(y1 + y2) / 2 + 10}
                  textAnchor="middle"
                  fontSize={9}
                  fill={colors.legendText}
                  fontFamily="system-ui, sans-serif"
                >
                  {rel.label}
                </text>
              )}
            </motion.g>
          );
        })}

        {/* Tables */}
        {tables.map((table, tIdx) => {
          const tx = tableX(tIdx);
          const ty = tableY();
          const th = tableHeight(table);

          return (
            <motion.g key={table.name} variants={itemVariants}>
              {/* Table card background */}
              <rect
                x={tx}
                y={ty}
                width={TABLE_W}
                height={th}
                rx={8}
                fill={colors.cardFill}
                stroke={colors.actorStroke}
                strokeWidth={1.5}
              />
              {/* Header */}
              <rect
                x={tx}
                y={ty}
                width={TABLE_W}
                height={HEADER_H}
                rx={8}
                fill={colors.headerFill}
              />
              {/* Header bottom rect to square off the bottom corners of header */}
              <rect
                x={tx}
                y={ty + HEADER_H - 8}
                width={TABLE_W}
                height={8}
                fill={colors.headerFill}
              />
              <text
                x={tx + TABLE_W / 2}
                y={ty + HEADER_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fill={colors.text}
                fontFamily="system-ui, sans-serif"
                fontWeight={700}
              >
                {table.name}
              </text>

              {/* Columns */}
              {table.columns.map((col, cIdx) => {
                const cy = ty + HEADER_H + 4 + cIdx * COL_H;
                const isPK = col.pk === true;
                const isFK = col.fk === true;
                const fillColor = isPK ? EMERALD : isFK ? AMBER : colors.columnFill;

                return (
                  <g key={col.name}>
                    {cIdx % 2 === 1 && (
                      <rect
                        x={tx + 4}
                        y={cy - 2}
                        width={TABLE_W - 8}
                        height={COL_H}
                        rx={4}
                        fill={colors.altRowFill}
                      />
                    )}
                    {/* Icon */}
                    <foreignObject x={tx + 10} y={cy + 7} width={12} height={12}>
                      <span style={{ color: fillColor, display: 'flex', alignItems: 'center' }}>
                        {isPK ? <KeyIcon /> : isFK ? <LinkIcon /> : null}
                      </span>
                    </foreignObject>
                    {/* Column name */}
                    <text
                      x={isPK || isFK ? tx + 26 : tx + 12}
                      y={cy + COL_H / 2 + 1}
                      dominantBaseline="middle"
                      fontSize={11}
                      fill={fillColor}
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight={isPK ? 700 : 400}
                    >
                      {col.name}
                    </text>
                    {/* Column type */}
                    <text
                      x={tx + TABLE_W - 10}
                      y={cy + COL_H / 2 + 1}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={10}
                      fill={colors.columnType}
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {col.type}
                    </text>
                  </g>
                );
              })}
            </motion.g>
          );
        })}

        {/* Legend */}
        <motion.g variants={itemVariants} transform={`translate(20, ${svgH - 28})`}>
          <circle cx={5} cy={5} r={4} fill={EMERALD} />
          <text x={13} y={9} fontSize={9} fill={colors.legendText} fontFamily="system-ui">
            PK
          </text>
          <circle cx={40} cy={5} r={4} fill={AMBER} />
          <text x={48} y={9} fontSize={9} fill={colors.legendText} fontFamily="system-ui">
            FK
          </text>
        </motion.g>
      </motion.svg>
    </div>
  );
}
