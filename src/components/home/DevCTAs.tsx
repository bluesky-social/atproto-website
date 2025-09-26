import Link from 'next/link'

export function DevCTAs() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
          <Link href="#" className="block px-8 py-6 pt-24">
            <div className="font-display text-xl font-medium">OAuth</div>
            <div className="">Log in and get permissions</div>
          </Link>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
          <Link href="#" className="block px-8 py-6 pt-24">
            <div className="font-display text-xl font-medium">Data repos</div>
            <div className="">Read and write to the user&#39;s store</div>
          </Link>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
          <Link href="#" className="block px-8 py-6 pt-24">
            <div className="font-display text-xl font-medium">Firehose</div>
            <div className="">Listen to the activity feed</div>
          </Link>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
          <Link href="#" className="block px-8 py-6 pt-24">
            <div className="font-display text-xl font-medium">Schemas</div>
            <div className="">Structured record and RPC types</div>
          </Link>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
          <Link href="#" className="block px-8 py-6 pt-24">
            <div className="font-display text-xl font-medium">Blobs</div>
            <div className="">Media and files on the network</div>
          </Link>
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800">
          <Link href="#" className="block px-8 py-6 pt-24">
            <div className="font-display text-xl font-medium">Moderation</div>
            <div className="">Label content to keep things chill</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
