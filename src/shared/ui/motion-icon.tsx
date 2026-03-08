'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MotionIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
}

export function MotionIcon({ icon: Icon, className, size }: MotionIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="inline-flex"
    >
      <Icon className={className} size={size} />
    </motion.div>
  );
}
