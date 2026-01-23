export function FlagIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  const strokeWidth = props.strokeWidth || '2.2'
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <path
        d="M6 20.2223V5.5719C6 5.06319 6.2897 4.59921 6.7621 4.41046C7.80332 3.99446 9.76465 3.33337 11.7143 3.33337C14.559 3.33337 17.441 6.14819 20.2857 6.14819C21.6198 6.14819 22.9593 5.83866 24.0058 5.50992C24.9471 5.21421 26 5.89307 26 6.87979V19.3911C26 19.8999 25.7103 20.3638 25.2379 20.5526C24.1967 20.9686 22.2354 21.6297 20.2857 21.6297C17.441 21.6297 14.559 18.8149 11.7143 18.8149C8.86958 18.8149 6 20.2223 6 20.2223ZM6 20.2223V28.6667"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}
