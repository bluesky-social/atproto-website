import { CheckIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid'

export default function RoadmapGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center overflow-hidden rounded-lg bg-white px-4 py-4 border border-gray-200 sm:px-5 sm:py-5"
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
          <p className="flex-1 ml-4 text-md font-medium">{item.name}</p>
        </div>
      ))}
    </div>
  )
}
