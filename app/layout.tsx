import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Devesh AI',
  description: 'One Chat. 20+ AI Minds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
