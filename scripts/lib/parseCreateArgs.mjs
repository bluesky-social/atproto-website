// scripts/lib/parseCreateArgs.mjs

/**
 * Parses the CLI args passed to `npm run blog create`. Recognizes the
 * `--no-ssite` flag and surfaces any other `--`-prefixed tokens as unknown,
 * so a typo like `--no-site` is reported instead of silently falling through
 * to an unwanted publish.
 *
 * @param {string[]} args
 * @returns {{ noSsite: boolean, unknownFlags: string[] }}
 */
export function parseCreateArgs(args) {
  const noSsite = args.includes('--no-ssite')
  const unknownFlags = args.filter(
    (a) => a.startsWith('--') && a !== '--no-ssite',
  )
  return { noSsite, unknownFlags }
}
