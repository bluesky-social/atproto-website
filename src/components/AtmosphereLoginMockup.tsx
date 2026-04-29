'use client'

import { useState } from 'react'
import Image, { StaticImageData } from 'next/image'

// Mock identity data for demonstration
const mockIdentities = [
  {
    did: 'did:plc:z72i7hdynmk6r22z27h6tvur',
    handle: 'alice.bsky.social',
    displayName: 'Alice',
  },
  {
    did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
    handle: 'alice.example.com',
    displayName: 'Alice (Personal)',
  },
]

function AvatarPlaceholder({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  // Sketchy gradient effect
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400 flex items-center justify-center text-white font-medium text-sm shadow-sm border border-sky-200">
      {initial}
    </div>
  )
}

// Unified Login/Signup Widget - always light mode, sketchy aesthetic
export function AtmosphereLoginWidget({
  appName = 'Example App',
  logoSrc,
}: {
  appName?: string
  logoSrc?: string | StaticImageData
}) {
  const [view, setView] = useState<'choose' | 'create'>('choose')
  const [handle, setHandle] = useState('')
  const [selectedDid, setSelectedDid] = useState<string | null>(null)

  return (
    // Force light mode with explicit background and text colors
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-sky-100 overflow-hidden text-zinc-900">
      {/* Header with sketchy logo */}
      <div className="px-6 pt-6 pb-4 text-center border-b border-sky-50">
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt="Atmosphere"
            width={48}
            height={48}
            className="mx-auto mb-3"
          />
        ) : (
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
            </svg>
          </div>
        )}
        <h2 className="text-lg font-semibold text-zinc-800">
          {view === 'choose' ? 'Choose an account' : 'Create an account'}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          to continue to <span className="font-medium text-zinc-700">{appName}</span>
        </p>
      </div>

      {view === 'choose' ? (
        <>
          {/* Identity List */}
          <div className="py-2">
            {mockIdentities.map((identity) => (
              <button
                key={identity.did}
                type="button"
                onClick={() => setSelectedDid(identity.did)}
                className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-sky-50 transition-colors text-left ${
                  selectedDid === identity.did ? 'bg-sky-50' : ''
                }`}
              >
                <AvatarPlaceholder name={identity.displayName || identity.handle} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-800 truncate">
                    {identity.displayName || identity.handle}
                  </div>
                  <div className="text-sm text-zinc-500 truncate">
                    @{identity.handle}
                  </div>
                </div>
                {selectedDid === identity.did && (
                  <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            {/* Use another account */}
            <button
              type="button"
              className="w-full px-6 py-3 flex items-center gap-3 hover:bg-sky-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-sky-300 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="font-medium text-zinc-600">
                Use another account
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="px-6 py-3 border-t border-sky-50">
            <button
              type="button"
              onClick={() => setView('create')}
              className="w-full text-center text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Create a new account
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Create account form */}
          <div className="p-6">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="yourhandle"
                className="w-full pl-8 pr-4 py-2.5 border border-sky-200 rounded-lg bg-white text-zinc-800 placeholder-zinc-400 focus:ring-2 focus:ring-sky-300 focus:border-sky-300 outline-none"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Your handle will be your identity across the Atmosphere.
            </p>

            <button
              type="button"
              className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg font-medium hover:from-sky-500 hover:to-blue-600 transition-all shadow-sm"
            >
              Create account
            </button>
          </div>

          {/* Back link */}
          <div className="px-6 py-3 border-t border-sky-50">
            <button
              type="button"
              onClick={() => setView('choose')}
              className="w-full text-center text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Use an existing account
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-sky-50/50 border-t border-sky-100">
        <p className="text-xs text-zinc-500 text-center">
          Your PDS authenticates you.{' '}
          <a href="/guides/identity" className="text-sky-600 hover:underline">Learn more</a>
        </p>
      </div>
    </div>
  )
}

// Single login button
export function AtmosphereLoginButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-medium rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all shadow-sm"
    >
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
        </svg>
      </div>
      <span>Login with Atmosphere</span>
    </button>
  )
}
