"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load existing filters from the URL so they persist on refresh
  const [department, setDepartment] = useState(searchParams.get("department") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [skill, setSkill] = useState(searchParams.get("skill") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    // Set or remove params based on user input
    if (department) params.set("department", department);
    else params.delete("department");

    if (location) params.set("location", location);
    else params.delete("location");

    if (skill) params.set("skill", skill);
    else params.delete("skill");

    // Always reset to page 1 when applying a new filter
    params.set("page", "1"); 

    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setDepartment("");
    setLocation("");
    setSkill("");
    router.push("/");
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 border border-slate-300 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <label className="block text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wide">Department</label>
        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border-2 border-slate-300 p-2 rounded text-slate-900 focus:border-slate-900 outline-none transition" placeholder="e.g. Engineering" />
      </div>
      <div className="flex-1 w-full">
        <label className="block text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wide">Location</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border-2 border-slate-300 p-2 rounded text-slate-900 bg-white focus:border-slate-900 outline-none transition">
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
      </div>
      <div className="flex-1 w-full">
        <label className="block text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wide">Required Skill</label>
        <input type="text" value={skill} onChange={(e) => setSkill(e.target.value)} className="w-full border-2 border-slate-300 p-2 rounded text-slate-900 focus:border-slate-900 outline-none transition" placeholder="e.g. React" />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <button type="submit" className="bg-slate-900 text-white font-bold px-6 py-2 border-2 border-slate-900 rounded hover:bg-slate-800 transition shadow-sm">Apply Filters</button>
        <button type="button" onClick={handleClear} className="bg-slate-100 text-slate-800 font-bold px-4 py-2 border-2 border-slate-300 rounded hover:bg-slate-200 transition">Clear</button>
      </div>
    </form>
  );
}