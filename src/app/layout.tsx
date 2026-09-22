import type { Metadata } from 'next';
import './globals.css';
import { AI_NAME, CREATOR_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `${AI_NAME} — AI Assistant by ${CREATOR_NAME}`,
  description: `${AI_NAME} is an ultra-intelligent, general-purpose AI assistant created by ${CREATOR_NAME}. Chat in Bangla, Banglish, English, and more.`,
  authors: [{ name: CREATOR_NAME }],
  creator: CREATOR_NAME,
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fafafa] text-zinc-900 antialiased selection:bg-[#e8f0fe] selection:text-[#1a73e8]">
        {children}
      </body>
    </html>
  );
}
