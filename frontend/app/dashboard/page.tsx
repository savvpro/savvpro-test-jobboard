"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, Briefcase, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface Stats {
  total_jobs: number;
  open_jobs: number;
  closed_jobs: number;
  total_applications: number;
  avg_applications_per_job: number;
  top_department: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}</div>;
  if (!stats) return <div className="text-center py-12">Failed to load statistics.</div>;

  const cards = [
    { title: "Total Jobs", value: stats.total_jobs, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Open Jobs", value: stats.open_jobs, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { title: "Closed Jobs", value: stats.closed_jobs, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { title: "Total Applications", value: stats.total_applications, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Avg Apps / Job", value: stats.avg_applications_per_job.toFixed(1), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Top Department", value: stats.top_department, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Hiring <span className="text-primary-600">Overview</span></h1>
        <p className="text-muted-foreground">Live insights into your recruitment pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="p-6 bg-background border rounded-2xl shadow-sm card-hover flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="text-3xl font-extrabold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-2xl font-bold relative">Platform Growth</h2>
          <p className="text-slate-400 text-sm relative">You've reached <span className="text-white font-bold">{stats.total_applications} candidates</span> across <span className="text-white font-bold">{stats.total_jobs} job listings</span>. Your most active department is <span className="text-primary-400 font-bold">{stats.top_department}</span>.</p>
          <div className="pt-4 flex gap-4 relative">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500" 
                style={{ width: `${(stats.open_jobs / (stats.total_jobs || 1)) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold">{((stats.open_jobs / (stats.total_jobs || 1)) * 100).toFixed(0)}% Open</span>
          </div>
        </div>

        <div className="p-8 bg-white border rounded-3xl flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold">Ready to scale?</h2>
          <p className="text-muted-foreground text-sm max-w-xs">Create more listings or optimize your current descriptions to attract more talent.</p>
          <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
            Post New Job
          </button>
        </div>
      </div>
    </div>
  );
}
