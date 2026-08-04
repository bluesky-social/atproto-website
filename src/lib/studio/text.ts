// Pure text helpers shared by the studio editors and the server-side services.
//
// MUST NOT import anything that reaches a `node:` built-in: the editors are
// `'use client'`, so a node import here is a webpack failure that takes
// `next dev` down, and tsc does not catch it. A guard test in
// src/lib/git.test.ts asserts this file stays clean.

// Titles and descriptions are single-line values — one MDX header field, one
// line in episodes.ts/posts.ts, one RSS element. A break in them is either an
// accidental Enter or a hard-wrapped paste, so fold each run of breaks (plus any
// whitespace hugging it, e.g. indentation on the next line) into one space.
//
// Deliberately does not trim: the editors call this on every keystroke, and
// eating a just-typed trailing space is the bug the guests field already had.
export function singleLine(value: string): string {
  return value.replace(/[ \t]*(?:\r\n|\r|\n)+[ \t]*/g, ' ')
}
