// Machine translators (Google Translate, the Chrome extension, Firefox's
// built-in translation) don't edit text in place — they detach each text node
// and put a `<font>` wrapper in its place. React keeps a reference to the
// original node, so the next time it inserts a sibling next to translated text,
// or removes it, the browser throws:
//
//   Node.insertBefore: Child to insert before is not a child of this node
//
// That exception escapes React's commit phase, which unmounts the tree — the
// page stops rendering entirely. Background:
// https://martijnhols.nl/blog/everything-about-google-translate-crashing-react
//
// The real fix is not to mount or unmount elements next to translatable text,
// and not to hand translators text that React rewrites (see the `notranslate`
// opt-outs on code blocks and the firehose). This guard is the backstop for
// what we don't control: the embedded kapa.ai widget, and any component written
// after this comment. It turns a page-killing exception into a skipped DOM
// operation, which at worst leaves a stale node on screen.
//
// Runs as a blocking inline script so it is installed before React hydrates —
// a visitor who translates the page and then navigates would otherwise hit the
// crash during hydration, before any effect could patch anything.
export const translateCrashGuard = `(function(){
  if (typeof Node !== 'function' || !Node.prototype) return
  var warned = false
  function warn(op) {
    if (warned) return
    warned = true
    console.warn('[translate-guard] Skipped ' + op + ' on a node reparented by a page translator. See src/lib/translate-crash-guard.ts')
  }
  var insertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      warn('insertBefore')
      return newNode
    }
    return insertBefore.apply(this, arguments)
  }
  var removeChild = Node.prototype.removeChild
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      warn('removeChild')
      return child
    }
    return removeChild.apply(this, arguments)
  }
})()`
