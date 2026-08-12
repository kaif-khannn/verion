import { useState, useEffect } from 'react';

interface Variant {
  variant_id: string;
  seo?: { title?: string };
}

interface CopeSimulationModalProps {
  variants: Variant[];
  winningVariantId: string;
  onClose: () => void;
  onRetest?: () => void;
  onSimulationComplete?: (winningVariantId: string) => void;
  agentFeed?: any[];
}

export default function CopeSimulationModal({ variants, winningVariantId, onClose, onRetest, onSimulationComplete, agentFeed = [] }: CopeSimulationModalProps) {
  const [phase, setPhase] = useState<'running' | 'finished'>('running');
  const [visibleAgents, setVisibleAgents] = useState<any[]>([]);
  
  // Track dynamically for all variants
  const [conversionRates, setConversionRates] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const initialRates: Record<string, number> = {};
    variants.forEach(v => initialRates[v.variant_id] = 1.2);
    setConversionRates(initialRates);
  }, [variants]);

  // Whenever new agentFeed arrives (e.g. after retest), reset animation state
  useEffect(() => {
    setPhase('running');
    setVisibleAgents([]);
  }, [agentFeed]);

  // Determine the true winner by counting votes from agent feed
  const voteCounts: Record<string, number> = {};
  variants.forEach(v => voteCounts[v.variant_id] = 0);
  
  agentFeed.forEach(a => {
    if (a?.chosen_variant_id && voteCounts[a.chosen_variant_id] !== undefined) {
      voteCounts[a.chosen_variant_id]++;
    }
  });

  // Find the variant with the maximum votes
  let actualWinnerId = winningVariantId;
  if (agentFeed.length > 0) {
    let maxVotes = -1;
    for (const [vId, votes] of Object.entries(voteCounts)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        actualWinnerId = vId;
      }
    }
  }

  useEffect(() => {
    if (phase === 'finished' && onSimulationComplete) {
      onSimulationComplete(actualWinnerId);
    }
  }, [phase, actualWinnerId, onSimulationComplete]);

  useEffect(() => {
    if (phase !== 'running') return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < agentFeed.length) {
        setVisibleAgents(prev => [...prev, agentFeed[currentIndex]]);
        
        // Update scores based on votes so far (Base of 3, +1 per vote, max 10)
        const newRates = { ...conversionRates };
        variants.forEach(v => {
           const votesSoFar = agentFeed.slice(0, currentIndex + 1).filter(a => a?.chosen_variant_id === v.variant_id).length;
           newRates[v.variant_id] = Math.min(10, 3 + votesSoFar);
        });
        
        setConversionRates(newRates);
        currentIndex++;
      } else {
        setPhase('finished');
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [phase, agentFeed, variants]);

  // Calculate simulated lift (Winner vs average of losers)
  let lift = 0;
  if (phase === 'finished') {
    const winnerConv = conversionRates[actualWinnerId] || 3;
    const loserConvs = variants.filter(v => v.variant_id !== actualWinnerId).map(v => conversionRates[v.variant_id] || 3);
    const avgLoserConv = loserConvs.length > 0 ? loserConvs.reduce((a,b) => a+b, 0) / loserConvs.length : 3;
    lift = ((winnerConv - avgLoserConv) / (avgLoserConv || 1)) * 100;
  }

  const gridColsClass = variants.length === 2 ? 'grid-cols-2' : variants.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={phase === 'finished' ? onClose : undefined}></div>
      
      <div className="relative w-full max-w-6xl bg-neutral-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${phase === 'running' ? 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`}></div>
            <h2 className="text-xl font-semibold text-white">
              {phase === 'running' ? 'Synthetic AI Multivariate Simulation Running...' : 'Test Concluded: Winner Declared'}
            </h2>
          </div>
          {phase === 'finished' && (
            <div className="flex items-center gap-3">
              {onRetest && (
                <button
                  onClick={onRetest}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5 border border-white/10"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  <span>Retest</span>
                </button>
              )}
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative h-[650px] overflow-y-auto">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full"></div>

          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 text-center shadow-lg">
                <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">AI Personas Evaluated</p>
                <p className="text-4xl font-bold text-white font-mono">{visibleAgents.length} / {agentFeed.length}</p>
              </div>
              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 text-center shadow-lg">
                <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">Status</p>
                <p className="text-xl font-medium text-blue-400 mt-2">
                  {phase === 'running' ? 'Analyzing Psychology...' : 'Statistically Significant'}
                </p>
              </div>
            </div>

            {/* Variants */}
            <div className={`grid ${gridColsClass} gap-6 relative z-10`}>
              {variants.map((variant, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isWin = variant.variant_id === actualWinnerId;
                const convRate = conversionRates[variant.variant_id] || 3;

                return (
                  <div key={variant.variant_id} className={`border rounded-2xl p-6 transition-all duration-500 relative ${phase === 'finished' ? (isWin ? 'border-green-500/50 bg-green-500/5 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.2)] z-20' : 'border-white/5 bg-black/50 opacity-50 scale-95 z-10') : 'border-white/10 bg-[#0f0f0f]'}`}>
                    {phase === 'finished' && isWin && (
                      <div className="absolute -top-3 right-4 z-30">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-400 bg-green-950 border border-green-500/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-green-500/20">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          Winner
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 bg-white/5 px-3 py-1 rounded-full">Variant {label}</span>
                    </div>
                    <h3 className="text-lg text-white font-medium mb-6 line-clamp-3" title={variant.seo?.title}>{variant.seo?.title || 'Generated Copy'}</h3>
                    
                    <div className="space-y-4">
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-sm text-neutral-500 mb-1">Simulated Score</p>
                        <p className={`text-3xl font-bold font-mono ${phase === 'finished' && isWin ? 'text-green-400' : 'text-white'}`}>
                          {convRate}<span className="text-xl text-neutral-500 font-sans">/10</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Result Banner */}
            {phase === 'finished' && (
              <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-700 relative z-10">
                <div>
                  <h3 className="text-green-400 font-bold text-xl mb-1">Multivariate Optimization Successful</h3>
                  <p className="text-green-400/80">
                    The synthetic AI test is complete. Routing 100% of future traffic to the winning variant.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-green-400/70 uppercase tracking-widest mb-1">Simulated Lift</p>
                  <p className="text-3xl font-bold text-green-400">+{lift.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Agent Feed */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col lg:sticky lg:top-0 h-[586px] relative z-10">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><path d="M12 2v20M2 12h20"/></svg>
              Live Agent Feed
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {visibleAgents.map((agent, idx) => {
                const variantIndex = variants.findIndex(v => v.variant_id === agent?.chosen_variant_id);
                const label = variantIndex >= 0 ? String.fromCharCode(65 + variantIndex) : '?';
                
                return (
                  <div key={idx} className="bg-neutral-900 border border-white/10 rounded-xl p-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-widest bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {agent?.persona_name || 'Unknown Persona'}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-500/20 text-indigo-400">
                        Chose Variant {label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 italic">"{agent?.reasoning || 'No reasoning provided.'}"</p>
                  </div>
                );
              })}
              {phase === 'running' && visibleAgents.length < agentFeed.length && (
                <div className="flex items-center gap-2 text-sm text-neutral-500 p-4">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                  AI Persona evaluating...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
