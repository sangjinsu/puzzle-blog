'use client';

import { motion } from 'framer-motion';
import type { TimelineEvent } from '../model/types';

interface TimelineProps {
  events: TimelineEvent[];
}

const DEFAULT_COLOR = 'rgba(99,102,241,1)';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

const itemVariantsRight = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <motion.div
        className="relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Center line — desktop only */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/10 hidden md:block"
          aria-hidden
        />

        {/* Mobile left line */}
        <div
          className="absolute left-5 top-0 bottom-0 w-px bg-white/10 md:hidden"
          aria-hidden
        />

        <div className="flex flex-col gap-8">
          {events.map((event, idx) => {
            const isLeft = idx % 2 === 0;
            const dotColor = event.color ?? DEFAULT_COLOR;

            return (
              <motion.div
                key={`${event.time}-${idx}`}
                className="relative flex items-start md:items-center"
                variants={isLeft ? itemVariants : itemVariantsRight}
              >
                {/* Mobile layout: always left-aligned */}
                <div className="md:hidden flex items-start gap-4 pl-12">
                  {/* Dot — mobile */}
                  <span
                    className="absolute left-[14px] top-2 w-3 h-3 rounded-full ring-2 ring-white/10 flex-shrink-0"
                    style={{ backgroundColor: dotColor }}
                    aria-hidden
                  />
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 w-full">
                    <p
                      className="text-xs font-mono font-semibold mb-1"
                      style={{ color: dotColor }}
                    >
                      {event.time}
                    </p>
                    <p className="text-sm font-semibold text-white">{event.label}</p>
                    {event.description && (
                      <p className="text-xs text-white/50 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>

                {/* Desktop layout: alternating sides */}
                <div className="hidden md:flex w-full items-center gap-0">
                  {/* Left side content */}
                  <div className="flex-1 flex justify-end pr-8">
                    {isLeft && (
                      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 max-w-xs w-full text-right">
                        <p
                          className="text-xs font-mono font-semibold mb-1"
                          style={{ color: dotColor }}
                        >
                          {event.time}
                        </p>
                        <p className="text-sm font-semibold text-white">{event.label}</p>
                        {event.description && (
                          <p className="text-xs text-white/50 mt-1">{event.description}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <span
                    className="w-4 h-4 rounded-full ring-2 ring-white/10 flex-shrink-0 z-10"
                    style={{ backgroundColor: dotColor }}
                    aria-hidden
                  />

                  {/* Right side content */}
                  <div className="flex-1 pl-8">
                    {!isLeft && (
                      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 max-w-xs w-full">
                        <p
                          className="text-xs font-mono font-semibold mb-1"
                          style={{ color: dotColor }}
                        >
                          {event.time}
                        </p>
                        <p className="text-sm font-semibold text-white">{event.label}</p>
                        {event.description && (
                          <p className="text-xs text-white/50 mt-1">{event.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
