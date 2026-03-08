'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ComparisonFeature } from '../model/types';

interface ComparisonChartProps {
  features: ComparisonFeature[];
  subjects: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
      staggerChildren: 0.06,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check
        className="w-4 h-4 text-emerald-400 mx-auto"
        aria-label="Yes"
        strokeWidth={2.5}
      />
    ) : (
      <X
        className="w-4 h-4 text-red-400 mx-auto"
        aria-label="No"
        strokeWidth={2.5}
      />
    );
  }
  return (
    <span className="text-xs text-white/70 leading-tight">{value}</span>
  );
}

export function ComparisonChart({ features, subjects }: ComparisonChartProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <motion.table
        className="w-full border-collapse"
        style={{ minWidth: Math.max(300, subjects.length * 120 + 160) }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label="Comparison Chart"
      >
        {/* Header */}
        <thead>
          <motion.tr variants={rowVariants}>
            <th className="text-left py-3 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider w-36">
              Feature
            </th>
            {subjects.map((subject) => (
              <th
                key={subject}
                className="py-3 px-4 text-center text-xs font-semibold text-indigo-300 uppercase tracking-wider"
              >
                {subject}
              </th>
            ))}
          </motion.tr>
          {/* Header divider */}
          <tr aria-hidden>
            <td
              colSpan={subjects.length + 1}
              className="h-px bg-white/10 p-0"
            />
          </tr>
        </thead>

        <tbody>
          {features.map((feature, fIdx) => (
            <motion.tr
              key={feature.name}
              variants={rowVariants}
              className={cn(
                'transition-colors',
                fIdx % 2 === 0
                  ? 'bg-transparent'
                  : 'bg-white/[0.03]'
              )}
            >
              <td className="py-3 px-4 text-sm font-medium text-white/80 whitespace-nowrap">
                {feature.name}
              </td>
              {subjects.map((subject) => {
                const val = feature.values[subject];
                return (
                  <td
                    key={subject}
                    className="py-3 px-4 text-center"
                  >
                    {val !== undefined ? (
                      <CellValue value={val} />
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
}
