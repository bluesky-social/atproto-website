import { PageHeader, PageHeaderProps } from './PageHeader'
import {
  PageSectionsNavigation,
  PageSectionProp,
} from './PageSectionsNavigation'
import { SectionProvider } from './SectionProvider'
import { AtprotoDocumentLink } from './AtprotoDocumentLink'
import { SubpageLinks } from './SubpageLinks'
import { BlueskyConversation } from './BlueskyConversation'

const BSKY_HEADER_TEMPLATE = "This post has {replies?{replies|reply|replies}}{quotes?, {quotes|quote|quotes}}{repostedBy?, and has been reposted by {repostedBy}}. <a href='{postUrl}'>Add your thoughts on Bluesky.</a>"
const BSKY_FOOTER_TEMPLATE = "<a href='{postUrl}'>Add your thoughts on Bluesky</a>"

interface PageProps {
  default: React.FunctionComponent
  header?: PageHeaderProps & { standardSiteUri?: string; blueskyPostUrl?: string; blueskyHeaderTemplate?: string; blueskyFooterTemplate?: string }
  sections?: PageSectionProp[]
}

export function Page(page: PageProps) {
  const sections = page.sections ?? []
  const navSections = page.header?.blueskyPostUrl
    ? [...sections, { id: 'discuss', title: 'Discussion' }]
    : sections

  return (
    <SectionProvider sections={navSections}>
      {page.header?.standardSiteUri && <AtprotoDocumentLink uri={page.header.standardSiteUri} />}
      {page.header && <PageHeader {...page.header} />}
      <SubpageLinks />
      <div className="flex flex-wrap items-start">
        <page.default />
        {navSections.length > 0 && <PageSectionsNavigation sections={navSections} />}
        {page.header?.blueskyPostUrl && <BlueskyConversation uri={page.header.blueskyPostUrl} headerTemplate={page.header.blueskyHeaderTemplate ?? BSKY_HEADER_TEMPLATE} footerTemplate={page.header.blueskyFooterTemplate ?? BSKY_FOOTER_TEMPLATE} />}
      </div>
    </SectionProvider>
  )
}
