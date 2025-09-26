const stats = [
  { label: 'Transactions every 24 hours', value: '44 million' },
  { label: 'Assets under holding', value: '$119 trillion' },
  { label: 'New users annually', value: '46,000' },
]

export function Hero() {
  return (
    <div className="py-48">
      <h1 className="font-display text-balance text-6xl/[0.9] font-medium text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
        Welcome to the Atmosphere
      </h1>
      <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
        A global network for connecting people, not platforms.
      </p>
    </div>
  )
}
