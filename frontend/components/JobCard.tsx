import Link from "next/link";
import { MapPin } from "lucide-react";

interface JobCardProps {
  job: {
    id: number;
    title: string;
    department: string;
    location: string;
    salary_min: number;
    salary_max: number;
    deadline: string;
    required_skills: string[];
  };
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link 
      href={`/jobs/${job.id}`}
      className="group p-6 bg-background border rounded-2xl card-hover relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
      <div className="space-y-4 relative">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full uppercase">
            {job.department}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        </div>
        <h3 className="text-xl font-bold group-hover:text-primary-600 transition-colors">
          {job.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {job.required_skills.slice(0, 3).map((skill) => (
            <span key={skill} className="px-2 py-1 bg-muted rounded-md text-xs">
              {skill}
            </span>
          ))}
          {job.required_skills.length > 3 && (
            <span className="text-xs text-muted-foreground self-center">
              +{job.required_skills.length - 3} more
            </span>
          )}
        </div>
        <div className="pt-4 flex justify-between items-center border-t">
          <span className="font-semibold text-primary-600">
            ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(job.deadline).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
