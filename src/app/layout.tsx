import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Puzzle Content Lab',
  description: '퍼즐 게임 데모를 통해 배우는 게임 콘텐츠 서버 설계 블로그',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
