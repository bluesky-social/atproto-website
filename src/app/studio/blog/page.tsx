import { notFound } from 'next/navigation'
import { BlogEditor } from './BlogEditor'

export const metadata = { title: 'Studio — Blog' }

export default function StudioBlogPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <BlogEditor />
}
