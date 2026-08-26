/**
 * The browser's own "Leave site? Changes you made may not be saved" confirm,
 * armed while an editor holds unsaved work.
 *
 * This sits *beside* the sessionStorage drafts in ./draft, not on top of them,
 * because the two cover different losses. A draft survives a reload but dies
 * with the tab, so closing the tab — or navigating away from /studio — drops
 * work with no warning and nothing to restore. `beforeunload` is the only hook
 * the platform gives for that moment, and it can do exactly one thing: ask.
 *
 * Written as a plain function over an event target rather than a React hook so
 * it stays testable in vitest's node environment, matching the browser wrappers
 * at the foot of ./draft.
 *
 * MUST STAY FREE OF NODE BUILT-INS — this is reached from `'use client'`
 * components and ends up in the browser bundle.
 */

/**
 * The slice of `BeforeUnloadEvent` this needs. Narrower than the DOM type so a
 * test can hand over a plain object, and so the file needs no DOM lib.
 */
export type BeforeUnloadEventLike = {
  preventDefault(): void
  returnValue?: unknown
}

/** The slice of `window` this needs, for the same reason. */
export type UnloadTarget = {
  addEventListener(
    type: 'beforeunload',
    listener: (event: BeforeUnloadEventLike) => void,
  ): void
  removeEventListener(
    type: 'beforeunload',
    listener: (event: BeforeUnloadEventLike) => void,
  ): void
}

/**
 * Warn before `target` unloads, whenever `hasUnsavedWork()` says there is
 * something to lose. Returns the cleanup that stops warning.
 *
 * `hasUnsavedWork` is a callback, not a boolean, so the guard can be registered
 * once on mount and still read the form as it stands when the tab is closed.
 * Re-registering on every keystroke would work too, and would be a listener
 * swap per character typed.
 *
 * Browsers ignore the text of the message and show their own, so there is none
 * to pass. They also refuse the dialog entirely unless the page has been
 * interacted with — which, for an editor holding typed-in work, it has.
 */
export function guardUnload(
  target: UnloadTarget,
  hasUnsavedWork: () => boolean,
): () => void {
  const onBeforeUnload = (event: BeforeUnloadEventLike) => {
    if (!hasUnsavedWork()) return
    event.preventDefault()
    // Legacy path, for browsers where preventDefault alone isn't the cancel
    // signal (Chrome and Edge before 119, Safari). The spec only counts a
    // returnValue *other than* the empty string, so '' would do nothing.
    event.returnValue = true
  }

  target.addEventListener('beforeunload', onBeforeUnload)
  return () => target.removeEventListener('beforeunload', onBeforeUnload)
}
