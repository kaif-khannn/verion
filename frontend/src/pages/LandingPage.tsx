import React from 'react';

interface LandingPageProps {
  onGetStarted: (mode: 'login' | 'signup') => void;
}

const agents = [
  {
    type: "hero",
    role: "The Mastermind", name: "Orchestrator", desc: "The central hub coordinating the entire multi-agent swarm pipeline. It dynamically routes tasks and monitors execution.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" /></svg>,
    className: "col-span-1 md:col-span-2 lg:col-span-2 md:row-span-1 lg:row-span-2 bg-gradient-to-br from-[#1a1a1a] to-black"
  },
  {
    type: "wide",
    role: "The Copywriter", name: "Marketing Agent", desc: "Crafts high-converting, psychologically targeted product descriptions.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-[#141414]"
  },
  {
    type: "square",
    role: "The Observer", name: "Vision Agent", desc: "Extracts semantic features from product images.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
    className: "col-span-1 row-span-1 bg-[#0f0f0f]"
  },
  {
    type: "square",
    role: "The Rival", name: "Competitor Agent", desc: "Analyzes competitor pricing and positioning.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 16h20M5 21v-4M19 21v-4M12 16V4M9 7h6" /></svg>,
    className: "col-span-1 row-span-1 bg-[#0f0f0f]"
  },
  {
    type: "wide",
    role: "The Critic", name: "Prediction Engine", desc: "Evaluates every variant using synthetic buyer personas before publishing.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-[#141414]"
  },
  {
    type: "wide",
    role: "The Data Scientist", name: "RAG Agent", desc: "Queries live vector databases for enriched contextual product data.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-[#141414]"
  },
  {
    type: "square",
    role: "The Forecaster", name: "Trend Agent", desc: "Monitors current market trends and demand.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    className: "col-span-1 row-span-1 bg-[#0f0f0f]"
  },
  {
    type: "square",
    role: "The Strategist", name: "SEO Agent", desc: "Injects optimal long-tail keywords for max visibility.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    className: "col-span-1 row-span-1 bg-[#0f0f0f]"
  },
  {
    type: "wide",
    role: "The Coordinator", name: "Decision Agent", desc: "Manages logic branches and resolves conflicting recommendations.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v18" /><path d="M18 9V3" /><path d="M18 21v-6" /><path d="M13 6h7" /><path d="M13 18h7" /><path d="M4 12h7" /><path d="m8 8-4 4 4 4" /></svg>,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-[#141414]"
  },
  {
    type: "square",
    role: "The Editor", name: "Quality Agent", desc: "Reviews content for brand consistency, tone, and grammar.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4c0-1.1.9-2 2-2" /><path d="M20 2c1.1 0 2 .9 2 2" /><path d="M22 8c0 1.1-.9 2-2 2" /><path d="M16 10c-1.1 0-2-.9-2-2" /><path d="m3 21 2-9" /><path d="M9 21v-5" /><path d="m15 21-2-9" /><path d="M9 4H4v5" /><path d="M12 16h8" /></svg>,
    className: "col-span-1 row-span-1 bg-[#0f0f0f]"
  },
  {
    type: "square",
    role: "The Guardian", name: "Privacy Agent", desc: "Ensures sensitive data is anonymized securely.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    className: "col-span-1 row-span-1 bg-[#0f0f0f]"
  },
  {
    type: "wide",
    role: "The Analyst", name: "Analytics Agent", desc: "Tracks performance metrics and post-publish engagement.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-[#141414]"
  },
];

const RevealOnScroll = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
};


export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-black overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-2000 rounded-b-[2rem] border-x border-b border-white/10 backdrop-blur-3xl mx-8">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black p-1 flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-medium text-xl tracking-tight text-neutral-500">Verion</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-neutral-500 uppercase tracking-wide">
            <a href="#" className="hover:text-neutral-900 transition-colors">Home</a>
            <a href="#about" className="hover:text-neutral-900 transition-colors">About Us</a>
            <a href="#faq" className="hover:text-neutral-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGetStarted('login')}
              className="text-sm font-medium bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 text-neutral-600 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => onGetStarted('signup')}
              className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-200 transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="pt-24 pb-10 px-4 md:px-8 space-y-6">

        {/* ── CARD 1: Hero Section ── */}
        <section className="relative w-full rounded-[3rem] bg-black  overflow-hidden pt-20 flex flex-col items-center shadow-2xl border border-white/5">


          <div className="relative z-10 text-center max-w-3xl mx-auto px-4 space-y-6 mb-16">
            <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-white">
              Verion
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 font-medium leading-relaxed max-w-lg mx-auto">
              Manage your e-commerce content automatically and scale your store seamlessly with Verion.
            </p>
          </div>

          <div className="relative z-10 w-[90%] max-w-5xl rounded-t-2xl bg-[#141414] shadow-2xl overflow-hidden translate-y-2 border-x border-t border-white/10">
            {/* Browser Header */}
            <div className="flex items-center px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
              <div className="flex gap-2 w-1/3">
                <div className="w-3 h-3 rounded-full bg-neutral-600" />
                <div className="w-3 h-3 rounded-full bg-neutral-600" />
                <div className="w-3 h-3 rounded-full bg-neutral-600" />
              </div>
              <div className="w-1/3 flex justify-center">
                <div className="bg-[#0f0f0f] text-neutral-500 text-xs px-20 py-1.5 rounded-md flex items-center gap-2">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  verion.com
                </div>
              </div>
            </div>
            {/* Links */}
            <div className="flex items-center justify-center gap-8 py-3 bg-[#141414] text-neutral-500 text-sm border-b border-white/5">
              <span className="text-white">New & Featured</span><span>Men</span><span>Women</span><span>Kids</span>
            </div>
            {/* Notification Bar */}
            <div className="bg-white text-black text-center py-2 text-xs font-bold tracking-wide">
              WHY WAIT? TRY AI CONTENT OPTIMIZATION <span className="font-normal opacity-60 ml-2">Generate perfect listings in seconds</span>
            </div>
            <div className="flex p-6 h-[400px] gap-6">
              <div className="w-2/3 flex gap-4">
                <div className="w-1/2 bg-[#0f0f0f] rounded-xl relative p-4 flex flex-col justify-between border border-white/5">
                  <div className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full inline-flex self-start gap-1 items-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    Highly rated
                  </div>
                  <div className="mt-auto bg-neutral-800/50 h-48 rounded-lg animate-pulse" />
                </div>
                <div className="w-1/2 bg-[#0f0f0f] rounded-xl p-4 flex flex-col justify-end border border-white/5">
                  <div className="bg-neutral-800/50 h-64 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="w-1/3 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-black font-bold">V</div>
                  <span className="text-white font-medium">Verion</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl text-white font-medium">10%</h3>
                  <p className="text-neutral-500 text-sm flex justify-between">SEO Score Increase</p>
                </div>
                <div className="bg-[#0f0f0f] p-4 rounded-xl flex gap-4 items-center border border-white/5">
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg animate-pulse" />
                  <div>
                    <p className="text-white text-sm font-medium">Optimized Title</p>
                    <p className="text-neutral-500 text-xs">Accessories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── CARD 2: Introduction ── */}
        <RevealOnScroll>
        <section id="about" className="bg-neutral-900 rounded-[3rem] p-12 md:p-24 border border-white/5 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
          <div className="md:w-1/2 z-10 flex flex-col justify-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
              <span className="text-white">Redefining e-commerce.</span><br />
              <span className="text-neutral-500">Autonomous Intelligence.</span>
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
              Verion wasn't built to be just another writing assistant. It was engineered from the ground up to completely replace the manual grind of managing an online store.
            </p>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
              Upload a single image and watch our specialized AI agents take over. They analyze trends, reverse-engineer pricing, and write psychological copy natively—so you can focus purely on scale.
            </p>
          </div>
          <div className="md:w-1/2 relative h-[500px] w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border border-white/10 shadow-2xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/[0.03] rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute top-[10%] left-[-10%] w-[250px] h-[250px] bg-white/[0.04] rounded-full blur-[60px] pointer-events-none"></div>

            {/* Multi-Agent Network Visualization */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                  50% { transform: translate(-50%, -50%) translateY(-10px); }
                }
                .animate-float-1 { animation: float 6s ease-in-out infinite; }
                .animate-float-2 { animation: float 7s ease-in-out infinite 2s; }
                .animate-float-3 { animation: float 8s ease-in-out infinite 4s; }
                
                @keyframes dash {
                  to { stroke-dashoffset: -24; }
                }
                .animate-dash { animation: dash 1.5s linear infinite; }
              `}</style>

              {/* Subtle Grid Background */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}></div>

              {/* Connecting Lines (SVG) */}
              <svg className="absolute w-full h-full inset-0 pointer-events-none opacity-60" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                {/* Central point is at 50% 50% */}
                <line x1="50%" y1="50%" x2="50%" y2="25%" stroke="url(#glow-grad)" strokeWidth="2" strokeDasharray="4 8" className="animate-dash" />
                <line x1="50%" y1="50%" x2="25%" y2="70%" stroke="url(#glow-grad)" strokeWidth="2" strokeDasharray="4 8" className="animate-dash" />
                <line x1="50%" y1="50%" x2="75%" y2="70%" stroke="url(#glow-grad)" strokeWidth="2" strokeDasharray="4 8" className="animate-dash" />
              </svg>

              {/* Central Hub: Orchestrator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="absolute inset-0 rounded-full bg-white/5 scale-[2.5] blur-xl animate-pulse pointer-events-none"></div>
                <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/30 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)] relative group cursor-pointer hover:border-white/50 transition-colors">
                  <div className="absolute inset-0 rounded-[2rem] border border-white/50 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none"></div>
                  <div className="absolute inset-0 rounded-[2rem] bg-white/20 animate-ping opacity-20"></div>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="mt-5 bg-white backdrop-blur-md px-5 py-2 rounded-full text-xs text-black font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.4)] relative z-10">
                  Orchestrator
                </div>
              </div>

              {/* Node 1: Vision Agent (Top) */}
              <div className="absolute top-[25%] left-1/2 animate-float-1 z-10 flex flex-col items-center group cursor-pointer">
                <div className="w-16 h-16 bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/10 transition-all shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white relative z-10"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-hover:text-white transition-colors bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Vision Agent</div>
              </div>

              {/* Node 2: SEO Agent (Bottom Left) */}
              <div className="absolute top-[70%] left-[25%] animate-float-2 z-10 flex flex-col items-center group cursor-pointer">
                <div className="w-16 h-16 bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/10 transition-all shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white relative z-10"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-2 6h-4c0-3-2-4-2-6a4 4 0 0 1 4-4Z" /><path d="M10 18h4" /><path d="M10 22h4" /></svg>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-hover:text-white transition-colors bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">SEO Agent</div>
              </div>

              {/* Node 3: Market Agent (Bottom Right) */}
              <div className="absolute top-[70%] left-[75%] animate-float-3 z-10 flex flex-col items-center group cursor-pointer">
                <div className="w-16 h-16 bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/10 transition-all shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white relative z-10"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold group-hover:text-white transition-colors bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Market Agent</div>
              </div>

            </div>
          </div>
        </section>
        </RevealOnScroll>

        {/* ── Agent Team Breakdown ── */}
        <RevealOnScroll>
        <section className="bg-black rounded-[3rem] p-8 md:p-16 lg:p-24 border border-white/5 relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-4">
              Meet your new <span className="text-neutral-500">Agent Team.</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Behind every product generation, a specialized swarm of AI agents collaborates autonomously. No micromanagement required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)] relative z-10 max-w-7xl mx-auto">
            {agents.map((agent, i) => {
              if (agent.type === 'hero') {
                return (
                  <div key={i} className={`p-8 rounded-[2rem] border border-white/10 group relative overflow-hidden flex flex-col justify-between hover:border-white/30 transition-colors duration-500 ${agent.className}`}>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700 pointer-events-none"></div>
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        {agent.icon}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">{agent.role}</div>
                      <h3 className="text-3xl lg:text-4xl text-white font-medium mb-4 leading-tight">{agent.name}</h3>
                    </div>
                    <p className="text-neutral-400 text-base leading-relaxed max-w-sm mt-4">{agent.desc}</p>
                  </div>
                );
              }

              if (agent.type === 'wide') {
                return (
                  <div key={i} className={`p-6 md:p-8 rounded-[2rem] border border-white/5 group relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 hover:border-white/20 transition-all duration-300 ${agent.className}`}>
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500">
                      {agent.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl text-white font-medium">{agent.name}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{agent.role}</span>
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed">{agent.desc}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className={`p-6 rounded-[2rem] border border-white/5 group relative overflow-hidden flex flex-col justify-center items-center text-center hover:border-white/20 transition-all duration-300 ${agent.className}`}>
                  <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-neutral-300 mb-4 group-hover:scale-110 group-hover:text-white transition-all duration-500">
                    {agent.icon}
                  </div>
                  <h3 className="text-lg text-white font-medium mb-2">{agent.name}</h3>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-3">{agent.role}</div>
                  <p className="text-neutral-500 text-xs leading-relaxed">{agent.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
        </RevealOnScroll>

        {/* ── CARD 3: Dark Section (Web Interface & How it works) ── */}
        <RevealOnScroll>
        <section className="bg-[#0f0f0f] rounded-[3rem] text-white overflow-hidden border border-white/5 relative">
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>

          <div className="px-8 md:px-24 pt-12 md:pt-24 pb-10 md:pb-12 flex flex-col md:flex-row items-center gap-12 border-b border-white/5">
            <div className="md:w-1/2 relative">
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-white/[0.03] rounded-[3rem] blur-[80px] scale-90 translate-y-10"></div>
              {/* Web Interface Mockup */}
              <div className="relative bg-[#0f0f0f] rounded-2xl border border-white/10 p-6 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                {/* Header */}
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    <div className="font-medium text-sm text-neutral-300">Agent Pipeline</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-4 bg-white/5 rounded-full"></div>
                    <div className="w-8 h-4 bg-white/10 rounded-full"></div>
                  </div>
                </div>

                {/* Pipeline Visualization */}
                <div className="relative mb-8 z-10">
                  <div className="flex justify-between items-center px-2">
                    {/* Node 1: Vision */}
                    <div className="w-12 h-12 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-white/5 rounded-xl animate-ping opacity-20"></div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    </div>

                    {/* Line */}
                    <div className="flex-1 h-px bg-white/10 mx-3 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>

                    {/* Node 2: Orchestrator */}
                    <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] relative">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>

                    {/* Line */}
                    <div className="flex-1 h-px bg-white/10 mx-3 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse delay-75"></div>
                    </div>

                    {/* Node 3: Export */}
                    <div className="w-12 h-12 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center relative">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                  </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                  <div className="bg-[#141414] rounded-lg p-3 border border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Vector Store</span>
                    <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse"></span>
                  </div>
                  <div className="bg-[#141414] rounded-lg p-3 border border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Active Agents</span>
                    <span className="text-white text-xs font-medium">8/8</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-[#141414] rounded-lg p-4 border border-white/5 relative z-10">
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-neutral-400 font-medium">COPE Simulation</span>
                    <span className="text-white font-mono">75%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-white w-3/4 rounded-full relative">
                      <div className="absolute inset-0 bg-white/50 blur-[2px] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
                <span className="text-white">Full visibility.</span><br />
                <span className="text-neutral-500">Agentic orchestration.</span>
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
                Experience complete transparency into the underlying multi-agent architecture. The sleek dashboard allows you to orchestrate RAG pipelines, monitor live competitor data vectors, and trace the logical reasoning of every synthetic A/B test before JSON payloads are pushed to Shopify.
              </p>
            </div>
          </div>

          {/* ── COPE Matrix Section (Neural Persona Engine) ── */}
          <div className="px-8 md:px-24 py-10 md:py-12 border-b border-white/5 relative bg-transparent">
            {/* Abstract Background Element */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.02] blur-[100px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="md:w-1/2 space-y-6">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
                  <span className="text-white">Neural Persona Engine</span><br />
                  <span className="text-neutral-500">Synthetic Simulation.</span>
                </h2>
                <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
                  Before publishing, our engine generates 8 unique psychological buyer profiles—ranging from "The Skeptic" to "The Impulse Buyer"—and pits them against your AI-generated variants in a simulated A/B test. The mathematically optimal variant is then automatically selected.
                </p>
              </div>

              <div className="md:w-1/2 w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 mr-1 gap-3 relative">
                <style>{`
                  @keyframes run-test {
                    0%, 80%, 100% { 
                      border-color: rgba(255,255,255,0.05); 
                      box-shadow: none; 
                      background-color: #1a1a1a; 
                      color: #a3a3a3; 
                    }
                    10%, 30% { 
                      border-color: rgba(255,255,255,0.6); 
                      box-shadow: 0 0 20px rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.05); 
                      background-color: rgba(255,255,255,0.1); 
                      color: #ffffff;
                    }
                  }
                  .animate-run-test {
                    animation: run-test 6s infinite;
                  }
                `}</style>

                {[
                  { name: 'Skeptic', delay: '0s' },
                  { name: 'Impulse', delay: '2.5s' },
                  { name: 'Loyalist', delay: '1.2s' },
                  { name: 'Bargain', delay: '4.8s' },
                  { name: 'Luxury', delay: '3.1s' },
                  { name: 'Researcher', delay: '0.6s' },
                  { name: 'Trend', delay: '5.4s' },
                  { name: 'Gifter', delay: '1.9s' },
                ].map((persona, i) => (
                  <div 
                    key={i} 
                    className="h-24 rounded-xl border flex flex-col items-center justify-center gap-2 bg-[#1a1a1a] text-neutral-400 border-white/5 relative overflow-hidden group transition-all animate-run-test cursor-default"
                    style={{ animationDelay: persona.delay }}
                  >
                    <div className="w-8 h-8 rounded-full bg-black/50 border border-white/5 flex items-center justify-center transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{persona.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 md:px-24 pt-10 md:pt-12 pb-12 md:pb-24 relative overflow-hidden">
            {/* Subtle horizontal lines */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <svg viewBox="0 0 1000 500" fill="none" className="w-[150%]">
                <path d="M0,250 C300,100 700,400 1000,250" stroke="white" strokeWidth="2.5" />
                <path d="M0,280 C350,130 650,430 1000,280" stroke="white" strokeWidth="1.25" />
              </svg>
            </div>

            <h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-16 relative z-10">
              How it works
            </h2>

            <div className="flex flex-col md:flex-row gap-8 relative z-10 items-end">
              <div className="w-full md:w-1/3 bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="text-neutral-400 text-sm font-bold mb-4 uppercase tracking-widest">Step 1</div>
                <div className="h-32 bg-[#0f0f0f] rounded-xl mb-4 p-4 border border-white/5">
                  <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                  </div>
                  <div className="h-2 w-2/3 bg-white/10 rounded mb-2"></div>
                  <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                </div>
                <p className="text-neutral-500 text-sm mt-2">Upload product images and seed data. Our Vision Agent extracts semantic features while the Orchestrator initializes the RAG context pipeline.</p>
              </div>

              <div className="w-full md:w-1/3 bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 transform translate-y-8 hover:translate-y-4 transition-transform z-10 shadow-2xl shadow-black/50">
                <div className="text-white text-sm font-bold mb-4 uppercase tracking-widest">Step 2</div>
                <div className="h-40 bg-[#0f0f0f] rounded-xl mb-4 p-4 border border-white/10">
                  <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-2 6h-4c0-3-2-4-2-6a4 4 0 0 1 4-4Z" /><path d="M10 18h4" /><path d="M10 22h4" /></svg>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded"></div>
                    <div className="h-2 w-full bg-white/10 rounded"></div>
                    <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                  </div>
                </div>
                <p className="text-white text-sm mt-2">A Swarm of Specialized AI Agents (SEO, Marketing, Competitor) query the RAG vector database to generate highly optimized, data-driven variants.</p>
              </div>

              <div className="w-full md:w-1/3 bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="text-neutral-400 text-sm font-bold mb-4 uppercase tracking-widest">Step 3</div>
                <div className="h-32 bg-[#0f0f0f] rounded-xl mb-4 p-4 flex flex-col items-center justify-center border border-white/5">
                  <button className="w-full mb-2 px-2 py-1 bg-white/10 text-white rounded-full font-medium text-sm border border-white/10">Publish to Shopify</button>
                  <button className="w-full mb-1 px-2 py-1 bg-white/10 text-white rounded-full font-medium text-sm border border-white/10">Publish to Amazon</button>
                </div>
                <p className="text-neutral-500 text-sm mt-2">The COPE Prediction Engine runs a synthetic A/B test using 8 distinct buyer personas to score variants. Push the winner to Shopify instantly.</p>
              </div>
            </div>
          </div>
        </section>
        </RevealOnScroll>

        {/* ── Integrations Marquee ── */}
        <RevealOnScroll>
        <section className="bg-[#0a0a0a] rounded-[3rem] py-12 md:py-16 border border-white/5 relative overflow-hidden flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-medium text-white mb-10 px-12 text-center">
            Seamlessly integrates with your stack.
          </h2>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 25s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="w-full relative overflow-hidden flex items-center before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-32 before:bg-gradient-to-r before:from-[#0a0a0a] before:to-transparent before:z-10 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-32 after:bg-gradient-to-l after:from-[#0a0a0a] after:to-transparent after:z-10">
            <div className="flex w-max animate-marquee opacity-60 hover:opacity-100 transition-opacity duration-500">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex gap-16 md:gap-24 px-8 md:px-12 items-center">
                  <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white hover:text-[#95BF47] transition-colors cursor-pointer">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" /><path d="M9 22V12h6v10" /><path d="M2 10.6L12 2l10 8.6" /></svg>
                    Shopify
                  </div>
                  <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white hover:text-[#96588a] transition-colors cursor-pointer">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                    WooCommerce
                  </div>
                  <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white hover:text-[#FF9900] transition-colors cursor-pointer">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                    Amazon
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </RevealOnScroll>


        {/* ── CARD 4: Testimonials ── */}
        <RevealOnScroll>
        <section className="bg-neutral-900 rounded-[3rem] p-12 md:p-24 border border-white/5 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[120px]"></div>

          <div className="flex justify-between items-end mb-16 relative z-10">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-white max-w-md leading-none">
              What <br /> users say
            </h2>
            <a href="#" className="text-neutral-500 hover:text-white font-medium flex items-center gap-2 border-b border-neutral-700 pb-1 transition-colors">
              All reviews <span>→</span>
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            {[
              { text: "The platform is really user-friendly and straightforward—just connect, and the agents automatically generate a product listing so you can start selling immediately!", name: "Willie Riggs", role: "Shopify Owner" },
              { text: "Verion AI makes it easy to recommend top-notch prices compared to competitors. The RAG intelligence is an absolute game-changer for my margins.", name: "Aliya Garrison", role: "E-commerce Manager" },
              { text: "Now I can perfectly anonymize dropshipping data while generating engaging marketing copy that benefits both my store and my customers.", name: "Aleksander Craig", role: "Dropshipper" }
            ].map((t, i) => (
              <div key={i} className="bg-neutral-800 p-8 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-neutral-500 font-medium">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed">"{t.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        </RevealOnScroll>



        {/* ── CARD 5: Final CTA ── */}
        <RevealOnScroll>
        <section className="bg-[#141414] p-12 md:p-24 border rounded-[3rem] border-white/5 relative overflow-hidden flex flex-col items-center backdrop-blur-3xl text-center">
          {/* Subtle radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px]"></div>

          <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-4 relative z-10">
            Join for Free now
          </h2>
          <p className="text-neutral-500 text-lg mb-8 relative z-10">
            Your first 100 generations are totally free.
          </p>
          <button
            onClick={() => onGetStarted('signup')}
            className="relative z-10 px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
          >
            Sign Up
          </button>

          {/* Bottom Mockup */}
          <div className="mt-20 relative z-10 w-full max-w-4xl bg-[#0f0f0f] rounded-t-3xl p-6 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12 border-x border-t border-white/10 items-center justify-between overflow-hidden">
            {/* Glow */}
            <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[80px]"></div>

            <div className="relative z-10 text-left md:w-1/2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-bold text-xs">V</div>
                <span className="font-medium text-white text-sm">Verion</span>
              </div>
              <h3 className="text-white text-3xl font-medium mb-4 leading-tight">A new way to <br /><span className="text-neutral-500">optimize products</span><br />and scale stores.</h3>
              <p className="text-neutral-600 text-sm mb-8">Connect your Shopify store and generate beautiful listings instantly.</p>
            </div>

            <div className="relative z-10 w-full md:w-auto bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 min-w-[280px]">
              <h4 className="text-white font-medium mb-1">Welcome!</h4>
              <p className="text-neutral-500 text-xs mb-6">Please sign in or create account.</p>
              <div className="flex gap-2 mb-6">
                <button className="flex-1 py-2 bg-[#222] rounded text-white text-xs hover:bg-[#2a2a2a] transition-colors border border-white/5">Google</button>
                <button className="flex-1 py-2 bg-[#222] rounded text-white text-xs hover:bg-[#2a2a2a] transition-colors border border-white/5">Apple</button>
              </div>
              <input type="text" placeholder="Enter your email" className="w-full bg-[#0f0f0f] border border-white/10 rounded p-3 text-xs text-white mb-3 outline-none focus:border-white/20 transition-colors" />
              <button onClick={() => onGetStarted('signup')} className="w-full py-3 bg-white text-black text-xs rounded font-medium hover:bg-neutral-200 transition-colors">Continue with email</button>
            </div>
          </div>
        </section>
        </RevealOnScroll>

        {/* ── FAQ Section ── */}
        <RevealOnScroll>
        <section id="faq" className="py-16 px-6 rounded-[3rem] bg-neutral-200/50 relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-medium text-black tracking-tight mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "What is Verion AI?",
                  a: "Verion AI is an enterprise-grade, Multi-Agent AI pipeline. It utilizes Retrieval-Augmented Generation (RAG) to query real-time competitor pricing and psychological consumer profiles, enabling a swarm of specialized AI agents to autonomously generate, test, and deploy optimized e-commerce listings."
                },
                {
                  q: "Do I need technical skills to use Verion?",
                  a: "Not at all. Verion features an intuitive web interface. Simply upload your product images and a brief description, and our AI agents handle the rest."
                },
                {
                  q: "How does it connect to Shopify?",
                  a: "Verion seamlessly integrates via the Shopify Admin API. Once the COPE Simulation Engine declares a statistically significant winner among the generated variants, the Orchestrator pushes the optimized JSON payload directly to your storefront."
                },
                {
                  q: "Is there a free trial available?",
                  a: "Yes! Your first 100 generations are completely free. You can sign up and start optimizing your listings immediately without any upfront commitment."
                }
              ].map((faq, i) => (
                <details key={i} className="group overflow-hidden border-b border-neutral-200 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:border-neutral-300/50">
                  <summary className="flex gap-4 justify-between items-center font-medium cursor-pointer list-none p-4 text-lg text-neutral-800 hover:text-black">
                    {faq.q}
                    <span className="transition-transform duration-300 group-open:rotate-180 text-neutral-400 group-hover:text-black">
                      <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="text-neutral-600 px-6 pb-6 text-sm leading-relaxed border-t border-neutral-100 pt-4 mt-2">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
        </RevealOnScroll>

      </main>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 mt-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-neutral-700 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">V</span>
          </div>
          <span className="font-medium text-neutral-500 text-sm">Verion</span>
        </div>
        <p className="text-neutral-600 text-xs">
          © 2026 copyright, All rights are reserved by Xcode.
        </p>
      </footer>
    </div>
  );
}
