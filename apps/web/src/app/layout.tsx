import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import CopilotKitRuntime from '@/components/copilotkit/CopilotKitRuntime';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Telecom Support — CopilotKit + LangGraph',
  description:
    'Multi-Agent Telecom Support System with CopilotKit, LangGraph, and the AG-UI protocol',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CopilotKitRuntime>{children}</CopilotKitRuntime>
      </body>
    </html>
  );
}
