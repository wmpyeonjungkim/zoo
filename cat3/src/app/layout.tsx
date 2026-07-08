import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '냥냥 퍼즐 킹덤',
  description: '귀여운 고양이들의 3매치 퍼즐 게임',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
