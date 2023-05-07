import { ArrowRightCircleIcon } from '@heroicons/react/24/solid'

export default function TLDR({ items }) {
  return (
    <div className="bg-gray-50 rounded mb-8 mt-2 lg:mt-0">
      <h3 className="font-bold px-4 py-2">TL;DR:</h3>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start px-4 py-2 border-t border-gray-100"
        >
          <ArrowRightCircleIcon
            className="h-5 w-5 text-blue-500"
            aria-hidden="true"
          />
          <div className="ml-2 flex-1 text-gray-600 text-sm">{item}</div>
        </div>
      ))}
    </div>
  )
}
