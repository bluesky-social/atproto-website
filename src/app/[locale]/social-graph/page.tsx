'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/Button'
import { DotPatternBackground } from '@/components/DotPattern'
import { SocialGraphVisualization, GraphNode, GraphEdge } from '@/components/social-graph/SocialGraphVisualization'
import { useBacklinksExplorer } from '@/components/social-graph/BacklinksExplorer'
import { RotatingText } from '@/components/social-graph/RotatingText'
import { RecordFlowAnimation } from '@/components/social-graph/RecordFlowAnimation'

const ROTATING_WORDS = [
  'identity',
  'network analysis',
  'audience management',
  'hacking',
  'business intelligence',
  'weird new apps',
]

export default function SocialGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGraphUpdate = useCallback(
    (newNodes: GraphNode[], newEdges: GraphEdge[]) => {
      setNodes(newNodes)
      setEdges(newEdges)
    },
    [],
  )

  const { expandNode, handleInputSubmit } = useBacklinksExplorer({
    onGraphUpdate: handleGraphUpdate,
    onNodeSelect: setHighlightedNode,
    onLoadingChange: setLoading,
    // Default seeds defined in BacklinksExplorer: pfrazee.com, jay.bsky.team, emily.bsky.team
  })

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setHighlightedNode(node.id)
    },
    [],
  )

  const handleExpandNode = useCallback(
    (node: GraphNode) => {
      expandNode(node.id)
    },
    [expandNode],
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:gap-16 md:px-8 lg:max-w-7xl">
      {/* Hero Section */}
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-mono text-4xl leading-tight md:text-6xl md:tracking-[-3px]">
          The Open Social Graph
        </h1>
        <p className="max-w-2xl text-xl text-zinc-400 md:text-2xl">
          The social graph that belongs to everyone. Build apps that inherit
          millions of connections without starting from zero.
        </p>
        <p className="flex flex-wrap items-center justify-center gap-2 font-mono text-lg text-zinc-500 md:text-xl">
          <span>The open social graph for</span>
          <RotatingText words={ROTATING_WORDS} />
        </p>
      </section>

      {/* Graph Visualization */}
      <section className="relative">
        <DotPatternBackground />
        <div className="relative z-10 overflow-hidden rounded-lg ring-1 ring-cyan-900/50">
          <SocialGraphVisualization
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            onExpandNode={handleExpandNode}
            highlightedNode={highlightedNode}
            onInputSubmit={handleInputSubmit}
            loading={loading}
            className="aspect-[16/10] md:aspect-[2/1]"
          />
        </div>
        <p className="relative z-20 mt-3 text-center text-xs text-zinc-500">
          Powered by{' '}
          <a
            href="https://constellation.microcosm.blue"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-400 hover:underline"
          >
            Constellation
          </a>{' '}
          from{' '}
          <a
            href="https://microcosm.blue"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-400 hover:underline"
          >
            Microcosm
          </a>
        </p>
      </section>

      {/* Benefits Section */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <BenefitCard
          title="Portable Identity"
          description="Users own their identity. DIDs and handles work across every app in the atmosphere."
        />
        <BenefitCard
          title="No API Keys"
          description="Public data is public. Read the firehose, query repositories, build indexes - no permission needed."
        />
        <BenefitCard
          title="Instant Network"
          description="Launch with millions of potential users already connected. No cold start problem."
        />
        <BenefitCard
          title="Your Users, Your Data"
          description="Build your own indexes, your own views. The network is shared, but your product is yours."
        />
        <BenefitCard
          title="Lightweight by Design"
          description="Relays, appviews, and labelers absorb the heavy lifting - keeping user PDSes small, cheap, and easy to self-host."
        />
      </section>

      {/* How It Works Section */}
      <section className="flex flex-col gap-6">
        <h2 className="text-center font-mono text-2xl md:text-3xl">
          How data flows
        </h2>
        <p className="mx-auto max-w-2xl text-center text-zinc-400">
          Records flow through the network - from personal data servers through
          relays to app views and back to users. Every interaction creates new
          connections.
        </p>
        <div className="mx-auto w-full max-w-4xl">
          <RecordFlowAnimation />
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center gap-6 py-8 text-center">
        <h2 className="font-mono text-2xl md:text-3xl">
          Ready to build?
        </h2>
        <p className="max-w-xl text-lg text-zinc-400">
          Join thousands of developers building the next generation of social
          applications on an open foundation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" arrow="right" font="mono" size="large" href="/docs">
            Get Started
          </Button>
          <Button variant="secondary" font="mono" size="large" href="/guides/understanding-atproto">
            Learn More
          </Button>
        </div>
      </section>
    </div>
  )
}

function BenefitCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
      <h3 className="mb-2 font-mono text-lg font-medium text-cyan-400">
        {title}
      </h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  )
}
