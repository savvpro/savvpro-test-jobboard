export default async function Dashboard() {
  const res = await fetch('http://127.0.0.1:8000/api/stats', { cache: 'no-store' });
  const stats = await res.json();

  const cards = [
    { label: "Total Jobs", value: stats.total_jobs },
    { label: "Open Jobs", value: stats.open_jobs },
    { label: "Closed Jobs", value: stats.closed_jobs },
    { label: "Total Applications", value: stats.total_applications },
    { label: "Avg Apps / Job", value: stats.avg_applications_per_job },
    { label: "Top Department", value: stats.top_department },
  ];

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8 text-slate-900 border-b-2 border-slate-200 pb-4">Platform Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white border-2 border-slate-800 p-8 rounded-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:shadow-none transition-all">
            <h3 className="text-sm uppercase tracking-widest font-bold text-slate-600 mb-2">{card.label}</h3>
            <p className="text-5xl font-black text-slate-900 truncate" title={String(card.value)}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}