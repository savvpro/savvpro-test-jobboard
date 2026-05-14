import ApplicationRow from "@/components/ApplicationRow";

export default async function ApplicationsPipeline({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;

  const res = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}/applications`, { cache: 'no-store' });
  const applications = await res.json();

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">Candidate Pipeline (Job ID: {jobId})</h1>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-100 border-b border-slate-300">
          <tr>
            <th className="p-4 font-bold text-slate-900 uppercase text-sm">Applicant</th>
            <th className="p-4 font-bold text-slate-900 uppercase text-sm">Experience</th>
            <th className="p-4 font-bold text-slate-900 uppercase text-sm">Status</th>
            <th className="p-4 font-bold text-slate-900 uppercase text-sm">Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.length > 0 ? (
            applications.map((app: any) => <ApplicationRow key={app.id} app={app} />)
          ) : (
            <tr><td colSpan={4} className="p-6 text-center text-slate-600 font-semibold">No applications found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}