'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GraphNode, GraphEdge } from './SocialGraphVisualization'

interface BacklinksExplorerProps {
  onGraphUpdate: (nodes: GraphNode[], edges: GraphEdge[]) => void
  onNodeSelect?: (nodeId: string | null) => void
  onLoadingChange?: (loading: boolean) => void
  initialSeeds?: string[]
}

interface BacklinkRecord {
  did: string
  collection: string
  rkey: string
}

// Public Bluesky API for handle resolution
const BSKY_PUBLIC_API = 'https://public.api.bsky.app'
const CONSTELLATION_API = 'https://constellation.microcosm.blue'

// Base limits for connections - will add random variation
const FOLLOWERS_LIMIT_BASE = 25
const FOLLOWERS_LIMIT_VARIANCE = 20
const MENTIONS_LIMIT_BASE = 10
const MENTIONS_LIMIT_VARIANCE = 10

// Team members to potentially seed the graph with (randomly pick 3)
const ALL_TEAM_SEEDS = ['pfrazee.com', 'jay.bsky.team', 'dholms.xyz', 'divy.zone', 'bnewbold.net']

// Shuffle and pick 3 random seeds
function getRandomSeeds(): string[] {
  const shuffled = [...ALL_TEAM_SEEDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

// Get a random limit with variance for visual variety
function getRandomLimit(base: number, variance: number): number {
  return base + Math.floor(Math.random() * variance)
}

export function useBacklinksExplorer({
  onGraphUpdate,
  onNodeSelect,
  onLoadingChange,
  initialSeeds,
}: BacklinksExplorerProps) {
  // Use provided seeds or generate random ones (stored in ref to keep stable)
  const seedsRef = useRef<string[]>(initialSeeds || getRandomSeeds())
  const [loading, setLoading] = useState(false)

  // Graph state stored in refs to avoid re-renders during expansion
  const nodesMapRef = useRef<Map<string, GraphNode>>(new Map())
  const edgesRef = useRef<GraphEdge[]>([])
  const expandedNodesRef = useRef<Set<string>>(new Set())
  const handleCacheRef = useRef<Map<string, string>>(new Map()) // handle -> DID
  const didHandleCacheRef = useRef<Map<string, string>>(new Map()) // DID -> handle
  const initRef = useRef(false)

  // Resolve a handle to a DID
  const resolveHandle = useCallback(async (handle: string): Promise<string> => {
    if (handle.startsWith('did:')) {
      return handle
    }

    const cached = handleCacheRef.current.get(handle)
    if (cached) return cached

    try {
      const response = await fetch(
        `${BSKY_PUBLIC_API}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to resolve handle: ${handle}`)
      }
      const data = await response.json()
      handleCacheRef.current.set(handle, data.did)
      didHandleCacheRef.current.set(data.did, handle)
      return data.did
    } catch (err) {
      console.error(`Error resolving handle ${handle}:`, err)
      throw err
    }
  }, [])

  // Get profile info for a DID
  const getProfile = useCallback(
    async (did: string): Promise<{ handle: string; displayName?: string }> => {
      // Check cache first
      const cachedHandle = didHandleCacheRef.current.get(did)
      if (cachedHandle) {
        return { handle: cachedHandle }
      }

      try {
        const response = await fetch(
          `${BSKY_PUBLIC_API}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
        )
        if (!response.ok) {
          return { handle: did.slice(8, 20) + '...' }
        }
        const data = await response.json()
        const handle = data.handle || did.slice(8, 20) + '...'
        didHandleCacheRef.current.set(did, handle)
        return {
          handle,
          displayName: data.displayName,
        }
      } catch {
        return { handle: did.slice(8, 20) + '...' }
      }
    },
    [],
  )

  // Fetch backlinks for a DID from Constellation
  const fetchBacklinks = useCallback(
    async (
      did: string,
    ): Promise<{ followers: Array<{ did: string; lexicon: string }>; mentions: Array<{ did: string; lexicon: string }> }> => {
      const followers: Array<{ did: string; lexicon: string }> = []
      const mentions: Array<{ did: string; lexicon: string }> = []

      try {
        // Use random limits for visual variety in cluster sizes
        const followersLimit = getRandomLimit(FOLLOWERS_LIMIT_BASE, FOLLOWERS_LIMIT_VARIANCE)
        const mentionsLimit = getRandomLimit(MENTIONS_LIMIT_BASE, MENTIONS_LIMIT_VARIANCE)
        const repliesLimit = getRandomLimit(10, 15)

        // Fetch followers - source format is "collection:path"
        const followsResponse = await fetch(
          `${CONSTELLATION_API}/xrpc/blue.microcosm.links.getBacklinks?subject=${encodeURIComponent(did)}&source=${encodeURIComponent('app.bsky.graph.follow:subject')}&limit=${followersLimit}`,
        )

        if (followsResponse.ok) {
          const followsData = await followsResponse.json()
          if (followsData.records) {
            followsData.records.forEach((record: BacklinkRecord) => {
              if (record.did) {
                followers.push({ did: record.did, lexicon: 'app.bsky.graph.follow' })
              }
            })
          }
        }

        // Fetch mentions - posts that mention this DID
        const mentionsResponse = await fetch(
          `${CONSTELLATION_API}/xrpc/blue.microcosm.links.getBacklinks?subject=${encodeURIComponent(did)}&source=${encodeURIComponent('app.bsky.feed.post:facets[].features[app.bsky.richtext.facet#mention].did')}&limit=${mentionsLimit}`,
        )

        if (mentionsResponse.ok) {
          const mentionsData = await mentionsResponse.json()
          if (mentionsData.records) {
            mentionsData.records.forEach((record: BacklinkRecord) => {
              if (record.did && !followers.some((f) => f.did === record.did)) {
                mentions.push({ did: record.did, lexicon: 'app.bsky.feed.post' })
              }
            })
          }
        }

        // Also fetch replies to this user's posts
        const repliesResponse = await fetch(
          `${CONSTELLATION_API}/xrpc/blue.microcosm.links.getBacklinks?subject=${encodeURIComponent(did)}&source=${encodeURIComponent('app.bsky.feed.post:reply.parent.uri')}&limit=${repliesLimit}`,
        )

        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json()
          if (repliesData.records) {
            repliesData.records.forEach((record: BacklinkRecord) => {
              if (
                record.did &&
                !followers.some((f) => f.did === record.did) &&
                !mentions.some((m) => m.did === record.did)
              ) {
                mentions.push({ did: record.did, lexicon: 'app.bsky.feed.post (reply)' })
              }
            })
          }
        }
      } catch (err) {
        console.error(`Error fetching backlinks for ${did}:`, err)
      }

      return { followers, mentions }
    },
    [],
  )

  // Add a node to the graph
  const addNode = useCallback(
    async (did: string, isExpanded = false): Promise<GraphNode | null> => {
      if (nodesMapRef.current.has(did)) {
        const existing = nodesMapRef.current.get(did)!
        if (isExpanded) existing.expanded = true
        return existing
      }

      const profile = await getProfile(did)
      const node: GraphNode = {
        id: did,
        label: profile.displayName || profile.handle,
        handle: profile.handle,
        expanded: isExpanded,
      }

      nodesMapRef.current.set(did, node)
      return node
    },
    [getProfile],
  )

  // Expand a node (fetch and add its connections)
  const expandNode = useCallback(
    async (did: string) => {
      if (expandedNodesRef.current.has(did)) return
      expandedNodesRef.current.add(did)

      setLoading(true)
      onLoadingChange?.(true)

      try {
        // Mark node as expanded
        const existingNode = nodesMapRef.current.get(did)
        if (existingNode) {
          existingNode.expanded = true
        } else {
          await addNode(did, true)
        }

        // Fetch backlinks
        const { followers, mentions } = await fetchBacklinks(did)

        // Add follower nodes and edges
        for (const follower of followers) {
          await addNode(follower.did)
          // Check if edge already exists
          const edgeExists = edgesRef.current.some(
            (e) =>
              (e.source === follower.did && e.target === did) ||
              (e.source === did && e.target === follower.did),
          )
          if (!edgeExists) {
            edgesRef.current.push({
              source: follower.did,
              target: did,
              lexicon: follower.lexicon,
              weight: 1,
            })
          }
        }

        // Add mention nodes and edges
        for (const mention of mentions) {
          await addNode(mention.did)
          const edgeExists = edgesRef.current.some(
            (e) =>
              (e.source === mention.did && e.target === did) ||
              (e.source === did && e.target === mention.did),
          )
          if (!edgeExists) {
            edgesRef.current.push({
              source: mention.did,
              target: did,
              lexicon: mention.lexicon,
              weight: 0.5,
            })
          }
        }

        // Update parent component
        const nodes = Array.from(nodesMapRef.current.values())
        const edges = [...edgesRef.current]
        onGraphUpdate(nodes, edges)
      } catch (err) {
        console.error('Error expanding node:', err)
      } finally {
        setLoading(false)
        onLoadingChange?.(false)
      }
    },
    [addNode, fetchBacklinks, onGraphUpdate, onLoadingChange],
  )

  // Handle input submission
  const handleInputSubmit = useCallback(
    async (handle: string) => {
      setLoading(true)
      onLoadingChange?.(true)

      try {
        const did = await resolveHandle(handle)
        await expandNode(did)
        onNodeSelect?.(did)
      } catch (err) {
        console.error('Error resolving handle:', err)
      } finally {
        setLoading(false)
        onLoadingChange?.(false)
      }
    },
    [resolveHandle, expandNode, onNodeSelect, onLoadingChange],
  )

  // Load initial seeds on mount
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function loadInitialSeeds() {
      setLoading(true)
      onLoadingChange?.(true)

      const seeds = seedsRef.current
      try {
        // Load all seeds - the first one becomes the highlighted/selected node
        for (let i = 0; i < seeds.length; i++) {
          const seed = seeds[i]
          try {
            const did = await resolveHandle(seed)
            await expandNode(did)
            // Select the first seed as the highlighted node
            if (i === 0) {
              onNodeSelect?.(did)
            }
          } catch (err) {
            console.error(`Error loading seed ${seed}:`, err)
          }
        }
      } finally {
        setLoading(false)
        onLoadingChange?.(false)
      }
    }

    loadInitialSeeds()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading,
    expandNode,
    handleInputSubmit,
  }
}
