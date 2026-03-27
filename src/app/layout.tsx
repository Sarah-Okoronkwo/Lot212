import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'Lot 212',
  description: 'Visual stories worth your time. History, culture, science, food and crime — told one slide at a time.',
  keywords: ['Lot 212', 'visual stories', 'history', 'culture', 'science', 'food', 'crime'],
  verification: {
    google: 'C_qJdVyxpifyuT_bkmxSJK5xaZ688BT8DUVyKU08H0Q',
  },
  openGraph: {
    title: 'Lot 212',
    description: 'Visual stories worth your time. History, culture, science, food and crime — told one slide at a time.',
    type: 'website',
    url: 'https://lot212.com',
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
      <body className="bg-ink-950 text-ink-50">
        {children}
        <Analytics />
        <GoogleAnalytics gaId="G-3QY15SRE09" />
      </body>
    </html>
  );
}

