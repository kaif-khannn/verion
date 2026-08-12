import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const NICHES = [
  { id: 'electronics', label: 'Electronics & Gadgets', icon: '💻' },
  { id: 'fashion', label: 'Apparel & Fashion', icon: '👕' },
  { id: 'home', label: 'Home & Kitchen', icon: '🏠' },
  { id: 'beauty', label: 'Beauty & Personal Care', icon: '✨' },
];
const MOCK_INSIGHTS = {
  electronics: {
    trends: [
      { category: 'Smart Rings', growth: '+45%', desc: 'Health tracking without the bulky watch is seeing massive adoption.' },
      { category: 'GaN Chargers', growth: '+32%', desc: 'High-power, ultra-compact chargers are replacing standard OEM bricks.' },
      { category: 'Retro Gaming Handhelds', growth: '+28%', desc: 'Nostalgia-driven tech is driving high engagement on social media.' },
      { category: 'Bone Conduction Audio', growth: '+35%', desc: 'Open-ear audio is trending strongly for outdoor fitness enthusiasts.' },
      { category: 'AI Dash Cams', growth: '+40%', desc: 'Smart vehicle security with real-time incident reporting is surging.' },
      { category: 'Foldable Phone Accessories', growth: '+22%', desc: 'As foldable adoption grows, niche protective cases are highly searched.' },
      { category: 'Portable SSDs', growth: '+55%', desc: 'High-speed, durable storage is essential for modern content creators.' },
      { category: 'Mechanical Keyboards', growth: '+48%', desc: 'Customizable switches and keycaps are dominating desk setups.' },
      { category: 'Drone Accessories', growth: '+30%', desc: 'ND filters and extended batteries are highly sought after by enthusiasts.' }
    ],
    competitorMove: 'Major competitors have dropped prices on last-gen true wireless earbuds by 15% to clear inventory for Q3.',
    growthImpact: 18.5,
    salesImpact: 'Targeting this niche could drive a 15% conversion lift, generating an estimated ₹75,000 in additional monthly revenue.',
    idea: 'Premium Titanium Smart Ring with AI Sleep Tracking'
  },
  fashion: {
    trends: [
      { category: 'Oversized Linen', growth: '+55%', desc: 'Breathable, relaxed fit fabrics are dominating summer collections.' },
      { category: 'Chunky Loafers', growth: '+40%', desc: 'A staple transition piece heading into the fall season.' },
      { category: 'Cargo Maxi Skirts', growth: '+35%', desc: 'Y2K fashion revival continues to drive strong conversion rates.' },
      { category: 'Vintage Graphic Tees', growth: '+50%', desc: 'Authentic-looking distressed prints are seeing a massive resurgence.' },
      { category: 'Techwear Jackets', growth: '+28%', desc: 'Functional, multi-pocket aesthetics are trending in urban streetwear.' },
      { category: 'Chrome Accents', growth: '+42%', desc: 'Metallic silver detailing and hardware are highly searched accessories.' },
      { category: 'Western Boots', growth: '+65%', desc: 'Cowboy and western-inspired footwear is a massive festival trend.' },
      { category: 'Wrap Dresses', growth: '+38%', desc: 'Flattering, versatile silhouettes are a staple for spring collections.' },
      { category: 'Statement Belts', growth: '+45%', desc: 'Bold, oversized buckles are replacing minimalist leather bands.' }
    ],
    competitorMove: 'Top fast-fashion brands are increasing ad spend on TikTok for sustainable/upcycled lines.',
    growthImpact: 22.0,
    salesImpact: 'Targeting this niche could drive a 18% conversion lift, generating an estimated ₹82,000 in additional monthly revenue.',
    idea: 'Oversized Sustainable Linen Button-Down Shirt'
  },
  home: {
    trends: [
      { category: 'Mushroom Lamps', growth: '+60%', desc: 'Ambient, organic-shaped lighting is trending heavily on Pinterest.' },
      { category: 'Cold Brew Makers', growth: '+42%', desc: 'At-home specialty coffee accessories see continued YoY growth.' },
      { category: 'Fluted Glassware', growth: '+38%', desc: 'Textured dining aesthetics are replacing smooth, minimalist glass.' },
      { category: 'Bouclé Chairs', growth: '+45%', desc: 'Textured, cozy fabrics are dominating premium living room setups.' },
      { category: 'Hydroponic Gardens', growth: '+30%', desc: 'Indoor smart planters are seeing strong growth among urban renters.' },
      { category: 'Matcha Ritual Sets', growth: '+55%', desc: 'Premium ceramic whisk and bowl sets are riding the wellness wave.' },
      { category: 'Velvet Pillows', growth: '+33%', desc: 'Rich jewel tones and soft textures are popular for autumn decor.' },
      { category: 'Floating Shelves', growth: '+40%', desc: 'Minimalist wall storage solutions remain highly searched.' },
      { category: 'Ceramic Vases', growth: '+50%', desc: 'Handcrafted, imperfect pottery aesthetics are driving sales.' }
    ],
    competitorMove: 'Home decor stores are bundling aesthetic desk organizers with lighting for WFH setups.',
    growthImpact: 15.2,
    salesImpact: 'Targeting this niche could drive a 12% conversion lift, generating an estimated ₹60,000 in additional monthly revenue.',
    idea: 'Vintage-Inspired Fluted Glass Mushroom Lamp'
  },
  beauty: {
    trends: [
      { category: 'Peptide Lip Treatments', growth: '+75%', desc: 'High-gloss, hydrating treatments are the fastest growing cosmetic segment.' },
      { category: 'Rosemary Hair Oil', growth: '+50%', desc: 'Scalp care and natural growth stimulants are dominating viral charts.' },
      { category: 'Skin Tints', growth: '+45%', desc: 'Lightweight, skincare-infused coverage is replacing heavy foundation.' },
      { category: 'Snail Mucin', growth: '+60%', desc: 'K-beauty essentials continue to drive massive organic search volume.' },
      { category: 'Liquid Blushes', growth: '+55%', desc: 'Highly pigmented liquid formulas are the most engaging makeup formats.' },
      { category: 'Heatless Curlers', growth: '+40%', desc: 'Silk curling ribbons remain a top-selling accessory for hair health.' },
      { category: 'Pimple Patches', growth: '+80%', desc: 'Hydrocolloid patches with cute designs are flying off the shelves.' },
      { category: 'Tinted Sunscreen', growth: '+65%', desc: 'Multi-purpose SPF products are replacing traditional foundations.' },
      { category: 'Lip Masks', growth: '+45%', desc: 'Overnight hydrating treatments are a rapidly growing segment.' }
    ],
    competitorMove: 'Competitors are heavily pushing bundle deals (Buy 2 Get 1 Free) on TikTok Shop for lip products.',
    growthImpact: 28.4,
    salesImpact: 'Targeting this niche could drive a 25% conversion lift, generating an estimated ₹95,000 in additional monthly revenue.',
    idea: 'Hydrating Peptide Lip Treatment with Shea Butter'
  }
};


interface TrendInsights {
  positioning_strategy: string;
  target_audience: string[];
  sales_impact: string;
}

export default function HomeTab({ onGenerateIdea, userName = 'Admin' }: { onGenerateIdea: (idea: string) => void, userName?: string }) {
  const [activeNiche, setActiveNiche] = useState('electronics');
  const [userNiches, setUserNiches] = useState(NICHES);
  const [selectedTrend, setSelectedTrend] = useState<{ category: string, desc: string } | null>(null);
  const [trendInsights, setTrendInsights] = useState<TrendInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [nicheData, setNicheData] = useState<any>(null);
  const [isLoadingNiche, setIsLoadingNiche] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/users/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.preferred_niches && data.preferred_niches.length > 0) {
          const filtered = NICHES.filter(n => data.preferred_niches.includes(n.id));
          if (filtered.length > 0) {
            setUserNiches(filtered);
            setActiveNiche(filtered[0].id);
          }
        }
      })
      .catch(err => console.error("Error fetching user profile:", err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/analytics')
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

  const getCleanedMarkdown = (markdown: string) => {
    const rawHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(rawHtml);
  };

  useEffect(() => {
    setIsLoadingNiche(true);
    fetch(`http://localhost:8000/api/insights/trends?niche=${activeNiche}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setNicheData(data.data);
        } else {
          setNicheData(MOCK_INSIGHTS[activeNiche as keyof typeof MOCK_INSIGHTS]);
        }
        setIsLoadingNiche(false);
      })
      .catch(err => {
        console.error("API failed, using fallback:", err);
        setNicheData(MOCK_INSIGHTS[activeNiche as keyof typeof MOCK_INSIGHTS]);
        setIsLoadingNiche(false);
      });
  }, [activeNiche]);

  const handleTrendClick = async (trend: { category: string, desc: string }) => {
    setSelectedTrend(trend);
    setTrendInsights(null);
    setIsLoadingInsights(true);

    try {
      const res = await fetch('http://localhost:8000/api/insights/trend-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: trend.category, description: trend.desc })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTrendInsights(data.insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* ── Welcome Header ── */}
      <div className="mb-10 relative py-12">
        <div className="relative z-10 space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">Welcome back, {userName.split(' ')[0]}.</h1>
          <p className="text-neutral-400 text-lg max-w-4xl">Your autonomous optimization engine is running smoothly. We've analyzed the market and have new growth opportunities ready for you.</p>
        </div>
      </div>

      {/* ── Niche Selection ── */}
      <div className="w-full">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3 font-semibold">Your Market Focus</p>
        <div className="inline-flex flex-wrap bg-[#0f0f0f] border border-white/5 rounded-full p-1 shadow-lg">
          {userNiches.map(niche => (
            <button
              key={niche.id}
              onClick={() => setActiveNiche(niche.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeNiche === niche.id
                ? 'bg-white text-black shadow-lg'
                : 'text-neutral-400 hover:text-white'
                }`}
            >
              {niche.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Market Trends ── */}
        <div className="lg:col-span-2 space-y-6">
          {isLoadingNiche || !nicheData ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
              <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
              <p className="text-rose-300 font-medium animate-pulse tracking-wide">Scanning live market trends...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-6">
              <div className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 mt-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Competitor Intelligence</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{nicheData.competitorMove}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white">Trending in your Niche</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {nicheData.trends.map((trend: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => handleTrendClick(trend)}
                    className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 hover:border-white/10 hover:bg-neutral-800 transition-all cursor-pointer group active:scale-95 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-indigo-400 transition-colors">{trend.category}</h3>
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20 shrink-0">{trend.growth}</span>
                    </div>
                    <p className="text-neutral-400 text-sm leading-relaxed flex-1">{trend.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: AI Action & Impact ── */}
        <div className="lg:col-span-1 relative h-full">
          {/* Action Card */}
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden h-full flex flex-col">

            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-white font-semibold mb-2">Product Suggestion</h3>
              <p className="text-neutral-400 text-sm mb-6">Based on our market analysis, we recommend generating an optimized listing for:</p>
              <div className="flex flex-col gap-4 mb-6 flex-1">
                <div className="p-5 bg-[#0f0f0f] border border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                  <p className="text-blue-300 font-medium text-base mb-2">"{isLoadingNiche || !nicheData ? "Analyzing best opportunities..." : nicheData.trends[0]?.category}"</p>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-[250px]">
                    {isLoadingNiche || !nicheData ? "Please wait while we crunch the market data." : nicheData.trends[0]?.desc}
                  </p>
                </div>

                {!isLoadingNiche && nicheData?.salesImpact && (
                  <div className="p-4 bg-[#0f0f0f] border border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                    <p className="text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1.5 mb-2 tracking-wide">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                      PROJECTED IMPACT
                    </p>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      {nicheData.salesImpact}
                    </p>
                  </div>
                )}

                <div className="p-5 bg-[#0f0f0f] border border-white/10 rounded-xl flex-1 flex flex-col justify-center">
                  <p className="text-neutral-400 text-xs mb-3 leading-relaxed">To successfully launch this product listing, please prepare the following assets:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs text-neutral-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0"><span className="text-[10px] font-bold">1</span></div>
                      <span className="mt-0.5"><strong>Collect product photography:</strong> High-resolution images showing multiple angles and use cases.</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-neutral-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0"><span className="text-[10px] font-bold">2</span></div>
                      <span className="mt-0.5"><strong>Gather specifications:</strong> Core materials, dimensions, and technical features.</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-neutral-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0"><span className="text-[10px] font-bold">3</span></div>
                      <span className="mt-0.5"><strong>Generate optimized listing:</strong> Use our AI engine to instantly write your SEO titles and descriptions.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => onGenerateIdea(nicheData?.trends[0]?.category || '')}
                className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex justify-center items-center gap-2 group mt-auto"
              >
                Generate New Product Idea
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Area (Full Width) */}
      <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex flex-col w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">AI Insights</h3>
            <p className="text-sm text-neutral-500">Generated by Verion AI Analyst</p>
          </div>
        </div>

        <div className="flex-1 w-full">
          {isLoadingAnalytics ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-2/3 mt-6"></div>
            </div>
          ) : (
            analytics?.insights ? (
              <div
                className="prose prose-invert prose-base max-w-none text-neutral-300 prose-strong:text-white prose-ul:pl-4 prose-li:my-1 prose-headings:text-white prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: getCleanedMarkdown(analytics.insights) }}
              />
            ) : (
              <p className="text-neutral-500">Failed to load insights.</p>
            )
          )}
        </div>
      </div>

      {/* ── Trend Insights Modal ── */}
      {selectedTrend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedTrend(null)}></div>
          <div className="relative z-10 w-full max-w-3xl bg-neutral-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 ease-out max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-300 mb-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Deep Dive Analysis
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedTrend.category}</h2>
                  <p className="text-neutral-400">{selectedTrend.desc}</p>
                </div>
                <button onClick={() => setSelectedTrend(null)} className="p-2 hover:bg-white/10 rounded-full text-neutral-400 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {isLoadingInsights ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-5">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-indigo-300 font-medium animate-pulse tracking-wide">Running market analysis via Groq LLM...</p>
                </div>
              ) : trendInsights ? (
                <div className="space-y-6">
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-[1.5rem] p-6 animate-in fade-in duration-700 ease-out" style={{ animationFillMode: 'backwards', animationDelay: '100ms' }}>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      Positioning Strategy
                    </h3>
                    <p className="text-neutral-300 text-base leading-relaxed">
                      {typeof trendInsights.positioning_strategy === 'string'
                        ? trendInsights.positioning_strategy
                        : JSON.stringify(trendInsights.positioning_strategy)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-[#0f0f0f] border border-white/5 rounded-[1.5rem] p-6 h-full flex flex-col animate-in fade-in duration-700 ease-out" style={{ animationFillMode: 'backwards', animationDelay: '250ms' }}>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Target Audience
                      </h3>
                      <ul className="space-y-3 flex-1">
                        {Array.isArray(trendInsights.target_audience)
                          ? trendInsights.target_audience.map((aud, idx) => (
                            <li key={idx} className="text-neutral-300 text-sm flex items-start gap-3">
                              <span className="text-rose-500 mt-1 flex-shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span>
                              {typeof aud === 'string' ? aud : JSON.stringify(aud)}
                            </li>
                          ))
                          : <li className="text-neutral-300 text-sm">
                            {typeof trendInsights.target_audience === 'string'
                              ? trendInsights.target_audience
                              : JSON.stringify(trendInsights.target_audience)}
                          </li>
                        }
                      </ul>
                    </div>

                    <div className="bg-[#0f0f0f] border border-white/5 rounded-[1.5rem] p-6 h-full flex flex-col justify-center animate-in fade-in duration-700 ease-out" style={{ animationFillMode: 'backwards', animationDelay: '400ms' }}>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        Predicted Sales Impact
                      </h3>
                      <p className="text-neutral-300 text-base leading-relaxed">
                        {typeof trendInsights.sales_impact === 'string'
                          ? trendInsights.sales_impact
                          : JSON.stringify(trendInsights.sales_impact)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 animate-in fade-in duration-700 ease-out" style={{ animationFillMode: 'backwards', animationDelay: '550ms' }}>
                    <button
                      onClick={() => {
                        onGenerateIdea(selectedTrend.category);
                        setSelectedTrend(null);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex justify-center items-center gap-2 group"
                    >
                      Auto-Generate Product Listing Now
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
