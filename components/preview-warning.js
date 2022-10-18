import Link from 'next/link'

export default function PreviewWarning({ rounded } = {}) {
  return (
    <div className={`relative bg-blue-600 ${rounded ? 'rounded-md' : ''}`}>
      <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
        <div className="pr-16 sm:px-16 sm:text-center">
          <p className="font-medium text-white">
            <span className="md:hidden">
              The AT Protocol is still in development.
            </span>
            <span className="hidden md:inline">
              The AT Protocol is still in active development.
            </span>
            <span className="block sm:ml-2 sm:inline-block">
              <Link href="/roadmap">
                <a className="font-bold text-white underline">
                  Learn more
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
