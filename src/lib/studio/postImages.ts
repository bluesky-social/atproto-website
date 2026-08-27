/**
 * Inline post images: the filenames they are stored under, the MDX preamble
 * imports that bind them, and the tag the author pastes into the body.
 *
 * A blog post's inline images live beside its `en.mdx` and reach the page as
 * static imports — `import pdsChart from "./pds-chart.png"` in the preamble,
 * `<Image src={pdsChart} alt="…" />` in the body. That indirection is what lets
 * Next size and optimize them, and it is the part that was tedious by hand.
 *
 * Pure string work, no Node built-ins: mirrors ./mdxHeader, and keeps the module
 * safe to import from the studio's client components.
 */
import { slugify } from '@/lib/slugs.mjs'

/** Extensions Next can import as a static image and that we accept on upload. */
export const POST_IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp'] as const
export type PostImageExt = (typeof POST_IMAGE_EXTS)[number]

function asExt(value: string | undefined): PostImageExt | null {
  const v = value?.toLowerCase()
  return v && (POST_IMAGE_EXTS as readonly string[]).includes(v)
    ? (v as PostImageExt)
    : null
}

/**
 * The extension to store a dropped file under, from its name or its MIME type.
 *
 * SVG is deliberately absent. `next/image` will not derive width and height from
 * one, so a static import breaks the layout the other images get for free.
 */
export function imageExtFor(name: string, type: string): PostImageExt | null {
  return asExt(name.split('.').pop()) ?? asExt(type.split('/').pop())
}

/** Basename with the final dot-segment removed: `ep.12.final.png` → `ep.12.final`. */
function basename(name: string): string {
  return name.replace(/\.[^./]*$/, '')
}

/**
 * The filename a dropped image is stored under: slugified, lowercase extension.
 *
 * Slugified rather than taken verbatim because the name ends up inside an import
 * path in the MDX — a space or a paren there needs escaping, and a stray one
 * fails the build rather than the upload.
 *
 * `ext` overrides the extension read from the name, for drops that arrive with
 * the type only in the MIME.
 */
export function sanitizeImageFilename(name: string, ext?: string): string {
  const resolved = asExt(ext) ?? imageExtFor(name, '') ?? 'png'
  let base = slugify(basename(name)) || 'image'
  // `opengraph-image.*` is Next's social-card convention: a file saved there
  // replaces the post's card. An inline image must never land on that name.
  if (base === 'opengraph-image') base = 'opengraph-image-2'
  return `${base}.${resolved}`
}

export type PreambleImport = { identifier: string; file: string }

// Default imports only — those are the ones that bind a name the body can use,
// and the ones whose identifiers a new import must not collide with.
const IMPORT_RE = /^[ \t]*import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"]/gm

export function parsePreambleImports(preamble: string): PreambleImport[] {
  const out: PreambleImport[] = []
  for (const m of preamble.matchAll(IMPORT_RE)) {
    out.push({ identifier: m[1], file: m[2] })
  }
  return out
}

// `header` is the MDX file's own export; the rest would not parse as a binding.
const CONFLICTING_NAMES: ReadonlySet<string> = new Set([
  'header',
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally',
  'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null',
  'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
  'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'await',
])

function camelCase(slug: string): string {
  const [first = '', ...rest] = slug.split('-').filter(Boolean)
  return first + rest.map((w) => w[0].toUpperCase() + w.slice(1)).join('')
}

/**
 * The identifier bound to an image, derived from its filename.
 *
 * `pds-chart.png` → `pdsChart`, matching what the posts written by hand use.
 * `taken` is every identifier the preamble already binds, so a second `chart`
 * becomes `chart2` rather than shadowing the first.
 */
export function identifierFor(filename: string, taken: Iterable<string>): string {
  let name = camelCase(slugify(basename(filename))) || 'image'
  // A leading digit is not a legal identifier, and a reserved word is not a
  // legal binding — both get decorated rather than rejected.
  if (/^\d/.test(name)) name = `img${name[0].toUpperCase()}${name.slice(1)}`
  if (CONFLICTING_NAMES.has(name)) name = `${name}Img`
  const used = new Set(taken)
  if (!used.has(name)) return name
  let n = 2
  while (used.has(`${name}${n}`)) n++
  return `${name}${n}`
}

/**
 * Add the import for `filename` to an MDX preamble.
 *
 * Idempotent by path: re-uploading a file with the same name replaces the bytes
 * in place, and a second import of the same path would not compile — so an
 * already-imported file returns its existing identifier and an untouched
 * preamble.
 *
 * The result always ends with a blank line. `parseMdxFile` splits the file at
 * `export const header`, and MDX requires that separation or the header stops
 * being an ESM export.
 */
export function addPreambleImport(
  preamble: string,
  filename: string,
): { preamble: string; identifier: string } {
  const imports = parsePreambleImports(preamble)
  const file = `./${filename}`
  const existing = imports.find((i) => i.file === file)
  if (existing) return { preamble, identifier: existing.identifier }

  const identifier = identifierFor(
    filename,
    imports.map((i) => i.identifier),
  )
  const lines = preamble.split('\n')
  let last = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^[ \t]*import\s/.test(lines[i])) last = i
  }
  lines.splice(last + 1, 0, `import ${identifier} from "${file}"`)
  return { preamble: `${lines.join('\n').trimEnd()}\n\n`, identifier }
}

/** JSX reads a bare `&` as the start of an entity and a bare `"` as the end of
 * the attribute; both have to be escaped or the post stops parsing. */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/** The tag the author copies into the body. */
export function imageTag(identifier: string, alt: string): string {
  return `<Image src={${identifier}} alt="${escapeAttribute(alt)}" />`
}
