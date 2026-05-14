"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  deadline: string;
  required_skills: string[];
  max_applicants: number | null;
  application_count: number;
  is_closed: boolean;
}

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    applicant_name: "",
    email: "",
    years_experience: 0,
    cv_summary: "",
    linkedin_url: ""
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Job not found");
        const data = await res.json();
        setJob(data);
      } catch (err) {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail?.[0]?.msg || data.detail || "Failed to submit application");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-8"><div className="h-12 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>;
  if (!job) return <div className="text-center py-12">Job not found.</div>;

  const isFull = job.max_applicants && job.application_count >= job.max_applicants;
  const isExpired = new Date(job.deadline) < new Date();
  const canApply = !job.is_closed && !isFull && !isExpired;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary-600 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold border-b pb-2">Description</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-600 py-4">{job.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold border-b pb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2 pt-2">
              {job.required_skills.map((skill) => (
                <span key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-xl border border-primary-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border sticky top-24 space-y-6">
            {!canApply ? (
              <div className="text-center space-y-2">
                <div className="p-3 bg-red-100 text-red-700 rounded-xl font-bold">
                  {job.is_closed ? "Position Closed" : isExpired ? "Deadline Passed" : "Applications Full"}
                </div>
                <Link href={`/jobs/${id}/applications`} className="text-sm text-primary-600 hover:underline">View current applications &rarr;</Link>
              </div>
            ) : submitted ? (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center"><CheckCircle2 className="h-16 w-16 text-green-500" /></div>
                <h3 className="text-xl font-bold">Application Sent!</h3>
                <button onClick={() => setSubmitted(false)} className="text-primary-600 font-medium hover:underline text-sm">
                  Apply again?
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold">Apply Now</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full p-2 bg-background border rounded-lg focus:ring-2 ring-primary-500 outline-none"
                    value={formData.applicant_name}
                    onChange={(e) => setFormData({...formData, applicant_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full p-2 bg-background border rounded-lg focus:ring-2 ring-primary-500 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full p-2 bg-background border rounded-lg focus:ring-2 ring-primary-500 outline-none"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CV Summary</label>
                  <textarea
                    required
                    maxLength={1000}
                    className="w-full p-2 bg-background border rounded-lg h-32 resize-none focus:ring-2 ring-primary-500 outline-none text-sm"
                    value={formData.cv_summary}
                    onChange={(e) => setFormData({...formData, cv_summary: e.target.value})}
                  />
                </div>
                {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
          
          <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
            <h3 className="font-bold">Hiring Manager?</h3>
            <p className="text-sm text-slate-300">Manage applicants and track status through the pipeline.</p>
            <Link 
              href={`/jobs/${id}/applications`}
              className="w-full block text-center py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all"
            >
              Pipeline Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
