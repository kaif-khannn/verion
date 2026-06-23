import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8000';

interface StatsData {
  rag_documents: number;
  avg_seo_score_increase: string;
  time_saved_per_listing: string;
  recent_optimizations: number;
}

export default function StatisticsTab() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch(`${API}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl">
        <h2 className="text-3xl font-semibold text-white">Platform Statistics</h2>
        <p className="text-neutral-500 mt-2 text-lg">Metrics across your workspace and the RAG Competitor Database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* RAG DB Card */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center text-white mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-2 uppercase tracking-widest">RAG Database</p>
            <p className="text-4xl font-semibold text-white">{stats ? stats.rag_documents.toLocaleString() : '...'}</p>
            <p className="text-sm text-neutral-500 mt-4">Competitor products indexed</p>
          </div>
        </div>

        {/* Optimizations */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center text-white mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-2 uppercase tracking-widest">Optimizations</p>
            <p className="text-4xl font-semibold text-white">{stats ? stats.recent_optimizations : '...'}</p>
            <p className="text-sm text-emerald-400 mt-4 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              12% this week
            </p>
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center text-white mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-2 uppercase tracking-widest">Avg. SEO Lift</p>
            <p className="text-4xl font-semibold text-white">{stats ? stats.avg_seo_score_increase : '...'}</p>
            <p className="text-sm text-neutral-500 mt-4">Based on RAG analysis</p>
          </div>
        </div>

        {/* Time Saved */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center text-white mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-2 uppercase tracking-widest">Time Saved</p>
            <p className="text-4xl font-semibold text-white">{stats ? stats.time_saved_per_listing : '...'}</p>
            <p className="text-sm text-neutral-500 mt-4">Per product listing</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-12 shadow-xl mt-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-3xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center mb-6 text-neutral-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
        </div>
        <h3 className="text-2xl font-medium text-white mb-2">Detailed Analytics</h3>
        <p className="text-neutral-500">Comprehensive chart visualization coming in the next update.</p>
      </div>
    </div>
  );
}
