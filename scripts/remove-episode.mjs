#!/usr/bin/env node
// scripts/remove-episode.mjs

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PODCAST_DIR = path.join(__dirname, '../src/app/[locale]/off-protocol')
const EPISODES_FILE = path.join(__dirname, '../src/lib/episodes.ts')
const PAGE_SIZE = 10

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function parseEpisodes() {
  const content = fs.readFileSync(EPISODES_FILE, 'utf-8')
  const episodes = []
  const entryRegex =
    /\{[^}]*slug:\s*'([^']*)'[^}]*episodeNumber:\s*(\d+)[^}]*title:\s*'([^']*)'[^}]*date:\s*'([^']*)'[^}]*\}/gs
  let match
  while ((match = entryRegex.exec(content)) !== null) {
    episodes.push({
      slug: match[1],
      episodeNumber: parseInt(match[2], 10),
      title: match[3],
      date: match[4],
    })
  }
  return episodes
}

function displayPage(episodes, offset) {
  const page = episodes.slice(offset, offset + PAGE_SIZE)
  if (page.length === 0) {
    console.log('\nNo more episodes.\n')
    return false
  }
  console.log('')
  page.forEach((ep, i) => {
    const num = offset + i + 1
    console.log(
      `  ${String(num).padStart(3)}. Ep ${ep.episodeNumber}: ${ep.title} (${ep.date})`,
    )
  })
  console.log('')
  return true
}

function removeEpisodeEntry(slug) {
  const content = fs.readFileSync(EPISODES_FILE, 'utf-8')
  const entryRegex = new RegExp(
    `\\s*\\{[^}]*slug:\\s*'${slug}'[^}]*\\},?\\n?`,
    's',
  )
  fs.writeFileSync(EPISODES_FILE, content.replace(entryRegex, '\n'))
}

function removeEpisodeDirectory(slug) {
  const dir = path.join(PODCAST_DIR, slug)
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
    return true
  }
  return false
}

export async function main() {
  const episodes = parseEpisodes()

  if (episodes.length === 0) {
    console.log('\nNo episodes found.\n')
    process.exit(0)
  }

  console.log('\n🗑️  Remove an Off Protocol episode\n')
  console.log(
    'NOTE: This deletes local files and removes the entry from episodes.ts.',
  )
  console.log(
    'It does NOT unsubscribe listeners — once a guid has been distributed,',
  )
  console.log('subscribers retain access on their devices.\n')

  let offset = 0
  while (true) {
    displayPage(episodes, offset)
    const end = Math.min(offset + PAGE_SIZE, episodes.length)
    const moreAvailable = end < episodes.length

    const options = [`${offset + 1}-${end}`]
    if (moreAvailable) options.push("'m' for more")
    options.push("'q' to quit")

    const input = (
      await question(`Select an episode to remove (${options.join(', ')}): `)
    ).trim().toLowerCase()

    if (input === 'q') {
      console.log('\nCancelled.\n')
      break
    }
    if (input === 'm') {
      if (moreAvailable) offset += PAGE_SIZE
      else console.log('\nNo more episodes to show.')
      continue
    }

    const num = parseInt(input, 10)
    if (Number.isNaN(num) || num < 1 || num > episodes.length) {
      console.log(
        `\nInvalid selection. Enter a number between 1 and ${episodes.length}.\n`,
      )
      continue
    }

    const ep = episodes[num - 1]
    const confirm = (
      await question(
        `Remove 'Ep ${ep.episodeNumber}: ${ep.title}'? This cannot be undone. (y/N): `,
      )
    ).trim().toLowerCase()

    if (confirm !== 'y') {
      console.log('\nCancelled.\n')
      break
    }

    removeEpisodeEntry(ep.slug)
    const dirRemoved = removeEpisodeDirectory(ep.slug)

    console.log('\n✅ Episode removed!')
    console.log(`  Removed from src/lib/episodes.ts`)
    console.log(
      dirRemoved
        ? `  Deleted src/app/[locale]/off-protocol/${ep.slug}/`
        : `  Directory src/app/[locale]/off-protocol/${ep.slug}/ not found`,
    )
    console.log('')
    break
  }

  rl.close()
}
