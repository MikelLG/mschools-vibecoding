import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Vibe Coding — mSchools 2026',
  description: 'Crea recursos educatius amb IA en 4 passos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
