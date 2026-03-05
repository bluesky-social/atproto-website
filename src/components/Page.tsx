import { PageHeader, PageHeaderProps } from './PageHeader'
import {
  PageSectionsNavigation,
  PageSectionProp,
} from './PageSectionsNavigation'
import { SectionProvider } from './SectionProvider'
import { AtprotoDocumentLink } from './AtprotoDocumentLink'
import { SubpageLinks } from './SubpageLinks'
import { BlueskyConversation } from './BlueskyConversation'

interface PageProps {
  default: React.FunctionComponent
  header?: PageHeaderProps & { standardSiteUri?: string; blueskyPostUrl?: string }
  sections?: PageSectionProp[]
}

export function Page(page: PageProps) {
  const sections = page.sections ?? []
  const navSections = page.header?.blueskyPostUrl
    ? [...sections, { id: 'discuss', title: 'Discuss' }]
    : sections

  return (
    <SectionProvider sections={navSections}>
      {page.header?.standardSiteUri && <AtprotoDocumentLink uri={page.header.standardSiteUri} />}
      {page.header && <PageHeader {...page.header} />}
      <SubpageLinks />
      <div className="flex items-start">
        <page.default />
        {navSections.length > 0 && <PageSectionsNavigation sections={navSections} />}
      </div>
      {page.header?.blueskyPostUrl && <BlueskyConversation uri={page.header.blueskyPostUrl} />}
    </SectionProvider>
  )
}
