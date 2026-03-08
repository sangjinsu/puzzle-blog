import { NAV_ITEMS } from '@/shared/config/navigation';
import { GlassPanel } from '@/shared/ui/glass-panel';
import { notFound } from 'next/navigation';

const CONTENT_SLUGS = ['life', 'quest', 'daily-mission', 'season-pass', 'event', 'ranking'];

export function generateStaticParams() {
  return CONTENT_SLUGS.map((slug) => ({ slug }));
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!CONTENT_SLUGS.includes(slug)) {
    notFound();
  }

  const navItem = NAV_ITEMS.find((item) => item.href === `/content/${slug}`);
  const title = navItem?.label ?? slug;
  const description = navItem?.description ?? '';

  return (
    <main className="flex flex-col gap-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <GlassPanel className="flex items-center justify-center p-16">
        <div className="text-center">
          <span className="text-5xl">🚧</span>
          <p className="mt-4 text-lg text-muted-foreground">
            콘텐츠 준비 중입니다
          </p>
        </div>
      </GlassPanel>
    </main>
  );
}
