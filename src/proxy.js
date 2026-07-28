import { i18nRouter } from 'next-i18n-router'
import i18nConfig from '../i18nConfig'

export function proxy(request) {
  return i18nRouter(request, i18nConfig)
}

export const config = {
  // Exclude `studio` so the dev-only authoring tool bypasses i18n routing and
  // is served by its own root layout at /studio/* (no locale prefix, no nav).
  matcher: '/((?!api|static|studio|.*\\..*|_next).*)',
}
