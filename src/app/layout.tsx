import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flappy Bird Game',
  description: 'A browser-based recreation of the classic Flappy Bird game',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
