#!/usr/bin/env node

const command = process.argv[2]
const arg = process.argv[3]

const commands = {
  create: {
    description: 'Create a new blog post',
    run: () => import('./new-blog-post.mjs').then((m) => m.main()),
  },
  remove: {
    description: 'Remove a blog post',
    run: () => import('./remove-blog-post.mjs').then((m) => m.main()),
  },
  ssite: {
    description: 'Publish a post as a standard-site record',
    usage: '<slug>',
    run: () => import('./publish-post.mjs').then((m) => m.main(arg)),
  },
  'hide-reply': {
    description: 'Hide a reply or detach a quote post',
    usage: '<post-url>',
    run: () => import('./hide-reply.mjs').then((m) => m.main(arg)),
  },
  'create-publication': {
    description: 'Create the standard-site publication record (one-time setup)',
    run: () => import('./create-publication.mjs').then((m) => m.main()),
  },
}

if (!command || !commands[command]) {
  console.log('\nUsage: npm run blog <command>\n')
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
