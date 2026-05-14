import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobBoard Pro — Find Your Next Role",
  description:
    "JobBoard Pro is an internal hiring platform connecting great talent with open roles across all departments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="site-logo">
              <span className="logo-icon">💼</span>
              <span className="logo-text">JobBoard <strong>Pro</strong></span>
            </Link>
            <nav className="site-nav">
              <Link href="/" className="nav-link">Browse Jobs</Link>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/jobs/new" className="nav-link btn-primary-nav">Post a Job</Link>
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <p>© {new Date().getFullYear()} JobBoard Pro — Internal Hiring Platform</p>
        </footer>
      </body>
    </html>
  );
}
