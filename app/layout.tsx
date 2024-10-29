import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { SettingsProvider } from '@/contexts/SettingsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Soil Moisture Simulation',
  description: 'A simulation of soil moisture dynamics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <div className="min-h-screen bg-background text-foreground">
              <div className="container mx-auto p-4">
                <ThemeToggle />
                {children}
              </div>
            </div>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
