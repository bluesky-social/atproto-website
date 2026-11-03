// Signal the React navigation bridge rather than assigning window.location:
// topic pages use client navigation while retaining the no-JS form fallback.
class TopicSelect extends HTMLElement {
  private handleChange = () => {
    this.dispatchEvent(new Event('topic-select:change', { bubbles: true }))
  }

  connectedCallback() {
    this.querySelector('select')?.addEventListener('change', this.handleChange)
  }

  disconnectedCallback() {
    this.querySelector('select')?.removeEventListener(
      'change',
      this.handleChange,
    )
  }
}

if (!customElements.get('topic-select'))
  customElements.define('topic-select', TopicSelect)

export {}
