'use client'

import { useState } from 'react'
import Image, { StaticImageData } from 'next/image'

export function AtmosphereLoginEmbed({ logoSrc }: { logoSrc?: string | StaticImageData }) {
  const [selectedDid, setSelectedDid] = useState<string | null>(null)

  const handleClick = () => {
    // Open demo app in popup
    const popup = window.open(
      'https://demo-a-production.up.railway.app/',
      'atmosphere-login',
      'width=500,height=600,scrollbars=yes'
    )

    // Listen for message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === 'https://demo-a-production.up.railway.app') {
        if (event.data?.did) {
          setSelectedDid(event.data.did)
          popup?.close()
          window.removeEventListener('message', handleMessage)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // Cleanup when popup closes
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', handleMessage)
      }
    }, 500)
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <button
        type="button"
        onClick={handleClick}
        className="h-8 inline-flex items-center gap-2 px-3 bg-white text-zinc-800 font-medium rounded border border-sky-200 hover:bg-sky-50 hover:border-sky-300 transition-all shadow-sm"
      >
        {logoSrc ? (
          <Image src={logoSrc} alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain" />
        ) : (
          <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
            </svg>
          </div>
        )}
        <span>Sign in with Atmosphere</span>
      </button>
      {selectedDid && (
        <div className="text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
          <span className="font-medium">Logged in:</span>{' '}
          <code className="bg-green-100 dark:bg-green-900/40 px-1 rounded">
            {selectedDid}
          </code>
        </div>
      )}
    </div>
  )
}
