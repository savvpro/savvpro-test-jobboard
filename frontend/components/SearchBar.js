"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e) {
    if (e.key === "Enter") {
      const val = query.trim();
      if (val) {
        router.push(`/?search=${encodeURIComponent(val)}`);
      } else {
        router.push(`/`);
      }
      setQuery("");
    }
  }

  return (
    <div className="topbar-search">
      <span className="material-symbols-outlined" aria-hidden="true">search</span>
      <input 
        type="text" 
        placeholder="Search jobs" 
        aria-label="Search jobs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
      />
    </div>
  );
}
