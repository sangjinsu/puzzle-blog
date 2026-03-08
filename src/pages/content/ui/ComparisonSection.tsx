import { GlassPanel } from '@/shared/ui/glass-panel';
import type { ComparisonGame } from '../model/types';
import { Check, X } from 'lucide-react';

interface ComparisonSectionProps {
  features: string[];
  games: ComparisonGame[];
}

export function ComparisonSection({ features, games }: ComparisonSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-foreground">게임 비교</h2>
      <GlassPanel className="overflow-x-auto p-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-muted-foreground font-medium">기능</th>
              {games.map((game) => (
                <th key={game.name} className="px-4 py-3 text-center text-foreground font-semibold">
                  {game.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature} className="border-b border-white/5">
                <td className="px-4 py-3 text-muted-foreground">{feature}</td>
                {games.map((game) => {
                  const value = game.features[feature];
                  return (
                    <td key={game.name} className="px-4 py-3 text-center">
                      {typeof value === 'boolean' ? (
                        value ? (
                          <Check className="mx-auto h-4 w-4 text-accent" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-destructive/60" />
                        )
                      ) : (
                        <span className="text-foreground">{value ?? '-'}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassPanel>
    </section>
  );
}
