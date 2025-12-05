import { PageHeader, PageHeaderProps } from './PageHeader'
import {
  PageSectionsNavigation,
  PageSectionProp,
} from './PageSectionsNavigation'
import { SectionProvider } from './SectionProvider'

interface PageProps {
  default: React.FunctionComponent
  header?: PageHeaderProps
  sections?: PageSectionProp[]
}

export function Page(page: PageProps) {
  return (
    <SectionProvider sections={page.sections ?? []}>
      {page.header && <PageHeader {...page.header} />}
      <div className="flex items-start">
        <page.default />
        {page.sections && <PageSectionsNavigation sections={page.sections} />}
      </div>
    </SectionProvider>
  )
}
