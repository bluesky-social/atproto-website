'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

// ============ TYPES ============
export interface GraphNode {
  id: string // DID
  label: string // handle or display name
  handle?: string
  x?: number
  y?: number
  vx?: number
  vy?: number
  pinned?: boolean
  size?: number
  expanded?: boolean
  // Animation state
  pulsePhase?: number
  starRotation?: number
}

export interface GraphEdge {
  source: string
  target: string
  lexicon?: string
  path?: string
  weight?: number
}

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick?: (node: GraphNode) => void
  onExpandNode?: (node: GraphNode) => void
  highlightedNode?: string | null
  className?: string
  onInputSubmit?: (handle: string) => void
  loading?: boolean
}

// ============ CONFIGURABLE CONSTANTS ============
const NODE_RADIUS = 4
const NODE_RADIUS_HIGHLIGHTED = 8
const NODE_RADIUS_EXPANDED = 6
const EDGE_WIDTH = 0.4
const EDGE_WIDTH_HIGHLIGHTED = 1.2
const REPULSION_STRENGTH = 1800
const ATTRACTION_STRENGTH = 0.025
const DAMPING = 0.88
const MIN_DISTANCE = 35
const CENTER_GRAVITY = 0.01
const ZOOM_MIN = 0.1
const ZOOM_MAX = 5
const DRAG_SENSITIVITY = 1
const LABELS_TO_SHOW = 8 // Only show this many labels at a time
const PULSE_NODES_COUNT = 5 // How many nodes pulse at once

// Constellation color palette
const COLOR_NODE_DEFAULT = '#06b6d4' // cyan-500
const COLOR_NODE_EXPANDED = '#22d3ee' // cyan-400
const COLOR_NODE_HIGHLIGHTED = '#f0fdfa' // teal-50
const COLOR_NODE_DIM = '#0e7490' // cyan-700
const COLOR_EDGE_FOLLOW = '#22c55e' // green-500
const COLOR_EDGE_FOLLOW_DIM = '#166534' // green-800
const COLOR_EDGE_MENTION = '#a855f7' // purple-500
const COLOR_EDGE_MENTION_DIM = '#581c87' // purple-900
const COLOR_EDGE_REPLY = '#c084fc' // purple-400
const COLOR_EDGE_REPLY_DIM = '#6b21a8' // purple-800
const COLOR_BACKGROUND = '#0c1222'
const COLOR_LABEL = '#ecfeff' // cyan-50
const COLOR_LABEL_DIM = '#0891b2' // cyan-600

const FONT_STACK = ['IBM Plex Mono', 'Cascadia Mono', 'SF Mono', 'monospace'].join(', ')

export function SocialGraphVisualization({
  nodes,
  edges,
  onNodeClick,
  onExpandNode,
  highlightedNode,
  className = '',
  onInputSubmit,
  loading = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const nodesRef = useRef<GraphNode[]>([])
  const edgesRef = useRef<GraphEdge[]>([])
  const simulationActiveRef = useRef(true)
  const frameCountRef = useRef(0)
  const pulsingNodesRef = useRef<Set<string>>(new Set())

  // Input state
  const [inputValue, setInputValue] = useState('')
  const [inputExpanded, setInputExpanded] = useState(false)

  // Detail panel state
  const [detailPanel, setDetailPanel] = useState<{
    visible: boolean
    node: GraphNode | null
    edges: GraphEdge[]
    x: number
    y: number
  }>({ visible: false, node: null, edges: [], x: 0, y: 0 })

  // Hover state (lightweight tooltip)
  const [hoverNode, setHoverNode] = useState<{
    node: GraphNode | null
    x: number
    y: number
  }>({ node: null, x: 0, y: 0 })

  // Viewport state
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 })
  const viewportRef = useRef(viewport)
  viewportRef.current = viewport

  // Animated zoom state
  const zoomAnimationRef = useRef<{
    active: boolean
    startTime: number
    startViewport: { x: number; y: number; zoom: number }
    targetViewport: { x: number; y: number; zoom: number }
    duration: number
  } | null>(null)

  // Drag state
  const dragRef = useRef<{
    isDragging: boolean
    startX: number
    startY: number
    startViewportX: number
    startViewportY: number
    draggedNode: GraphNode | null
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startViewportX: 0,
    startViewportY: 0,
    draggedNode: null,
  })

  // Initialize and update nodes
  useEffect(() => {
    if (nodes.length === 0) {
      nodesRef.current = []
      edgesRef.current = []
      return
    }

    const canvas = canvasRef.current
    const width = canvas?.width || 800
    const height = canvas?.height || 600
    const centerX = width / 2
    const centerY = height / 2

    // Preserve existing positions
    const existingPositions = new Map<string, GraphNode>()
    nodesRef.current.forEach((n) => {
      existingPositions.set(n.id, n)
    })

    // Find a good spawn point for new nodes - near their connected nodes if possible
    const initializedNodes = nodes.map((node) => {
      const existing = existingPositions.get(node.id)
      if (existing) {
        return {
          ...node,
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy,
          pulsePhase: existing.pulsePhase ?? Math.random() * Math.PI * 2,
          starRotation: existing.starRotation ?? Math.random() * Math.PI * 2,
        }
      }

      // For new nodes, spawn near connected nodes or center with small random offset
      const connectedEdge = edges.find((e) => e.source === node.id || e.target === node.id)
      let spawnX = centerX
      let spawnY = centerY

      if (connectedEdge) {
        const connectedId = connectedEdge.source === node.id ? connectedEdge.target : connectedEdge.source
        const connectedNode = existingPositions.get(connectedId)
        if (connectedNode) {
          spawnX = connectedNode.x || centerX
          spawnY = connectedNode.y || centerY
        }
      }

      return {
        ...node,
        x: spawnX + (Math.random() - 0.5) * 60,
        y: spawnY + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        starRotation: Math.random() * Math.PI * 2,
      }
    })

    nodesRef.current = initializedNodes
    edgesRef.current = edges
    simulationActiveRef.current = true

    // Center viewport on first load - zoom in more for legibility
    if (existingPositions.size === 0 && initializedNodes.length > 0) {
      const avgX = initializedNodes.reduce((sum, n) => sum + (n.x || 0), 0) / initializedNodes.length
      const avgY = initializedNodes.reduce((sum, n) => sum + (n.y || 0), 0) / initializedNodes.length
      setViewport({ x: centerX - avgX * 1.5, y: centerY - avgY * 1.5, zoom: 1.5 })
    }
  }, [nodes, edges])

  // Continuous force simulation
  const runSimulationStep = useCallback(() => {
    const simNodes = nodesRef.current
    const simEdges = edgesRef.current
    if (simNodes.length === 0) return

    const canvas = canvasRef.current
    const width = (canvas?.width || 800) / (window.devicePixelRatio || 1)
    const height = (canvas?.height || 600) / (window.devicePixelRatio || 1)
    const centerX = width / 2
    const centerY = height / 2

    let totalMovement = 0

    // Repulsion between all pairs
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const nodeA = simNodes[i]
        const nodeB = simNodes[j]

        const dx = (nodeB.x || 0) - (nodeA.x || 0)
        const dy = (nodeB.y || 0) - (nodeA.y || 0)
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        const minDist = Math.max(distance, MIN_DISTANCE)

        const force = REPULSION_STRENGTH / (minDist * minDist)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force

        if (!nodeA.pinned) {
          nodeA.vx = (nodeA.vx || 0) - fx
          nodeA.vy = (nodeA.vy || 0) - fy
        }
        if (!nodeB.pinned) {
          nodeB.vx = (nodeB.vx || 0) + fx
          nodeB.vy = (nodeB.vy || 0) + fy
        }
      }
    }

    // Attraction along edges
    simEdges.forEach((edge) => {
      const sourceNode = simNodes.find((n) => n.id === edge.source)
      const targetNode = simNodes.find((n) => n.id === edge.target)
      if (!sourceNode || !targetNode) return

      const dx = (targetNode.x || 0) - (sourceNode.x || 0)
      const dy = (targetNode.y || 0) - (sourceNode.y || 0)
      const distance = Math.sqrt(dx * dx + dy * dy) || 1

      const force = distance * ATTRACTION_STRENGTH
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force

      if (!sourceNode.pinned) {
        sourceNode.vx = (sourceNode.vx || 0) + fx
        sourceNode.vy = (sourceNode.vy || 0) + fy
      }
      if (!targetNode.pinned) {
        targetNode.vx = (targetNode.vx || 0) - fx
        targetNode.vy = (targetNode.vy || 0) - fy
      }
    })

    // Center gravity
    simNodes.forEach((node) => {
      if (!node.pinned) {
        const dx = centerX - (node.x || 0)
        const dy = centerY - (node.y || 0)
        node.vx = (node.vx || 0) + dx * CENTER_GRAVITY
        node.vy = (node.vy || 0) + dy * CENTER_GRAVITY
      }
    })

    // Apply velocities and damping
    simNodes.forEach((node) => {
      if (!node.pinned) {
        const vx = (node.vx || 0) * DAMPING
        const vy = (node.vy || 0) * DAMPING
        node.x = (node.x || 0) + vx
        node.y = (node.y || 0) + vy
        node.vx = vx
        node.vy = vy
        totalMovement += Math.abs(vx) + Math.abs(vy)
      }
    })

    // Slow down simulation when stable
    if (totalMovement < 0.1) {
      simulationActiveRef.current = false
    }
  }, [])

  // Easing function for smooth zoom animation
  const easeOutCubic = useCallback((t: number): number => 1 - Math.pow(1 - t, 3), [])

  // Process zoom animation in render loop
  const processZoomAnimation = useCallback(() => {
    const anim = zoomAnimationRef.current
    if (!anim || !anim.active) return

    const elapsed = performance.now() - anim.startTime
    const progress = Math.min(1, elapsed / anim.duration)
    const eased = easeOutCubic(progress)

    const newViewport = {
      x: anim.startViewport.x + (anim.targetViewport.x - anim.startViewport.x) * eased,
      y: anim.startViewport.y + (anim.targetViewport.y - anim.startViewport.y) * eased,
      zoom: anim.startViewport.zoom + (anim.targetViewport.zoom - anim.startViewport.zoom) * eased,
    }

    setViewport(newViewport)

    if (progress >= 1) {
      zoomAnimationRef.current = null
    }
  }, [easeOutCubic])

  // Draw a star shape
  const drawStar = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      color: string,
      rotation: number,
      pulse: number,
    ) => {
      const points = 4
      const innerRadius = radius * 0.4
      const outerRadius = radius * (1 + pulse * 0.3)

      ctx.beginPath()
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / points + rotation
        const px = x + Math.cos(angle) * r
        const py = y + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()

      // Add a soft glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, outerRadius * 1.5)
      gradient.addColorStop(0, `${color}40`)
      gradient.addColorStop(1, `${color}00`)
      ctx.beginPath()
      ctx.arc(x, y, outerRadius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    },
    [],
  )

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    })
    resizeObserver.observe(container)

    function render() {
      if (!ctx || !canvas) return

      frameCountRef.current++
      const frame = frameCountRef.current

      // Process zoom animation
      processZoomAnimation()

      // Run simulation step
      if (simulationActiveRef.current || frame % 3 === 0) {
        runSimulationStep()
      }

      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)
      const vp = viewportRef.current

      // Background
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height),
      )
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, COLOR_BACKGROUND)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Static star field
      ctx.fillStyle = 'rgba(103, 232, 249, 0.02)'
      for (let i = 0; i < 80; i++) {
        const sx = (i * 137.5 + 50) % width
        const sy = (i * 89.3 + 30) % height
        ctx.beginPath()
        ctx.arc(sx, sy, 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.save()
      ctx.translate(vp.x, vp.y)
      ctx.scale(vp.zoom, vp.zoom)

      const currentNodes = nodesRef.current
      const currentEdges = edgesRef.current

      // Update pulsing nodes periodically
      if (frame % 60 === 0) {
        pulsingNodesRef.current.clear()
        const shuffled = [...currentNodes].sort(() => Math.random() - 0.5)
        shuffled.slice(0, PULSE_NODES_COUNT).forEach((n) => pulsingNodesRef.current.add(n.id))
      }

      // Draw edges
      currentEdges.forEach((edge) => {
        const sourceNode = currentNodes.find((n) => n.id === edge.source)
        const targetNode = currentNodes.find((n) => n.id === edge.target)
        if (!sourceNode || !targetNode) return

        const isHighlighted =
          highlightedNode &&
          (edge.source === highlightedNode || edge.target === highlightedNode)
        const isDetailNode =
          detailPanel.node &&
          (edge.source === detailPanel.node.id || edge.target === detailPanel.node.id)

        // Determine edge color based on lexicon type
        const lexicon = edge.lexicon || ''
        let edgeColor: string
        let edgeColorDim: string
        if (lexicon.includes('follow')) {
          edgeColor = COLOR_EDGE_FOLLOW
          edgeColorDim = COLOR_EDGE_FOLLOW_DIM
        } else if (lexicon.includes('reply')) {
          edgeColor = COLOR_EDGE_REPLY
          edgeColorDim = COLOR_EDGE_REPLY_DIM
        } else {
          edgeColor = COLOR_EDGE_MENTION
          edgeColorDim = COLOR_EDGE_MENTION_DIM
        }

        // Draw glow for highlighted edges
        if (isHighlighted || isDetailNode) {
          ctx.beginPath()
          ctx.moveTo(sourceNode.x || 0, sourceNode.y || 0)
          ctx.lineTo(targetNode.x || 0, targetNode.y || 0)
          ctx.strokeStyle = `${edgeColor}40`
          ctx.lineWidth = (EDGE_WIDTH_HIGHLIGHTED * 3) / vp.zoom
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.moveTo(sourceNode.x || 0, sourceNode.y || 0)
        ctx.lineTo(targetNode.x || 0, targetNode.y || 0)
        ctx.strokeStyle = isHighlighted || isDetailNode ? edgeColor : edgeColorDim
        ctx.lineWidth = ((isHighlighted || isDetailNode) ? EDGE_WIDTH_HIGHLIGHTED : EDGE_WIDTH) / vp.zoom
        ctx.stroke()
      })

      // Determine which nodes get labels
      const labelNodes = new Set<string>()
      if (highlightedNode) labelNodes.add(highlightedNode)
      if (detailPanel.node) labelNodes.add(detailPanel.node.id)
      // Add expanded nodes
      currentNodes.filter((n) => n.expanded).forEach((n) => labelNodes.add(n.id))
      // Fill remaining slots with random selection, prioritizing central nodes
      const remaining = currentNodes
        .filter((n) => !labelNodes.has(n.id))
        .sort((a, b) => {
          const aDist = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2)
          const bDist = Math.sqrt((b.x || 0) ** 2 + (b.y || 0) ** 2)
          return aDist - bDist
        })
      remaining.slice(0, Math.max(0, LABELS_TO_SHOW - labelNodes.size)).forEach((n) => labelNodes.add(n.id))

      // Draw nodes
      currentNodes.forEach((node) => {
        const isHighlighted = node.id === highlightedNode
        const isDetailNode = detailPanel.node?.id === node.id
        const isExpanded = node.expanded
        const isPulsing = pulsingNodesRef.current.has(node.id)
        const isConnectedToHighlighted =
          highlightedNode &&
          currentEdges.some(
            (e) =>
              (e.source === highlightedNode && e.target === node.id) ||
              (e.target === highlightedNode && e.source === node.id),
          )

        let radius = NODE_RADIUS
        if (isHighlighted || isDetailNode) radius = NODE_RADIUS_HIGHLIGHTED
        else if (isExpanded) radius = NODE_RADIUS_EXPANDED
        radius = radius / vp.zoom

        let color = COLOR_NODE_DIM
        if (isHighlighted || isDetailNode) {
          color = COLOR_NODE_HIGHLIGHTED
        } else if (isConnectedToHighlighted) {
          color = COLOR_NODE_EXPANDED
        } else if (isExpanded) {
          color = COLOR_NODE_EXPANDED
        } else if (!highlightedNode && !detailPanel.node) {
          color = COLOR_NODE_DEFAULT
        }

        // Calculate pulse
        const pulseTime = frame * 0.05
        const pulse = isPulsing ? Math.sin(pulseTime + (node.pulsePhase || 0)) * 0.5 + 0.5 : 0
        const rotation = (node.starRotation || 0) + frame * 0.002

        drawStar(ctx, node.x || 0, node.y || 0, radius, color, rotation, pulse)

        // Label
        if (labelNodes.has(node.id) && vp.zoom > 0.3) {
          const fontSize = Math.max(7, 9 / vp.zoom)
          ctx.font = `${fontSize}px ${FONT_STACK}`
          ctx.fillStyle = isHighlighted || isDetailNode ? COLOR_LABEL : COLOR_LABEL_DIM
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          const label = node.handle || node.label
          const shortLabel = label.length > 16 ? label.slice(0, 14) + '...' : label
          ctx.fillText(shortLabel, node.x || 0, (node.y || 0) + radius + 4 / vp.zoom)
        }
      })

      ctx.restore()
      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(animationRef.current)
    }
  }, [highlightedNode, detailPanel.node, runSimulationStep, drawStar, processZoomAnimation])

  // Screen to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): [number, number] => {
    const vp = viewportRef.current
    return [(screenX - vp.x) / vp.zoom, (screenY - vp.y) / vp.zoom]
  }, [])

  // Find node at position
  const findNodeAt = useCallback((worldX: number, worldY: number): GraphNode | null => {
    const vp = viewportRef.current
    const radius = NODE_RADIUS_HIGHLIGHTED / vp.zoom

    for (const node of nodesRef.current) {
      const dx = (node.x || 0) - worldX
      const dy = (node.y || 0) - worldY
      if (dx * dx + dy * dy < radius * radius * 4) {
        return node
      }
    }
    return null
  }, [])

  // Get edges for a node
  const getNodeEdges = useCallback((nodeId: string): GraphEdge[] => {
    return edgesRef.current.filter((e) => e.source === nodeId || e.target === nodeId)
  }, [])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    const [worldX, worldY] = screenToWorld(screenX, screenY)
    const clickedNode = findNodeAt(worldX, worldY)

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startViewportX: viewportRef.current.x,
      startViewportY: viewportRef.current.y,
      draggedNode: clickedNode,
    }

    if (clickedNode) {
      clickedNode.pinned = true
    }

    setHoverNode({ node: null, x: 0, y: 0 })
  }, [screenToWorld, findNodeAt])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const drag = dragRef.current

    if (drag.isDragging) {
      const dx = (e.clientX - drag.startX) * DRAG_SENSITIVITY
      const dy = (e.clientY - drag.startY) * DRAG_SENSITIVITY

      if (drag.draggedNode) {
        const vp = viewportRef.current
        drag.draggedNode.x = (drag.draggedNode.x || 0) + dx / vp.zoom
        drag.draggedNode.y = (drag.draggedNode.y || 0) + dy / vp.zoom
        drag.startX = e.clientX
        drag.startY = e.clientY
        simulationActiveRef.current = true
      } else {
        setViewport((prev) => ({
          ...prev,
          x: drag.startViewportX + dx,
          y: drag.startViewportY + dy,
        }))
      }
      setHoverNode({ node: null, x: 0, y: 0 })
    } else {
      // Hover detection
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      const [worldX, worldY] = screenToWorld(screenX, screenY)
      const hoveredNode = findNodeAt(worldX, worldY)

      if (hoveredNode && hoveredNode.id !== detailPanel.node?.id) {
        setHoverNode({
          node: hoveredNode,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      } else {
        setHoverNode({ node: null, x: 0, y: 0 })
      }
    }
  }, [screenToWorld, findNodeAt, detailPanel.node])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current
    const wasDragging = Math.abs(e.clientX - drag.startX) > 5 || Math.abs(e.clientY - drag.startY) > 5

    if (drag.draggedNode) {
      drag.draggedNode.pinned = false

      if (!wasDragging) {
        // Click on node - open detail panel
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const nodeEdges = getNodeEdges(drag.draggedNode.id)
          setDetailPanel({
            visible: true,
            node: drag.draggedNode,
            edges: nodeEdges,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          })
          setHoverNode({ node: null, x: 0, y: 0 })
          onNodeClick?.(drag.draggedNode)
        }
      }
    } else if (!wasDragging) {
      // Click on empty space - close detail panel
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const screenX = e.clientX - rect.left
        const screenY = e.clientY - rect.top
        const [worldX, worldY] = screenToWorld(screenX, screenY)
        const clickedNode = findNodeAt(worldX, worldY)

        if (clickedNode) {
          const nodeEdges = getNodeEdges(clickedNode.id)
          setDetailPanel({
            visible: true,
            node: clickedNode,
            edges: nodeEdges,
            x: screenX,
            y: screenY,
          })
          onNodeClick?.(clickedNode)
        } else {
          setDetailPanel({ visible: false, node: null, edges: [], x: 0, y: 0 })
        }
      }
    }

    dragRef.current = {
      isDragging: false,
      startX: 0,
      startY: 0,
      startViewportX: 0,
      startViewportY: 0,
      draggedNode: null,
    }
  }, [onNodeClick, screenToWorld, findNodeAt, getNodeEdges])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    e.stopPropagation()

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setViewport((prev) => {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev.zoom * zoomFactor))
      const zoomRatio = newZoom / prev.zoom
      return {
        x: mouseX - (mouseX - prev.x) * zoomRatio,
        y: mouseY - (mouseY - prev.y) * zoomRatio,
        zoom: newZoom,
      }
    })
  }, [])

  // Animate zoom to a target, focusing on a specific point
  const animateZoomTo = useCallback(
    (targetZoom: number, focusNodeId?: string | null) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)
      const centerX = width / 2
      const centerY = height / 2

      // Find the focus point - highlighted node, or first expanded node, or center
      let focusX = centerX
      let focusY = centerY

      const focusId = focusNodeId || highlightedNode
      if (focusId) {
        const focusNode = nodesRef.current.find((n) => n.id === focusId)
        if (focusNode && focusNode.x !== undefined && focusNode.y !== undefined) {
          focusX = focusNode.x
          focusY = focusNode.y
        }
      } else {
        // Fall back to first expanded node
        const expandedNode = nodesRef.current.find((n) => n.expanded)
        if (expandedNode && expandedNode.x !== undefined && expandedNode.y !== undefined) {
          focusX = expandedNode.x
          focusY = expandedNode.y
        }
      }

      const current = viewportRef.current
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, targetZoom))

      // Calculate new viewport position to keep focus point centered
      const targetX = centerX - focusX * newZoom
      const targetY = centerY - focusY * newZoom

      zoomAnimationRef.current = {
        active: true,
        startTime: performance.now(),
        startViewport: { ...current },
        targetViewport: { x: targetX, y: targetY, zoom: newZoom },
        duration: 300,
      }
    },
    [highlightedNode],
  )

  const handleZoomIn = useCallback(() => {
    const currentZoom = viewportRef.current.zoom
    animateZoomTo(currentZoom * 1.4)
  }, [animateZoomTo])

  const handleZoomOut = useCallback(() => {
    const currentZoom = viewportRef.current.zoom
    animateZoomTo(currentZoom / 1.4)
  }, [animateZoomTo])

  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && onInputSubmit) {
      onInputSubmit(inputValue.trim())
      setInputValue('')
      setInputExpanded(false)
      simulationActiveRef.current = true
    }
  }, [inputValue, onInputSubmit])

  const handleExpandNetwork = useCallback(() => {
    if (detailPanel.node && onExpandNode) {
      onExpandNode(detailPanel.node)
      simulationActiveRef.current = true
    }
  }, [detailPanel.node, onExpandNode])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={(e) => {
          handleMouseUp(e)
          setHoverNode({ node: null, x: 0, y: 0 })
        }}
        onWheel={handleWheel}
        className="cursor-grab active:cursor-grabbing"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded bg-slate-800/80 text-cyan-400 ring-1 ring-cyan-900 hover:bg-slate-700/80"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded bg-slate-800/80 text-cyan-400 ring-1 ring-cyan-900 hover:bg-slate-700/80"
        >
          <span className="text-lg font-bold">−</span>
        </button>
      </div>

      {/* Handle input overlay */}
      <div className="absolute left-4 top-4">
        {inputExpanded ? (
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="handle.bsky.social"
              autoFocus
              className="w-48 rounded bg-slate-800/90 px-3 py-1.5 font-mono text-sm text-cyan-100 placeholder-cyan-800 ring-1 ring-cyan-900 focus:outline-none focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="rounded bg-cyan-600 px-3 py-1.5 font-mono text-sm text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {loading ? '...' : 'Go'}
            </button>
            <button
              type="button"
              onClick={() => setInputExpanded(false)}
              className="rounded bg-slate-700 px-2 py-1.5 text-sm text-slate-400 hover:bg-slate-600"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setInputExpanded(true)}
            className="flex items-center gap-2 rounded bg-slate-800/80 px-3 py-1.5 font-mono text-sm text-cyan-400 ring-1 ring-cyan-900 hover:bg-slate-700/80"
          >
            <span>@</span>
            <span className="text-cyan-600">explore handle...</span>
          </button>
        )}
      </div>

      {/* Stats overlay */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 font-mono text-xs text-cyan-700">
          {nodes.length} nodes · {edges.length} edges
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded bg-slate-800/80 px-3 py-1.5 font-mono text-sm text-cyan-400">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          Loading...
        </div>
      )}

      {/* Hover tooltip (lightweight) */}
      {hoverNode.node && !detailPanel.visible && (
        <div
          className="pointer-events-none absolute z-40 rounded bg-slate-900/95 px-2 py-1 font-mono text-sm text-cyan-300 ring-1 ring-cyan-800"
          style={{ left: hoverNode.x + 12, top: hoverNode.y + 12 }}
        >
          @{hoverNode.node.handle || hoverNode.node.label}
          <span className="ml-2 text-cyan-700">click for details</span>
        </div>
      )}

      {/* Detail panel (persistent on click) */}
      {detailPanel.visible && detailPanel.node && (
        <div
          className="absolute z-50 w-72 rounded-lg bg-slate-900 p-4 ring-1 ring-cyan-700 shadow-xl"
          style={{
            left: Math.min(detailPanel.x + 12, (containerRef.current?.clientWidth || 400) - 300),
            top: Math.min(detailPanel.y + 12, (containerRef.current?.clientHeight || 400) - 250),
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <a
                href={`https://bsky.app/profile/${detailPanel.node.handle || detailPanel.node.label}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-base font-medium text-cyan-200 hover:text-cyan-100 hover:underline"
              >
                @{detailPanel.node.handle || detailPanel.node.label}
              </a>
              <div className="mt-0.5 font-mono text-xs text-slate-500">
                {detailPanel.node.id.slice(0, 28)}...
              </div>
            </div>
            <button
              onClick={() => setDetailPanel({ visible: false, node: null, edges: [], x: 0, y: 0 })}
              className="text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          {detailPanel.edges.length > 0 && (
            <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto border-t border-slate-700 pt-3">
              {detailPanel.edges.slice(0, 12).map((edge, i) => {
                const otherNodeId = edge.source === detailPanel.node?.id ? edge.target : edge.source
                const otherNode = nodesRef.current.find((n) => n.id === otherNodeId)
                const otherHandle = otherNode?.handle || otherNodeId.slice(8, 20)
                const lexiconType = edge.lexicon?.split('.').pop() || 'link'
                const isFollow = edge.lexicon?.includes('follow')
                const isReply = edge.lexicon?.includes('reply')
                return (
                  <div key={i} className="flex items-center gap-2 font-mono text-xs">
                    <span className={isFollow ? 'text-green-500' : isReply ? 'text-purple-400' : 'text-purple-500'}>
                      {lexiconType}
                    </span>
                    <span className="text-slate-600">→</span>
                    <a
                      href={`https://bsky.app/profile/${otherHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      {otherHandle}
                    </a>
                  </div>
                )
              })}
              {detailPanel.edges.length > 12 && (
                <div className="text-xs text-slate-600">+{detailPanel.edges.length - 12} more</div>
              )}
            </div>
          )}

          <button
            onClick={handleExpandNetwork}
            disabled={loading || detailPanel.node.expanded}
            className="mt-3 w-full rounded bg-cyan-700 py-2 font-mono text-sm text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {detailPanel.node.expanded ? 'Already expanded' : 'Expand network →'}
          </button>
        </div>
      )}
    </div>
  )
}
