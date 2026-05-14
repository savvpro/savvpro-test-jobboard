"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { createJob, JobCreateInput, LocationEnum } from "@/lib/api";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<JobCreateInput, "required_skills">>({
    title: "",
    department: "Engineering",
    description: "",
    location: "remote",
    salary_min: 0,
    salary_max: 0,
    deadline: "",
    max_applicants: null,
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("salary") || name === "max_applicants" ? (value ? parseInt(value) : null) : value,
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (skills.length === 0) {
      setError("Please add at least one required skill.");
      setLoading(false);
      return;
    }

    try {
      const payload: JobCreateInput = {
        ...formData,
        salary_min: Number(formData.salary_min),
        salary_max: Number(formData.salary_max),
        required_skills: skills,
      };

      const res = await createJob(payload);
      router.push(`/jobs/${res.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create job listing. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-8 md:py-12 max-w-[800px] mx-auto px-6 animate-fade-up">
      <Link 
        href="/" 
        className="inline-flex items-center gap-1.5 text-textSecondary hover:text-textPrimary text-[14px] font-medium transition-colors mb-12"
      >
        <ArrowLeft size={16} />
        Back to Jobs
      </Link>

      <div className="mb-12">
        <h1 className="text-[40px] leading-[1.1] font-bold tracking-[-1.5px] text-textPrimary mb-4">
          Post a New Position
        </h1>
        <p className="text-[17px] text-textSecondary max-w-[600px]">
          Fill in the details below to create a new job listing on the platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-textPrimary ml-1">Job Title</label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Senior Software Engineer"
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-textPrimary ml-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all appearance-none"
            >
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-textPrimary ml-1">Job Description</label>
          <textarea
            required
            name="description"
            rows={8}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the role, responsibilities, and team..."
            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-textPrimary ml-1">Location</label>
            <div className="flex gap-2">
              {(["remote", "hybrid", "onsite"] as LocationEnum[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, location: loc }))}
                  className={`flex-1 py-2.5 rounded-lg text-[14px] font-medium transition-all border ${
                    formData.location === loc
                      ? "bg-accent text-white border-accent shadow-sm"
                      : "bg-white text-textSecondary border-border hover:border-[#BBBBC0]"
                  }`}
                >
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-textPrimary ml-1">Deadline</label>
            <input
              required
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-textPrimary ml-1">Salary Min ($)</label>
            <input
              required
              type="number"
              name="salary_min"
              value={formData.salary_min || ""}
              onChange={handleInputChange}
              placeholder="Min"
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-textPrimary ml-1">Salary Max ($)</label>
            <input
              required
              type="number"
              name="salary_max"
              value={formData.salary_max || ""}
              onChange={handleInputChange}
              placeholder="Max"
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-textPrimary ml-1">Max Applicants (Optional)</label>
            <input
              type="number"
              name="max_applicants"
              value={formData.max_applicants || ""}
              onChange={handleInputChange}
              placeholder="No limit"
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[14px] font-semibold text-textPrimary ml-1">Required Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill (e.g. Python, React)"
              className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-textPrimary text-white px-6 rounded-xl hover:bg-black active:scale-95 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-surface rounded-xl border border-dashed border-border">
            {skills.length === 0 ? (
              <span className="text-[13px] text-textTertiary p-2">No skills added yet...</span>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-white border border-border rounded-lg pl-3 pr-2 py-1.5 text-[13px] font-medium text-textPrimary flex items-center gap-1.5 shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-textTertiary hover:text-danger hover:bg-danger/5 p-0.5 rounded transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 text-danger text-[14px] font-medium p-4 rounded-xl flex items-center gap-3">
            <X size={18} />
            {error}
          </div>
        )}

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-4 rounded-2xl text-[17px] font-bold tracking-[-0.3px] hover:bg-accentHover active:scale-[0.99] transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Posting Position...
              </>
            ) : (
              "Post Job Listing"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
