import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'

export default function Alert({ title, message }) {
  return (
    <div className="rounded-md bg-blue-600 px-4 py-5 mb-6 mt-4 md:mt-0">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-10 w-10 text-blue-400 mt-0.5"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-blue-50">{title}</h3>
          <div className="mt-2 text-md text-blue-100">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
