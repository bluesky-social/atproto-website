import Link from 'next/link'
import { CheckIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid'

export default function RoadmapGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => (
        <Link key={idx} href={item.href || '#'}>
          <div
            className={`flex items-center overflow-hidden rounded-lg bg-white px-4 py-4 border border-gray-200 sm:px-5 sm:py-5 ${
              item.href && 'cursor-pointer'
            }`}
          >
            <div
              className={`rounded-md ${
                item.done ? 'bg-blue-500' : 'bg-gray-400'
              } p-3`}
            >
              {item.done ? (
                <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
              ) : (
                <EllipsisHorizontalIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="flex-1 ml-4 text-md font-medium leading-5">
              {item.name}
              {item.label && (
                <>
                  {' '}
                  <span className="bg-blue-100 text-blue-700 font-mono text-xs px-1 py-.5 rounded-sm">
                    {item.label}
                  </span>
                </>
              )}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
