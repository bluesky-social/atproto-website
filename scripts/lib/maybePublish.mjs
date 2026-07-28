// scripts/lib/maybePublish.mjs

/**
 * Runs the standard.site publish step for a freshly-created post, owning all
 * publish-outcome messaging. Never throws: a publish failure is reported as a
 * warning plus a recovery command so that `npm run blog create` still succeeds
 * (the post files already exist by the time this runs).
 *
 * @param {string} slug
 * @param {{ noSsite: boolean, publishFn: (slug: string) => Promise<string> }} opts
 * @returns {Promise<{status: 'skipped'} | {status: 'published', uri: string} | {status: 'failed', error: Error}>}
 */
export async function maybePublish(slug, { noSsite, publishFn }) {
  if (noSsite) {
    console.log('\n⏭  Skipping standard.site publish (--no-ssite).')
    console.log(`   Publish later with: npm run blog ssite ${slug}`)
    return { status: 'skipped' }
  }

  try {
    const uri = await publishFn(slug)
    console.log(`\n✅ Published standard.site record: ${uri}`)
    return { status: 'published', uri }
  } catch (error) {
    console.warn(
      `\n⚠️  Post created but standard.site publish failed: ${error.message}`,
    )
    console.warn(`   Publish later with: npm run blog ssite ${slug}`)
    return { status: 'failed', error }
  }
}
