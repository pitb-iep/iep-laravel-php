import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import AppProviders from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'AUTISM360 (digital & scalable)',
  description: 'Assessment • IEP • Goals • Data • Progress — all in one',
  manifest: '/site.webmanifest',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans overflow-x-hidden`}
        suppressHydrationWarning
      >
        <AppProviders>
          <Toaster position="top-right" richColors />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
