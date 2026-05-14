import StatusBadge from "./StatusBadge";

export interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  description: string;
  status: string;
  postedAt?: string;
  tags?: string[];
  onViewDetails?: () => void;
}

export default function JobCard({
  title,
  company,
  location,
  salaryRange,
  description,
  status,
  postedAt,
  tags,
  onViewDetails,
}: JobCardProps) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-200/50 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/80 dark:shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{company}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{location}</span>
            {salaryRange ? <span>{salaryRange}</span> : null}
            {postedAt ? <span>Posted {postedAt}</span> : null}
          </div>
        </div>

        {onViewDetails ? (
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-zinc-200"
          >
            View details
          </button>
        ) : null}
      </div>

      <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>

      {tags?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
