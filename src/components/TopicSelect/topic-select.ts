// Signal the React navigation bridge rather than assigning window.location:
// topic pages use client navigation while retaining the no-JS form fallback.
class TopicSelect extends HTMLElement {
  private handleChange = () => {
    this.dispatchEvent(new Event('topic-select:change', { bubbles: true }))
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const select = this.querySelector('select')
    if (event.key !== 'Enter' || !select?.showPicker) return
    try {
      select.showPicker()
      event.preventDefault()
    } catch {
      // Keep native keyboard behavior if this browser cannot open the picker.
    }
  }

  connectedCallback() {
    this.querySelector('select')?.addEventListener(
      'keydown',
      this.handleKeyDown,
    )
    this.querySelector('select')?.addEventListener('change', this.handleChange)
  }

  disconnectedCallback() {
    this.querySelector('select')?.removeEventListener(
      'keydown',
      this.handleKeyDown,
    )
    this.querySelector('select')?.removeEventListener(
      'change',
      this.handleChange,
    )
  }
}

if (!customElements.get('topic-select'))
  customElements.define('topic-select', TopicSelect)

export {}
