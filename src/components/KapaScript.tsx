'use client'

import Script from 'next/script'

function hideKapaDefaultButton() {
  const container = document.getElementById('kapa-widget-container')
  if (!container) return

  const hide = () => {
    const button = container.shadowRoot?.querySelector('button')
    if (button) {
      button.style.setProperty('display', 'none', 'important')
      return true
    }
    return false
  }

  if (!hide()) {
    const observer = new MutationObserver(() => {
      if (hide()) observer.disconnect()
    })
    const root = container.shadowRoot ?? container
    observer.observe(root, { childList: true, subtree: true })
  }
}

export function KapaScript() {
  return (
    <Script
      src="https://widget.kapa.ai/kapa-widget.bundle.js"
      data-website-id="918051fd-2626-4b70-b124-e12c71999dea"
      data-project-name="atproto"
      data-project-color="#000000"
      data-project-logo="https://atproto.com/favicon.ico"
      data-modal-ask-ai-input-placeholder="Find solutions from the docs, Github, forums, and more..."
      onLoad={hideKapaDefaultButton}
      onError={(e) => console.error('[Kapa] script failed to load', e)}
    />
  )
}
