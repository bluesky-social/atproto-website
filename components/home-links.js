import Link from 'next/link'
import {
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Guides',
    href: '/guides',
    description:
      'Learn about the technology with high-level explanations of its design.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Specifications',
    href: '/specs',
    description: 'Read the protocol documentation for detailed explanations.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Lexicons',
    href: '/lexicons',
    description:
      'Explore the schemas which drive the protocol and social applications.',
    icon: BookOpenIcon,
  },
]

export default function HomeLinks() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 text-center">
      {features.map((feature) => (
        <div key={feature.name} className="pt-6">
          <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
            <Link href={feature.href}>
              <a className="block -mt-6">
                <span>
                  <span className="inline-flex items-center justify-center rounded-md bg-blue-500 p-3 shadow-lg">
                    <feature.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </span>
                <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                  {feature.name}
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  {feature.description}
                </p>
              </a>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
