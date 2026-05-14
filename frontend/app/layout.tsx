import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "JobBoard Pro | Modern Hiring Platform",
  description: "Next generation hiring platform for growing teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900`}>
        {/* PREMIUM HEADER */}
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center gap-10">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:-translate-y-0.5">
                    JP
                  </div>
                  <span className="text-2xl font-extrabold font-outfit tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                    JobBoard Pro
                  </span>
                </Link>
                <div className="hidden md:flex space-x-8 items-center">
                  <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
                    Find Jobs
                  </Link>
                  <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
                    Analytics Dashboard
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-5">
                <Link href="/jobs/new" className="relative inline-flex h-10 items-center justify-center px-6 font-semibold text-white transition-all duration-200 bg-slate-900 font-outfit rounded-full hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 overflow-hidden group">
                  <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                  <span className="relative flex items-center gap-2">
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Post a Job
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
          {children}
        </main>

        {/* PREMIUM FOOTER */}
        <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    JP
                  </div>
                  <span className="text-xl font-bold font-outfit text-white">
                    JobBoard Pro
                  </span>
                </div>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                  The modern hiring platform built for growing teams. Post jobs, manage applications, and track your hiring pipeline with our beautiful status workflow.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 font-outfit">Platform</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> All Jobs</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Analytics</Link></li>
                  <li><Link href="/jobs/new" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Post Job</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 font-outfit">Resources</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="hover:text-white cursor-pointer transition-colors">Documentation</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Hiring Guides</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                &copy; {new Date().getFullYear()} JobBoard Pro. Built for assessment.
              </div>
              <div className="flex gap-6">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
