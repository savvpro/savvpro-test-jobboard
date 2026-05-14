"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-[100] h-[48px] border-b transition-colors duration-200 ${
        scrolled ? "border-black/5 shadow-sm" : "border-transparent"
      }`}
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 h-full flex items-center justify-between">
        <Link 
          href="/" 
          className="text-[17px] font-semibold tracking-[-0.3px] text-textPrimary"
        >
          JobBoard Pro
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-[14px] text-textSecondary hover:text-textPrimary transition-colors duration-150">
            Browse Jobs
          </Link>
          <Link href="/dashboard" className="text-[14px] text-textSecondary hover:text-textPrimary transition-colors duration-150">
            Dashboard
          </Link>
          <Link 
            href="/jobs/new" 
            className="bg-accent text-white px-4 py-1.5 rounded-lg text-[14px] font-medium hover:bg-accentHover transition-colors scale-active"
          >
            Post a Job
          </Link>
        </div>
        
        <button className="md:hidden text-textPrimary">
          <Menu size={20} />
        </button>
      </div>
    </nav>
  );
}