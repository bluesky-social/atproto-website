'use client'

import { useEffect } from 'react'

// A privacy-friendly YouTube facade implemented as a standard Web Component.
// It paints the video's poster image and only injects the real YouTube
// <iframe> once the visitor clicks play — so no Google player JS or cookies
// load on page view. The behavior is plain vanilla custom-element code; the
// React export below just hosts the element and registers it in the browser.
const ELEMENT_NAME = 'lite-youtube'

function defineLiteYouTube() {
  if (typeof window === 'undefined') return
  if (customElements.get(ELEMENT_NAME)) return

  class LiteYouTube extends HTMLElement {
    connectedCallback() {
      const videoId = this.getAttribute('videoid') ?? ''
      const label = this.getAttribute('title') ?? 'Play video'

      const root = this.attachShadow({ mode: 'open' })
      root.innerHTML = `
        <style>
          :host { display: block; }
          .frame {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            background: #000;
            border-radius: 0.75rem;
            overflow: hidden;
            cursor: pointer;
          }
          .poster {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .play {
            position: absolute;
            inset: 0;
            margin: auto;
            width: 68px;
            height: 48px;
            border: 0;
            padding: 0;
            background: transparent;
            cursor: pointer;
            transition: opacity 0.15s ease;
          }
          .frame:hover .play { opacity: 0.85; }
          .play svg { width: 100%; height: 100%; }
          iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
        </style>
        <div class="frame" part="frame">
          <img class="poster" alt="" loading="lazy" />
          <button class="play" type="button" aria-label="${label}">
            <svg viewBox="0 0 68 48" aria-hidden="true">
              <path d="M66.52 7.74a8 8 0 0 0-5.6-5.66C55.8.7 34 .7 34 .7s-21.8 0-26.92 1.38a8 8 0 0 0-5.6 5.66A83 83 0 0 0 .5 24a83 83 0 0 0 .98 16.26 8 8 0 0 0 5.6 5.66C12.2 47.3 34 47.3 34 47.3s21.8 0 26.92-1.38a8 8 0 0 0 5.6-5.66A83 83 0 0 0 67.5 24a83 83 0 0 0-.98-16.26Z" fill="#f00"/>
              <path d="M27 34V14l18 10-18 10Z" fill="#fff"/>
            </svg>
          </button>
        </div>
      `

      const frame = root.querySelector('.frame') as HTMLElement
      const poster = root.querySelector('.poster') as HTMLImageElement
      if (videoId) {
        // Prefer the 1280x720 16:9 thumbnail; fall back to the always-present
        // hqdefault (480x360) if the video has no HD poster.
        poster.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        poster.addEventListener(
          'error',
          () => {
            poster.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          },
          { once: true },
        )
      }

      frame.addEventListener(
        'click',
        () => {
          const iframe = document.createElement('iframe')
          // youtube-nocookie keeps the player in privacy-enhanced mode.
          iframe.setAttribute(
            'src',
            `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`,
          )
          iframe.setAttribute('title', label)
          iframe.setAttribute(
            'allow',
            'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture',
          )
          iframe.setAttribute('allowfullscreen', '')
          frame.replaceChildren(iframe)
        },
        { once: true },
      )
    }
  }

  customElements.define(ELEMENT_NAME, LiteYouTube)
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lite-youtube': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { videoid?: string }
    }
  }
}

export function YouTubeEmbed({ id, title }: { id: string; title?: string }) {
  // Register the custom element on the client after hydration. Guarded inside
  // defineLiteYouTube so multiple embeds on a page only define it once.
  useEffect(() => {
    defineLiteYouTube()
  }, [])

  return (
    <div className="not-prose my-8 first:mt-0">
      <lite-youtube videoid={id} title={title} />
    </div>
  )
}
