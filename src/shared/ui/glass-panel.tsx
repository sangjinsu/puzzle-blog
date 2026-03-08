import * as React from 'react';
import { cn } from '@/shared/lib/utils';

type GlassVariant = 'default' | 'strong' | 'subtle';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
}

const variantClasses: Record<GlassVariant, string> = {
  default: 'glass',
  strong: 'glass-strong',
  subtle: 'glass-subtle',
};

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl shadow-lg', variantClasses[variant], className)}
      {...props}
    />
  )
);
GlassPanel.displayName = 'GlassPanel';

export { GlassPanel };
