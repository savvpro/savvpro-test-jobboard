import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "JobBoard Pro — Internal Hiring Platform",
  description: "Browse open roles, submit applications, and manage the hiring pipeline with JobBoard Pro.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href="/" className="navbar-brand">
              💼 JobBoard Pro
            </Link>
            <div className="navbar-links">
              <Link href="/">Jobs</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/post-job" className="btn btn-primary btn-sm">
                + Post Job
              </Link>
            </div>
          </div>
        </nav>
        <main className="container" style={{ paddingBottom: "3rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
