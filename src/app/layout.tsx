import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Lot 212',
  description: 'Stay current with the latest news and updates from Lot 212.',
  keywords: ['Lot 212', 'news', 'stories', 'updates'],
  verification: {
    google: 'C_qJdVyxpifyuT_bkmxSJK5xaZ688BT8DUVyKU08H0Q',
  },
  openGraph: {
    title: 'Lot 212',
    description: 'Stay current with the latest news and updates from Lot 212.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#18181f" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-ink-950 text-ink-50 overflow-hidden h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}