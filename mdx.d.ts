// Types for the named exports our MDX files carry. @types/mdx only types the
// default export; everything else has to be declared here, and it must stay a
// *script* file (no top-level import/export) for this to be an ambient
// augmentation rather than a module one.
//
// Needed because page.tsx reads `header` to build its metadata. Until that
// change, pages imported MDX through a template-literal `import()`, which TS
// resolves to `any` — so a missing type was never surfaced.

declare module '*.mdx' {
  /**
   * `export const header` from the MDX file. Typed loosely on purpose: blog
   * posts, episodes, guides, and specs all carry different extra fields, and
   * only title/description are read by shared code. Optional because plenty of
   * MDX files — code snippets, transcripts — have no header at all.
   */
  export const header:
    | ({ title: string; description: string } & Record<string, unknown>)
    | undefined

  /** Section list injected by the recma plugin, consumed by the section nav. */
  export const sections: Array<{ id: string; title: string }> | undefined
}
