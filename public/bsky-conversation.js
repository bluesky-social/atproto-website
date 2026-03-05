const API = 'https://public.api.bsky.app/xrpc'

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
 */
function renderReply(threadView) {
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
    nestedHtml = `
      <ol class="thread">
        ${nested.map((r) => renderReply(r)).join('')}
      </ol>`
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
 * Render the header summary.
 */
function renderHeader(replyCount, quotes, repostedBy, { engageText, postUrl: url }) {
  const items = []

  if (replyCount > 0) {
    items.push(
      `<li class="replies">${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}</li>`
    )
  }

  if (quotes.length > 0) {
    items.push(
      `<li class="quotes">${quotes.length} ${quotes.length === 1 ? 'quote' : 'quotes'}</li>`
    )
  }

  if (repostedBy.length > 0) {
    const names = repostedBy.slice(0, 3).map((a) => {
      return `<a href="${profileUrl(a.did)}">@${escapeHtml(a.handle)}</a>`
    })
    const remaining = repostedBy.length - names.length
    let text = `reposted by ${names.join(', ')}`
    if (remaining > 0) {
      text += `, and ${remaining} ${remaining === 1 ? 'other' : 'others'}`
    }
    items.push(`<li class="reposts">${text}</li>`)
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

    this.innerHTML = '<div class="bsky-conversation"><p class="loading">Loading conversation…</p></div>'

    try {
      const [thread, quotesRes, repostsRes] = await Promise.all([
        fetch(
          `${API}/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=6`
        ).then((r) => r.json()),
        fetch(
          `${API}/app.bsky.feed.getQuotes?uri=${encodeURIComponent(atUri)}&limit=25`
        ).then((r) => r.json()),
        fetch(
          `${API}/app.bsky.feed.getRepostedBy?uri=${encodeURIComponent(atUri)}&limit=25`
        ).then((r) => r.json()),
      ])

      this.render(url, thread, quotesRes, repostsRes)
    } catch (err) {
      console.error('bsky-conversation: failed to load', err)
      this.innerHTML = ''
    }
  }

  render(originalUrl, threadRes, quotesRes, repostsRes) {
    const threadView = threadRes.thread
    if (!threadView || threadView.$type !== 'app.bsky.feed.defs#threadViewPost') {
      this.innerHTML = ''
      return
    }

    // Read configurable attributes
    const showOriginalPost = this.getAttribute('show-original-post') === 'true'
    const engageAttr = this.getAttribute('engage-text')
    // Default to showing engage link; only hide if explicitly set to empty string
    const engageText = engageAttr === '' ? null : (engageAttr || 'Comment or quote on Bluesky')

    // Direct replies (top-level threads)
    const directReplies = (threadView.replies || [])
      .filter((r) => r.$type === 'app.bsky.feed.defs#threadViewPost')

    const quotes = quotesRes.posts || []
    const repostedBy = repostsRes.repostedBy || []

    // Count total replies recursively
    function countReplies(replies) {
      let count = 0
      for (const r of replies) {
        if (r.$type === 'app.bsky.feed.defs#threadViewPost') {
          count += 1
          if (r.replies) count += countReplies(r.replies)
        }
      }
      return count
    }
    const totalReplies = countReplies(threadView.replies || [])

    // Nothing to show (unless we have engage text to display)
    if (totalReplies === 0 && quotes.length === 0 && repostedBy.length === 0 && !engageText) {
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
        html: renderReply(reply),
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

    const header = renderHeader(totalReplies, quotes, repostedBy, {
      engageText,
      postUrl: originalUrl,
    })
    const timeline =
      timelineItems.length > 0
        ? `<ol class="timeline">${timelineItems.map((i) => i.html).join('')}</ol>`
        : ''

    this.innerHTML = `
      <div class="bsky-conversation">
        ${header}
        ${timeline}
      </div>`
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('bsky-conversation')) {
  customElements.define('bsky-conversation', BskyConversation)
}
