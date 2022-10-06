import Link from 'next/link'
import {
  AcademicCapIcon,
  CommandLineIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Get Started',
    href: '/get-started',
    description:
      'Explore the beta software and learn how to host your own server.',
    icon: CommandLineIcon,
  },
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
]

export default function HomeLinks() {
  return (
    <div className="relative bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-lg font-semibold text-indigo-600">Introducing</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          The Social Internet
        </p>
        <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">
          Connect to friends, family, and communities without ever being locked
          into a service. The <code>at://</code> protocol puts you in control of
          your online world.
        </p>
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <Link href={feature.href}>
                    <a className="block -mt-6" href={feature.href}>
                      <span>
                        <span className="inline-flex items-center justify-center rounded-md bg-indigo-500 p-3 shadow-lg">
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
        </div>
      </div>
    </div>
  )
}
