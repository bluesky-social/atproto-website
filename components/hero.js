import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#06142B] bg-[url(/img/hero-bg.jpg)] bg-center bg-cover">
      <div className="relative pt-10 pb-20 sm:pt-4 sm:pb-24">
        <main className="mx-auto mt-16 max-w-7xl px-4 sm:mt-24">
          <div className="text-center">
            <img
              src="/img/hero-img.png"
              className="mx-auto w-48 sm:w-64 mb-10"
              alt="The AT Protocol logo, an @ symbol with a blue sky and clouds in the background"
            />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline text-blue-50">
                The AT Protocol
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-blue-100 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Social networking technology created by Bluesky
            </p>
            <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="https://bsky.app">
                  <a className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:px-10 md:text-lg focus-visible:outline outline-yellow-500 outline-2">
                    Join the waitlist
                  </a>
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="/docs">
                  <a className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg focus-visible:outline outline-yellow-500 outline-2">
                    Docs
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
