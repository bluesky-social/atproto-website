#!/usr/bin/env node
// scripts/podcast.mjs

const command = process.argv[2]
const arg = process.argv[3]

const commands = {
  create: {
    description: 'Create a new Off Protocol episode',
    run: () => import('./new-episode.mjs').then((m) => m.main()),
  },
  remove: {
    description: 'Remove an Off Protocol episode',
    run: () => import('./remove-episode.mjs').then((m) => m.main()),
  },
}

if (!command || !commands[command]) {
  console.log('\nUsage: npm run podcast <command>\n')
  console.log('Commands:')
  for (const [name, cmd] of Object.entries(commands)) {
    const usage = cmd.usage ? ` ${cmd.usage}` : ''
    console.log(`  ${name}${usage}`.padEnd(32) + cmd.description)
  }
  console.log('')
  process.exit(command ? 1 : 0)
}

commands[command].run().catch((err) => {
  console.error(err)
  process.exit(1)
})
