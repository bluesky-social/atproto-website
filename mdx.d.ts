// Types for the named exports our MDX files carry. @types/mdx only types the
// default export; everything else has to be declared here, and it must stay a
// *script* file (no top-level import/export) for this to be an ambient
// augmentation rather than a module one.
//
// Needed because page.tsx now reads `header` to build its metadata. Before that,
// pages imported MDX through a template-literal `import()`, which TS resolves to
// `any` — so the absence of these types was never surfaced.

declare module '*.mdx' {
  /**
   * `export const header` from the MDX file.
   *
   * Typed as `any`, deliberately. Blog posts, episodes, guides, and specs all
   * carry different header shapes, and an ambient declaration can't vary per
   * file. A structural type doesn't work either: `EpisodePage` requires
   * `episodeNumber`, `date`, `pubDate`, and `audioUrl`, and no index signature
   * or optional-property type satisfies required props — the alternative was a
   * double cast in every episode page, which asserts just as much as `any` does
   * while looking more rigorous.
   *
   * This is not a regression: the dynamic import these pages used before
   * resolved to `any` too. Header shape is enforced where headers are *written*
   * — `EpisodeFields` and `OwnedFields` in src/lib/studio, both covered by
   * tests — rather than where they're read.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const header: any

  /**
   * `export const metadata` — a second, older convention used by two pages
   * (guides/data-validation, specs/permission) whose MDX renders its own `# h1`
   * and so carries no `header`. Same `any` reasoning as above.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const metadata: any

  /** Section list injected by the recma plugin, consumed by the section nav. */
  export const sections: Array<{ id: string; title: string }> | undefined
}
