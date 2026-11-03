import { afterEach, expect, it, vi } from 'vitest'

// The element only needs EventTarget and querySelector; exercise its real
// lifecycle without requiring a browser DOM or mounting the whole Next app.
afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

it('signals client navigation on change and removes its listener on disconnect', async () => {
  const select = new EventTarget()
  class Element extends EventTarget {
    querySelector() {
      return select
    }
  }
  let Constructor:
    | (new () => Element & {
        connectedCallback(): void
        disconnectedCallback(): void
      })
    | undefined
  vi.stubGlobal('HTMLElement', Element)
  vi.stubGlobal('customElements', {
    get: () => undefined,
    define: (_: string, value: typeof Constructor) => {
      Constructor = value
    },
  })
  const assign = vi.fn()
  vi.stubGlobal('window', { location: { assign } })
  await import('./topic-select')
  const element = new Constructor!()
  const navigate = vi.fn()
  element.addEventListener('topic-select:change', navigate)
  element.connectedCallback()
  element.connectedCallback()
  select.dispatchEvent(new Event('change'))
  expect(navigate).toHaveBeenCalledTimes(1)
  expect(navigate.mock.calls[0][0].bubbles).toBe(true)
  expect(assign).not.toHaveBeenCalled()
  element.disconnectedCallback()
  select.dispatchEvent(new Event('change'))
  expect(navigate).toHaveBeenCalledTimes(1)
})
