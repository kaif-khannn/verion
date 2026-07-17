import React, { useState, useRef, useCallback, useEffect } from 'react';
import PipelineVisualizer from '../PipelineVisualizer';
import CopeSimulationModal from './CopeSimulationModal';

const API = 'http://localhost:8000';

// ── Types ──
interface SeoData {
  title?: string; keywords?: string[]; bullet_points?: string[];
  price?: string; color?: string; condition?: string; weight?: string;
  brand?: string; material?: string; dimensions?: string;
  category?: string; product_type?: string; specs?: Record<string, string>; error?: string;
}

interface MarketingData {
  platform?: string; whatsapp?: string; instagram_caption?: string;
  platform_description?: string; call_to_action?: string; error?: string;
}

interface CompetitorData {
  market_positioning?: string;
  recommended_price?: string;
  pricing_strategy?: string;
  competitor_insights?: string[];
  error?: string;
}

interface ValidationData {
  status?: string;
  missing_elements?: string[];
  warnings?: string[];
  error?: string;
}

interface ScoreData {
  seo_score?: number;
  marketing_score?: number;
  overall_score?: number;
  feedback?: string;
  error?: string;
}

interface CopeScores {
  overall_score: number;
  purchase_probability: number;
  expected_ctr: number;
  seo_ranking_potential: string;
  brand_compliance: number;
  confidence_score: number;
}

interface Variant {
  variant_id: string;
  marketing: MarketingData;
  seo: SeoData;
  cope_scores?: CopeScores;
}

interface CopeDecision {
  action: string;
  reason: string;
  recommended_variant_id?: string;
  variants_to_test?: string[];
}

interface ResultData {
  sanitized_input?: string; 
  vision_analysis?: string;
  rag_context?: string;
  seo?: SeoData; 
  marketing?: MarketingData;
  competitor_analysis?: CompetitorData;
  validation?: ValidationData;
  scores?: ScoreData;
  scored_variants?: Variant[];
  decision?: CopeDecision;
}

interface ApiResult { status: string; data: ResultData; }

type PublishState = 'idle' | 'uploading' | 'publishing' | 'success' | 'error';

const PLATFORMS = [
  { id: 'shopify', label: 'Shopify', emoji: '🛍️', color: 'from-[#95bf47] to-[#739931]' },
  { id: 'woocommerce', label: 'WooCommerce', emoji: '🛒', color: 'from-[#96588a] to-[#7b4671]' },
  { id: 'amazon', label: 'Amazon', emoji: '📦', color: 'from-[#ff9900] to-[#e68a00]' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all text-xs px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-neutral-300 font-medium">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function GenerateTab({ initialInput = '', initialImage = null }: { initialInput?: string, initialImage?: string | null }) {
  const [rawInput, setRawInput] = useState(initialInput);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialImage);
  const [platform, setPlatform] = useState('shopify');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState({ step: 0, loading: false });
  const [results, setResults] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (initialInput) setRawInput(initialInput);
  }, [initialInput]);

  useEffect(() => {
    setExistingImageUrl(initialImage || null);
  }, [initialImage]);

  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [publishResult, setPublishResult] = useState<{ admin_url?: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishVendor, setPublishVendor] = useState('Verion AI');
  const [publishPrice, setPublishPrice] = useState('0.00');
  const [publishSalePrice, setPublishSalePrice] = useState('');
  const [publishQuantity, setPublishQuantity] = useState<number | ''>(1);
  const [abTestState, setAbTestState] = useState<'idle' | 'starting' | 'live_ready' | 'simulating' | 'success' | 'error'>('idle');
  const [agentFeed, setAgentFeed] = useState<any[]>([]);

  const addImages = useCallback((files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;
    setImageFiles(prev => [...prev, ...valid]);
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); addImages(Array.from(e.dataTransfer.files));
  }, [addImages]);

  const handleGenerate = async () => {
    if (!rawInput.trim()) return;
    setPipelineStatus({ step: 1, loading: true });
    setResults(null); setError(null);
    setPublishState('idle'); setAbTestState('idle'); setPublishResult(null);
    setSelectedVariantId(null);
    try {
      const formData = new FormData();
      formData.append('raw_description', rawInput);
      formData.append('platform', platform);
      imageFiles.forEach(f => formData.append('images', f));
      if (existingImageUrl) formData.append('image_url', existingImageUrl);
      const response = await fetch(`${API}/api/generate`, { method: 'POST', body: formData });
      const data = await response.json();
      setPipelineStatus({ step: 8, loading: false });
      setResults(data);
      if (data.data?.competitor_analysis?.recommended_price) {
        setPublishPrice(data.data.competitor_analysis.recommended_price);
      } else if (data.data?.seo?.price) {
        setPublishPrice(data.data.seo.price);
      }
    } catch {
      setError('Failed to connect to backend.');
      setPipelineStatus({ step: 0, loading: false });
    }
  };

  const startAbTest = async () => {
    if (!resultData?.scored_variants || !resultData?.decision) return;
    setAbTestState('starting');
    try {
      const variantsToTest = resultData.decision?.variants_to_test?.length
        ? resultData.scored_variants.filter(v => resultData.decision.variants_to_test.includes(v.variant_id))
        : resultData.scored_variants;
      const payload = {
        platform,
        product_id: 'prod_' + Math.random().toString(36).substring(7), // Mock ID for MVP
        variants: variantsToTest
      };
      const r = await fetch(`${API}/api/experiments/start`, {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error('Failed to start A/B test');
      setAbTestState('live_ready');
    } catch (e) {
      console.error(e);
      setAbTestState('error');
    }
  };

  const runLiveReview = async () => {
    if (!resultData || !resultData.scored_variants) return;
    setAbTestState('starting'); // Use starting as a loading state for the button
    try {
      const payload = {
        variants: resultData.scored_variants
      };
      const r = await fetch(`${API}/api/experiments/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error('Failed to run simulation');
      const data = await r.json();
      if (data.data && data.data.agent_feed) {
        setAgentFeed(data.data.agent_feed);
      }
      setAbTestState('simulating');
    } catch (e) {
      console.error(e);
      setAbTestState('error');
    }
  };

  const resultData = results?.data;
  const activePlatform = PLATFORMS.find(p => p.id === platform)!;
  const activeVariant = resultData?.scored_variants?.find(v => v.variant_id === selectedVariantId) || resultData?.scored_variants?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left Panel: Input ── */}
      <section className="col-span-1 bg-neutral-900 border border-white/5 rounded-[2rem] p-6 shadow-xl space-y-5 h-fit">
        <h2 className="text-xl font-semibold text-white">Product Input</h2>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Select Platform</p>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id} onClick={() => setPlatform(p.id)} title={p.label}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${platform === p.id
                  ? `bg-white text-black border-transparent shadow-lg scale-[1.02]`
                  : 'bg-[#0f0f0f] border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
                  }`}
              >
                <span className="hidden sm:block truncate w-full text-center">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Product Images</p>
          <div
            onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            className="group cursor-pointer rounded-xl border-2 border-dashed border-white/10 bg-[#0f0f0f] hover:border-white/20 transition-all p-4 text-center"
          >
            {imagePreviews.length === 0 && !existingImageUrl ? (
              <div className="py-4 flex flex-col items-center gap-2 text-neutral-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                <p className="text-sm font-medium text-neutral-400">Drop images or click</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {existingImageUrl && (
                    <div className="relative group/img aspect-square">
                      <img src={existingImageUrl} alt="existing" className="w-full h-full object-cover rounded-lg" />
                      <button onClick={e => { e.stopPropagation(); setExistingImageUrl(null); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity">×</button>
                    </div>
                  )}
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group/img aspect-square">
                      <img src={src} alt="preview" className="w-full h-full object-cover rounded-lg" />
                      <button onClick={e => { e.stopPropagation(); removeImage(i); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && addImages(Array.from(e.target.files))} />
        </div>

        <div className="relative">
          <textarea
            value={rawInput} onChange={e => setRawInput(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#0f0f0f] border border-white/5 text-white resize-none h-32 text-sm focus:border-white/20 outline-none transition-colors"
            placeholder={`Describe your product for ${activePlatform.label}...`}
          />
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs">{error}</div>}

        <button
          onClick={handleGenerate} disabled={pipelineStatus.loading || !rawInput.trim()}
          className="w-full py-3 bg-white text-black font-medium rounded-full disabled:opacity-50 transition-opacity flex justify-center items-center gap-2"
        >
          {pipelineStatus.loading ? 'Agents Working...' : `Generate & Optimize`}
        </button>
      </section>

      {/* ── Right Panel ── */}
      <section className="col-span-1 lg:col-span-2 space-y-5">
        {pipelineStatus.step > 0 && (
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 shadow-xl">
            <PipelineVisualizer status={pipelineStatus} />
          </div>
        )}

        {resultData ? (
          <div className="space-y-5">
            
            {/* Existing Privacy & Vision */}
            {resultData.sanitized_input && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                  <h3 className="font-semibold text-white">Privacy Agent</h3>
                </div>
                <p className="text-neutral-300 text-sm bg-[#0f0f0f] rounded-xl p-4 font-mono border border-white/5">{resultData.sanitized_input}</p>
              </div>
            )}

            {resultData.vision_analysis && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                  <h3 className="font-semibold text-white">Vision Agent</h3>
                </div>
                <p className="text-neutral-300 text-sm bg-[#0f0f0f] rounded-xl p-4 border border-white/5 leading-relaxed">{resultData.vision_analysis}</p>
              </div>
            )}

            {/* ── COPE Decision & Variants ── */}
            {resultData.decision && resultData.scored_variants && (
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-[2rem] p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-blue-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-full border border-blue-500/50">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">COPE Decision Engine</h3>
                      <p className="text-blue-300 text-sm">{resultData.decision.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {resultData.scored_variants.map((variant, idx) => {
                    const isSelected = selectedVariantId ? selectedVariantId === variant.variant_id : idx === 0;
                    return (
                    <div 
                      key={variant.variant_id} 
                      onClick={() => setSelectedVariantId(variant.variant_id)}
                      className={`bg-[#0f0f0f] border rounded-xl p-5 relative cursor-pointer transition-all duration-300 ${
                        isSelected 
                        ? 'border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.3)] scale-105 z-10' 
                        : 'border-white/5 hover:border-white/20 hover:scale-[1.02]'
                      }`}
                    >
                      {idx === 0 && <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg">Champion</span>}
                      {isSelected && idx !== 0 && <span className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg">Selected</span>}
                      
                      <div className="flex justify-between items-center mb-4">
                        <h4 className={`font-medium ${isSelected ? 'text-blue-400' : 'text-white'}`}>Variant {String.fromCharCode(65 + idx)}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400">Score:</span>
                          <span className={`font-bold ${isSelected ? 'text-blue-400' : 'text-white'}`}>{variant.cope_scores?.overall_score}/100</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-neutral-500 uppercase">Est. Conv. Prob</p>
                          <p className={`text-lg font-bold ${isSelected ? 'text-blue-400' : 'text-white'}`}>{variant.cope_scores?.purchase_probability}%</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-neutral-500 uppercase">Expected CTR</p>
                          <p className={`text-lg font-bold ${isSelected ? 'text-blue-400' : 'text-white'}`}>{variant.cope_scores?.expected_ctr}%</p>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>

                {activeVariant && (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5 shadow-inner mt-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      Variant {String.fromCharCode(65 + (resultData.scored_variants.findIndex(v => v.variant_id === activeVariant.variant_id) !== -1 ? resultData.scored_variants.findIndex(v => v.variant_id === activeVariant.variant_id) : 0))} Description
                    </h4>
                    <div className="text-sm text-neutral-300 border-l-2 border-blue-500/50 pl-4 leading-relaxed whitespace-pre-wrap">
                      {activeVariant.marketing.platform_description}
                    </div>
                  </div>
                )}

                {/* Action Buttons (Always available so users can force tests) */}
                <>
                  <div className="flex items-center gap-4 mt-6 mb-2">
                    <div className="flex-1 border-t border-white/5"></div>
                    <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Simulation Override</span>
                    <div className="flex-1 border-t border-white/5"></div>
                  </div>
                  {abTestState === 'idle' ? (
                    <button onClick={startAbTest} className="w-full py-3 bg-[#0f0f0f] border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 text-blue-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      {resultData.decision.action === 'ab_test' ? 'Start Autonomous A/B Test' : 'Force Synthetic A/B Test'}
                    </button>
                  ) : abTestState === 'starting' ? (
                     <button disabled className="w-full py-3 bg-neutral-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 opacity-70">
                      Running Synthetic AI Simulation...
                    </button>
                  ) : (
                    <button onClick={runLiveReview} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.4)] animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> Live Review
                    </button>
                  )}
                </>
              </div>
            )}

            {/* SEO Optimized Output */}
            {resultData.seo && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>
                  <h3 className="font-semibold text-white">SEO Optimized Output</h3>
                </div>
                {resultData.seo.title && <div><p className="text-xs text-neutral-500 uppercase mb-1">Title</p><p className="text-xl font-bold text-white">{resultData.seo.title}</p></div>}
                {resultData.seo.keywords && <div className="flex flex-wrap gap-2">{resultData.seo.keywords.map((kw: string) => <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-neutral-300 border border-white/5">#{kw}</span>)}</div>}
              </div>
            )}

            {/* Competitor Intelligence (RAG) */}
            {resultData.competitor_analysis && !resultData.competitor_analysis.error && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0055] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
                <div className="flex items-center gap-2 relative z-10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  <h3 className="font-semibold text-white">Competitor Intelligence (RAG)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-[#0f0f0f] rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-neutral-500 uppercase mb-1">Recommended Price</p>
                    <p className="text-2xl font-bold text-green-400">₹{resultData.competitor_analysis.recommended_price || 'N/A'}</p>
                  </div>
                  <div className="bg-[#0f0f0f] rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-neutral-500 uppercase mb-1">Market Positioning</p>
                    <p className="text-sm text-neutral-300 line-clamp-2">{resultData.competitor_analysis.market_positioning}</p>
                  </div>
                </div>
                {resultData.competitor_analysis.pricing_strategy && (
                  <div className="bg-[#0f0f0f] rounded-xl p-4 border border-white/5 relative z-10">
                    <p className="text-xs text-neutral-500 uppercase mb-1">Pricing Strategy</p>
                    <p className="text-sm text-neutral-300">{resultData.competitor_analysis.pricing_strategy}</p>
                  </div>
                )}
                {resultData.competitor_analysis.competitor_insights && resultData.competitor_analysis.competitor_insights.length > 0 && (
                  <div className="relative z-10">
                    <p className="text-xs text-neutral-500 uppercase mb-2">Market Insights</p>
                    <ul className="space-y-2">
                      {resultData.competitor_analysis.competitor_insights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex gap-2 text-sm text-neutral-300"><span className="text-neutral-500">•</span> {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Quality Scores */}
            {resultData.scores && !resultData.scores.error && (
               <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg space-y-4">
                 <div className="flex items-center gap-2">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                   <h3 className="font-semibold text-white">Quality Score</h3>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="flex flex-col items-center">
                     <div className="text-3xl font-bold text-white">{resultData.scores.overall_score}<span className="text-sm text-neutral-500 font-normal">/100</span></div>
                     <p className="text-xs text-neutral-500 uppercase mt-1">Overall</p>
                   </div>
                   <div className="h-10 w-px bg-white/10"></div>
                   <div className="flex flex-col items-center">
                     <div className="text-xl font-bold text-neutral-300">{resultData.scores.seo_score}<span className="text-xs text-neutral-600 font-normal">/100</span></div>
                     <p className="text-xs text-neutral-500 uppercase mt-1">SEO</p>
                   </div>
                   <div className="h-10 w-px bg-white/10"></div>
                   <div className="flex flex-col items-center">
                     <div className="text-xl font-bold text-neutral-300">{resultData.scores.marketing_score}<span className="text-xs text-neutral-600 font-normal">/100</span></div>
                     <p className="text-xs text-neutral-500 uppercase mt-1">Marketing</p>
                   </div>
                 </div>
                 {resultData.scores.feedback && <p className="text-sm text-neutral-400 bg-[#0f0f0f] rounded-xl p-3 border border-white/5">{resultData.scores.feedback}</p>}
               </div>
            )}

            {/* Publish Section for Selected Variant */}
            {(platform === 'shopify' || platform === 'woocommerce') && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activePlatform.emoji}</span>
                  <h3 className="font-semibold text-white">Publish to {activePlatform.label}</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><label className="text-xs text-neutral-500 uppercase mb-1 block">Regular Price</label><input value={publishPrice} onChange={e => setPublishPrice(e.target.value)} className="w-full p-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-white text-sm outline-none focus:border-white/20 transition-colors" /></div>
                  <div><label className="text-xs text-neutral-500 uppercase mb-1 block">Sale Price</label><input value={publishSalePrice} onChange={e => setPublishSalePrice(e.target.value)} placeholder="Optional" className="w-full p-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-white text-sm outline-none focus:border-white/20 transition-colors" /></div>
                  <div><label className="text-xs text-neutral-500 uppercase mb-1 block">Units</label><input type="number" value={publishQuantity} onChange={e => setPublishQuantity(e.target.value ? parseInt(e.target.value) : '')} className="w-full p-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-white text-sm outline-none focus:border-white/20 transition-colors" /></div>
                </div>
                {publishResult ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-white font-semibold text-sm">Published!</p><a href={publishResult.admin_url} target="_blank" rel="noreferrer" className="text-xs text-neutral-400 underline mt-2 block">View in {activePlatform.label} →</a></div>
                ) : (
                  <button onClick={async () => {
                    setPublishError(null); setPublishState('uploading');
                    try {
                      let imageUrls: string[] = [];
                      if (existingImageUrl) imageUrls.push(existingImageUrl);
                      if (imageFiles.length > 0) {
                        const fd = new FormData(); imageFiles.forEach(f => fd.append('images', f));
                        const r = await fetch(`${API}/api/upload-images`, { method: 'POST', body: fd });
                        if (!r.ok) throw new Error('Image upload failed');
                        imageUrls = [...imageUrls, ...(await r.json()).image_urls];
                      }
                      setPublishState('publishing');
                      
                      const payload = {
                        platform: platform,
                        title: resultData.seo?.title ? String(resultData.seo.title) : 'New Product',
                        description: activeVariant?.marketing?.platform_description ? String(activeVariant.marketing.platform_description) : '',
                        tags: Array.isArray(resultData.seo?.keywords) ? resultData.seo.keywords : (typeof resultData.seo?.keywords === 'string' ? (resultData.seo.keywords as any).split(',').map((k: string) => k.trim()) : []),
                        price: publishPrice ? String(publishPrice).replace(/[^0-9.]/g, '') || '0.00' : '0.00',
                        sale_price: publishSalePrice ? String(publishSalePrice).replace(/[^0-9.]/g, '') || null : null,
                        image_urls: Array.isArray(imageUrls) ? imageUrls : [],
                        vendor: publishVendor ? String(publishVendor) : 'Verion AI',
                        quantity: typeof publishQuantity === 'number' && !isNaN(publishQuantity) ? publishQuantity : undefined,
                        color: resultData.seo?.color || null,
                        condition: resultData.seo?.condition || null,
                        weight: resultData.seo?.weight || null,
                        brand: resultData.seo?.brand || null,
                        material: resultData.seo?.material || null,
                        dimensions: resultData.seo?.dimensions || null,
                        category: resultData.seo?.category || null,
                        product_type: resultData.seo?.product_type || "",
                        specs: resultData.seo?.specs || null
                      };
                      const r = await fetch(`${API}/api/publish`, {
                        method: 'POST', 
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(payload)
                      });
                      if (!r.ok) { const d = await r.json(); throw new Error(d.detail); }
                      setPublishResult((await r.json()).result); setPublishState('success');
                    } catch (e: any) { setPublishError(e.message); setPublishState('idle'); }
                  }} disabled={publishState !== 'idle'} className={`w-full py-3 text-white font-medium rounded-full disabled:opacity-50 transition-opacity bg-gradient-to-r ${activePlatform.color}`}>
                    {publishState === 'uploading' ? 'Uploading Images...' : publishState === 'publishing' ? 'Publishing...' : `Publish Selected Variant to ${activePlatform.label}`}
                  </button>
                )}
                {publishError && <p className="text-red-400 text-xs mt-2">{publishError}</p>}
              </div>
            )}
          </div>
        ) : pipelineStatus.step === 0 && (
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[300px] shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            </div>
            <div><p className="text-white font-medium">Pipeline Ready</p><p className="text-neutral-500 text-sm mt-1">Select a platform and add details on the left.</p></div>
          </div>
        )}
      </section>

      {/* COPE Simulation Modal Overlay */}
      {abTestState === 'simulating' && resultData && resultData.scored_variants && (
        <CopeSimulationModal
          variants={resultData.scored_variants}
          winningVariantId={resultData.decision?.recommended_variant_id || resultData.scored_variants[0].variant_id}
          onClose={() => setAbTestState('success')}
          agentFeed={agentFeed}
        />
      )}
    </div>
  );
}
