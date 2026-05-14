"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getJob, Job } from "@/lib/api";
import ApplyForm from "@/components/ApplyForm";
import { ArrowLeft, Clock } from "lucide-react";

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const res = await getJob(Number(params.id));
      setJob(res);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading) {
    return (
      <main className="py-12 animate-pulse">
        <div className="w-24 h-5 bg-surface rounded-md mb-8" />
        <div className="flex gap-3 mb-4">
          <div className="w-20 h-6 bg-surface rounded-md" />
          <div className="w-20 h-6 bg-surface rounded-md" />
        </div>
        <div className="w-3/4 h-10 bg-surface rounded-md mb-4" />
        <div className="w-1/3 h-6 bg-surface rounded-md mb-2" />
        <div className="w-1/4 h-5 bg-surface rounded-md mb-12" />
        <div className="w-full h-[1px] bg-border mb-12" />
        <div className="w-48 h-8 bg-surface rounded-md mb-6" />
        <div className="space-y-3">
          <div className="w-full h-4 bg-surface rounded-md" />
          <div className="w-full h-4 bg-surface rounded-md" />
          <div className="w-5/6 h-4 bg-surface rounded-md" />
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="py-24 text-center">
        <h2 className="text-[28px] font-bold text-textPrimary mb-2">Job Not Found</h2>
        <p className="text-textSecondary mb-6">This position may have been removed or no longer exists.</p>
        <Link href="/" className="text-accent hover:underline">
          Return to open roles
        </Link>
      </main>
    );
  }

  const deadlineDate = new Date(job.deadline);
  const diffTime = deadlineDate.getTime() - new Date().getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;

  return (
    <main className="py-8 md:py-12 max-w-[800px] mx-auto animate-fade-up">
      <Link href="/" className="inline-flex items-center gap-1.5 text-textSecondary hover:text-textPrimary text-[14px] font-medium transition-colors mb-12">
        <ArrowLeft size={16} />
        Back to Jobs
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-[#F0F4FF] text-accent rounded-md px-2.5 py-1 text-[13px] font-medium">
            {job.department}
          </span>
          <span className="bg-surface text-textSecondary rounded-md px-2.5 py-1 text-[13px] font-medium capitalize">
            {job.location}
          </span>
          {job.is_closed && (
            <span className="bg-black/80 text-white rounded-md px-2.5 py-1 text-[13px] font-medium">
              Closed
            </span>
          )}
        </div>

        <h1 className="text-[40px] leading-[1.1] font-bold tracking-[-1.5px] text-textPrimary mb-4">
          {job.title}
        </h1>

        <div className="text-[20px] font-medium text-textPrimary mb-3">
          ${job.salary_min.toLocaleString()} — ${job.salary_max.toLocaleString()}
        </div>

        <div className={`flex items-center gap-1.5 text-[15px] ${isExpired ? 'text-danger' : 'text-textSecondary'}`}>
          <Clock size={16} />
          {isExpired ? 'Application deadline passed' : `Deadline: ${deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        </div>
      </div>

      <hr className="border-border mb-12" />

      <section className="mb-12">
        <h2 className="text-[28px] font-bold tracking-[-0.5px] text-textPrimary mb-6">
          About this role
        </h2>
        <div className="text-[17px] leading-[1.5] text-textPrimary whitespace-pre-wrap mb-10">
          {job.description}
        </div>

        <h3 className="text-[20px] font-bold tracking-[-0.3px] text-textPrimary mb-4">
          Required Skills
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {job.required_skills.map((skill, i) => (
            <span key={i} className="bg-surface rounded-md px-3 py-1.5 text-[14px] text-textPrimary font-medium">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <hr className="border-border mb-12" />

      <section className="mb-12 bg-surface2 border border-border rounded-[24px] p-8 md:p-12 relative overflow-hidden">
        {job.is_closed ? (
          <div className="text-center py-8">
            <h2 className="text-[24px] font-bold tracking-[-0.5px] text-textPrimary mb-2">
              Position Closed
            </h2>
            <p className="text-[15px] text-textSecondary">
              We are no longer accepting applications for this role.
            </p>
          </div>
        ) : isExpired ? (
          <div className="text-center py-8">
            <h2 className="text-[24px] font-bold tracking-[-0.5px] text-textPrimary mb-2">
              Deadline Passed
            </h2>
            <p className="text-[15px] text-textSecondary">
              The window to apply for this role has closed.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-[28px] font-bold tracking-[-0.5px] text-textPrimary mb-8">
              Apply for this position
            </h2>
            <ApplyForm jobId={job.id} onSuccess={() => fetchJob()} />
          </>
        )}
      </section>

      <div className="mt-16 text-center">
        <Link 
          href={`/jobs/${job.id}/applications`}
          className="text-[14px] text-accent font-medium hover:underline inline-flex items-center gap-1"
        >
          Manager: View Applications →
        </Link>
      </div>
    </main>
  );
}