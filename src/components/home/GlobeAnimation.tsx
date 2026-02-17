'use client'

import { useRef, useEffect, useState } from 'react'

// ============ CONFIGURABLE CONSTANTS ============
const DEFAULT_LINES = 25
const TILE_SIZE = 2 // 2x2 pixel tiles, each producing 2 characters
const RENDER_SCALE = 4 // Render at higher resolution for box filtering (1 = no filtering)
const TEXTURE_PATH = '/globe/solidmap.webp'
const TEXTURE_COLOR_PATH = '/globe/globe-texture.png'
const ROTATION_SPEED = 0.001
const DRAG_SENSITIVITY = 0.01
const SHOW_WEBGL_CANVAS = false
const AXIAL_TILT_X = -8 * (Math.PI / 180) // Earth's axial tilt in radians (towards camera)
const AXIAL_TILT_Z = 0 // Counterclockwise rotation in view plane -- was originally (15 * (Math.PI / 180)) which gave a slight offset
const CAMERA_FOV = 0.1
const SPHERE_SCALE = 0.14 // Scale factor for the sphere (1 = default size)
const OUTLINE_SCALE = 1.025 // Scale multiplier for the outline sphere (relative to SPHERE_SCALE)
const TEXTURE_OPACITY = 0.2
const ASCII_VISIBLE_THRESHOLD = 64 // how "bright" does a pixel need to be to register on the ascii map

// ASCII characters for 1×2 vertical binary patterns
// Index = bit pattern: top(2) + bottom(1)
const ASCII_MAP = [
  ' ', // 00 - empty
  '.', // 01 - bottom only
  "'", // 10 - top only
  '#', // 11 - full
]

// ============ SHADER SOURCES ============
const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec3 aPosition;
in vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
}
`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;

uniform sampler2D uTexture;

out vec4 fragColor;

void main() {
  float land = texture(uTexture, vTexCoord).r;
  // Black in texture = land (opaque), White = water (transparent)
  float alpha = 1.0 - land;
  fragColor = vec4(1.0, 1.0, 1.0, alpha);
}
`

const COLOR_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;

uniform sampler2D uTexture;

out vec4 fragColor;

void main() {
  fragColor = texture(uTexture, vTexCoord);
}
`

const SOLID_FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`

// ============ MATH UTILITIES ============
function multiplyMatrices(
  a: Float32Array,
  b: Float32Array,
): Float32Array<ArrayBuffer> {
  const result = new Float32Array(16)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      result[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3]
    }
  }
  return result
}

function createRotationMatrix(
  axisX: number,
  axisY: number,
  axisZ: number,
  angle: number,
): Float32Array {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const t = 1 - c

  // Normalize axis
  const len = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ)
  const x = axisX / len
  const y = axisY / len
  const z = axisZ / len

  return new Float32Array([
    t * x * x + c,
    t * x * y + s * z,
    t * x * z - s * y,
    0,
    t * x * y - s * z,
    t * y * y + c,
    t * y * z + s * x,
    0,
    t * x * z + s * y,
    t * y * z - s * x,
    t * z * z + c,
    0,
    0,
    0,
    0,
    1,
  ])
}

function createPerspectiveMatrix(
  fov: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array {
  const f = 1.0 / Math.tan(fov / 2)
  const nf = 1 / (near - far)
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ])
}

function createModelViewMatrix(
  rotationMatrix: Float32Array,
  scaleMultiplier: number = 1,
): Float32Array {
  // Apply initial axial tilt
  const tiltX = createRotationMatrix(1, 0, 0, -AXIAL_TILT_X)
  const tiltZ = createRotationMatrix(0, 0, 1, AXIAL_TILT_Z)
  const tiltMatrix = multiplyMatrices(tiltZ, tiltX)

  // Combine tilt with user rotation
  const combined = multiplyMatrices(tiltMatrix, rotationMatrix)

  // Add scale and translation to push sphere back
  const s = SPHERE_SCALE * scaleMultiplier
  return new Float32Array([
    combined[0] * s,
    combined[1] * s,
    combined[2] * s,
    0,
    combined[4] * s,
    combined[5] * s,
    combined[6] * s,
    0,
    combined[8] * s,
    combined[9] * s,
    combined[10] * s,
    0,
    0,
    0,
    -3,
    1,
  ])
}

// ============ UV SPHERE GENERATION ============
function createUVSphere(latSegments: number, lonSegments: number) {
  const vertices: number[] = []
  const texCoords: number[] = []
  const indices: number[] = []

  for (let lat = 0; lat <= latSegments; lat++) {
    const theta = (lat * Math.PI) / latSegments
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let lon = 0; lon <= lonSegments; lon++) {
      const phi = (lon * 2 * Math.PI) / lonSegments
      const sinPhi = Math.sin(phi)
      const cosPhi = Math.cos(phi)

      const x = -cosPhi * sinTheta // Negated to fix winding order
      const y = cosTheta
      const z = sinPhi * sinTheta

      vertices.push(x, y, z)
      texCoords.push(lon / lonSegments, lat / latSegments)
    }
  }

  for (let lat = 0; lat < latSegments; lat++) {
    for (let lon = 0; lon < lonSegments; lon++) {
      const first = lat * (lonSegments + 1) + lon
      const second = first + lonSegments + 1

      indices.push(first, second, first + 1)
      indices.push(second, second + 1, first + 1)
    }
  }

  return {
    vertices: new Float32Array(vertices),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices),
  }
}

// ============ WEBGL UTILITIES ============
function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${error}`)
  }

  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${error}`)
  }

  return program
}

function loadTexture(
  gl: WebGL2RenderingContext,
  url: string,
): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const texture = gl.createTexture()!
    const image = new Image()

    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      resolve(texture)
    }

    image.onerror = () => reject(new Error(`Failed to load texture: ${url}`))
    image.src = url
  })
}

// ============ ASCII CONVERSION ============
// For a 2x2 pixel tile, we produce 2 characters:
//   [TL] [TR]  →  char1 (based on TL, BL)   char2 (based on TR, BR)
//   [BL] [BR]
// Each character uses the 4-symbol map based on its top/bottom pixel
// When RENDER_SCALE > 1, we box-filter (average) each scaled pixel block
function convertToAscii(
  pixels: Uint8Array,
  width: number,
  height: number,
  outputLines: number,
): string {
  const outputWidth = outputLines * TILE_SIZE
  const outputHeight = outputLines * TILE_SIZE

  // Box filter: average alpha values over RENDER_SCALE x RENDER_SCALE blocks
  const getAveragedAlpha = (outX: number, outY: number): number => {
    let sum = 0
    for (let sy = 0; sy < RENDER_SCALE; sy++) {
      for (let sx = 0; sx < RENDER_SCALE; sx++) {
        const srcX = outX * RENDER_SCALE + sx
        const srcY = outY * RENDER_SCALE + sy
        const srcIndex = ((height - 1 - srcY) * width + srcX) * 4 + 3 // +3 for alpha, flip Y
        sum += pixels[srcIndex]
      }
    }
    return sum / (RENDER_SCALE * RENDER_SCALE)
  }

  const lines: string[] = []

  // Number of 2x2 tiles in output
  const tilesX = outputWidth / TILE_SIZE
  const tilesY = outputHeight / TILE_SIZE

  for (let ty = 0; ty < tilesY; ty++) {
    let line = ''
    for (let tx = 0; tx < tilesX; tx++) {
      const baseY = ty * TILE_SIZE
      const baseX = tx * TILE_SIZE

      // Get averaged alpha for each of the 4 pixels in the tile
      const tl = getAveragedAlpha(baseX, baseY) > ASCII_VISIBLE_THRESHOLD
      const tr = getAveragedAlpha(baseX + 1, baseY) > ASCII_VISIBLE_THRESHOLD
      const bl = getAveragedAlpha(baseX, baseY + 1) > ASCII_VISIBLE_THRESHOLD
      const br =
        getAveragedAlpha(baseX + 1, baseY + 1) > ASCII_VISIBLE_THRESHOLD

      // Left character: top=TL, bottom=BL
      const leftPattern = (tl ? 2 : 0) | (bl ? 1 : 0)
      // Right character: top=TR, bottom=BR
      const rightPattern = (tr ? 2 : 0) | (br ? 1 : 0)

      let charL = ASCII_MAP[leftPattern]
      let charR = ASCII_MAP[rightPattern]

      // add "glitch"
      // if (charR === 'M') {
      //   if (tx % 3 === 0 && ty % 8 === 0 && charL === 'M') {
      //     charR = 'M '
      //   }
      // }

      line += charL + charR
    }
    lines.push(line)
  }

  return lines.join('\n')
}

const MONOSPACE_FONT_STACK = [
  '"IBM Plex Mono"', // preferred (matches original design)
  '"Cascadia Mono"', // Windows 11+
  '"SF Mono"', // macOS / iOS
  '"Fira Mono"', // common Linux / web
  '"Roboto Mono"', // Android / Google
  '"Source Code Pro"', // Adobe, widely installed
  '"JetBrains Mono"', // popular dev font
  '"Consolas"', // Windows
  '"Menlo"', // macOS
  '"Liberation Mono"', // Linux
  '"DejaVu Sans Mono"', // Linux
  '"Courier New"', // universal fallback
  'monospace', // generic keyword — last resort
].join(', ')

// ============ MAIN COMPONENT ============
interface GlobeProps {
  lines?: number
}

export function GlobeAnimation({ lines = DEFAULT_LINES }: GlobeProps) {
  const canvasSize = lines * TILE_SIZE * RENDER_SCALE
  const charsPerLine = lines * TILE_SIZE
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textureCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const [asciiText, setAsciiText] = useState('')
  const [preSize, setPreSize] = useState({ width: 0, height: 0 })

  // Measure the pre element to size the texture canvas
  useEffect(() => {
    const pre = preRef.current
    if (!pre) return

    const updateSize = () => {
      const rect = pre.getBoundingClientRect()
      setPreSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })
    }

    // Initial measurement after fonts load
    if (document.fonts.ready) {
      document.fonts.ready.then(updateSize)
    } else {
      updateSize()
    }

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(pre)

    return () => resizeObserver.disconnect()
  }, [])

  // Shared rotation matrix ref for both canvases
  const rotationMatrixRef = useRef(
    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  )
  const isDraggingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      preserveDrawingBuffer: true,
    })
    if (!gl) {
      console.error('WebGL2 not supported')
      return
    }

    let animationId: number
    let lastMouseX = 0
    let lastMouseY = 0

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      lastMouseX = e.clientX
      lastMouseY = e.clientY
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return

      const deltaX = e.clientX - lastMouseX
      const deltaY = e.clientY - lastMouseY
      lastMouseX = e.clientX
      lastMouseY = e.clientY

      // Horizontal drag -> rotate around Y axis
      if (deltaX !== 0) {
        const rotY = createRotationMatrix(0, 1, 0, deltaX * DRAG_SENSITIVITY)
        rotationMatrixRef.current = multiplyMatrices(
          rotY,
          rotationMatrixRef.current,
        )
      }

      // Vertical drag -> rotate around X axis
      if (deltaY !== 0) {
        const rotX = createRotationMatrix(1, 0, 0, deltaY * DRAG_SENSITIVITY)
        rotationMatrixRef.current = multiplyMatrices(
          rotX,
          rotationMatrixRef.current,
        )
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const handleMouseLeave = () => {
      isDraggingRef.current = false
    }

    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseLeave)

    const init = async () => {
      // Compile shaders and create programs
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
      const fragmentShader = compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        FRAGMENT_SHADER,
      )
      const solidFragmentShader = compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        SOLID_FRAGMENT_SHADER,
      )

      const program = createProgram(gl, vertexShader, fragmentShader)
      const outlineProgram = createProgram(
        gl,
        vertexShader,
        solidFragmentShader,
      )

      // Get locations for main program
      const aPosition = gl.getAttribLocation(program, 'aPosition')
      const aTexCoord = gl.getAttribLocation(program, 'aTexCoord')
      const uModelViewMatrix = gl.getUniformLocation(
        program,
        'uModelViewMatrix',
      )
      const uProjectionMatrix = gl.getUniformLocation(
        program,
        'uProjectionMatrix',
      )
      const uTexture = gl.getUniformLocation(program, 'uTexture')

      // Get locations for outline program
      const outlineAPosition = gl.getAttribLocation(outlineProgram, 'aPosition')
      const outlineUModelViewMatrix = gl.getUniformLocation(
        outlineProgram,
        'uModelViewMatrix',
      )
      const outlineUProjectionMatrix = gl.getUniformLocation(
        outlineProgram,
        'uProjectionMatrix',
      )

      // Create sphere geometry
      const sphere = createUVSphere(32, 64)

      // Create buffers
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW)

      const texCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.texCoords, gl.STATIC_DRAW)

      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW)

      // Create VAO for main program
      const vao = gl.createVertexArray()
      gl.bindVertexArray(vao)

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.enableVertexAttribArray(aTexCoord)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

      // Create VAO for outline program (only needs position)
      const outlineVao = gl.createVertexArray()
      gl.bindVertexArray(outlineVao)

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(outlineAPosition)
      gl.vertexAttribPointer(outlineAPosition, 3, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

      // Load texture
      const texture = await loadTexture(gl, TEXTURE_PATH)

      // Set up GL state
      gl.enable(gl.DEPTH_TEST)
      // gl.enable(gl.CULL_FACE);
      // gl.cullFace(gl.BACK);
      gl.clearColor(0, 0, 0, 0)

      // Create projection matrix
      const projectionMatrix = createPerspectiveMatrix(
        CAMERA_FOV,
        1, // aspect ratio
        0.1,
        100,
      )

      // Pixel buffer for reading
      const pixels = new Uint8Array(canvasSize * canvasSize * 4)
      const oldPixels = new Uint8Array(canvasSize * canvasSize * 4)

      const render = () => {
        // Auto-spin when not dragging
        if (!isDraggingRef.current) {
          const autoRotation = createRotationMatrix(0, 1, 0, ROTATION_SPEED)
          rotationMatrixRef.current = multiplyMatrices(
            autoRotation,
            rotationMatrixRef.current,
          )
        }

        gl.viewport(0, 0, canvasSize, canvasSize)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Pass 1: Draw outline (larger sphere, solid white)
        gl.useProgram(outlineProgram)
        const outlineModelViewMatrix = createModelViewMatrix(
          rotationMatrixRef.current,
          OUTLINE_SCALE,
        )
        gl.uniformMatrix4fv(
          outlineUModelViewMatrix,
          false,
          outlineModelViewMatrix,
        )
        gl.uniformMatrix4fv(outlineUProjectionMatrix, false, projectionMatrix)
        gl.bindVertexArray(outlineVao)
        gl.drawElements(
          gl.TRIANGLES,
          sphere.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        )

        // Clear depth buffer so main sphere draws on top
        gl.clear(gl.DEPTH_BUFFER_BIT)

        // Pass 2: Draw main sphere with texture
        gl.useProgram(program)
        const modelViewMatrix = createModelViewMatrix(rotationMatrixRef.current)
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix)
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix)

        // Bind texture
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(uTexture, 0)

        // Draw
        gl.bindVertexArray(vao)
        gl.drawElements(
          gl.TRIANGLES,
          sphere.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        )

        // Read pixels
        gl.readPixels(
          0,
          0,
          canvasSize,
          canvasSize,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels,
        )

        // Average the new values into the old ones
        for (let i = 0; i < pixels.length; i++) {
          pixels[i] = oldPixels[i] * 0.99 + pixels[i] * 0.01
        }
        oldPixels.set(pixels)

        // Convert to ascii
        const ascii = convertToAscii(pixels, canvasSize, canvasSize, lines)
        setAsciiText(ascii)

        animationId = requestAnimationFrame(render)
      }

      render()
    }

    init().catch(console.error)

    return () => {
      cancelAnimationFrame(animationId)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [canvasSize, lines])

  // Texture canvas WebGL rendering
  useEffect(() => {
    const textureCanvas = textureCanvasRef.current
    if (!textureCanvas || preSize.width === 0 || preSize.height === 0) return

    // Set canvas resolution to match pre element
    textureCanvas.width = preSize.height /* not width - force square */
    textureCanvas.height = preSize.height

    const gl = textureCanvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
    })
    if (!gl) {
      console.error('WebGL2 not supported for texture canvas')
      return
    }

    let animationId: number

    const init = async () => {
      // Compile shaders and create program
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
      const fragmentShader = compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        COLOR_FRAGMENT_SHADER,
      )
      const program = createProgram(gl, vertexShader, fragmentShader)

      // Get locations
      const aPosition = gl.getAttribLocation(program, 'aPosition')
      const aTexCoord = gl.getAttribLocation(program, 'aTexCoord')
      const uModelViewMatrix = gl.getUniformLocation(
        program,
        'uModelViewMatrix',
      )
      const uProjectionMatrix = gl.getUniformLocation(
        program,
        'uProjectionMatrix',
      )
      const uTexture = gl.getUniformLocation(program, 'uTexture')

      // Create sphere geometry
      const sphere = createUVSphere(32, 64)

      // Create buffers
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW)

      const texCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.texCoords, gl.STATIC_DRAW)

      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW)

      // Create VAO
      const vao = gl.createVertexArray()
      gl.bindVertexArray(vao)

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.enableVertexAttribArray(aTexCoord)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

      // Load color texture
      const texture = await loadTexture(gl, TEXTURE_COLOR_PATH)

      // Set up GL state
      gl.enable(gl.DEPTH_TEST)
      gl.clearColor(0, 0, 0, 0)

      // Create projection matrix (use same aspect ratio as the pre element)
      const projectionMatrix = createPerspectiveMatrix(CAMERA_FOV, 1, 0.1, 100)

      const render = () => {
        gl.viewport(
          0,
          0,
          preSize.height /* not width - force square */,
          preSize.height,
        )
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.useProgram(program)

        // Use the shared rotation matrix
        const modelViewMatrix = createModelViewMatrix(rotationMatrixRef.current)
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix)
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix)

        // Bind texture
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(uTexture, 0)

        // Draw
        gl.bindVertexArray(vao)
        gl.drawElements(
          gl.TRIANGLES,
          sphere.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        )

        animationId = requestAnimationFrame(render)
      }

      render()
    }

    init().catch(console.error)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [preSize.width, preSize.height])

  return (
    <div ref={containerRef} style={{ position: 'relative', cursor: 'grab' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          display: SHOW_WEBGL_CANVAS ? 'block' : 'none',
        }}
      />
      <canvas
        ref={textureCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          opacity: TEXTURE_OPACITY,
        }}
      />
      <pre
        ref={preRef}
        className="text-[8px] text-blue-600 md:text-sm xl:text-base dark:text-yellow-500"
        style={{
          position: 'relative',
          margin: 0,
          padding: 0,
          userSelect: 'none',

          // ── Monospace hardening ──
          // Deep fallback chain so *some* monospace font always loads.
          fontFamily: MONOSPACE_FONT_STACK,
          fontWeight: 'bold',
          lineHeight: 1.2,

          // Lock the width to exactly the character count.
          // `ch` = width of the "0" glyph in the current font, which in
          // any monospace face equals the width of every other glyph.
          width: `${charsPerLine}ch`,

          // Prevent the browser from collapsing runs of spaces or
          // wrapping lines — every character must stay in its grid cell.
          whiteSpace: 'pre',

          // Disable ligatures, kerning, and other OpenType features that
          // could shift glyph widths and break the character grid.
          fontFeatureSettings: '"liga" 0, "clig" 0, "dlig" 0, "kern" 0, "calt" 0',
          fontKerning: 'none',
          fontVariantLigatures: 'none',

          // Prevent iOS / macOS text size inflation on rotation.
          WebkitTextSizeAdjust: 'none',
          textSizeAdjust: 'none',

          // Prevent sub-pixel rendering differences from shifting
          // character positions across platforms.
          textRendering: 'geometricPrecision',
        }}
      >
        {asciiText}
      </pre>
    </div>
  )
}
