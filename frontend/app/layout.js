import "./globals.css";
import "./sidebar.css";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export const metadata = {
  title: "JobBoard Pro — Internal Hiring Platform",
  description: "Browse open roles, submit applications, and manage the hiring pipeline with JobBoard Pro.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="site-body" suppressHydrationWarning>
        <div className="app-container">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <Link href="/" style={{ color: "#1e293b" }}>JobBoard Pro</Link>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "normal", marginTop: "0.25rem" }}>Internal Hiring</div>
            </div>
            
            <nav className="sidebar-nav">
              <Link href="/dashboard" className="sidebar-link">
                <span className="material-symbols-outlined">grid_view</span>
                Dashboard
              </Link>
              <Link href="/" className="sidebar-link">
                <span className="material-symbols-outlined">work_outline</span>
                Jobs
              </Link>
              <Link href="/applications" className="sidebar-link">
                <span className="material-symbols-outlined">people_outline</span>
                Applications
              </Link>
            </nav>

            <div className="sidebar-bottom">
              <Link href="/post-job" style={{ display: "block", textDecoration: "none" }}>
                <div className="sidebar-post-btn">
                  <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "0.5rem", fontSize: "1.125rem" }}>add</span>
                  Post a Job
                </div>
              </Link>
              <div className="sidebar-user">
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#1e293b", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>A</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b", lineHeight: 1.2 }}>Admin</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>System</div>
                </div>
              </div>
            </div>
          </aside>
          
          <div className="main-wrapper">
            {/* Minimal topbar for pages other than dashboard */}
            <div className="mobile-only-header">
              <SearchBar />
            </div>
            <main className="main-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
