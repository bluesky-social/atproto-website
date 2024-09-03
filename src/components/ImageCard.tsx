import Link from 'next/link'
import Image from 'next/image'
import { Tag } from './Tag'

export function ImageCard({
  image,
  href,
  title,
  tag,
  description,
}: React.PropsWithChildren<{
  image: string
  href: string
  title: string
  tag: string
  description: string
}>) {
  return (
    <div className="not-prose">
      <Link href={href}>
        <Image
          alt={title}
          src={image}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
      </Link>
      <h3 className="leading-1 mt-6 text-lg font-semibold text-gray-900 dark:text-white">
        <Link href={href}>{title}</Link>
      </h3>
      <div className="mt-2 flex items-center gap-x-3">
        <Tag color={tag === 'Guide' ? 'emerald' : 'sky'}>{tag}</Tag>
      </div>
      <p className="mt-4 text-sm dark:text-zinc-400">{description}</p>
    </div>
  )
}
