import Link from "next/link";

export default function JobCard({ job }: { job: any }) {
  return (
    <div className="border border-slate-300 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
          <p className="text-slate-600 font-medium">{job.department} &bull; <span className="uppercase">{job.location}</span></p>
        </div>
        {job.is_closed && <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded font-bold">CLOSED</span>}
      </div>
      <p className="text-slate-700 mb-4 line-clamp-2">{job.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.required_skills.map((skill: string) => (
          <span key={skill} className="bg-slate-100 border border-slate-300 text-slate-800 text-xs px-2 py-1 rounded-md font-semibold">
            {skill}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center mt-6 border-t pt-4">
        <span className="text-slate-900 font-bold">${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
        <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:text-blue-800 font-bold underline underline-offset-4">
          View & Apply &rarr;
        </Link>
      </div>
    </div>
  );
}