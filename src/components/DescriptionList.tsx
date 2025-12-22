export function DescriptionList({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-gray-100 dark:border-white/10">
      <dl className="divide-y divide-gray-100 dark:divide-white/10">
        {children}
      </dl>
    </div>
  )
}

export function Description({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
      <dt className="text-md font-medium leading-6 text-gray-900 dark:text-white">
        {title}
      </dt>
      <dd className="text-md mt-1 leading-6 text-gray-700 sm:col-span-3 sm:mt-0 dark:text-gray-400">
        {children}
      </dd>
    </div>
  )
}
