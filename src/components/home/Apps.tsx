const apps = [
  {
    href: 'https://www.graze.social/',
    alt: 'The user interface of Graze. A visual canvas based editor for designing and deploying algorithms on Bluesky.',
    src: 'https://bsky.social/about/project-graze.png',
    title: 'Graze',
    desc: 'Graze lets you design and control custom feeds for yourself, your friends, and your passions.',
  },
  {
    href: 'https://tangled.org/',
    alt: 'A repository hosted on Tangled',
    src: 'https://bsky.social/about/project-tangled.png',
    title: 'Tangled',
    desc: 'Tangled is a social git platform on the atmosphere where developers own code, communities self-govern, and coding is fun.',
  },
  {
    href: 'https://skylight.social/',
    alt: 'The mobile user interface of Skylight.',
    src: 'https://bsky.social/about/project-skylight.png',
    title: 'Skylight',
    desc: 'Tune in and tune out with short form videos. Your content and connections stay with you.',
  },
  {
    href: 'https://leaflet.pub/',
    alt: 'The user interface of Leaflet.pub, showing a document being edited.',
    src: 'https://bsky.social/about/project-leaflet.png',
    title: 'Leaflet.pub',
    desc: 'Leaflet.pub is a fast, account-free tool for creating and sharing collaborative documents and blogs.',
  },
  {
    href: 'https://stream.place/',
    alt: 'The user interface of Streamplace, showing a collection of available streams.',
    src: 'https://bsky.social/about/project-streamplace.png',
    title: 'Streamplace',
    desc: 'Stream.place is an open-source video streaming layer for decentralized social networks.',
  },
  {
    href: 'https://www.germnetwork.com/',
    alt: "Germ's logo and mobile user interface showing three user profiles.",
    src: 'https://bsky.social/about/project-germ.png',
    title: 'Germ',
    desc: 'Germ Network is a privacy-first encrypted messenger with multiple identities and AT-Protocol integration.',
  },
]

export function Apps() {
  return (
    <div className="grid-col-1 grid gap-4 md:grid-cols-3">
      {apps.map((app) => (
        <a
          key={app.href}
          href={app.href}
          target="_blank"
          className="md:hover:bg-offwhite flex flex-col justify-evenly gap-[14px] self-start overflow-hidden rounded-[20px] bg-white p-6 text-black"
        >
          <img
            alt={app.alt}
            loading="lazy"
            width="400"
            height="300"
            decoding="async"
            data-nimg="1"
            className="h-full w-full object-cover md:object-contain"
            src={app.src}
          />
          <div className="flex flex-col gap-2">
            <h4 className="md:text-sans-20 font-bold -tracking-[0.24px] md:-tracking-[0.24px]">
              {app.title}
            </h4>
            <p className="md:text-sans-16 line-clamp-3 -tracking-[0.24px] md:-tracking-[0.16px]">
              {app.desc}
            </p>
          </div>
          <div className="text-primary-blue flex items-center gap-2">
            <p className="font-600 md:text-sans-16 -tracking-[0.24px] md:-tracking-[0.16px]">
              See project
            </p>
            <svg
              className="group-hover/card:text-primary-blue h-4 w-4 -rotate-45 transform"
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Arrow Icon</title>
              <path
                d="M5.88809 9.20633L13.7935 9.20634M13.7935 9.20634L10.4996 5.9124M13.7935 9.20634L10.4996 12.5003M18.2258 9.20633C18.2258 13.8372 14.4717 17.5913 9.84082 17.5913C5.20991 17.5913 1.45582 13.8372 1.45582 9.20633C1.45582 4.57542 5.20991 0.821327 9.84082 0.821327C14.4717 0.821327 18.2258 4.57542 18.2258 9.20633Z"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>
        </a>
      ))}
    </div>
  )
}
