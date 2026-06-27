import React from 'react';

interface LandingPageProps {
  onGetStarted: (mode: 'login' | 'signup') => void;
}

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
      <main className="pt-24 pb-10 px-4 md:px-8 max-w-[1400px] mx-auto space-y-6">

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
        <section id="about" className="bg-neutral-900 rounded-[3rem] p-12 md:p-24 border border-white/5 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
          <div className="md:w-1/2 space-y-8 z-10">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-100 leading-snug">
              <span className="text-white font-semibold ">Verion</span> is a powerful <br /> multi-agent platform
            </h2>
            <div className="space-y-6 text-gray-300 text-lg">
              <p>With which you can effortlessly create, optimize, and distribute highly-converting product listings.</p>
              <p>For every product uploaded, our AI agents analyze images, extract specs, evaluate competitors, and write pristine SEO content.</p>
            </div>
          </div>
          <div className="md:w-1/2 relative h-[500px] w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border border-white/10 shadow-2xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/[0.03] rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute top-[10%] left-[-10%] w-[250px] h-[250px] bg-white/[0.04] rounded-full blur-[60px] pointer-events-none"></div>
            
            {/* Multi-Agent Network Visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Connecting Lines (SVG) */}
              <svg className="absolute w-full h-full inset-0 pointer-events-none opacity-40" style={{ zIndex: 0 }}>
                {/* Central point is at 50% 50% */}
                <line x1="50%" y1="50%" x2="50%" y2="25%" stroke="url(#line-grad-1)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="25%" y2="70%" stroke="url(#line-grad-2)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '200ms' }} />
                <line x1="50%" y1="50%" x2="75%" y2="70%" stroke="url(#line-grad-3)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" style={{ animationDelay: '400ms' }} />
                
                <defs>
                  <linearGradient id="line-grad-1" x1="50%" y1="50%" x2="50%" y2="25%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="line-grad-2" x1="50%" y1="50%" x2="25%" y2="70%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="line-grad-3" x1="50%" y1="50%" x2="75%" y2="70%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Hub: Orchestrator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.15)] relative group cursor-pointer hover:border-white/40 transition-colors">
                  <div className="absolute inset-0 rounded-3xl bg-white/20 animate-ping opacity-20"></div>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs text-white font-medium shadow-xl">Orchestrator</div>
              </div>

              {/* Node 1: Vision Agent (Top) */}
              <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
                <div className="w-14 h-14 bg-[#141414] rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:scale-110 group-hover:-translate-y-1 transition-all shadow-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-white transition-colors"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-neutral-500 font-bold group-hover:text-white transition-colors">Vision Agent</div>
              </div>

              {/* Node 2: SEO Agent (Bottom Left) */}
              <div className="absolute top-[70%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
                <div className="w-14 h-14 bg-[#141414] rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:scale-110 group-hover:-translate-y-1 transition-all shadow-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-white transition-colors"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-2 6h-4c0-3-2-4-2-6a4 4 0 0 1 4-4Z"/><path d="M10 18h4"/><path d="M10 22h4"/></svg>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-neutral-500 font-bold group-hover:text-white transition-colors">SEO Agent</div>
              </div>

              {/* Node 3: Market Agent (Bottom Right) */}
              <div className="absolute top-[70%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
                <div className="w-14 h-14 bg-[#141414] rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:scale-110 group-hover:-translate-y-1 transition-all shadow-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-white transition-colors"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-neutral-500 font-bold group-hover:text-white transition-colors">Market Agent</div>
              </div>

            </div>
          </div>
        </section>

        {/* ── CARD 3: Dark Section (Web Interface & How it works) ── */}
        <section className="bg-[#0f0f0f] rounded-[3rem] text-white overflow-hidden border border-white/5 relative">
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>

          <div className="p-12 md:p-24 flex flex-col md:flex-row items-center gap-12 border-b border-white/5">
            <div className="md:w-1/2 relative">
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-white/[0.03] rounded-[3rem] blur-[80px] scale-90 translate-y-10"></div>
              {/* Web Interface Mockup */}
              <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-medium text-sm text-neutral-300">Dashboard</div>
                  <div className="w-24 h-6 bg-white/10 rounded-full"></div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-10">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-[#0f0f0f] rounded-xl flex flex-col justify-end p-2 border border-white/5"><div className="h-2 w-full bg-white/10 rounded"></div></div>)}
                </div>
                <div className="flex gap-4">
                  <div className="w-1/3 bg-[#0f0f0f] rounded-xl p-4 h-32 border border-white/5"></div>
                  <div className="w-2/3 bg-[#0f0f0f] rounded-xl p-4 h-32 flex flex-col justify-end border border-white/5"><div className="w-full h-16 bg-gradient-to-t from-white/10 to-transparent border-b border-white/20"></div></div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
                <span className="text-neutral-400">Web interface:</span>
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
                In addition to the powerful agentic pipeline, the application contains a sleek web interface for managing your integrations, viewing RAG competitor statistics, and publishing directly to your Shopify store.
              </p>
            </div>
          </div>

          <div className="p-12 md:p-24 relative overflow-hidden">
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
                <p className="text-neutral-500">Upload images and brief descriptions. The Vision Agent analyzes every detail.</p>
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
                <p className="text-white">Our RAG Database and Multi-Agent team collaborates to build the perfect SEO listing.</p>
              </div>

              <div className="w-full md:w-1/3 bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="text-neutral-400 text-sm font-bold mb-4 uppercase tracking-widest">Step 3</div>
                <div className="h-32 bg-[#0f0f0f] rounded-xl mb-4 p-4 flex items-center justify-center border border-white/5">
                  <button className="px-6 py-2 bg-white/10 text-white rounded-full font-medium text-sm border border-white/10">Publish to Shopify</button>
                </div>
                <p className="text-neutral-500">Review the generated metadata and push directly to your storefront with one click.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CARD 4: Testimonials ── */}
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



      </main>
      {/* ── CARD 5: Final CTA ── */}
      <section className="bg-[#141414] p-12 md:p-24 border rounded-t-[3rem] mx-8 border-white/5 relative overflow-hidden flex flex-col items-center rounded-b-[2rem] border-x border-b border-white/5 backdrop-blur-3xl text-center">
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

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-16 px-6 mx-8 mt-8 mb-4 rounded-[3rem] bg-neutral-200/50 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium text-black tracking-tight mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What is Verion AI?",
                a: "Verion AI is a powerful multi-agent platform designed to help e-commerce store owners automate and optimize their product listings. It generates high-converting, SEO-optimized content in seconds."
              },
              {
                q: "Do I need technical skills to use Verion?",
                a: "Not at all. Verion features an intuitive web interface. Simply upload your product images and a brief description, and our AI agents handle the rest."
              },
              {
                q: "How does it connect to Shopify?",
                a: "Verion seamlessly integrates with your Shopify store. Once your optimized listing is generated and reviewed, you can publish it directly to your storefront with a single click."
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

      {/* ── Footer ── */}
      <footer className="py-8 px-6 mx-8 mt-2 text-center">
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
