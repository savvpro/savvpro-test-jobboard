"use client";

import { useState } from "react";
import { JobCard, PaginationControls } from "@/components";

const jobData = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "SavvPro Labs",
    location: "Remote",
    salaryRange: "$110k - $140k",
    description:
      "Lead UI and UX initiatives for our job board platform, build accessible design systems, and collaborate closely with product and engineering.",
    status: "Open",
    postedAt: "2 days ago",
    tags: ["Design", "Remote", "Full-time"],
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "SavvPro Labs",
    location: "Austin, TX",
    salaryRange: "$120k - $160k",
    description:
      "Build customer-facing features using React and Next.js while helping maintain our backend APIs and platform reliability.",
    status: "Paused",
    postedAt: "5 days ago",
    tags: ["Engineering", "Next.js", "API"],
  },
  {
    id: 3,
    title: "Customer Success Lead",
    company: "SavvPro Labs",
    location: "New York, NY",
    salaryRange: "$90k - $110k",
    description:
      "Partner with enterprise customers to deliver onboarding and adoption programs that increase retention and lifetime value.",
    status: "Closed",
    postedAt: "1 week ago",
    tags: ["Customer Success", "Enterprise", "Hybrid"],
  },
];

const PAGE_SIZE = 2;

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(jobData.length / PAGE_SIZE);
  const visibleJobs = jobData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-zinc-50 py-10 text-slate-950 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="space-y-3 rounded-3xl bg-white/90 p-8 shadow-sm shadow-zinc-200/50 dark:bg-zinc-950/80 dark:shadow-black/20">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Job board demo
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Reusable JobCard, StatusBadge, and Pagination
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              This page demonstrates reusable TypeScript components using TailwindCSS for easy job listing layouts and pagination controls.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              salaryRange={job.salaryRange}
              description={job.description}
              status={job.status}
              postedAt={job.postedAt}
              tags={job.tags}
              onViewDetails={() => setCurrentPage(currentPage)}
            />
          ))}
        </section>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          className="justify-center"
        />
      </main>
    </div>
  );
}
