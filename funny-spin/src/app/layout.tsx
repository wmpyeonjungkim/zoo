import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '고양이 키우기 🐱',
  description: '방치형 고양이 키우기 게임 — 생선을 모아 고양이를 키워보세요!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
