import { afterEach, expect, it, vi } from 'vitest'

// The element only needs EventTarget and querySelector; exercise its real
// lifecycle without requiring a browser DOM or mounting the whole Next app.
afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

it('signals client navigation on change and removes its listener on disconnect', async () => {
  const select = Object.assign(new EventTarget(), { showPicker: vi.fn() })
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
  const enter = Object.assign(new Event('keydown', { cancelable: true }), {
    key: 'Enter',
  })
  select.dispatchEvent(enter)
  expect(select.showPicker).toHaveBeenCalledTimes(1)
  expect(enter.defaultPrevented).toBe(true)
  const arrow = Object.assign(new Event('keydown', { cancelable: true }), {
    key: 'ArrowDown',
  })
  select.dispatchEvent(arrow)
  expect(arrow.defaultPrevented).toBe(false)
  select.showPicker.mockImplementationOnce(() => {
    throw new Error('Unsupported')
  })
  const fallback = Object.assign(new Event('keydown', { cancelable: true }), {
    key: 'Enter',
  })
  select.dispatchEvent(fallback)
  expect(fallback.defaultPrevented).toBe(false)
  select.dispatchEvent(new Event('change'))
  expect(navigate).toHaveBeenCalledTimes(1)
  expect(navigate.mock.calls[0][0].bubbles).toBe(true)
  expect(assign).not.toHaveBeenCalled()
  element.disconnectedCallback()
  select.showPicker.mockClear()
  select.dispatchEvent(enter)
  expect(select.showPicker).not.toHaveBeenCalled()
  select.dispatchEvent(new Event('change'))
  expect(navigate).toHaveBeenCalledTimes(1)
})
