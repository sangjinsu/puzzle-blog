import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-primary">
        Puzzle Content Lab
      </h1>
      <p className="max-w-lg text-center text-lg text-muted-foreground">
        퍼즐 게임 데모를 통해 배우는 게임 콘텐츠 서버 설계 블로그
      </p>
      <Button asChild size="lg">
        <Link href="/demo">데모 플레이하기</Link>
      </Button>
    </main>
  );
}
