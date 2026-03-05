import { PageHeader, PageHeaderProps } from './PageHeader'
import {
  PageSectionsNavigation,
  PageSectionProp,
} from './PageSectionsNavigation'
import { SectionProvider } from './SectionProvider'
import { AtprotoDocumentLink } from './AtprotoDocumentLink'
import { SubpageLinks } from './SubpageLinks'

interface PageProps {
  default: React.FunctionComponent
  header?: PageHeaderProps & { standardSiteUri?: string; blueskyPostUrl?: string }
  sections?: PageSectionProp[]
}

export function Page(page: PageProps) {
  return (
    <SectionProvider sections={page.sections ?? []}>
      {page.header?.standardSiteUri && <AtprotoDocumentLink uri={page.header.standardSiteUri} />}
      {page.header && <PageHeader {...page.header} />}
      <SubpageLinks />
      <div className="flex items-start">
        <page.default />
        {page.sections && <PageSectionsNavigation sections={page.sections} />}
      </div>
    </SectionProvider>
  )
}
