import { PageHeader, PageHeaderProps } from './PageHeader'
import {
  PageSectionsNavigation,
  PageSectionProp,
} from './PageSectionsNavigation'
import { SectionProvider } from './SectionProvider'
import { AtprotoDocumentLink } from './AtprotoDocumentLink'
import { AtprotoPublicationLink } from './AtprotoPublicationLink'
import { SubpageLinks } from './SubpageLinks'
import { BlueskyConversation } from './BlueskyConversation'

const BSKY_CONVERSATION_HEADER = "This post has {replies?{replies|reply|replies}}{quotes?, {quotes|quote|quotes}}{repostedBy?, and has been reposted by {repostedBy}}."

interface PageProps {
  default: React.FunctionComponent
  header?: PageHeaderProps & { standardSiteUri?: string; blueskyPostUrl?: string; blueskyHeaderTemplate?: string; hideSectionNav?: boolean }
  sections?: PageSectionProp[]
}

export function Page(page: PageProps) {
  const sections = page.sections ?? []
  // Still keyed to the build-time field, deliberately. Revealing this entry when
  // the thread resolves would mean rendering the nav from the section store
  // instead of this prop, and SectionProvider resets the store from the prop.
  // Cost of leaving it: for the window between posting a thread and the next
  // deploy, the discussion renders but isn't listed in the side nav.
  const navSections = page.header?.blueskyPostUrl
    ? [...sections, { id: 'discuss', title: 'Discussion' }]
    : sections
  const showSectionNav = navSections.length > 0 && !page.header?.hideSectionNav

  return (
    <SectionProvider sections={navSections}>
      {page.header?.standardSiteUri && (
        <>
          <AtprotoDocumentLink uri={page.header.standardSiteUri} />
          <AtprotoPublicationLink />
        </>
      )}
      {page.header && <PageHeader {...page.header} />}
      <SubpageLinks />
      <div className="flex flex-wrap items-start">
        <page.default />
        {showSectionNav && <PageSectionsNavigation sections={navSections} />}
        {/* Gated on either: an explicit URL renders immediately, and a post with
            only a standardSiteUri resolves its thread from that record — which is
            what lets a thread reach a live post without rebuilding the site. */}
        {(page.header?.blueskyPostUrl || page.header?.standardSiteUri) && (
          <BlueskyConversation
            uri={page.header.blueskyPostUrl}
            documentUri={page.header.standardSiteUri}
            headerTemplate={page.header.blueskyHeaderTemplate ?? BSKY_CONVERSATION_HEADER}
          />
        )}
      </div>
    </SectionProvider>
  )
}
