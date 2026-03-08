'use client';

import Link from 'next/link';
import { GlassPanel } from '@/shared/ui/glass-panel';
import { MotionIcon } from '@/shared/ui/motion-icon';
import { NAV_ITEMS } from '@/shared/config/navigation';
import { Gamepad2, BookOpen, Server } from 'lucide-react';
import { DemoContainer } from '@/widgets/puzzle-board';

const contentItems = NAV_ITEMS.filter(
  (item) => item.href.startsWith('/content/')
);

export default function Home() {
  return (
    <main className="flex flex-col gap-12 p-6 md:p-10">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 pt-8 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          <span className="text-primary">Puzzle</span> Content Lab
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          퍼즐 게임 데모를 직접 플레이하면서, 그 뒤에서 동작하는 서버 로직과 DB 설계를 자연스럽게 학습하는 블로그입니다.
        </p>
      </section>

      {/* Demo Embed */}
      <section>
        <DemoContainer stageId={1} />
      </section>

      {/* 3 Layer 소개 */}
      <section className="grid gap-4 md:grid-cols-3">
        <GlassPanel className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <MotionIcon icon={Gamepad2} className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">PLAY</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            로얄매치 스타일 3매치 데모를 직접 플레이하며 게임 메카닉을 체험합니다.
          </p>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              <MotionIcon icon={Server} className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground">LOGIC</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            각 콘텐츠의 서버/DB 구현을 인포그래픽과 코드로 설명합니다.
          </p>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <MotionIcon icon={BookOpen} className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">COMPARE</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            포코포코, 포코팡타운, 로얄매치, 매치빌런 등 실제 게임의 콘텐츠를 비교 분석합니다.
          </p>
        </GlassPanel>
      </section>

      {/* Content Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground">콘텐츠</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contentItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <GlassPanel variant="subtle" className="flex items-center gap-4 p-4 transition-colors hover:bg-white/10">
                <MotionIcon icon={item.icon} className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">{item.label}</span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </GlassPanel>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
