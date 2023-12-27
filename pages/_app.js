import { useEffect } from 'react';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (systemTheme) {
      document.documentElement.setAttribute('data-theme', systemTheme)
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
