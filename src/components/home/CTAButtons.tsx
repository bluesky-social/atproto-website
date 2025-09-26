import Link from 'next/link'

export function CTAButtons() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <div className="rounded-lg bg-gray-100 lg:col-span-2 dark:bg-gray-800">
          <Link
            href="#"
            className="font-display block p-6 text-center text-3xl font-medium"
          >
            Learn
          </Link>
        </div>
        <div className="rounded-lg bg-gray-100 lg:col-span-2 dark:bg-gray-800">
          <Link
            href="#"
            className="font-display block p-6 text-center text-3xl font-medium"
          >
            Build
          </Link>
        </div>
        <div className="rounded-lg bg-gray-100 lg:col-span-2 dark:bg-gray-800">
          <Link
            href="#"
            className="font-display block p-6 text-center text-3xl font-medium"
          >
            Deploy
          </Link>
        </div>
      </div>
    </div>
  )
}
