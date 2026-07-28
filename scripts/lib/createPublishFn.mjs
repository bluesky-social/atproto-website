// scripts/lib/createPublishFn.mjs

/**
 * Builds the `publishFn` that `maybePublish` invokes to publish a post's
 * standard.site record. The dynamic import of `publish-post.mjs` happens
 * INSIDE the returned function so that a module-load failure (e.g. the
 * gitignored generated `src/lexicons` is missing) surfaces as a rejected
 * promise that `maybePublish` catches — rather than crashing at import time.
 *
 * The `importer` is injectable so the import-failure contract can be tested
 * without manipulating the real module graph.
 *
 * @param {() => Promise<{ main: (slug: string) => Promise<string> }>} importer
 * @returns {(slug: string) => Promise<string>}
 */
export function createPublishFn(importer = () => import('../publish-post.mjs')) {
  return async (slug) => {
    const mod = await importer()
    return mod.main(slug)
  }
}
