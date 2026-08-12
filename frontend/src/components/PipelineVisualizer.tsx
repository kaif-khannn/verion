import { useEffect, useRef, useState } from 'react'

interface Step {
  id: number
  name: string
  subLabel: string
  color: string
}

const STEPS: Step[] = [
  { id: 1, name: 'Input Processing',        subLabel: 'Parsing & normalizing input data',        color: '#818cf8' },
  { id: 2, name: 'Privacy Protection',      subLabel: 'Scanning & redacting sensitive content',  color: '#34d399' },
  { id: 3, name: 'Vision Analysis',         subLabel: 'Running multi-modal image analysis',      color: '#f472b6' },
  { id: 4, name: 'SEO Optimization',        subLabel: 'Generating keywords & meta structure',    color: '#fb923c' },
  { id: 5, name: 'Marketing Content',       subLabel: 'Crafting platform-specific copy',         color: '#60a5fa' },
  { id: 6, name: 'Validation & Quality',    subLabel: 'Checking completeness & compliance',      color: '#facc15' },
  { id: 7, name: 'Conversion Optimization', subLabel: 'Scoring and A/B variant generation',      color: '#a78bfa' },
  { id: 8, name: 'Decision Engine',         subLabel: 'Selecting optimal content variant',       color: '#f87171' },
]

// Approx durations each step gets during live simulation (ms).
const STEP_DURATIONS = [800, 700, 1800, 1400, 1200, 900, 1100, 600]

interface Props {
  status: { step: number; loading: boolean }
}

function useElapsedMs(running: boolean) {
  const [ms, setMs] = useState(0)
  const start = useRef<number>(0)
  const frame = useRef<number>(0)

  useEffect(() => {
    if (running) {
      start.current = performance.now()
      const tick = () => {
        setMs(Math.floor(performance.now() - start.current))
        frame.current = requestAnimationFrame(tick)
      }
      frame.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(frame.current)
    }
    return () => cancelAnimationFrame(frame.current)
  }, [running])

  useEffect(() => {
    if (!running) setMs(0)
  }, [running])

  return ms
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// Spinning arc SVG for the active step indicator
function SpinnerArc({ color }: { color: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="animate-spin" style={{ animationDuration: '1s' }}>
      <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
      <path
        d="M18 3 A15 15 0 0 1 33 18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Animated progress bar filling across the step row
function StepProgressBar({ color, durationMs }: { color: string; durationMs: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(100), 50)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full overflow-hidden">
      <div
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: `width ${durationMs}ms cubic-bezier(0.4,0,0.2,1)`,
          height: '100%',
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </div>
  )
}

// Particle data-flow connector between steps
function FlowConnector({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="relative flex items-center justify-center h-3 mx-auto" style={{ width: 2 }}>
      <div
        className="absolute w-px"
        style={{
          top: 0, bottom: 0,
          background: active
            ? `linear-gradient(to bottom, ${color}60, ${color}20)`
            : 'rgba(255,255,255,0.04)',
          transition: 'background 0.4s ease',
        }}
      />
      {active && (
        <div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
            animation: 'slideDown 0.9s ease-in-out infinite',
            top: 0,
          }}
        />
      )}
    </div>
  )
}

export default function PipelineVisualizer({ status }: Props) {
  // liveStep: which step the animation is currently showing as active
  const [liveStep, setLiveStep] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedMs = useElapsedMs(status.loading)

  // Drive the live step animation
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (status.loading) {
      // Start from step 1 and advance through steps while API is running
      if (liveStep === 0) setLiveStep(1)

      const advance = (current: number) => {
        const next = current + 1
        if (next > STEPS.length) return
        const duration = STEP_DURATIONS[current - 1] ?? 800
        timerRef.current = setTimeout(() => {
          setLiveStep(next)
          advance(next)
        }, duration)
      }
      advance(liveStep === 0 ? 1 : liveStep)
    } else if (!status.loading && status.step >= STEPS.length) {
      // API done – jump all complete
      setLiveStep(STEPS.length + 1)
    } else if (!status.loading && status.step === 0) {
      setLiveStep(0)
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.loading, status.step])

  const isFullyDone = !status.loading && status.step >= STEPS.length
  const isRunning = status.loading
  const hasStarted = liveStep > 0 || isFullyDone

  return (
    <>
      {/* keyframes injected once */}
      <style>{`
        @keyframes slideDown {
          0%   { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes completePop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>

      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">
            Agent Pipeline
          </h3>
          {isRunning && (
            <span
              className="text-xs font-mono text-neutral-400 tabular-nums"
              style={{ animation: 'pulseGlow 1.5s ease-in-out infinite' }}
            >
              {formatMs(elapsedMs)}
            </span>
          )}
          {isFullyDone && (
            <span className="text-xs text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Complete
            </span>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-0">
          {STEPS.map((step, idx) => {
            const isDone    = isFullyDone || liveStep > step.id
            const isActive  = !isFullyDone && liveStep === step.id
            const isPending = !isDone && !isActive
            const showConnector = idx < STEPS.length - 1

            return (
              <div key={step.id}>
                {/* Step Row */}
                <div
                  className="relative overflow-hidden transition-all duration-500"
                  style={{
                    borderRadius: 16,
                    padding: '14px 18px',
                    animation: isActive ? 'fadeSlideIn 0.35s ease forwards' : undefined,
                    background: isDone
                      ? 'rgba(255,255,255,0.04)'
                      : isActive
                        ? `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`
                        : 'rgba(255,255,255,0.02)',
                    border: isDone
                      ? '1px solid rgba(255,255,255,0.08)'
                      : isActive
                        ? `1px solid ${step.color}55`
                        : '1px solid rgba(255,255,255,0.04)',
                    boxShadow: isActive ? `0 0 24px ${step.color}22` : 'none',
                  }}
                >
                  {/* Live progress bar along the bottom */}
                  {isActive && (
                    <StepProgressBar
                      color={step.color}
                      durationMs={STEP_DURATIONS[idx] ?? 800}
                    />
                  )}

                  <div className="flex items-center gap-4">
                    {/* Badge */}
                    <div className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center">
                      {isDone ? (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${step.color}20`,
                            animation: hasStarted ? 'completePop 0.4s ease forwards' : undefined,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      ) : isActive ? (
                        <SpinnerArc color={step.color} />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.2)',
                          }}
                        >
                          {step.id}
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold leading-tight transition-colors duration-500"
                        style={{
                          color: isDone
                            ? 'rgba(255,255,255,0.85)'
                            : isActive
                              ? '#fff'
                              : 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {step.name}
                      </p>
                      {(isActive || isDone) && (
                        <p
                          className="text-xs mt-0.5 transition-colors duration-300"
                          style={{
                            color: isDone ? 'rgba(255,255,255,0.3)' : `${step.color}cc`,
                            animation: isActive ? 'fadeSlideIn 0.3s ease' : undefined,
                          }}
                        >
                          {isDone ? 'Completed' : step.subLabel}
                        </p>
                      )}
                    </div>

                    {/* Right badge */}
                    <div className="flex-shrink-0">
                      {isDone && (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: `${step.color}18`,
                            color: step.color,
                            animation: 'completePop 0.35s ease forwards',
                          }}
                        >
                          Done
                        </span>
                      )}
                      {isActive && (
                        <span
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
                          style={{ color: step.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: step.color,
                              animation: 'pulseGlow 0.8s ease-in-out infinite',
                            }}
                          />
                          Running
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs text-neutral-700 font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Animated flow connector between rows */}
                {showConnector && (
                  <FlowConnector
                    color={step.color}
                    active={liveStep === step.id && !isFullyDone}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom summary bar */}
        {isFullyDone && (
          <div
            className="mt-4 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))',
              border: '1px solid rgba(52,211,153,0.2)',
              animation: 'fadeSlideIn 0.5s ease forwards',
            }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400">All {STEPS.length} stages complete</p>
              <p className="text-xs text-neutral-500 mt-0.5">Pipeline executed successfully · Results ready</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
