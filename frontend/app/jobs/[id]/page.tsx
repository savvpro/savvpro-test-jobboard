"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ applicant_name: "", email: "", years_experience: 0, cv_summary: "", linkedin_url: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // We added include_closed=true so you can still view a job even after closing it!
    fetch(`http://127.0.0.1:8000/api/jobs?include_closed=true&per_page=100`)
      .then(res => {
        if (!res.ok) throw new Error("CORS or Network Error");
        return res.json();
      })
      .then(data => {
        const foundJob = data.results.find((j: any) => j.id.toString() === jobId);
        if (foundJob) {
          setJob(foundJob);
        } else {
          setErrorMsg("Job not found or has been removed.");
        }
      })
      .catch((err) => {
        setErrorMsg("Failed to connect to backend. Did you restart Uvicorn?");
      });
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}/apply`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    if (res.ok) setMsg("✅ Application submitted successfully!");
    else setMsg(`❌ Error: ${result.detail[0]?.msg || result.detail}`);
  };

  if (errorMsg) return <div className="p-8 text-xl font-bold text-red-600 bg-red-50 border border-red-200 rounded">{errorMsg}</div>;
  if (!job) return <p className="text-xl font-bold text-slate-600 animate-pulse mt-8">Loading job details...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-4xl font-extrabold text-slate-900">{job.title}</h1>
          {job.is_closed && <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">CLOSED</span>}
        </div>
        <p className="text-xl font-semibold text-slate-600 mb-6">{job.department} &bull; <span className="uppercase">{job.location}</span></p>
        <p className="text-slate-800 text-lg mb-6 leading-relaxed">{job.description}</p>
        <div className="bg-slate-100 p-4 rounded-lg font-bold text-slate-900 mb-6 border border-slate-200">
          Salary Range: ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
        </div>
      </div>

      <div className="bg-white p-8 border border-slate-300 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 border-b border-slate-200 pb-2 text-slate-900">Submit Application</h2>
        {msg && <div className="mb-6 p-4 bg-slate-100 text-slate-900 font-bold border border-slate-300 rounded">{msg}</div>}
        
        {job.is_closed ? (
           <div className="p-4 bg-red-50 text-red-800 font-bold border border-red-200 rounded">
             This position is no longer accepting applications.
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-medium">
            <input className="border border-slate-400 p-3 rounded text-slate-900 focus:ring-2 focus:ring-slate-900" placeholder="Full Name" required onChange={(e) => setFormData({...formData, applicant_name: e.target.value})} />
            <input type="email" className="border border-slate-400 p-3 rounded text-slate-900 focus:ring-2 focus:ring-slate-900" placeholder="Email Address" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="number" min="0" className="border border-slate-400 p-3 rounded text-slate-900 focus:ring-2 focus:ring-slate-900" placeholder="Years of Experience" required onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value)})} />
            <textarea className="border border-slate-400 p-3 rounded h-32 text-slate-900 focus:ring-2 focus:ring-slate-900" placeholder="CV Summary (Max 1000 chars)" required maxLength={1000} onChange={(e) => setFormData({...formData, cv_summary: e.target.value})} />
            <input type="url" className="border border-slate-400 p-3 rounded text-slate-900 focus:ring-2 focus:ring-slate-900" placeholder="LinkedIn URL (https://linkedin.com/...)" onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} />
            <button type="submit" className="bg-slate-900 text-white font-bold p-4 rounded hover:bg-slate-800 transition mt-2 shadow-md hover:shadow-lg">Apply Now &rarr;</button>
          </form>
        )}
      </div>
    </div>
  );
}