'use client'

import clsx from 'clsx'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  id: string
  title: string
  description: string
  layer: number
  isSecondary?: boolean
}

const STEPS: Step[] = [
  {
    id: 'identity',
    title: 'Auth',
    description: 'Users sign in via OAuth through their PDS. The handle resolves to a DID, which points to the user\'s data server. Identity is portable.',
    layer: 0,
  },
  {
    id: 'create',
    title: 'Write',
    description: 'The client POSTs a record — a post, like, follow — as JSON matching a Lexicon schema. The PDS stores it in the user\'s signed repository.',
    layer: 1,
  },
  {
    id: 'relay',
    title: 'Relay',
    description: 'Relays subscribe to many PDSes and merge their streams into a unified firehose that anyone can consume.',
    layer: 2,
  },
  {
    id: 'backfill',
    title: 'Tap',
    description: 'New services can backfill historical data from Relays using tap, catching up on past activity.',
    layer: 2,
    isSecondary: true,
  },
  {
    id: 'appview',
    title: 'App',
    description: 'AppViews consume the firehose, build indexes, and serve data via Lexicon-defined API endpoints.',
    layer: 3,
  },
  {
    id: 'label',
    title: 'Label',
    description: 'Labelers query AppViews, analyze content, and publish moderation labels that clients can subscribe to.',
    layer: 3,
    isSecondary: true,
  },
  {
    id: 'read',
    title: 'Read',
    description: 'Clients query AppViews for data via apps, feeds, screen readers, or RSS. New interactions create new records.',
    layer: 4,
  },
]

const AUTO_ROTATE_INTERVAL = 4000

export function RecordFlowAnimation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length)
    }, AUTO_ROTATE_INTERVAL)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isPaused && !hasInteracted) {
      startTimer()
    } else {
      stopTimer()
    }
    return () => stopTimer()
  }, [isPaused, hasInteracted, startTimer, stopTimer])

  const handleStepHover = useCallback((index: number) => {
    setIsPaused(true)
    setCurrentStep(index)
  }, [])

  const handleStepLeave = useCallback(() => {
    if (!hasInteracted) {
      setIsPaused(false)
    }
  }, [hasInteracted])

  const handleStepClick = useCallback((index: number) => {
    setHasInteracted(true)
    setCurrentStep(index)
  }, [])

  const currentStepData = STEPS[currentStep]

  return (
    <div className="w-full not-prose">
      {/* Main Animation Canvas */}
      <div className="relative rounded-lg bg-zinc-900 ring-1 ring-zinc-800 overflow-hidden mb-3">
        <div className="aspect-[16/10] md:aspect-[20/9] lg:aspect-[24/9]">
          <NetworkDiagram currentStep={currentStep} />
        </div>

        {/* XRPC Panel overlay */}
        <div className="absolute bottom-2 left-2 right-2 md:left-auto md:right-2 md:w-[240px]">
          <XRPCPanel currentStep={currentStep} />
        </div>

        {/* Firehose stream */}
        <AnimatePresence>
          {(currentStep === 2 || currentStep === 3) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-2 right-2 w-[180px] hidden lg:block"
            >
              <FirehoseStream />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-0.5 mb-3 overflow-x-auto">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(index)}
            onMouseEnter={() => handleStepHover(index)}
            onMouseLeave={handleStepLeave}
            className={clsx(
              'flex-1 rounded px-1.5 py-1 transition-all duration-200 min-w-0',
              index === currentStep
                ? step.isSecondary
                  ? 'bg-zinc-800/80'
                  : 'bg-zinc-800'
                : 'hover:bg-zinc-800/50',
            )}
          >
            <div
              className={clsx(
                'text-xs font-medium truncate transition-colors text-center',
                index === currentStep
                  ? step.isSecondary ? 'text-zinc-400' : 'text-yellow-400'
                  : 'text-zinc-600',
              )}
            >
              {step.title}
            </div>
            {index === currentStep && !isPaused && !hasInteracted && (
              <div className="mt-0.5 h-px bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  className={clsx('h-full', step.isSecondary ? 'bg-zinc-500' : 'bg-yellow-600')}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: AUTO_ROTATE_INTERVAL / 1000, ease: 'linear' }}
                  key={`progress-${step.id}`}
                />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm text-zinc-400 leading-relaxed"
        >
          {currentStepData.description}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function NetworkDiagram({ currentStep }: { currentStep: number }) {
  const layer = STEPS[currentStep].layer

  const getViewBox = () => {
    const xPositions = [10, 100, 240, 380, 480]
    const x = xPositions[Math.min(layer, 4)]
    return `${x} 0 460 180`
  }

  const getLayerOpacity = (targetLayer: number) => {
    const distance = Math.abs(layer - targetLayer)
    if (distance === 0) return 1
    if (distance === 1) return 0.35
    return 0.1
  }

  // Shift alignment based on layer so mobile viewports show the right portion
  const getPreserveAspectRatio = () => {
    if (layer <= 1) return 'xMinYMid slice'
    if (layer >= 4) return 'xMaxYMid slice'
    return 'xMidYMid slice'
  }

  return (
    <motion.svg
      viewBox={getViewBox()}
      className="w-full h-full"
      animate={{ viewBox: getViewBox() }}
      transition={{ type: 'spring', stiffness: 35, damping: 16 }}
      preserveAspectRatio={getPreserveAspectRatio()}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <marker id="flowArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <path d="M 0 0.5 L 8 3.5 L 0 6.5 Q 2 3.5 0 0.5" fill="#fbbf24" />
        </marker>
        <marker id="flowArrowDim" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <path d="M 0 0.5 L 8 3.5 L 0 6.5 Q 2 3.5 0 0.5" fill="#3f3f46" />
        </marker>
        <marker id="flowArrowPurple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <path d="M 0 0.5 L 8 3.5 L 0 6.5 Q 2 3.5 0 0.5" fill="#a855f7" />
        </marker>

        <linearGradient id="recordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Flow paths */}
      <g className="flow-paths">
        {/* Identity → PDS (active from auth step onward) */}
        <FlowPath d="M 95 75 C 120 75, 140 55, 165 55" active={currentStep >= 0} opacity={getLayerOpacity(0)} />
        <FlowPath d="M 95 95 C 120 95, 140 85, 165 85" active={currentStep >= 0} opacity={getLayerOpacity(0)} />
        <FlowPath d="M 95 115 C 120 115, 140 115, 165 115" active={currentStep >= 0} opacity={getLayerOpacity(0)} />

        {/* PDS → Relay */}
        <FlowPath d="M 265 60 C 300 60, 320 75, 355 75" active={currentStep >= 2} opacity={getLayerOpacity(1)} />
        <FlowPath d="M 265 85 C 300 85, 320 85, 355 85" active={currentStep >= 2} opacity={getLayerOpacity(1)} />
        <FlowPath d="M 265 110 C 300 110, 320 95, 355 95" active={currentStep >= 2} opacity={getLayerOpacity(1)} />

        {/* Relay → AppView */}
        <FlowPath d="M 455 80 C 490 80, 510 55, 545 55" active={currentStep >= 4} opacity={getLayerOpacity(2)} />
        <FlowPath d="M 455 90 C 490 90, 510 85, 545 85" active={currentStep >= 4} opacity={getLayerOpacity(2)} />
        <FlowPath d="M 455 100 C 490 100, 510 115, 545 115" active={currentStep >= 4} opacity={getLayerOpacity(2)} />

        {/* AppView → Readers */}
        <FlowPath d="M 645 70 C 680 70, 700 65, 735 65" active={currentStep >= 6} opacity={getLayerOpacity(3)} />
        <FlowPath d="M 645 85 C 680 85, 700 90, 735 90" active={currentStep >= 6} opacity={getLayerOpacity(3)} />
        <FlowPath d="M 645 100 C 680 100, 700 115, 735 115" active={currentStep >= 6} opacity={getLayerOpacity(3)} />
      </g>

      {/* Backfill path - tap pulls historical data from relay storage */}
      <motion.g animate={{ opacity: currentStep === 3 ? 1 : 0.08 }} transition={{ duration: 0.3 }}>
        {/* Arrow from relay down to database, labeled "tap" */}
        <path
          d="M 405 105 L 405 125"
          fill="none"
          stroke={currentStep === 3 ? '#fbbf24' : '#3f3f46'}
          strokeWidth={currentStep === 3 ? 1.5 : 1}
          markerEnd={currentStep === 3 ? 'url(#flowArrow)' : 'url(#flowArrowDim)'}
        />
        <text x={418} y={118} fill={currentStep === 3 ? '#fbbf24' : '#52525b'} style={{ fontSize: '7px', fontStyle: 'italic' }}>
          tap
        </text>

        {/* Database icon directly below relay */}
        <rect x={380} y={130} width={50} height={30} rx={3} fill={currentStep === 3 ? '#292524' : '#18181b'} stroke={currentStep === 3 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
        <ellipse cx={405} cy={133} rx={22} ry={5} fill="none" stroke={currentStep === 3 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
        <line x1={383} y1={133} x2={383} y2={155} stroke={currentStep === 3 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
        <line x1={427} y1={133} x2={427} y2={155} stroke={currentStep === 3 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
      </motion.g>

      {/* Labeler */}
      <motion.g animate={{ opacity: currentStep === 5 ? 1 : 0.06 }} transition={{ duration: 0.3 }}>
        <rect x={660} y={48} width={55} height={28} rx={5} fill="#18181b" stroke={currentStep === 5 ? '#a855f7' : '#3f3f46'} strokeWidth={1} />
        <text x={687} y={62} textAnchor="middle" fill={currentStep === 5 ? '#c084fc' : '#52525b'} style={{ fontSize: '8px' }}>Labeler</text>
        <text x={687} y={72} textAnchor="middle" fill="#3f3f46" style={{ fontSize: '7px' }}>moderation</text>
        <path d="M 645 58 L 658 58" fill="none" stroke={currentStep === 5 ? '#a855f7' : '#3f3f46'} strokeWidth={1} markerEnd="url(#flowArrowPurple)" />
        <path d="M 658 68 L 645 68" fill="none" stroke={currentStep === 5 ? '#a855f7' : '#3f3f46'} strokeWidth={1} markerEnd="url(#flowArrowPurple)" />
      </motion.g>

      {/* Loop arrow */}
      <motion.g animate={{ opacity: currentStep === 6 ? 0.7 : 0.03 }} transition={{ duration: 0.3 }}>
        <path
          d="M 760 90 C 785 90, 795 50, 780 25 C 765 5, 100 5, 65 25 C 50 40, 55 55, 70 70"
          fill="none"
          stroke={currentStep === 6 ? '#fbbf24' : '#27272a'}
          strokeWidth={currentStep === 6 ? 1.5 : 0.75}
          strokeDasharray="5 3"
          markerEnd={currentStep === 6 ? 'url(#flowArrow)' : 'url(#flowArrowDim)'}
        />
        <text x={420} y={18} textAnchor="middle" fill={currentStep === 6 ? '#fbbf24' : '#27272a'} style={{ fontSize: '7px', fontStyle: 'italic' }}>
          new interaction → new record
        </text>
      </motion.g>

      {/* Layer: Identity */}
      <motion.g animate={{ opacity: getLayerOpacity(0) }} transition={{ duration: 0.3 }}>
        <text x={65} y={38} textAnchor="middle" fill={layer === 0 ? '#fbbf24' : '#3f3f46'} style={{ fontSize: '8px' }}>
          Identity
        </text>
        <g transform="translate(45, 55)">
          <circle cx={20} cy={20} r={14} fill={layer === 0 ? '#292524' : '#18181b'} stroke={layer === 0 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
          <text x={20} y={24} textAnchor="middle" fill={layer === 0 ? '#fbbf24' : '#52525b'} style={{ fontSize: '9px' }}>A</text>
        </g>
        <g transform="translate(45, 75)">
          <circle cx={20} cy={20} r={14} fill={layer === 0 ? '#292524' : '#18181b'} stroke={layer === 0 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
          <text x={20} y={24} textAnchor="middle" fill={layer === 0 ? '#fbbf24' : '#52525b'} style={{ fontSize: '9px' }}>B</text>
        </g>
        <g transform="translate(45, 95)">
          <circle cx={20} cy={20} r={14} fill={layer === 0 ? '#292524' : '#18181b'} stroke={layer === 0 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
          <text x={20} y={24} textAnchor="middle" fill={layer === 0 ? '#fbbf24' : '#52525b'} style={{ fontSize: '9px' }}>C</text>
        </g>
      </motion.g>

      {/* Layer: PDS - also visible during auth since PDS handles OAuth */}
      <motion.g animate={{ opacity: layer <= 1 ? 1 : getLayerOpacity(1) }} transition={{ duration: 0.3 }}>
        <text x={215} y={38} textAnchor="middle" fill={layer <= 1 ? '#fbbf24' : '#3f3f46'} style={{ fontSize: '8px' }}>
          Personal Data Servers
        </text>
        <ServiceBox x={165} y={45} w={100} h={24} label="bsky.social" active={layer <= 1} />
        <ServiceBox x={165} y={73} w={100} h={24} label="example.com" active={layer <= 1} />
        <ServiceBox x={165} y={101} w={100} h={24} label="self-hosted" active={layer <= 1} />
      </motion.g>

      {/* Layer: Relay */}
      <motion.g animate={{ opacity: getLayerOpacity(2) }} transition={{ duration: 0.3 }}>
        <text x={405} y={38} textAnchor="middle" fill={layer === 2 ? '#fbbf24' : '#3f3f46'} style={{ fontSize: '8px' }}>
          Relays
        </text>
        <ServiceBox x={355} y={55} w={100} h={50} label="bsky.network" active={layer === 2} />
        <motion.g animate={{ opacity: 0.25 }}>
          <ServiceBox x={360} y={115} w={60} h={18} label="other" active={false} tiny />
        </motion.g>
      </motion.g>

      {/* Layer: AppView */}
      <motion.g animate={{ opacity: getLayerOpacity(3) }} transition={{ duration: 0.3 }}>
        <text x={595} y={38} textAnchor="middle" fill={layer === 3 ? '#fbbf24' : '#3f3f46'} style={{ fontSize: '8px' }}>
          App Views
        </text>
        <ServiceBox x={545} y={45} w={100} h={24} label="Bluesky" sub="app.bsky.*" active={layer === 3} lexicon />
        <ServiceBox x={545} y={73} w={100} h={24} label="WhiteWind" sub="com.whtwnd.*" active={layer === 3} lexicon />
        <ServiceBox x={545} y={101} w={100} h={24} label="Frontpage" sub="fyi.unravel.*" active={layer === 3} lexicon />
      </motion.g>

      {/* Layer: Readers - different client types */}
      <motion.g animate={{ opacity: getLayerOpacity(4) }} transition={{ duration: 0.3 }}>
        <text x={760} y={38} textAnchor="middle" fill={layer === 4 ? '#fbbf24' : '#3f3f46'} style={{ fontSize: '8px' }}>
          Clients
        </text>
        {/* Mobile app */}
        <g transform="translate(735, 50)">
          <rect x={10} y={0} width={20} height={32} rx={3} fill={layer === 4 ? '#292524' : '#18181b'} stroke={layer === 4 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
          <rect x={14} y={4} width={12} height={18} rx={1} fill={layer === 4 ? '#3f3f46' : '#27272a'} />
          <circle cx={20} cy={27} r={2} fill={layer === 4 ? '#fbbf24' : '#3f3f46'} />
        </g>
        {/* RSS icon */}
        <g transform="translate(735, 85)">
          <rect x={10} y={0} width={20} height={20} rx={3} fill={layer === 4 ? '#292524' : '#18181b'} stroke={layer === 4 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
          <circle cx={15} cy={15} r={2} fill={layer === 4 ? '#fb923c' : '#52525b'} />
          <path d="M 14 8 Q 14 12, 18 12" fill="none" stroke={layer === 4 ? '#fb923c' : '#52525b'} strokeWidth={1.5} strokeLinecap="round" />
          <path d="M 14 4 Q 14 14, 24 14" fill="none" stroke={layer === 4 ? '#fb923c' : '#52525b'} strokeWidth={1.5} strokeLinecap="round" />
          <text x={40} y={12} fill={layer === 4 ? '#a1a1aa' : '#52525b'} style={{ fontSize: '9px' }}>rss</text>
        </g>
        {/* Screen reader / accessibility */}
        <g transform="translate(735, 110)">
          <rect x={10} y={0} width={20} height={20} rx={3} fill={layer === 4 ? '#292524' : '#18181b'} stroke={layer === 4 ? '#fbbf24' : '#3f3f46'} strokeWidth={1} />
          <circle cx={20} cy={7} r={3} fill={layer === 4 ? '#60a5fa' : '#52525b'} />
          <path d="M 17 12 L 20 17 L 23 12" fill="none" stroke={layer === 4 ? '#60a5fa' : '#52525b'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <text x={40} y={12} fill={layer === 4 ? '#a1a1aa' : '#52525b'} style={{ fontSize: '9px' }}>a11y</text>
        </g>
      </motion.g>

      {/* Records - positioned above boxes */}
      <RecordFlow currentStep={currentStep} layer={layer} />
    </motion.svg>
  )
}

function FlowPath({ d, active, opacity }: { d: string; active: boolean; opacity: number }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={active ? '#fbbf24' : '#3f3f46'}
      strokeWidth={active ? 1.5 : 0.75}
      strokeLinecap="round"
      markerEnd={active ? 'url(#flowArrow)' : 'url(#flowArrowDim)'}
      animate={{ opacity }}
      transition={{ duration: 0.3 }}
    />
  )
}

function ServiceBox({
  x, y, w, h, label, sub, active, tiny, lexicon
}: {
  x: number; y: number; w: number; h: number; label: string; sub?: string
  active: boolean; tiny?: boolean; lexicon?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={active ? '#292524' : '#18181b'}
        stroke={active ? '#fbbf24' : '#3f3f46'}
        strokeWidth={active ? 1.5 : 0.75}
      />
      <text
        x={x + w / 2}
        y={y + (sub ? 10 : h / 2 + 3)}
        textAnchor="middle"
        fill={active ? '#fbbf24' : '#71717a'}
        style={{ fontSize: tiny ? '6px' : '8px' }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + 19}
          textAnchor="middle"
          fill={lexicon ? '#60a5fa' : '#52525b'}
          style={{ fontSize: '7px', fontFamily: lexicon ? 'monospace' : 'inherit' }}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

function RecordFlow({ currentStep, layer }: { currentStep: number; layer: number }) {
  if (STEPS[currentStep].isSecondary) return null

  const records = [
    { id: 0, delay: 0 },
    { id: 1, delay: 0.06 },
    { id: 2, delay: 0.12 },
  ]

  // Positions aligned with relevant components
  const getPosition = (record: typeof records[0]) => {
    const positions = [
      { x: 35, y: 75 + record.id * 20 },                       // Left of user icons
      { x: 155, y: 55 + record.id * 28 },                      // Left of PDS boxes
      { x: 345, y: 80 },                                        // Left of relay (converge)
      { x: 345, y: 80 },                                        // (backfill)
      { x: 535, y: 55 + record.id * 28 },                      // Left of AppView boxes
      { x: 535, y: 55 + record.id * 28 },                      // (labeler)
      { x: 725, y: 70 + record.id * 20 },                      // Near readers
    ]
    return positions[currentStep] || positions[0]
  }

  return (
    <g>
      {records.map((record) => {
        const pos = getPosition(record)

        return (
          <motion.g
            key={record.id}
            animate={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 60, damping: 12, delay: record.delay }}
          >
            <motion.g
              animate={{ scale: currentStep === 2 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.4, repeat: currentStep === 2 ? Infinity : 0, repeatDelay: 0.5 }}
            >
              <rect x={-8} y={-6} width={16} height={12} rx={2} fill="url(#recordGrad)" />
              <line x1={-5} y1={-2} x2={3} y2={-2} stroke="#78350f" strokeWidth={1} strokeLinecap="round" />
              <line x1={-5} y1={1} x2={5} y2={1} stroke="#78350f" strokeWidth={1} strokeLinecap="round" />
              <line x1={-5} y1={4} x2={2} y2={4} stroke="#78350f" strokeWidth={1} strokeLinecap="round" />
            </motion.g>
          </motion.g>
        )
      })}
    </g>
  )
}

function FirehoseStream() {
  const [events, setEvents] = useState<Array<{ text: string; id: number }>>([])
  const idRef = useRef(0)

  useEffect(() => {
    const samples = ['alice → post', 'bob → like', 'carol → follow']

    const interval = setInterval(() => {
      setEvents((prev) => {
        const next = [{ text: samples[idRef.current % samples.length], id: idRef.current }, ...prev]
        idRef.current++
        return next.slice(0, 3)
      })
    }, 900)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded bg-black/90 ring-1 ring-yellow-500/30 overflow-hidden">
      <div className="px-2 py-0.5 bg-yellow-900/30 border-b border-yellow-600/20 flex items-center gap-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
        </span>
        <span className="text-2xs text-yellow-400">firehose</span>
      </div>
      <div className="px-2 py-1 font-mono text-3xs">
        <AnimatePresence>
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1 - i * 0.25, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-zinc-500"
            >
              <span className="text-yellow-600">›</span> {event.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function XRPCPanel({ currentStep }: { currentStep: number }) {
  const content: Record<number, { method: string; color: string; endpoint: string }> = {
    0: { method: 'GET', color: 'text-blue-400 bg-blue-900/60', endpoint: 'identity.resolveHandle' },
    1: { method: 'POST', color: 'text-green-400 bg-green-900/60', endpoint: 'repo.createRecord' },
    2: { method: 'WS', color: 'text-yellow-400 bg-yellow-900/60', endpoint: 'sync.subscribeRepos' },
    3: { method: 'GET', color: 'text-zinc-300 bg-zinc-700/60', endpoint: 'sync.getRepo' },
    4: { method: 'GET', color: 'text-blue-400 bg-blue-900/60', endpoint: 'feed.getPostThread' },
    5: { method: 'GET', color: 'text-purple-400 bg-purple-900/60', endpoint: 'label.queryLabels' },
    6: { method: 'GET', color: 'text-blue-400 bg-blue-900/60', endpoint: 'feed.getTimeline' },
  }

  const c = content[currentStep]
  if (!c) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded bg-black/90 ring-1 ring-zinc-700/50 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-2 py-1.5 flex items-center gap-1.5"
        >
          <span className={clsx('px-1 py-0.5 rounded text-3xs font-medium', c.color)}>
            {c.method}
          </span>
          <span className="font-mono text-3xs text-zinc-500 truncate">
            {c.endpoint}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
