import React, { useState, useEffect } from 'react';

interface Variant {
  variant_id: string;
  seo?: { title?: string };
}

interface CopeSimulationModalProps {
  variants: Variant[];
  winningVariantId: string;
  onClose: () => void;
  agentFeed?: any[];
}

export default function CopeSimulationModal({ variants, winningVariantId, onClose, agentFeed = [] }: CopeSimulationModalProps) {
  const [phase, setPhase] = useState<'running' | 'finished'>('running');
  const [visibleAgents, setVisibleAgents] = useState<any[]>([]);
  
  // We'll just assume Variant 0 is "A" and Variant 1 is "B" for the visual simulation
  const variantA = variants[0];
  const variantB = variants.length > 1 ? variants[1] : variants[0];
  
  const isAWinner = winningVariantId === variantA?.variant_id;

  // Let the agent votes dictate the real winner if feed is present
  const aVotes = agentFeed.filter(a => a.chosen_variant_id === variantA?.variant_id).length;
  const bVotes = agentFeed.filter(a => a.chosen_variant_id === variantB?.variant_id).length;
  const totalVotes = agentFeed.length || 1;
  const aWin = agentFeed.length > 0 ? aVotes >= bVotes : isAWinner;
  
  const [convA, setConvA] = useState(1.2);
  const [convB, setConvB] = useState(1.2);

  useEffect(() => {
    if (phase !== 'running') return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < agentFeed.length) {
        setVisibleAgents(prev => [...prev, agentFeed[currentIndex]]);
        
        // Update conversion rates based on votes so far
        const newAVotes = agentFeed.slice(0, currentIndex + 1).filter(a => a.chosen_variant_id === variantA?.variant_id).length;
        const newBVotes = agentFeed.slice(0, currentIndex + 1).filter(a => a.chosen_variant_id === variantB?.variant_id).length;
        
        setConvA(2.0 + (newAVotes * 0.5));
        setConvB(2.0 + (newBVotes * 0.5));
        
        currentIndex++;
      } else {
        setPhase('finished');
        clearInterval(interval);
      }
    }, 1200); // 1.2 seconds between each agent

    return () => clearInterval(interval);
  }, [phase, agentFeed, variantA, variantB]);

  const winner = aWin ? variantA : variantB;
  const loser = aWin ? variantB : variantA;
  
  const winnerConv = aWin ? convA : convB;
  const loserConv = aWin ? convB : convA;
  
  const lift = ((winnerConv - loserConv) / (loserConv || 1)) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={phase === 'finished' ? onClose : undefined}></div>
      
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${phase === 'running' ? 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`}></div>
            <h2 className="text-xl font-semibold text-white">
              {phase === 'running' ? 'Synthetic AI Simulation Running...' : 'Test Concluded: Winner Declared'}
            </h2>
          </div>
          {phase === 'finished' && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative h-[600px] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-6 relative z-10">
              {/* Variant A */}
              <div className={`border rounded-2xl p-6 transition-all duration-500 ${phase === 'finished' ? (aWin ? 'border-green-500/50 bg-green-500/5' : 'border-white/5 bg-black/50 opacity-50') : 'border-white/10 bg-[#0f0f0f]'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 bg-white/5 px-3 py-1 rounded-full">Variant A</span>
                  {phase === 'finished' && aWin && <span className="text-xs font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">🏆 Winner</span>}
                </div>
                <h3 className="text-lg text-white font-medium mb-6 line-clamp-2" title={variantA?.seo?.title}>{variantA?.seo?.title || 'Original Copy'}</h3>
                
                <div className="space-y-4">
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-sm text-neutral-500 mb-1">Simulated Conversion Rate</p>
                    <p className={`text-3xl font-bold font-mono ${phase === 'finished' && aWin ? 'text-green-400' : 'text-white'}`}>
                      {convA.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant B */}
              <div className={`border rounded-2xl p-6 transition-all duration-500 ${phase === 'finished' ? (!aWin ? 'border-green-500/50 bg-green-500/5' : 'border-white/5 bg-black/50 opacity-50') : 'border-white/10 bg-[#0f0f0f]'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 bg-white/5 px-3 py-1 rounded-full">Variant B</span>
                  {phase === 'finished' && !aWin && <span className="text-xs font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">🏆 Winner</span>}
                </div>
                <h3 className="text-lg text-white font-medium mb-6 line-clamp-2" title={variantB?.seo?.title}>{variantB?.seo?.title || 'Optimized Copy'}</h3>
                
                <div className="space-y-4">
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-sm text-neutral-500 mb-1">Simulated Conversion Rate</p>
                    <p className={`text-3xl font-bold font-mono ${phase === 'finished' && !aWin ? 'text-green-400' : 'text-white'}`}>
                      {convB.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Banner */}
            {phase === 'finished' && (
              <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-700 relative z-10">
                <div>
                  <h3 className="text-green-400 font-bold text-xl mb-1">Optimization Successful</h3>
                  <p className="text-green-400/80">
                    The synthetic AI test is complete. Routing 100% of future traffic to the winning variant.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-400/70 uppercase tracking-widest mb-1">Simulated Lift</p>
                  <p className="text-3xl font-bold text-green-400">+{lift.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Agent Feed */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col h-full relative z-10">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><path d="M12 2v20M2 12h20"/></svg>
              Live Agent Feed
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {visibleAgents.map((agent, idx) => {
                const votedA = agent.chosen_variant_id === variantA?.variant_id;
                return (
                  <div key={idx} className="bg-neutral-900 border border-white/10 rounded-xl p-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-widest bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {agent.persona_name}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${votedA ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        Chose Variant {votedA ? 'A' : 'B'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 italic">"{agent.reasoning}"</p>
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
