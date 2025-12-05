'use client'

import clsx from 'clsx'
import { useSectionStore } from './SectionProvider'

export interface PageSectionProp {
  id: string
  title: string
}

export function PageSectionsNavigation({
  sections,
}: {
  sections?: PageSectionProp[]
}) {
  const visibleSections = useSectionStore((s) => s.visibleSections)
  const maxLen = (sections || []).reduce(
    (len, section) => (section.title.length > len ? section.title.length : len),
    0,
  )

  if (!sections?.length) {
    return <></>
  }

  return (
    <div className="sticky top-4 pt-16">
      {sections.map((section) => (
        <div
          key={section.id}
          className={clsx(
            'border-l-2 px-4 py-2',
            section.id === visibleSections[0]
              ? 'border-slate-900'
              : 'border-slate-200',
          )}
        >
          <a
            className={clsx(
              maxLen > 20 || sections.length > 8 ? 'text-md' : 'text-lg',
              section.id === visibleSections[0]
                ? 'text-slate-900'
                : 'text-slate-500',
            )}
            href={`#${section.id}`}
          >
            {section.title}
          </a>
        </div>
      ))}
    </div>
  )
}
