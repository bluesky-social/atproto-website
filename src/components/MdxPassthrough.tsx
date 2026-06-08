/**
 * No-op MDX wrapper. Pass via the `components.wrapper` prop on an MDX render
 * to suppress the global wrapper defined in src/components/mdx.tsx (which
 * adds an outer <article>+<Prose> chrome — fine for full-page MDX like
 * blog posts, but unwanted when the surrounding page provides its own
 * section / typography, as on the podcast episode page).
 */
export function MdxPassthrough({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
