"use client";

import { useState } from "react";
import { applyToJob } from "@/lib/api";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ApplyFormProps {
  jobId: number;
  onSuccess: () => void;
}

export default function ApplyForm({ jobId, onSuccess }: ApplyFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experience: "",
    cvSummary: "",
    linkedin: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const cvLength = formData.cvSummary.length;
  const isOverLimit = cvLength > 1000;
  const isWarning = cvLength > 900;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit) return;
    
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await applyToJob(jobId, {
        applicant_name: formData.name,
        email: formData.email,
        years_experience: parseInt(formData.experience) || 0,
        cv_summary: formData.cvSummary,
        linkedin_url: formData.linkedin || null,
      });
      setSubmitted(true);
      setTimeout(onSuccess, 500); // Trigger parent callback after brief delay
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (err?.detail && Array.isArray(err.detail)) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        err.detail.forEach((e: any) => {
          errors[e.field] = e.message;
        });
        setFieldErrors(errors);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-surface2 border border-success/20 rounded-[18px] p-8 text-center animate-fade-up">
        <CheckCircle2 className="mx-auto text-success mb-4" size={48} />
        <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-textPrimary mb-2">
          Application Submitted!
        </h3>
        <p className="text-[15px] text-textSecondary max-w-[300px] mx-auto">
          Thanks, {formData.name.split(' ')[0]}. We'll review your application and be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fade-up">
      {error && (
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-md text-[14px]">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-textPrimary">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            className="border-[1.5px] border-border rounded-md px-4 py-2.5 text-[15px] focus-ring"
            placeholder="Jane Doe"
            disabled={loading}
          />
          {fieldErrors['applicant_name'] && <span className="text-danger text-[13px]">{fieldErrors['applicant_name']}</span>}
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-textPrimary">
            Email Address <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            className="border-[1.5px] border-border rounded-md px-4 py-2.5 text-[15px] focus-ring"
            placeholder="jane@example.com"
            disabled={loading}
          />
          {fieldErrors['email'] && <span className="text-danger text-[13px]">{fieldErrors['email']}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-medium text-textPrimary">
          Years of Experience <span className="text-danger">*</span>
        </label>
        <input
          type="number"
          required
          min="0"
          value={formData.experience}
          onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))}
          className="border-[1.5px] border-border rounded-md px-4 py-2.5 text-[15px] focus-ring max-w-[200px]"
          placeholder="5"
          disabled={loading}
        />
        {fieldErrors['years_experience'] && <span className="text-danger text-[13px]">{fieldErrors['years_experience']}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-medium text-textPrimary flex justify-between">
          <span>CV Summary <span className="text-danger">*</span></span>
          <span className={`text-[13px] font-normal ${isOverLimit ? 'text-danger font-medium' : isWarning ? 'text-warning' : 'text-textTertiary'}`}>
            {cvLength} / 1000
          </span>
        </label>
        <textarea
          required
          rows={6}
          value={formData.cvSummary}
          onChange={(e) => setFormData(p => ({ ...p, cvSummary: e.target.value }))}
          className={`border-[1.5px] border-border rounded-md px-4 py-3 text-[15px] focus-ring resize-none ${isOverLimit ? 'border-danger focus:border-danger ring-danger/20' : ''}`}
          placeholder="Briefly describe your experience and why you are a good fit for this role..."
          disabled={loading}
        />
        {fieldErrors['cv_summary'] && <span className="text-danger text-[13px]">{fieldErrors['cv_summary']}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-medium text-textPrimary">
          LinkedIn Profile URL <span className="text-textSecondary font-normal">(Optional)</span>
        </label>
        <input
          type="url"
          value={formData.linkedin}
          onChange={(e) => setFormData(p => ({ ...p, linkedin: e.target.value }))}
          className="border-[1.5px] border-border rounded-md px-4 py-2.5 text-[15px] focus-ring"
          placeholder="https://linkedin.com/in/janedoe"
          disabled={loading}
        />
        {fieldErrors['linkedin_url'] && <span className="text-danger text-[13px]">{fieldErrors['linkedin_url']}</span>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || isOverLimit || !formData.name || !formData.email || !formData.experience || !formData.cvSummary}
          className="bg-accent text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:bg-accentHover transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center min-w-[200px]"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Submit Application"}
        </button>
      </div>
    </form>
  );
}