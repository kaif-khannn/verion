import React, { useState, useRef, useCallback, useEffect } from 'react';
import PipelineVisualizer from '../PipelineVisualizer';

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

interface ResultData {
  sanitized_input?: string; vision_analysis?: string;
  seo?: SeoData; marketing?: MarketingData;
}

interface ApiResult { status: string; data: ResultData; }

type PublishState = 'idle' | 'uploading' | 'publishing' | 'success' | 'error';

const PLATFORMS = [
  { id: 'shopify', label: 'Shopify', emoji: '🛍️', color: 'from-neutral-700 to-neutral-900' },
  { id: 'amazon', label: 'Amazon', emoji: '📦', color: 'from-neutral-700 to-neutral-900' },
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: 'from-neutral-700 to-neutral-900' },
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

export default function GenerateTab({ initialInput = '' }: { initialInput?: string }) {
  const [rawInput, setRawInput] = useState(initialInput);
  const [platform, setPlatform] = useState('shopify');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState({ step: 0, loading: false });
  const [results, setResults] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialInput) setRawInput(initialInput);
  }, [initialInput]);

  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [publishResult, setPublishResult] = useState<{ admin_url?: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishVendor, setPublishVendor] = useState('Verion AI');
  const [publishPrice, setPublishPrice] = useState('0.00');
  const [publishQuantity, setPublishQuantity] = useState<number | ''>(1);

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
    try {
      const formData = new FormData();
      formData.append('raw_description', rawInput);
      formData.append('platform', platform);
      imageFiles.forEach(f => formData.append('images', f));
      const response = await fetch(`${API}/api/generate`, { method: 'POST', body: formData });
      const data = await response.json();
      setPipelineStatus({ step: 6, loading: false });
      setResults(data);
      if (data.data?.seo?.price) setPublishPrice(data.data.seo.price);
    } catch {
      setError('Failed to connect to backend.');
      setPipelineStatus({ step: 0, loading: false });
    }
  };

  const resultData = results?.data;
  const activePlatform = PLATFORMS.find(p => p.id === platform)!;

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
            {imagePreviews.length === 0 ? (
              <div className="py-4 flex flex-col items-center gap-2 text-neutral-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                <p className="text-sm font-medium text-neutral-400">Drop images or click</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 mb-3">
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
          {pipelineStatus.loading ? 'Agents Working...' : `Generate`}
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
            {resultData.sanitized_input && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                  <h3 className="font-semibold text-white">Privacy Agent</h3>
                </div>
                <p className="text-neutral-300 text-sm bg-[#0f0f0f] rounded-xl p-4 font-mono border border-white/5">{resultData.sanitized_input}</p>
              </div>
            )}

            {resultData.seo && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>
                  <h3 className="font-semibold text-white">SEO Optimized Output</h3>
                </div>
                {resultData.seo.title && <div><p className="text-xs text-neutral-500 uppercase">Title</p><p className="text-xl font-bold text-white">{resultData.seo.title}</p></div>}
                {resultData.seo.keywords && <div className="flex flex-wrap gap-2">{resultData.seo.keywords.map(kw => <span key={kw} className="text-xs px-2 py-1 rounded-full bg-white/10 text-neutral-300 border border-white/5">#{kw}</span>)}</div>}
              </div>
            )}

            {resultData.marketing && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
                  <h3 className="font-semibold text-white">Marketing Copy</h3>
                </div>
                {resultData.marketing.platform_description && (
                  <div className="relative group"><div className="bg-[#0f0f0f] rounded-xl p-4 text-sm text-neutral-300 whitespace-pre-wrap border border-white/5">{resultData.marketing.platform_description}</div><CopyButton text={resultData.marketing.platform_description} /></div>
                )}
              </div>
            )}

            {/* Publish Section */}
            {platform === 'shopify' && (
              <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2"><span className="text-lg"></span><h3 className="font-semibold text-white">Publish to Shopify</h3></div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div><label className="text-xs text-neutral-500 uppercase mb-1 block">Price</label><input value={publishPrice} onChange={e => setPublishPrice(e.target.value)} className="w-full p-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-white text-sm outline-none focus:border-white/20 transition-colors" /></div>
                  <div><label className="text-xs text-neutral-500 uppercase mb-1 block">Units</label><input type="number" value={publishQuantity} onChange={e => setPublishQuantity(e.target.value ? parseInt(e.target.value) : '')} className="w-full p-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-white text-sm outline-none focus:border-white/20 transition-colors" /></div>
                </div>
                {publishResult ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4"><p className="text-white font-semibold text-sm">Published!</p><a href={publishResult.admin_url} target="_blank" rel="noreferrer" className="text-xs text-neutral-400 underline mt-2 block">View in Shopify →</a></div>
                ) : (
                  <button onClick={async () => {
                    setPublishError(null); setPublishState('uploading');
                    try {
                      let imageUrls: string[] = [];
                      if (imageFiles.length > 0) {
                        const fd = new FormData(); imageFiles.forEach(f => fd.append('images', f));
                        const r = await fetch(`${API}/api/upload-images`, { method: 'POST', body: fd });
                        if (!r.ok) throw new Error('Image upload failed');
                        imageUrls = (await r.json()).image_urls;
                      }
                      setPublishState('publishing');
                      const r = await fetch(`${API}/api/publish`, {
                        method: 'POST', 
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                          platform: 'shopify', title: resultData.seo?.title || 'New Product', description: resultData.marketing?.platform_description || '',
                          tags: resultData.seo?.keywords || [], price: publishPrice || '0.00', image_urls: imageUrls, vendor: publishVendor, quantity: publishQuantity !== '' ? publishQuantity : undefined
                        })
                      });
                      if (!r.ok) { const d = await r.json(); throw new Error(d.detail); }
                      setPublishResult((await r.json()).result); setPublishState('success');
                    } catch (e: any) { setPublishError(e.message); setPublishState('idle'); }
                  }} disabled={publishState !== 'idle'} className="w-full py-3 bg-white text-black font-medium rounded-full disabled:opacity-50 transition-opacity">
                    {publishState === 'uploading' ? 'Uploading Images...' : publishState === 'publishing' ? 'Publishing...' : 'Publish to Shopify'}
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
    </div>
  );
}
