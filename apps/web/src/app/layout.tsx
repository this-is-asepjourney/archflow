import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ArchFlow — Visual Architecture Design Platform',
  description:
    'Design your entire software project visually — topology, architecture, database, UML, flows, and technical documentation — all in one place.',
  keywords: ['architecture', 'diagram', 'topology', 'UML', 'ERD', 'infrastructure', 'design'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
