import { topicSelectHref } from './topicHref'

// Progressive enhancement for the server-rendered topic <form>: navigate as
// soon as the selection changes. Without JS, the form still submits to
// /blog/topic, which redirects. The submit button is hidden by CSS
// (@media (scripting: enabled)), not here, so it does not flash on load.
class TopicSelect extends HTMLElement {
  connectedCallback() {
    const select = this.querySelector('select')
    if (!select) return
    select.addEventListener('change', () => {
      window.location.assign(topicSelectHref(select.value))
    })
  }
}

if (!customElements.get('topic-select'))
  customElements.define('topic-select', TopicSelect)
