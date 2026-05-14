"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Rocket } from "lucide-react";
import Link from "next/link";

export default function NewJob() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    department: "Engineering",
    description: "",
    location: "remote",
    salary_min: 0,
    salary_max: 0,
    required_skills: [""],
    max_applicants: null as number | null,
    deadline: ""
  });

  const addSkill = () => setFormData({ ...formData, required_skills: [...formData.required_skills, ""] });
  const removeSkill = (index: number) => {
    const newSkills = formData.required_skills.filter((_, i) => i !== index);
    setFormData({ ...formData, required_skills: newSkills });
  };
  const updateSkill = (index: number, val: string) => {
    const newSkills = [...formData.required_skills];
    newSkills[index] = val;
    setFormData({ ...formData, required_skills: newSkills });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    const submissionData = {
      ...formData,
      required_skills: formData.required_skills.filter(s => s.trim() !== "")
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail?.[0]?.msg || data.detail || "Failed to create job");
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary-600 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" />
        Cancel
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Post a <span className="text-primary-600">New Role</span></h1>
        <p className="text-muted-foreground">Fill in the details to find your next great hire.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-background border p-8 rounded-3xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold">Job Title</label>
            <input
              required
              className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Department</label>
            <select
              className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none bg-background"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Location</label>
            <select
              className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none bg-background"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Min Salary ($)</label>
            <input
              required
              type="number"
              className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none"
              value={formData.salary_min}
              onChange={(e) => setFormData({ ...formData, salary_min: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Max Salary ($)</label>
            <input
              required
              type="number"
              className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none"
              value={formData.salary_max}
              onChange={(e) => setFormData({ ...formData, salary_max: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Description</label>
          <textarea
            required
            className="w-full p-3 border rounded-xl h-48 focus:ring-2 ring-primary-500 outline-none resize-none"
            placeholder="Describe the role, responsibilities, and team..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold">Required Skills</label>
          <div className="space-y-2">
            {formData.required_skills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <input
                  required
                  className="flex-1 p-2 border rounded-lg focus:ring-2 ring-primary-500 outline-none"
                  placeholder="e.g. React"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                />
                {formData.required_skills.length > 1 && (
                  <button type="button" onClick={() => removeSkill(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="h-4 w-4" /> Add Skill
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">Max Applicants (Optional)</label>
            <input
              type="number"
              className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none"
              placeholder="Leave blank for no limit"
              value={formData.max_applicants || ""}
              onChange={(e) => setFormData({ ...formData, max_applicants: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Deadline</label>
            <input
              required
              type="date"
              className="w-full p-3 border rounded-xl focus:ring-2 ring-primary-500 outline-none"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
        >
          <Rocket className="h-5 w-5" />
          {submitting ? "Publishing..." : "Publish Job Listing"}
        </button>
      </form>
    </div>
  );
}
