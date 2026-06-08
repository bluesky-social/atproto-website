import { apps, permissionSets, individualScopes } from './scopeData'
import { assembleScopeString, emitCuratedScopeString } from './scopeUtils'
import type { CuratedScope } from './types'
import { resolvePermissionSet } from './permissionSetResolver'

const ALL_SCOPES: CuratedScope[] = [...permissionSets, ...individualScopes]
const SCOPES_BY_ID = new Map(ALL_SCOPES.map((s) => [s.id, s]))

class ScopeBuilderElement extends HTMLElement {
  private selectedIds = new Set<string>()
  // Permission sets the user resolved by pasting a link. Session-only:
  // never written to localStorage. Rendered in the "Added by link" section
  // and otherwise treated like curated sets.
  private customSets: CuratedScope[] = []
  // Last resolver error message, shown under the input. Cleared on success.
  private customSetError: string = ''
  private resolving = false
  // Per-scope audience overrides for curated permission sets whose
  // `defaultAud` is editable. Keyed by scope id. Preserved across
  // un-check/re-check so a user can tweak without losing their edit.
  private audOverrides = new Map<string, string>()
  // Default to Bluesky on load regardless of where it falls in the
  // alphabetical pill order — it's the most likely starting point.
  private activeAppId: string =
    apps.find((a) => a.id === 'bluesky')?.id ?? apps[0]?.id ?? 'bluesky'
  private _handleChange: (e: Event) => void
  private _handleInput: (e: Event) => void
  private _handleClick: (e: Event) => void

  constructor() {
    super()

    this._handleChange = (e: Event) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        const id = target.dataset.scopeId
        if (!id) return

        // Anchor the clicked checkbox's viewport position across the
        // re-render. Without this, the sticky scope string grows (each
        // token adds a line), the item itself may gain an aud input,
        // and the item's "Included via" note may appear — any of which
        // shifts the checkbox out from under the user's cursor. After
        // the re-render we scroll by the delta so the clicked element
        // stays at the same Y.
        const anchorBefore = target.getBoundingClientRect().top

        if (target.checked) {
          this.selectedIds.add(id)
          // Cascade: uncheck any scopes that this one supersedes, since
          // they're now implied by the broader selection.
          for (const s of ALL_SCOPES) {
            if (s.supersededBy === id) this.selectedIds.delete(s.id)
          }
        } else {
          this.selectedIds.delete(id)
        }
        this._render()

        const after = this.querySelector<HTMLInputElement>(
          `input[data-scope-id="${id}"]`,
        )
        if (after) {
          const delta = after.getBoundingClientRect().top - anchorBefore
          if (delta !== 0) window.scrollBy(0, delta)
        }
      }
    }

    this._handleInput = (e: Event) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement && target.dataset.audFor) {
        const id = target.dataset.audFor
        this.audOverrides.set(id, target.value)
        // Targeted update only — don't re-render the list (would steal focus
        // from the input). The only thing that depends on aud is the
        // generated scope string at the top.
        this._updateOutput()
      }
    }

    this._handleClick = (e: Event) => {
      const target = e.target as HTMLElement

      // App pill click
      const pill = target.closest('[data-app-pill]') as HTMLButtonElement | null
      if (pill) {
        const appId = pill.dataset.appPill
        if (appId && appId !== this.activeAppId) {
          this.activeAppId = appId
          this._swapActiveApp()
        }
        return
      }

      const btn = target.closest('[data-action="copy"]') as HTMLButtonElement | null
      if (btn) {
        const scopeString = btn.dataset.copyText ?? ''
        navigator.clipboard.writeText(scopeString).then(() => {
          const original = btn.textContent
          btn.textContent = 'Copied!'
          btn.disabled = true
          setTimeout(() => {
            btn.textContent = original
            btn.disabled = false
          }, 1500)
        })
        return
      }

      const addBtn = target.closest('[data-action="resolve-set"]') as HTMLButtonElement | null
      if (addBtn) {
        const input = this.querySelector<HTMLInputElement>('[data-custom-set-input]')
        const value = input?.value ?? ''
        void this._resolveCustomSet(value)
        return
      }
    }
  }

  connectedCallback() {
    this.addEventListener('change', this._handleChange)
    this.addEventListener('input', this._handleInput)
    this.addEventListener('click', this._handleClick)
    this._render()
  }

  disconnectedCallback() {
    this.removeEventListener('change', this._handleChange)
    this.removeEventListener('input', this._handleInput)
    this.removeEventListener('click', this._handleClick)
  }

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  // Computes the final space-separated scope string for the current selection,
  // honoring per-scope audience overrides. Used by both the initial render
  // and the targeted output updates triggered by aud input typing.
  private _computeAssembled(): string {
    const all = [...ALL_SCOPES, ...this.customSets]
    const scopeStrings = all
      .filter((s) => this.selectedIds.has(s.id))
      .map((s) => emitCuratedScopeString(s, this.audOverrides.get(s.id)))
    return assembleScopeString(scopeStrings)
  }

  private async _resolveCustomSet(input: string): Promise<void> {
    if (this.resolving) return
    this.resolving = true
    this.customSetError = ''
    this._render()

    const result = await resolvePermissionSet(input)

    this.resolving = false
    if (!result.ok) {
      this.customSetError = result.error.message
      this._render()
      return
    }
    // De-dupe: replace any existing custom set with the same id.
    const scope = result.value
    this.customSets = [...this.customSets.filter((s) => s.id !== scope.id), scope]
    this._render()
  }

  // Targeted refresh of only the sticky output box. Used when the user types
  // in an aud input — we can't re-render the full widget because that would
  // blow away the input element and steal focus mid-keystroke.
  private _updateOutput() {
    const assembled = this._computeAssembled()
    const pre = this.querySelector('[data-scope-string-pre]')
    if (pre) pre.textContent = assembled.replace(/ /g, '\n')
    const btn = this.querySelector('[data-scope-string-copy]') as HTMLButtonElement | null
    if (btn) btn.dataset.copyText = assembled
  }

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  // Inner-HTML only for the app pill bar. Used both on first render and for
  // targeted updates when the user clicks a pill.
  private _renderPillBarInner(): string {
    return apps.map((a) => this._renderAppPill(a.id, a.name)).join('')
  }

  // Inner-HTML only for the permission-set list under the active pill.
  // Targeted updates on pill click swap this out without touching the rest
  // of the widget's DOM — keeps the sticky header and individual-scopes
  // section stable and avoids the visible jump that came from full
  // innerHTML replacement.
  private _renderPermissionSetsListInner(): string {
    return permissionSets
      .filter((s) => s.appId === this.activeAppId)
      .map((s) => this._renderScopeItem(s))
      .join('')
  }

  private _renderAddedByLinkSection(): string {
    const listHtml =
      this.customSets.length > 0
        ? `<div class="rounded-xl border border-amber-200 dark:border-amber-900/50 overflow-hidden [&>*]:border-t [&>*]:border-t-gray-100 dark:[&>*]:border-t-gray-700 [&>*:first-child]:border-t-0">
             ${this.customSets.map((s) => this._renderScopeItem(s)).join('')}
           </div>`
        : ''

    const errorHtml = this.customSetError
      ? `<p class="mt-2 text-xs text-red-600 dark:text-red-400">${escapeHtml(this.customSetError)}</p>`
      : ''

    return `
      <section class="mb-6">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 px-3">
          Added by link
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 px-3">
          Paste a <span class="font-mono">lexicon.garden</span> or <span class="font-mono">at://</span> link to any published permission set. Resolved sets are <span class="font-medium">unverified</span> and not saved.
        </p>
        <div class="flex gap-2 px-3 mb-3">
          <input
            type="text"
            data-custom-set-input
            placeholder="https://lexicon.garden/lexicon/did:plc:.../app.example.authThing"
            class="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs font-mono text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            data-action="resolve-set"
            class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
            ${this.resolving ? 'disabled' : ''}
          >
            ${this.resolving ? 'Resolving…' : 'Add'}
          </button>
        </div>
        <div class="px-3">${errorHtml}</div>
        ${listHtml}
      </section>`
  }

  // Updates only the two pieces of DOM that change on a pill click.
  private _swapActiveApp() {
    const pillBar = this.querySelector('[data-app-pill-bar]')
    if (pillBar) pillBar.innerHTML = this._renderPillBarInner()
    const list = this.querySelector('[data-permission-sets-list]')
    if (list) list.innerHTML = this._renderPermissionSetsListInner()

    // Anchor the permission-sets section just below the sticky header so
    // the user always lands in a consistent place regardless of how the
    // list length changed. scroll-mt-44 on the section provides the offset.
    const section = this.querySelector(
      '[data-permission-sets-section]',
    ) as HTMLElement | null
    section?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  private _renderAppPill(appId: string, name: string): string {
    const active = appId === this.activeAppId
    const cls = active
      ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
    return `
      <button
        type="button"
        data-app-pill="${escapeAttr(appId)}"
        aria-pressed="${active}"
        class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${cls}"
      >
        ${escapeHtml(name)}
      </button>`
  }

  private _renderScopeItem(scope: CuratedScope): string {
    const isChecked = this.selectedIds.has(scope.id)
    const checkedAttr = isChecked ? 'checked' : ''

    // Disable-on-conflict: if this scope is superseded by another scope that's
    // currently selected, render disabled + dim + show an "Included via"
    // inline note. The superset covers this one, so selecting both would
    // produce a redundant scope string.
    const supersederId = scope.supersededBy
    const superseder = supersederId ? SCOPES_BY_ID.get(supersederId) : undefined
    const isSuperseded = !!(supersederId && this.selectedIds.has(supersederId))
    const disabledAttr = isSuperseded ? 'disabled' : ''

    const labelCls = isSuperseded
      ? 'flex gap-3 py-3 px-3 opacity-60 cursor-not-allowed'
      : 'flex gap-3 py-3 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'

    const supersededTooltip =
      isSuperseded && superseder
        ? `Included via ${escapeAttr(superseder.label)}`
        : ''

    const includedViaHtml =
      isSuperseded && superseder
        ? `<p class="mt-0.5 text-xs italic text-gray-500 dark:text-gray-400">
             Included via <span class="not-italic font-medium">${escapeHtml(superseder.label)}</span>.
           </p>`
        : ''

    const warningHtml = scope.warning
      ? `<span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">${escapeHtml(scope.warning)}</span>`
      : ''

    // Editable audience — only rendered when the scope has a defaultAud
    // AND the user has selected this scope. Bare keystrokes update the
    // generated scope string live via _updateOutput (targeted DOM update).
    const audInputHtml =
      scope.defaultAud && isChecked
        ? (() => {
            const currentAud = this.audOverrides.get(scope.id) ?? scope.defaultAud
            return `
            <div class="mt-2">
              <label class="block text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Audience
              </label>
              <input
                type="text"
                data-aud-for="${escapeAttr(scope.id)}"
                value="${escapeAttr(currentAud)}"
                placeholder="did:web:your.service#svc_type (leave blank to omit aud)"
                class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs font-mono text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p class="mt-1 text-2xs text-gray-500 dark:text-gray-400">
                The <code class="font-mono">#</code> will be percent-encoded in the final scope string.
              </p>
            </div>`
          })()
        : ''

    const expanded = scope.expandedPermissions
    const repoCount = expanded?.repo?.length ?? 0
    const rpcCount = expanded?.rpc?.length ?? 0
    const totalCount = repoCount + rpcCount

    const repoListHtml =
      repoCount > 0
        ? `<div class="mt-2">
            <div class="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Repo (${repoCount})</div>
            <ul class="mt-0.5 pl-3 space-y-0.5">
              ${expanded!
                .repo!.map(
                  (p) =>
                    `<li class="text-xs font-mono text-gray-600 dark:text-gray-300">repo:${escapeHtml(p.collection)} <span class="text-gray-400 dark:text-gray-500">(${p.actions.join(', ')})</span></li>`,
                )
                .join('')}
            </ul>
          </div>`
        : ''

    const rpcListHtml =
      rpcCount > 0
        ? `<div class="mt-2">
            <div class="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">RPC (${rpcCount})</div>
            <ul class="mt-0.5 pl-3 space-y-0.5">
              ${expanded!
                .rpc!.map(
                  (lxm) =>
                    `<li class="text-xs font-mono text-gray-600 dark:text-gray-300">rpc:${escapeHtml(lxm)}</li>`,
                )
                .join('')}
            </ul>
          </div>`
        : ''

    const specInlineHtml = scope.specLink
      ? ` <a href="${escapeHtml(scope.specLink)}" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">${scope.kind === 'permission-set' ? 'View Lexicon' : 'Spec'} &rarr;</a>`
      : ''

    const summaryText = totalCount > 0 ? `Bundled permissions (${totalCount})` : 'Details'
    const detailsHtml = `<details class="px-3 pb-3">
            <summary class="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 pl-7">
              ${summaryText}
            </summary>
            <div class="pl-7 mt-2">
              <p class="text-xs text-gray-600 dark:text-gray-400">${escapeHtml(scope.explanation)}${specInlineHtml}</p>
              ${repoListHtml}
              ${rpcListHtml}
            </div>
          </details>`

    return `
      <div>
        <label
          class="${labelCls}"
          ${supersededTooltip ? `title="${supersededTooltip}"` : ''}
        >
          <input
            type="checkbox"
            class="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-600 disabled:cursor-not-allowed"
            data-scope-id="${scope.id}"
            ${checkedAttr}
            ${disabledAttr}
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${escapeHtml(scope.label)}</span>
              ${warningHtml}
            </div>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">${escapeHtml(scope.description)}</p>
            ${includedViaHtml}
            ${audInputHtml}
          </div>
        </label>
        ${detailsHtml}
      </div>`
  }

  private _render() {
    const assembled = this._computeAssembled()

    this.innerHTML = `
      <div class="not-prose font-sans max-w-2xl">
        <!-- Sticky scope string -->
        <div class="sticky top-14 z-10 -mx-4 px-4 pb-8 pt-4 bg-white dark:bg-zinc-900">
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 rounded-t-xl">
              <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Generated scope string</span>
              <button
                data-action="copy"
                data-scope-string-copy
                data-copy-text="${escapeAttr(assembled)}"
                class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
              >
                Copy
              </button>
            </div>
            <pre data-scope-string-pre class="px-4 py-3 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all rounded-b-xl">${escapeHtml(assembled.replace(/ /g, '\n'))}</pre>
          </div>
        </div>

        <!-- Individual scopes (top) -->
        <section class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 px-3">
            Individual Scopes
          </h3>
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden [&>*]:border-t [&>*]:border-t-gray-100 dark:[&>*]:border-t-gray-700 [&>*:first-child]:border-t-0">
            ${individualScopes.map((s) => this._renderScopeItem(s)).join('')}
          </div>
        </section>

        <!-- Permission sets, grouped by app -->
        <section class="mb-6 scroll-mt-44" data-permission-sets-section>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">
            Permission Sets
          </h3>
          <div class="mb-3 flex flex-wrap gap-2 px-3" data-app-pill-bar>
            ${this._renderPillBarInner()}
          </div>
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden [&>*]:border-t [&>*]:border-t-gray-100 dark:[&>*]:border-t-gray-700 [&>*:first-child]:border-t-0" data-permission-sets-list>
            ${this._renderPermissionSetsListInner()}
          </div>
        </section>

        ${this._renderAddedByLinkSection()}

      </div>`
  }
}

// ---------------------------------------------------------------------------
// Tiny escape helpers (no DOM dependency)
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined' && !customElements.get('scope-builder')) {
  customElements.define('scope-builder', ScopeBuilderElement)
}

export { ScopeBuilderElement }
