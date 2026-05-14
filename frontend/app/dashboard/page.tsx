"use client";

import { useEffect, useState } from "react";
import { getStats, Stats } from "@/lib/api";
import DashboardStat from "@/components/DashboardStat";
import { Briefcase, CheckCircle, XCircle, Users, BarChart2, Trophy, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !stats) {
    return (
      <main className="py-12 max-w-[1120px] mx-auto px-6 animate-pulse">
        <div className="w-64 h-10 bg-surface rounded-md mb-2" />
        <div className="w-48 h-6 bg-surface rounded-md mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="h-[140px] bg-surface rounded-[18px]" />
          <div className="h-[140px] bg-surface rounded-[18px]" />
          <div className="h-[140px] bg-surface rounded-[18px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-[140px] bg-surface rounded-[18px]" />
          <div className="h-[140px] bg-surface rounded-[18px]" />
          <div className="h-[140px] bg-surface rounded-[18px]" />
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="py-24 text-center">
        <h2 className="text-[28px] font-bold text-textPrimary mb-2">Error Loading Dashboard</h2>
        <p className="text-[17px] text-textSecondary mb-6">Failed to load hiring analytics.</p>
        <button onClick={handleRefresh} className="text-accent font-medium hover:underline">Try Again</button>
      </main>
    );
  }

  return (
    <main className="py-12 max-w-[1120px] mx-auto px-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[40px] leading-[1.1] font-bold tracking-[-1.5px] text-textPrimary mb-2">
            Hiring Analytics
          </h1>
          <p className="text-[17px] text-textSecondary font-medium">
            Live overview of your hiring pipeline.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-textPrimary bg-white border border-border px-5 py-2.5 rounded-full shadow-sm hover:border-[#BBBBC0] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin text-accent' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Statistics'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardStat 
          label="Total Jobs" 
          value={stats.total_jobs} 
          icon={<Briefcase size={16} />} 
          accentColor="#0066CC" 
        />
        <DashboardStat 
          label="Open Jobs" 
          value={stats.open_jobs} 
          icon={<CheckCircle size={16} />} 
          accentColor="#34C759" 
        />
        <DashboardStat 
          label="Closed Jobs" 
          value={stats.closed_jobs} 
          icon={<XCircle size={16} />} 
          accentColor="#8E8E93" 
        />
        <DashboardStat 
          label="Total Applications" 
          value={stats.total_applications} 
          icon={<Users size={16} />} 
          accentColor="#AF52DE" 
        />
        <DashboardStat 
          label="Avg Apps / Job" 
          value={Number(stats.avg_applications_per_job.toFixed(1))} 
          icon={<BarChart2 size={16} />} 
          accentColor="#FF9F0A" 
        />
        <DashboardStat 
          label="Top Department" 
          value={stats.top_department || "N/A"} 
          icon={<Trophy size={16} />} 
          accentColor="#FF3B30" 
        />
      </div>
    </main>
  );
}