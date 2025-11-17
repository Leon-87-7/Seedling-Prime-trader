import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Seedling Prime trader',
  description:
    'Track real-time stock prices and manage your portfolio, get personalized alerts & explore detailed company insights with Seedling Prime trader.',
  icons: {
    icon: '/favicon.ico',
  },
};

/**
 * Root layout component that wraps application pages with html and body elements, applies the Geist fonts and dark theme class, and renders the provided content.
 *
 * @param children - React nodes to render inside the document body.
 * @returns The root HTML structure containing the provided children.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
