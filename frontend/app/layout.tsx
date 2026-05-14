import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <nav className="bg-slate-900 text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">JobBoard Pro</Link>
            <div className="flex gap-6 font-semibold items-center">
              <Link href="/" className="hover:text-blue-300 transition">Listings</Link>
              <Link href="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>
              <Link href="/jobs/new" className="bg-white text-slate-900 px-4 py-2 rounded font-bold hover:bg-slate-200 transition">
                + Post a Job
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-6 mt-4">
          {children}
        </main>
      </body>
    </html>
  );
}