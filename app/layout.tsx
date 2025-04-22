import './globals.css';
import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import { Outfit } from 'next/font/google'; 
import { Toaster } from '@/components/ui/toaster';
import { JotaiProvider } from '@/lib/store/provider';
import { Providers } from '@/lib/providers';

// const inter = Inter({ subsets: ['latin'] });
// Note: If we plan to support Minara in different non-English languages, we should modify the subset
const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Minara Calendar',
  description: 'A modern calendar app built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <Providers>
          <JotaiProvider>
            {children}
            <Toaster />
          </JotaiProvider>
        </Providers>
      </body>
    </html>
  );
}