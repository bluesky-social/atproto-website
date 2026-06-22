// scripts/lib/buildContributors.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildContributors } from './buildContributors.mjs'

const authors = {
  'Jim Ray': 'did:plc:lysqukqdu6hsrhet5v2brjgo',
  'AT Protocol Team': 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
}

test('builds a single-author contributors array', () => {
  const out = buildContributors('Jim Ray', authors)
  assert.deepEqual(out, [
    {
      did: 'did:plc:lysqukqdu6hsrhet5v2brjgo',
      displayName: 'Jim Ray',
      role: 'author',
    },
  ])
})

test('preserves displayName for team identities', () => {
  const out = buildContributors('AT Protocol Team', authors)
  assert.deepEqual(out[0].displayName, 'AT Protocol Team')
  assert.equal(out[0].did, 'did:plc:ewvi7nxzyoun6zhxrhs64oiz')
})

test('throws on unknown author', () => {
  assert.throws(
    () => buildContributors('Nobody', authors),
    /unknown author: Nobody/i,
  )
})
