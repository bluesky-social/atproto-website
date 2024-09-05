export function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl lg:max-w-3xl">{children}</div>
}
// flex-auto prose dark:prose-invert [html_:where(&>*)]:mx-auto [html_:where(&>*)]:max-w-2xl [html_:where(&>*)]:lg:mx-[calc(50%-min(50%,theme(maxWidth.lg)))] [html_:where(&>*)]:lg:max-w-3xl
