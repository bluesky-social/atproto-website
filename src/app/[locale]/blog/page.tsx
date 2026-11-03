import { BlogIndex, BLOG_DESCRIPTION } from '@/components/BlogListing'

/**
 * Blog Post Listing
 *
 * HOW TO ADD A NEW BLOG POST:
 *
 * The easiest way is to run
 *
 * npm run blog
 *
 * From the root directory of this application
 *
 * 1. Create a new directory: src/app/[locale]/blog/your-post-slug/
 *
 * 2. Add page.tsx (copy from an existing post and update metadata)
 *
 * 3. Add en.mdx with your content:
 *    ```
 *    export const header = {
 *      title: 'Your Post Title',
 *      description: 'Your post description',
 *      date: 'January 20, 2026',
 *    }
 *
 *    # Your Post Title
 *
 *    Your markdown content here...
 *    ```
 *
 * 4. Add the post to the `posts` array in src/lib/posts.ts (newest first)
 *
 * 5. (Optional) Add translations: pt.mdx, ja.mdx, ko.mdx
 */

export const metadata = {
  title: 'Blog',
  description: BLOG_DESCRIPTION,
}

export default function BlogIndexPage() {
  return <BlogIndex />
}
