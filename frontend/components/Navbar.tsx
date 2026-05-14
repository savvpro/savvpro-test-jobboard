"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              JobBoard Pro
            </Link>
          </div>
          <NavLinks />
        </div>
      </div>
    </nav>
  );
}

function NavLinks() {
  const { user, logout } = useAuth();

  return (
    <div className="hidden sm:flex space-x-8 items-center">
      <Link href="/" className="text-sm font-medium hover:text-primary-500 transition-colors">Jobs</Link>
      <Link href="/dashboard" className="text-sm font-medium hover:text-primary-500 transition-colors">Dashboard</Link>
      
      {user ? (
        <>
          {user.role === "recruiter" && (
            <Link href="/jobs/new" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm">
              Post a Job
            </Link>
          )}
          <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-700">
            Logout
          </button>
        </>
      ) : (
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary-500">Login</Link>
          <Link href="/signup" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg">Sign Up</Link>
        </div>
      )}
    </div>
  );
}
