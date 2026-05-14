"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJob() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "", department: "", description: "", location: "remote", 
    salary_min: 0, salary_max: 0, required_skills: "", max_applicants: "", deadline: ""
  });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the data to match the FastAPI backend expectations
    const payload = {
      ...formData,
      salary_min: Number(formData.salary_min),
      salary_max: Number(formData.salary_max),
      max_applicants: formData.max_applicants ? Number(formData.max_applicants) : null,
      required_skills: formData.required_skills.split(",").map(skill => skill.trim()).filter(Boolean)
    };

    const res = await fetch("http://127.0.0.1:8000/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setMsg("✅ Job Posted Successfully!");
      setTimeout(() => router.push("/"), 1500); // Redirect to homepage
    } else {
      const error = await res.json();
      setMsg(`❌ Error: ${error.detail[0]?.msg || error.detail}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 border border-slate-300 rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-extrabold mb-6 border-b border-slate-200 pb-2 text-slate-900">Post a New Role</h1>
      {msg && <div className="mb-6 p-4 bg-slate-100 text-slate-900 font-bold border border-slate-300 rounded">{msg}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-medium">
        <input className="border border-slate-400 p-3 rounded text-slate-900" placeholder="Job Title (e.g., QA Engineer)" required onChange={(e) => setFormData({...formData, title: e.target.value})} />
        <input className="border border-slate-400 p-3 rounded text-slate-900" placeholder="Department (e.g., Engineering)" required onChange={(e) => setFormData({...formData, department: e.target.value})} />
        <textarea className="border border-slate-400 p-3 rounded h-32 text-slate-900" placeholder="Job Description" required onChange={(e) => setFormData({...formData, description: e.target.value})} />
        
        <select className="border border-slate-400 p-3 rounded text-slate-900 bg-white" onChange={(e) => setFormData({...formData, location: e.target.value})}>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
        
        <div className="flex gap-4">
          <input type="number" className="border border-slate-400 p-3 rounded text-slate-900 w-full" placeholder="Min Salary" required onChange={(e) => setFormData({...formData, salary_min: e.target.value as any})} />
          <input type="number" className="border border-slate-400 p-3 rounded text-slate-900 w-full" placeholder="Max Salary" required onChange={(e) => setFormData({...formData, salary_max: e.target.value as any})} />
        </div>
        
        <input className="border border-slate-400 p-3 rounded text-slate-900" placeholder="Required Skills (comma separated: React, Node, SQL)" required onChange={(e) => setFormData({...formData, required_skills: e.target.value})} />
        
        <div className="flex gap-4">
          <input type="number" className="border border-slate-400 p-3 rounded text-slate-900 w-full" placeholder="Max Applicants (Optional)" onChange={(e) => setFormData({...formData, max_applicants: e.target.value})} />
          <input type="date" className="border border-slate-400 p-3 rounded text-slate-900 w-full" required onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
        </div>

        <button type="submit" className="bg-slate-900 text-white font-bold p-4 rounded hover:bg-slate-800 transition mt-4">Create Job Listing</button>
      </form>
    </div>
  );
}