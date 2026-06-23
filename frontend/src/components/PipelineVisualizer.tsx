interface Step {
  id: number
  name: string
  icon: string
}

const STEPS: Step[] = [
  { id: 1, name: "Input Processing", icon: "📝" },
  { id: 2, name: "Privacy Protection", icon: "🛡️" },
  { id: 3, name: "Vision Analysis", icon: "👁️" },
  { id: 4, name: "SEO Optimization", icon: "🚀" },
  { id: 5, name: "Marketing Content", icon: "📣" },
  { id: 6, name: "Validation & Quality", icon: "✅" },
]

export default function PipelineVisualizer({ status }: { status: { step: number; loading: boolean } }) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-5">Agent Pipeline</h3>
      <div className="space-y-3">
        {STEPS.map((step) => {
          const isDone = status.step > step.id || (status.step === step.id && !status.loading)
          const isActive = status.step === step.id && status.loading

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-500 ${isDone
                  ? 'bg-white/5 border-white/10 text-white'
                  : isActive
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    : 'bg-[#0f0f0f] border-white/5 text-neutral-500'
                }`}
            >
              {/* Status indicator */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${isDone
                  ? 'bg-white/10 text-white'
                  : isActive
                    ? 'bg-black text-white'
                    : 'bg-[#141414] text-neutral-600 border border-white/5'
                }`}>
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : step.id}
              </div>

              <span className="font-medium text-sm flex-1">{step.name}</span>

              {/* Status label */}
              {isDone && (
                <span className="text-xs text-neutral-400 font-medium tracking-wide">Done</span>
              )}
              {isActive && (
                <span className="flex items-center gap-2 text-xs text-black font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
                  Running
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
