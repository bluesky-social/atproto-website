import { Children } from 'react'
import Image from 'next/image'
import cli from '@/images/icons/command-line.svg'
import service from '@/images/icons/cloud.svg'
import webapp from '@/images/icons/computer-desktop.svg'
import repo from '@/images/icons/code-bracket.svg'

type ProjectType = 'repo' | 'cli' | 'webapp' | 'service'

const ICONS = { repo, cli, webapp, service }

export function Listing({
  children,
  title,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="mb-16 flex flex-col lg:flex-row">
      <div className="lg:w-[200px]">
        <div className="border-gray-100 text-lg font-medium lg:border-b">
          {title}
        </div>
      </div>
      <div className="flex max-w-2xl flex-1 flex-col gap-4">{children}</div>
    </div>
  )
}

export function Item({
  children,
  type,
}: React.PropsWithChildren<{ type?: ProjectType }>) {
  const icon = ICONS[type || 'repo']
  return (
    <a
      className="flex flex-row gap-3 rounded-lg border border-gray-200 px-4 py-4 hover:bg-gray-50"
      href="#"
    >
      <Image
        src={icon}
        alt=""
        className="mt-1 h-5 w-5 opacity-[0.8]"
        unoptimized
      />
      <span className="flex flex-col gap-1">{children}</span>
    </a>
  )
}

export function Title({ org, name }: { org?: string; name: string }) {
  return (
    <span className="flex gap-0.5 text-lg font-semibold text-gray-900">
      {org ? (
        <>
          <span className="truncate">{org}</span>
          <span className="text-gray-500 dark:text-gray-400">/</span>
        </>
      ) : (
        <></>
      )}
      <span className="whitespace-nowrap">{name}</span>
    </span>
  )
}

export function Description({ children }: React.PropsWithChildren<{}>) {
  return <span className="block">{children}</span>
}
