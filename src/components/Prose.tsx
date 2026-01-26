import clsx from 'clsx'

export function Prose<T extends React.ElementType = 'div'>({
  as,
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className'> & {
  as?: T
  className?: string
}) {
  let Component = as ?? 'div'

  return (
    <Component
      className={clsx(
        className,
        'prose dark:prose-invert',
        // `html :where(& > *)` is used to select all direct children without an increase in specificity like you'd get from just `& > *`
        'px-8 md:px-16 [html_:where(&>*)]:max-w-2xl [html_:where(&>*)]:lg:max-w-3xl',
      )}
      {...props}
    />
  )
}
