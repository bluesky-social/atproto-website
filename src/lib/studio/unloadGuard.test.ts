import { describe, expect, it, vi } from 'vitest'
import { guardUnload, type BeforeUnloadEventLike } from './unloadGuard'

/** A stand-in for `window` that lets a test fire the event by hand. */
function fakeWindow() {
  const listeners = new Set<(event: BeforeUnloadEventLike) => void>()
  return {
    listeners,
    addEventListener(_type: 'beforeunload', fn: (e: BeforeUnloadEventLike) => void) {
      listeners.add(fn)
    },
    removeEventListener(_type: 'beforeunload', fn: (e: BeforeUnloadEventLike) => void) {
      listeners.delete(fn)
    },
    /** Fires beforeunload and reports the event the browser would have read. */
    unload() {
      const event = {
        preventDefault: vi.fn<() => void>(),
        returnValue: undefined as unknown,
      }
      for (const fn of listeners) fn(event)
      return event
    },
  }
}

describe('guardUnload', () => {
  it('asks the browser to confirm when there is unsaved work', () => {
    const win = fakeWindow()
    guardUnload(win, () => true)

    const event = win.unload()

    expect(event.preventDefault).toHaveBeenCalled()
    // Set for browsers that predate preventDefault being enough. The spec only
    // treats a value other than '' as a cancel, so '' would be a no-op here.
    expect(event.returnValue).not.toBe('')
    expect(event.returnValue).toBeTruthy()
  })

  it('lets the page go when there is nothing unsaved', () => {
    const win = fakeWindow()
    guardUnload(win, () => false)

    const event = win.unload()

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.returnValue).toBeUndefined()
  })

  it('asks at unload time, not at registration time', () => {
    // The whole point of taking a callback: the guard is registered once, on
    // mount, and must see the form as it stands when the tab is closed — not as
    // it stood when the effect ran.
    const win = fakeWindow()
    let unsaved = false
    guardUnload(win, () => unsaved)

    expect(win.unload().preventDefault).not.toHaveBeenCalled()
    unsaved = true
    expect(win.unload().preventDefault).toHaveBeenCalled()
  })

  it('stops guarding once its cleanup runs', () => {
    const win = fakeWindow()
    const stop = guardUnload(win, () => true)

    stop()

    expect(win.listeners.size).toBe(0)
    expect(win.unload().preventDefault).not.toHaveBeenCalled()
  })

  it('removes only its own listener', () => {
    // Two editors never share a tab, but a stale cleanup running after a remount
    // must not disarm the guard the remount installed.
    const win = fakeWindow()
    const stopFirst = guardUnload(win, () => true)
    guardUnload(win, () => true)

    stopFirst()

    expect(win.listeners.size).toBe(1)
    expect(win.unload().preventDefault).toHaveBeenCalled()
  })
})
