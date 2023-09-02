import Link from "next/link";

export default function Error({ title, message }) {
  return (
    <div className="relative overflow-hidden bg-[#06142B] bg-[url(/img/hero-bg.jpg)] bg-center bg-cover">
      <div className="relative pt-10 pb-20 sm:pt-4 sm:pb-24">
        <main className="mx-auto mt-16 max-w-7xl px-4 sm:mt-24">
          <div className="flex flex-row space-x-6 sm:space-x-8 md:space-x-10">
            <img
              src="/img/hero-img.png"
              className="h-20 sm:h-28 md:h-32"
              title="The AT Protocol"
            />
            <div className="self-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-6xl">
                <span className="block xl:inline text-blue-50">{title}</span>
              </h1>
              <p className="mx-auto max-w-md text-base text-blue-100 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                {message}
              </p>
            </div>
          </div>
          <div className="mt-8 max-w-xl sm:flex sm:justify-start sm:ml-36 md:ml-44 sm:mt-12 md:mt-16">
            <div className="rounded-md shadow">
              <Link href="/">
                <a className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:px-10 md:text-lg">
                  Back to home
                </a>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
