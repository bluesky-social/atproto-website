'use client'

import React, { useRef, useEffect, useState } from 'react'

type SparklineProps = {
  data: number[]
}

const Sparkline: React.FC<SparklineProps> = ({ data }) => {
  // Reference to the container element that is changeable
  const containerRef = useRef<HTMLDivElement>(null)
  // Current dimensions for the chart
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Create effect to run when component mounts
  useEffect(() => {
    const container = containerRef.current

    // Do nothing if there is no element
    if (!container) return

    const updateDimensions = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    }

    // Set initial dimensions
    updateDimensions()

    // Create the observer and subscribe to container's changes
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(container)

    return () => {
      // Disconnect when the component unmounts
      resizeObserver.disconnect()
    }
  }, [])

  // Don't render the chart for less than 2 points
  if (!data || data.length < 2) return null

  // Calculate the min and max values of the data
  const min = Math.min(...data)
  const max = Math.max(...data)

  // Construct the points string with the simple mapping
  // Scales are [0, length] -> [0, width] and [min, max] -> [0, height]
  const { width, height } = dimensions
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = ((value - min) / (max - min)) * height

      return `${x},${height - y}`
    })
    .join(' ')

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          className="fill-none stroke-current stroke-2"
          points={points}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export default Sparkline
