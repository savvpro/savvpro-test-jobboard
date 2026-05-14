"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface FilterBarProps {
  onFilter: (filters: { department?: string; location?: string; search?: string }) => void;
  departments: string[];
}

export default function FilterBar({ onFilter, departments }: FilterBarProps) {
  const [dept, setDept] = useState("");
  const [loc, setLoc] = useState("");
  const [search, setSearch] = useState("");

  const isActive = dept !== "" || loc !== "" || search !== "";

  // Debounce search typing
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilter({ department: dept || undefined, location: loc || undefined, search: search || undefined });
    }, search ? 300 : 0);
    return () => clearTimeout(handler);
  }, [dept, loc, search, onFilter]);

  const clearFilters = () => {
    setDept("");
    setLoc("");
    setSearch("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <select 
        value={dept}
        onChange={(e) => setDept(e.target.value)}
        className="border-[1.5px] border-border rounded-full px-4 py-2 bg-white text-[14px] text-textPrimary focus-ring hover:bg-surface2 transition-colors cursor-pointer appearance-none pr-8"
        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236E6E73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        <option value="">All Departments</option>
        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      <select 
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        className="border-[1.5px] border-border rounded-full px-4 py-2 bg-white text-[14px] text-textPrimary focus-ring hover:bg-surface2 transition-colors cursor-pointer appearance-none pr-8"
        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236E6E73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        <option value="">All Locations</option>
        <option value="remote">Remote</option>
        <option value="hybrid">Hybrid</option>
        <option value="onsite">On-site</option>
      </select>

      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search required skills..."
          className="w-full border-[1.5px] border-border rounded-full py-2 pl-9 pr-4 bg-white text-[14px] text-textPrimary focus-ring placeholder:text-textTertiary"
        />
      </div>

      {isActive && (
        <button 
          onClick={clearFilters}
          className="text-[13px] text-accent font-medium hover:underline ml-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}