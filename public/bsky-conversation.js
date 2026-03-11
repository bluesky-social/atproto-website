;(function () {
'use strict'

const API = 'https://public.api.bsky.app/xrpc'

// Humanize filters inlined from human-eyes (https://tangled.org/jimray.net/human-eyes)

/**
 * Django-style pluralize: returns the appropriate suffix based on count.
 *   pluralize(1, "y,ies") → "y"
 *   pluralize(2, "y,ies") → "ies"
 *   pluralize(1)          → ""
 *   pluralize(2)          → "s"
 */
function pluralize(value, arg = 's') {
  let singularSuffix, pluralSuffix
  if (arg.includes(',')) {
    ;[singularSuffix, pluralSuffix] = arg.split(',', 2)
  } else {
    singularSuffix = ''
    pluralSuffix = arg
  }
  const n = typeof value !== 'string' && typeof value !== 'number' && typeof value?.length === 'number'
    ? value.length
    : Number(value)
  return n === 1 ? singularSuffix : pluralSuffix
}

/**
 * Converts a large integer to friendly text. Numbers under 1 million
 * are returned with comma formatting.
 *   intword(1200000)  → "1.2 million"
 *   intword(500)      → "500"
 */
const MAGNITUDES = [
  { threshold: 1e18, label: 'quintillion' },
  { threshold: 1e15, label: 'quadrillion' },
  { threshold: 1e12, label: 'trillion' },
  { threshold: 1e9,  label: 'billion' },
  { threshold: 1e6,  label: 'million' },
]

function intword(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value)
  const abs = Math.abs(num)
  for (const { threshold, label } of MAGNITUDES) {
    if (abs >= threshold) {
      const formatted = parseFloat((num / threshold).toFixed(1))
      return `${formatted} ${label}`
    }
  }
  if (Number.isInteger(num)) return num.toLocaleString('en-US')
  return String(num)
}

/**
 * Joins a list into a human-readable string with an Oxford comma.
 *   oxfordComma(["a", "b", "c"])      → "a, b, and c"
 *   oxfordComma(["a", "b", "c"], 2)   → "a, b, and 1 other"
 */
function oxfordComma(items, limit, suffix) {
  if (!Array.isArray(items) || items.length === 0) return ''
  const list = items.map(String)
  if (list.length === 1) return list[0]
  if (list.length === 2 && (limit == null || limit >= 2)) {
    return `${list[0]} and ${list[1]}`
  }
  if (limit != null && limit <= 0) return ''
  if (limit != null && limit < list.length) {
    const shown = list.slice(0, limit)
    const remaining = list.length - limit
    const tail = suffix ?? `and ${remaining} ${remaining === 1 ? 'other' : 'others'}`
    return `${shown.join(', ')}, ${tail}`
  }
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`
}

/**
 * Convert a bsky.app URL to an AT URI.
 * e.g. https://bsky.app/profile/atproto.com/post/3mg6cliy3lc26
 *   → at://atproto.com/app.bsky.feed.post/3mg6cliy3lc26
 */
function toAtUri(url) {
  const m = url.match(
    /bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/
  )
  if (!m) return null
  return `at://${m[1]}/app.bsky.feed.post/${m[2]}`
}

/**
 * Build a bsky.app profile URL from a DID or handle.
 */
function profileUrl(handleOrDid) {
  return `https://bsky.app/profile/${handleOrDid}`
}

/**
 * Build a bsky.app post URL from an AT URI.
 */
function postUrl(atUri) {
  const parts = atUri.replace('at://', '').split('/')
  return `https://bsky.app/profile/${parts[0]}/post/${parts[2]}`
}

/**
 * Format a date string for display.
 */
function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Render an author link fragment.
 */
function renderAuthor(author) {
  const avatar = author.avatar
    ? `<img class="avatar" src="${author.avatar}" alt="" loading="lazy" />`
    : ''
  const name = author.displayName || author.handle
  return `
    <a class="author" href="${profileUrl(author.did)}">
      ${avatar}
      <strong class="displayname">${escapeHtml(name)}</strong>
      <span class="handle">@${escapeHtml(author.handle)}</span>
    </a>`
}

/**
 * Render a footer with timestamp and link.
 */
function renderFooter(uri, timestamp) {
  return `
    <footer>
      <time datetime="${timestamp}">${formatDate(timestamp)}</time>
      <a href="${postUrl(uri)}">view on Bluesky</a>
    </footer>`
}

/**
 * Render a reply and its nested replies recursively.
 * Stops at maxDepth and shows a link to continue on Bluesky.
 */
function renderReply(threadView, depth, maxDepth) {
  const post = threadView.post
  const record = post.record
  const nested = (threadView.replies || [])
    .filter((r) => r.$type === 'app.bsky.feed.defs#threadViewPost')
    .sort(
      (a, b) =>
        new Date(a.post.record.createdAt) - new Date(b.post.record.createdAt)
    )

  let nestedHtml = ''
  if (nested.length > 0) {
    if (depth >= maxDepth) {
      nestedHtml = `
      <p class="depth-cutoff"><a href="${postUrl(post.uri)}">More of the conversation on Bluesky &rarr;</a></p>`
    } else {
      nestedHtml = `
      <ol class="thread">
        ${nested.map((r) => renderReply(r, depth + 1, maxDepth)).join('')}
      </ol>`
    }
  }

  return `
    <li class="reply">
      ${renderAuthor(post.author)}
      <p>${escapeHtml(record.text || '')}</p>
      ${renderFooter(post.uri, record.createdAt)}
      ${nestedHtml}
    </li>`
}

/**
 * Render a quote post.
 */
function renderQuote(post) {
  const record = post.record
  return `
    <li class="quote">
      ${renderAuthor(post.author)}
      <p>${escapeHtml(record.text || '')}</p>
      ${renderFooter(post.uri, record.createdAt)}
    </li>`
}

/**
 * Interpolate a header template string.
 *
 * Tokens:
 *   {replies}              → raw reply count
 *   {quotes}               → raw quote count
 *   {reposts}              → raw repost count
 *   {repostedBy}           → linked names: "@a, @b, and 3 others"
 *   {postUrl}              → bsky.app post URL
 *   {replies|one|many}     → hidden when 0, "1 one" when 1, "N many" when 2+
 *   {quotes|one|many}      → same
 *   {reposts|one|many}     → same
 *   {name?...content...}   → conditional block, renders content only if name is truthy
 */
function renderTemplate(template, stats, repostedBy, url) {
  const vars = {
    replies: stats.replyCount,
    quotes: stats.quoteCount,
    reposts: stats.repostCount,
    postUrl: url,
    repostedBy: formatRepostedBy(repostedBy, stats.repostCount, url),
  }

  let result = template

  // Replace {name|singular|plural} first — output nothing when count is 0
  result = result.replace(
    /\{(replies|quotes|reposts)\|([^|}]+)\|([^}]+)\}/g,
    (_, key, singular, plural) => {
      const n = vars[key]
      if (n === 0) return ''
      return `${intword(n)} ${pluralize(n, `${singular},${plural}`)}`
    }
  )

  // Replace {name} simple tokens
  result = result.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : ''
  )

  // Replace {name?...content...} conditional blocks — now inner tokens are resolved
  let prev
  do {
    prev = result
    result = result.replace(
      /\{(\w+)\?([^{}]*)\}/g,
      (_, key, content) => (vars[key] ? content : '')
    )
  } while (result !== prev)

  // Collapse multiple spaces / leading-trailing whitespace from removed tokens
  result = result.replace(/\s{2,}/g, ' ').trim()

  return result
}

/**
 * Format repostedBy names as linked HTML.
 */
function formatRepostedBy(repostedBy, repostCount, url) {
  if (repostCount === 0) return ''
  const names = repostedBy.slice(0, 3).map((a) => {
    return `<a href="${profileUrl(a.did)}">@${escapeHtml(a.handle)}</a>`
  })
  const remaining = repostCount - names.length
  if (remaining > 0) {
    const suffix = `and <a href="${url}/reposted-by">${intword(remaining)} other${pluralize(remaining)}</a>`
    return oxfordComma(names, names.length, suffix)
  }
  return oxfordComma(names)
}

/**
 * Render the header summary.
 * Uses header-template if provided, otherwise falls back to default format.
 */
function renderHeader(stats, repostedBy, { engageText, postUrl: url, headerTemplate }) {
  if (headerTemplate) {
    const html = renderTemplate(headerTemplate, stats, repostedBy, url)
    if (!html) return ''
    return `<header><p>${html}</p></header>`
  }

  const items = []

  if (stats.replyCount > 0) {
    items.push(
      `<li class="replies">${intword(stats.replyCount)} ${pluralize(stats.replyCount, 'reply,replies')}</li>`
    )
  }

  if (stats.quoteCount > 0) {
    items.push(
      `<li class="quotes"><a href="${url}/quotes">${intword(stats.quoteCount)} ${pluralize(stats.quoteCount, 'quote,quotes')}</a></li>`
    )
  }

  if (stats.repostCount > 0) {
    items.push(`<li class="reposts">reposted by ${formatRepostedBy(repostedBy, stats.repostCount, url)}</li>`)
  }

  if (engageText && url) {
    items.push(`<li class="engage"><a href="${url}">${escapeHtml(engageText)}</a></li>`)
  }

  if (items.length === 0) return ''
  return `<header><ul>${items.join('')}</ul></header>`
}

/**
 * Minimal HTML escaping.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

class BskyConversation extends HTMLElement {
  async connectedCallback() {
    const url = this.getAttribute('uri')
    if (!url) {
      this.innerHTML = ''
      return
    }

    const atUri = toAtUri(url)
    if (!atUri) {
      this.innerHTML = ''
      return
    }

    const maxDepth = parseInt(this.getAttribute('max-depth'), 10) || 3

    this.innerHTML = '<div class="bsky-conversation"><p class="loading">Loading conversation…</p></div>'

    try {
      const fetchJson = (url) =>
        fetch(url, { cache: 'no-store' })
          .then((r) => r.ok ? r.json() : {})
          .catch(() => ({}))

      const encodedUri = encodeURIComponent(atUri)
      const [thread, quotesRes, repostsRes] = await Promise.all([
        fetchJson(`${API}/app.bsky.feed.getPostThread?uri=${encodedUri}&depth=${maxDepth}&_t=${Date.now()}`),
        fetchJson(`${API}/app.bsky.feed.getQuotes?uri=${encodedUri}&limit=25&_t=${Date.now()}`),
        fetchJson(`${API}/app.bsky.feed.getRepostedBy?uri=${encodedUri}&limit=25&_t=${Date.now()}`),
      ])
      this.render(url, thread, quotesRes, repostsRes, maxDepth)
    } catch (err) {
      console.error('bsky-conversation: failed to load', err)
      this.innerHTML = ''
    }
  }

  render(originalUrl, threadRes, quotesRes, repostsRes, maxDepth) {
    const threadView = threadRes.thread
    if (!threadView || threadView.$type !== 'app.bsky.feed.defs#threadViewPost') {
      this.innerHTML = ''
      return
    }

    // Read configurable attributes
    const showOriginalPost = this.getAttribute('show-original-post') === 'true'
    const headerTemplate = this.getAttribute('header-template')
    const footerTemplate = this.getAttribute('footer-template')
    const engageAttr = this.getAttribute('engage-text')
    // Default to showing engage link; only hide if explicitly set to empty string
    const engageText = engageAttr === '' ? null : (engageAttr || 'Add your thoughts')

    // Direct replies (top-level threads)
    // Filter out the original author's direct replies to their own post —
    // those are extensions of the original post, not conversation.
    // The author's replies deeper in the tree (replying to others) are kept.
    const rootAuthorDid = threadView.post.author.did
    const directReplies = (threadView.replies || [])
      .filter((r) => r.$type === 'app.bsky.feed.defs#threadViewPost')
      .filter((r) => r.post.author.did !== rootAuthorDid)

    const quotes = quotesRes.posts || []
    const repostedBy = repostsRes.repostedBy || []

    // Count total replies recursively, excluding the root author's
    // direct replies to the root post (same filter as directReplies above)
    function countReplies(replies, isTopLevel) {
      let count = 0
      for (const r of replies) {
        if (r.$type !== 'app.bsky.feed.defs#threadViewPost') continue
        if (isTopLevel && r.post.author.did === rootAuthorDid) continue
        count += 1
        if (r.replies) count += countReplies(r.replies, false)
      }
      return count
    }
    const totalReplies = countReplies(threadView.replies || [], true)

    // Nothing to show (unless we have engage text to display)
    const rootPost = threadView.post
    if ((rootPost.replyCount || 0) === 0 && (rootPost.quoteCount || 0) === 0 && (rootPost.repostCount || 0) === 0 && !engageText) {
      this.innerHTML = ''
      return
    }

    // Build timeline: interleave top-level reply threads and quote posts
    const timelineItems = []

    // Optionally include the original post
    if (showOriginalPost) {
      const origPost = threadView.post
      timelineItems.push({
        timestamp: new Date(origPost.record.createdAt),
        html: `
          <li class="original">
            ${renderAuthor(origPost.author)}
            <p>${escapeHtml(origPost.record.text || '')}</p>
            ${renderFooter(origPost.uri, origPost.record.createdAt)}
          </li>`,
      })
    }

    for (const reply of directReplies) {
      timelineItems.push({
        timestamp: new Date(reply.post.record.createdAt),
        html: renderReply(reply, 0, maxDepth),
      })
    }

    for (const quote of quotes) {
      timelineItems.push({
        timestamp: new Date(quote.record.createdAt),
        html: renderQuote(quote),
      })
    }

    // Sort chronologically (oldest first)
    timelineItems.sort((a, b) => a.timestamp - b.timestamp)

    const stats = {
      replyCount: rootPost.replyCount || 0,
      quoteCount: rootPost.quoteCount || 0,
      repostCount: rootPost.repostCount || 0,
    }

    const header = renderHeader(stats, repostedBy, {
      engageText,
      postUrl: originalUrl,
      headerTemplate,
    })
    const timeline =
      timelineItems.length > 0
        ? `<ol class="timeline">${timelineItems.map((i) => i.html).join('')}</ol>`
        : ''

    this.innerHTML = `
      <style>
        .bsky-conversation {
          --bsky-border-color: #e5e7eb;
          --bsky-muted-color: #6b7280;
          --bsky-accent-color: #2563eb;
        }
        .dark .bsky-conversation {
          --bsky-border-color: #374151;
          --bsky-muted-color: #9ca3af;
          --bsky-accent-color: #60a5fa;
        }

        .bsky-conversation header ul {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em 1em;
          list-style: none;
          padding: 0;
          margin: 0 0 1.5em;
          font-size: smaller;
        }

        .bsky-conversation header .engage a {
          color: var(--bsky-accent-color);
          text-decoration: none;
        }
        .bsky-conversation header .engage a:hover {
          text-decoration: underline;
        }

        .bsky-conversation .timeline {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .bsky-conversation .reply,
        .bsky-conversation .quote,
        .bsky-conversation .original {
          padding: 0.75em 0;
          border-top: 1px solid var(--bsky-border-color);
        }

        .bsky-conversation .author {
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
          text-decoration: none;
          color: inherit;
          margin-bottom: 0.25em;
        }
        .bsky-conversation .author:hover .displayname {
          text-decoration: underline;
        }

        .bsky-conversation .avatar {
          width: 1.5em;
          height: 1.5em;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .bsky-conversation .displayname {
          font-weight: 600;
        }

        .bsky-conversation .handle {
          color: var(--bsky-muted-color);
        }

        .bsky-conversation .reply > p,
        .bsky-conversation .quote > p,
        .bsky-conversation .original > p {
          margin: 0.25em 0 0;
        }

        .bsky-conversation footer {
          display: flex;
          gap: 0.75em;
          margin-top: 0.25em;
          font-size: smaller;
          color: var(--bsky-muted-color);
        }
        .bsky-conversation footer a {
          color: var(--bsky-muted-color);
          text-decoration: none;
        }
        .bsky-conversation footer a:hover {
          text-decoration: underline;
        }

        .bsky-conversation .thread {
          list-style: none;
          padding: 0 0 0 1.5em;
          margin: 0;
          border-left: 2px solid var(--bsky-border-color);
        }

        .bsky-conversation .thread .reply {
          border-top: none;
          padding: 0.5em 0;
        }

        .bsky-conversation .depth-cutoff {
          margin: 0.5em 0 0;
          font-size: smaller;
        }
        .bsky-conversation .depth-cutoff a {
          color: var(--bsky-accent-color);
          text-decoration: none;
        }
        .bsky-conversation .depth-cutoff a:hover {
          text-decoration: underline;
        }

        .bsky-conversation .continue {
          text-align: center;
          padding: 1em 0 0.5em;
          border-top: 1px solid var(--bsky-border-color);
          font-size: smaller;
        }
        .bsky-conversation .continue a {
          color: var(--bsky-accent-color);
          text-decoration: none;
        }
        .bsky-conversation .continue a:hover {
          text-decoration: underline;
        }
      </style>
      <div class="bsky-conversation">
        ${header}
        ${timeline}
        ${timeline ? `<footer class="continue">${renderTemplate(footerTemplate || "<a href='{postUrl}'>Add your thoughts on Bluesky</a>", stats, repostedBy, originalUrl)}</footer>` : ''}
      </div>`
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('bsky-conversation')) {
  customElements.define('bsky-conversation', BskyConversation)
}

})();
