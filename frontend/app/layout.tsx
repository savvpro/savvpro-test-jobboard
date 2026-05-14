import type { Metadata } from 'next';
import '../styles/globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'JobBoard Pro | Find Your Next Role',
  description: 'Premium job board for exceptional talent.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 max-w-[1120px] w-full mx-auto px-6 pb-20">
          {children}
        </div>
        <footer className="py-8 text-center text-[13px] text-textSecondary border-t border-border">
          © 2024 JobBoard Pro
        </footer>
      </body>
    </html>
  );
}