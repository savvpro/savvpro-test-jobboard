import JobCard from "@/components/JobCard";
import PaginationControls from "@/components/PaginationControls";
import JobFilters from "@/components/JobFilters"; // <-- Import the new component

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = new URLSearchParams({ page: page.toString(), per_page: "5" });
  
  // Connect the URL parameters to the backend query
  if (params.department) query.set("department", params.department);
  if (params.location) query.set("location", params.location);
  if (params.skill) query.set("skill", params.skill);

  const res = await fetch(`http://127.0.0.1:8000/api/jobs?${query.toString()}`, { cache: 'no-store' });
  const data = await res.json();

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8 text-slate-900 border-b-2 border-slate-200 pb-4">Open Roles</h1>
      
      {/* Drop the Filter Bar into the UI */}
      <JobFilters />

      <div className="flex flex-col gap-6">
        {data.results?.length > 0 ? (
          data.results.map((job: any) => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="bg-slate-100 border-2 border-dashed border-slate-300 p-8 text-center rounded-lg">
            <p className="text-slate-600 font-bold text-xl">No open roles match your filters.</p>
            <p className="text-slate-500 font-medium mt-2">Try adjusting your search criteria or clearing the filters.</p>
          </div>
        )}
      </div>
      <PaginationControls totalCount={data.total_count || 0} page={page} perPage={5} />
    </div>
  );
}