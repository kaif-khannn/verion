import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:8000';

interface StatsData {
  rag_documents: number;
  avg_seo_score_increase: string;
  time_saved_per_listing: string;
  recent_optimizations: number;
}

interface ChartDataPoint {
  date: string;
  optimizations: number;
  seo_score: number;
}

interface AnalyticsData {
  chart_data: ChartDataPoint[];
  insights: string;
}

export default function StatisticsTab() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    // Fetch top level stats
    fetch(`${API}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    // Fetch deep analytics
    fetch(`${API}/api/analytics`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setIsLoadingAnalytics(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingAnalytics(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-white">Platform Statistics</h2>
        <p className="text-neutral-500 mt-2 text-lg">Metrics across your workspace and the RAG Competitor Database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Growth Prediction Card */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center text-emerald-400 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
            </div>
            <p className="text-sm text-emerald-400 font-medium mb-2 uppercase tracking-widest">Growth Prediction</p>
            <div className="flex items-end gap-2 mb-1">
              <p className="text-4xl font-semibold text-white">+18.5%</p>
              <span className="text-emerald-400 font-medium text-sm mb-1">Uplift</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 mb-4">Estimated revenue impact.</p>
          </div>
          <div className="h-12 mt-2 flex items-end gap-1.5 justify-between relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
            {[40, 55, 45, 60, 75, 65, 90].map((h, i) => (
              <div key={i} className="w-full bg-emerald-500/30 rounded-t-sm transition-all duration-500 hover:bg-emerald-500/60 relative" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        {/* Optimizations */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center text-white mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-2 uppercase tracking-widest">Optimizations</p>
            <p className="text-4xl font-semibold text-white">{stats ? stats.recent_optimizations : '...'}</p>
            <p className="text-sm text-emerald-400 mt-4 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
              12% this week
            </p>
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center text-white mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <p className="text-sm text-neutral-400 font-medium mb-2 uppercase tracking-widest">Time Saved</p>
            <p className="text-4xl font-semibold text-white">{stats ? stats.time_saved_per_listing : '...'}</p>
            <p className="text-sm text-neutral-500 mt-4">Per product listing</p>
          </div>
        </div>
      </div>

      {/* AI Analytics Section */}
      <div className="mt-6">
        {/* Chart Area */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
          <h3 className="text-xl font-medium text-white mb-6">Optimization Trends</h3>

          {isLoadingAnalytics ? (
            <div className="h-[300px] w-full animate-pulse flex flex-col justify-end gap-2 items-center">
              <div className="w-full flex items-end gap-2 h-full">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-md" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                ))}
              </div>
            </div>
          ) : (
            analytics?.chart_data && (
              <div>
                {/* Legend */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-neutral-400">Avg SEO Score <span className="text-neutral-500">(0–100 quality scale)</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                    <span className="text-xs text-neutral-400">Daily Optimizations <span className="text-neutral-500">(product listings generated)</span></span>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.chart_data} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSeo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                      {/* Left Y-axis: SEO Score (0-100) */}
                      <YAxis yAxisId="seo" domain={[0, 100]} stroke="#10b981" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} label={{ value: 'SEO Score', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10, dx: -4 }} />
                      {/* Right Y-axis: Optimizations (count) */}
                      <YAxis yAxisId="opt" orientation="right" stroke="#8b5cf6" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Optimizations', angle: 90, position: 'insideRight', fill: '#8b5cf6', fontSize: 10, dx: 8 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px' }}
                        labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 6 }}
                        formatter={(value: any, name: any) => {
                          if (name === 'seo_score') return [`${value} / 100`, '🟢 Avg SEO Score'];
                          if (name === 'optimizations') return [value, '🟣 Daily Optimizations'];
                          return [value, name];
                        }}
                      />
                      <Area yAxisId="seo" type="monotone" dataKey="seo_score" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSeo)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                      <Area yAxisId="opt" type="monotone" dataKey="optimizations" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpt)" dot={false} activeDot={{ r: 5, fill: '#8b5cf6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          )}
        </div>
      </div>


    </div>
  );
}
