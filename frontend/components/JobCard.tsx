"use client";

import { useRouter } from "next/navigation";
import { Job } from "@/lib/api";
import { Clock } from "lucide-react";

export default function JobCard({ job, onClick }: { job: Job; onClick?: () => void }) {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) onClick();
    else router.push(`/jobs/${job.id}`);
  };

  const deadlineDate = new Date(job.deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft > 0 && daysLeft <= 7;
  const isExpired = daysLeft < 0;

  return (
    <div 
      onClick={handleCardClick}
      className={`relative bg-white border border-border rounded-[18px] p-6 shadow-sm cursor-pointer transition flex flex-col justify-between h-full group ${
        job.is_closed ? "opacity-70 grayscale-[0.3]" : "hover:-translate-y-[2px] hover:shadow-md hover:border-[#BBBBC0]"
      }`}
    >
      {job.is_closed && (
        <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] rounded-[18px] flex items-center justify-center">
          <div className="bg-black/80 text-white font-medium text-[14px] px-4 py-1.5 rounded-full shadow-lg">
            Position Closed
          </div>
        </div>
      )}
      
      <div>
        <div className="flex items-start justify-between mb-4">
          <span className="bg-[#F0F4FF] text-accent rounded-md px-2 py-0.5 text-[12px] font-medium">
            {job.department}
          </span>
          <span className="text-textSecondary text-[13px] capitalize">
            {job.location}
          </span>
        </div>
        
        <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-textPrimary leading-tight mb-3">
          {job.title}
        </h3>
        
        <p className="text-[15px] font-medium text-textPrimary mb-5">
          ${job.salary_min.toLocaleString()} — ${job.salary_max.toLocaleString()} / year
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {job.required_skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="bg-surface rounded-md px-2.5 py-1 text-[13px] text-textPrimary">
              {skill}
            </span>
          ))}
          {job.required_skills.length > 3 && (
            <span className="bg-surface rounded-md px-2.5 py-1 text-[13px] text-textSecondary">
              +{job.required_skills.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <div className={`flex items-center gap-1.5 text-[13px] ${isUrgent && !job.is_closed ? 'text-danger font-medium' : 'text-textSecondary'}`}>
          <Clock size={14} />
          {isUrgent && !job.is_closed ? `${daysLeft} days left` : isExpired ? 'Expired' : `Deadline: ${new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </div>
        
        {!job.is_closed && (
          <span className="text-accent font-medium text-[14px] group-hover:underline">
            Apply →
          </span>
        )}
      </div>
    </div>
  );
}