// public/off-protocol/widget.mjs
//
// Defines the <off-protocol-next> custom element: client-side fetch of the
// next Off Protocol livestream from the atproto.com repo, with a live
// countdown. Pure logic lives in (and is tested via) event-utils.mjs.
//
// Loaded as a module: <script type="module" src="/off-protocol/widget.mjs">.

import {
  selectNextEvent,
  formatEventDateTime,
  countdownText,
  pickStreamUrl,
  rkeyFromUri,
  buildEventLinks,
  pdsEndpoint,
} from './event-utils.mjs'

const DEFAULTS = {
  did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz', // atproto.com
  collection: 'community.lexicon.calendar.event',
  marker: 'https://atproto.com/off-protocol',
  plc: 'https://plc.directory',
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const STYLE = `
  <style>
    .op-next {
      --op-border: #bfdbfe;
      --op-bg: #eff6ff;
      --op-muted: #52525b;
      --op-fg: #18181b;
      --op-accent: #2563eb;
      --op-accent-fg: #ffffff;
      --op-pill-bg: #ffffff;
      --op-menu-bg: #ffffff;
      --op-hover: #f1f5f9;
      --op-live: #dc2626;
    }
    .dark .op-next {
      --op-border: rgba(59, 130, 246, 0.28);
      --op-bg: rgba(37, 99, 235, 0.10);
      --op-muted: #a1a1aa;
      --op-fg: #ffffff;
      --op-accent: #3b82f6;
      --op-accent-fg: #ffffff;
      --op-pill-bg: rgba(255, 255, 255, 0.05);
      --op-menu-bg: #18181b;
      --op-hover: rgba(255, 255, 255, 0.07);
      --op-live: #f87171;
    }

    .op-next {
      border: 1px solid var(--op-border);
      background: var(--op-bg);
      border-radius: 0.75rem;
      padding: 1.5rem;
      color: var(--op-fg);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .op-next .eyebrow {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--op-muted);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }
    .op-next .eyebrow .dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--op-live);
      animation: op-pulse 1.6s ease-in-out infinite;
    }
    @keyframes op-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }

    .op-next .name { font-size: 1.375rem; font-weight: 700; margin: 0; line-height: 1.2; }
    .op-next .when { color: var(--op-muted); margin: 0; font-size: 0.95rem; }
    .op-next .desc { margin: 0; font-size: 0.95rem; line-height: 1.5; }
    .op-next .countdown { font-variant-numeric: tabular-nums; font-weight: 600; margin: 0; }
    .op-next .countdown.live { color: var(--op-live); }

    .op-next .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; margin-top: 0.25rem; }
    .op-next .watch {
      background: var(--op-accent);
      color: var(--op-accent-fg);
      padding: 0.55rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
    }
    .op-next .watch:hover { filter: brightness(1.07); }

    .op-next .rsvp { position: relative; display: inline-block; }
    .op-next .rsvp-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--op-pill-bg);
      color: var(--op-fg);
      border: 1px solid var(--op-border);
      padding: 0.55rem 0.9rem;
      border-radius: 0.5rem;
      font: inherit;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .op-next .rsvp-btn:hover { border-color: var(--op-accent); color: var(--op-accent); }
    .op-next .rsvp-btn svg { width: 0.7rem; height: 0.7rem; }
    .op-next .rsvp-menu {
      position: absolute;
      top: calc(100% + 0.35rem);
      left: 0;
      z-index: 20;
      min-width: 11rem;
      background: var(--op-menu-bg);
      border: 1px solid var(--op-border);
      border-radius: 0.5rem;
      padding: 0.25rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    }
    .op-next .rsvp-menu[hidden] { display: none; }
    .op-next .rsvp-item {
      display: block;
      padding: 0.5rem 0.7rem;
      border-radius: 0.375rem;
      color: var(--op-fg);
      text-decoration: none;
      font-size: 0.9rem;
    }
    .op-next .rsvp-item:hover { background: var(--op-hover); }
  </style>
`

class OffProtocolNext extends HTMLElement {
  async connectedCallback() {
    const attr = (k) => this.getAttribute(k) || DEFAULTS[k]
    const did = attr('did')
    const collection = attr('collection')
    const marker = attr('marker')
    const plc = attr('plc')

    try {
      const didDoc = await fetch(`${plc}/${encodeURIComponent(did)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
      const pds = pdsEndpoint(didDoc)
      if (!pds) return this.hide()

      const url =
        `${pds}/xrpc/com.atproto.repo.listRecords` +
        `?repo=${encodeURIComponent(did)}` +
        `&collection=${encodeURIComponent(collection)}&limit=30`
      const data = await fetch(url, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
      if (!data) return this.hide()

      const event = selectNextEvent(data.records, Date.now(), marker)
      if (!event) return this.hide()

      this.render(did, event)
    } catch (err) {
      console.error('off-protocol-next: failed to load', err)
      this.hide()
    }
  }

  disconnectedCallback() {
    this.cleanup()
  }

  cleanup() {
    if (this._timer) clearInterval(this._timer)
    if (this._onDocClick) document.removeEventListener('click', this._onDocClick)
    if (this._onKey) document.removeEventListener('keydown', this._onKey)
  }

  hide() {
    this.cleanup()
    this.innerHTML = ''
  }

  render(did, event) {
    const v = event.value
    const rkey = rkeyFromUri(event.uri)
    const links = buildEventLinks(did, rkey)
    const streamUrl = pickStreamUrl(v.uris)
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const when = formatEventDateTime(v.startsAt, localZone)

    this._startsAt = Date.parse(v.startsAt)
    this._endsAt = Date.parse(v.endsAt || v.startsAt)

    const watch = streamUrl
      ? `<a class="watch" href="${escapeHtml(streamUrl)}" target="_blank" rel="noopener noreferrer">Watch on Streamplace</a>`
      : ''
    const desc = v.description
      ? `<p class="desc">${escapeHtml(v.description)}</p>`
      : ''

    this.innerHTML = `
      ${STYLE}
      <div class="op-next">
        <p class="eyebrow" data-eyebrow>Next livestream</p>
        <h2 class="name">${escapeHtml(v.name)}</h2>
        <p class="when">${escapeHtml(when)}</p>
        ${desc}
        <p class="countdown" data-countdown></p>
        <div class="actions">
          ${watch}
          <div class="rsvp" data-rsvp>
            <button class="rsvp-btn" type="button" aria-haspopup="true" aria-expanded="false" data-rsvp-toggle>
              RSVP
              <svg aria-hidden="true" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg>
            </button>
            <div class="rsvp-menu" role="menu" data-rsvp-menu hidden>
              <a class="rsvp-item" role="menuitem" href="${escapeHtml(links.smokeSignal)}" target="_blank" rel="noopener noreferrer">Smoke Signal</a>
              <a class="rsvp-item" role="menuitem" href="${escapeHtml(links.atmoRsvp)}" target="_blank" rel="noopener noreferrer">atmo.rsvp</a>
            </div>
          </div>
        </div>
      </div>`

    this._eyebrow = this.querySelector('[data-eyebrow]')
    this._countdownEl = this.querySelector('[data-countdown]')
    this.wireRsvp()
    this.tick()
    this._timer = setInterval(() => this.tick(), 1000)
  }

  wireRsvp() {
    const root = this.querySelector('[data-rsvp]')
    const toggle = this.querySelector('[data-rsvp-toggle]')
    const menu = this.querySelector('[data-rsvp-menu]')
    if (!root || !toggle || !menu) return

    const close = () => {
      menu.hidden = true
      toggle.setAttribute('aria-expanded', 'false')
    }
    toggle.addEventListener('click', (e) => {
      e.stopPropagation()
      const willOpen = menu.hidden
      menu.hidden = !willOpen
      toggle.setAttribute('aria-expanded', String(willOpen))
    })
    this._onDocClick = (e) => {
      if (!root.contains(e.target)) close()
    }
    this._onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('click', this._onDocClick)
    document.addEventListener('keydown', this._onKey)
  }

  tick() {
    const now = Date.now()
    if (now > this._endsAt) return this.hide()

    const delta = this._startsAt - now
    if (delta <= 0) {
      // Live: between startsAt and endsAt
      this._eyebrow.innerHTML = '<span class="dot"></span>Live now'
      this._countdownEl.textContent = 'Happening now — join the stream'
      this._countdownEl.classList.add('live')
      this._countdownEl.hidden = false
      return
    }

    const label = countdownText(delta)
    if (label) {
      this._countdownEl.textContent = label
      this._countdownEl.classList.remove('live')
      this._countdownEl.hidden = false
    } else {
      // More than 24h out — the date line carries the timing on its own.
      this._countdownEl.textContent = ''
      this._countdownEl.hidden = true
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('off-protocol-next')) {
  customElements.define('off-protocol-next', OffProtocolNext)
}
