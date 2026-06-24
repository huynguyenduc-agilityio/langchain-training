import type { Metadata } from 'next';
import { Geist, Inter } from 'next/font/google';
import '@/config/env';

import CopilotKitRuntime from '@/components/copilotkit/CopilotKitRuntime';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/features/auth/auth-context';
import { cn } from '@/utils';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'CityRide — Intra-city Ride Booking',
  description:
    'AI-powered intra-city ride-hailing application with fare estimation, ride booking, and trip management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'dark',
        'antialiased',
        inter.variable,
        'font-sans',
        geist.variable,
      )}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-family)',
        }}
      >
        <TooltipProvider>
          <AuthProvider>
            <CopilotKitRuntime>{children}</CopilotKitRuntime>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
