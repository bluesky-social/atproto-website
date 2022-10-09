import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'

export default function Alert({ title, message }) {
  return (
    <div className="rounded-md bg-blue-50 px-4 py-5">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-blue-400 mt-0.5"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
