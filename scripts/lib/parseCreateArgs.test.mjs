// scripts/lib/parseCreateArgs.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseCreateArgs } from './parseCreateArgs.mjs'

test('recognizes --no-ssite', () => {
  assert.deepEqual(parseCreateArgs(['--no-ssite']), {
    noSsite: true,
    unknownFlags: [],
  })
})

test('reports an unrecognized flag (e.g. a typo) and does not set noSsite', () => {
  assert.deepEqual(parseCreateArgs(['--no-site']), {
    noSsite: false,
    unknownFlags: ['--no-site'],
  })
})

test('no flags yields no-ssite false and no unknowns', () => {
  assert.deepEqual(parseCreateArgs([]), { noSsite: false, unknownFlags: [] })
})
