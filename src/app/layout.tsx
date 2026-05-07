import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from '@/components/providers/QueryProvider';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora  = Sora({ subsets: ['latin'], variable: '--font-sora',  display: 'swap' });

export const metadata: Metadata = {
  title:       '3ZF — Three Zeros of Freedom',
  description: 'Harmony Community, Organisation, Association, Supershop, Events, Blog, and more.',
  keywords:    '3ZF, Harmony Community, Bangladesh',
  openGraph: {
    title:       '3ZF Platform',
    description: 'Three Zeros of Freedom',
    type:        'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico',                  sizes: 'any' },
      { url: '/favicon-16x16.png',  type: 'image/png', sizes: '16x16'  },
      { url: '/favicon-32x32.png',  type: 'image/png', sizes: '32x32'  },
      { url: '/icon-192x192.png',   type: 'image/png', sizes: '192x192'},
      { url: '/icon-512x512.png',   type: 'image/png', sizes: '512x512'},
    ],
    apple:    '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'card !text-sm !font-medium',
                success: { iconTheme: { primary: '#6B46C1', secondary: '#fff' } },
                duration: 3000,
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}