import { GlassPanel } from '@/shared/ui/glass-panel';
import { Lightbulb } from 'lucide-react';

interface KeyTakeawaysProps {
  items: string[];
}

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-foreground">핵심 정리</h2>
      <GlassPanel className="p-6">
        <ul className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </GlassPanel>
    </section>
  );
}
