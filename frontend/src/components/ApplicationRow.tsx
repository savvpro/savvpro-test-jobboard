import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { ApplicationResponse } from "@/types/application";

export interface ApplicationRowProps {
  application: ApplicationResponse;
}

export default function ApplicationRow({ application }: ApplicationRowProps) {
  const { id, job_id, applicant_name, email, years_experience, cv_summary, status, linkedin_url } = application;

  return (
    <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950/80 dark:shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{applicant_name}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <a href={`mailto:${email}`} className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-200">
              {email}
            </a>
            <span className="mx-2 text-zinc-400">·</span>
            <span>{years_experience} years experience</span>
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Applied to{" "}
            <Link href={`/job/${job_id}`} className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100">
              Job #{job_id}
            </Link>
            <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-500">Application ID {id}</span>
          </p>
          {linkedin_url && (
            <p className="text-sm">
              <a
                href={linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-white"
              >
                LinkedIn profile
              </a>
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{cv_summary}</p>
    </article>
  );
}
