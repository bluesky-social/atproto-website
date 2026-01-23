import { UserIcon } from '../UserIcon'
import { AcademicCapIcon } from './AcademicCapIcon'
import { BookIcon } from './BookIcon'
import { CubeIcon } from './CubeIcon'
import { DatabaseIcon } from './DatabaseIcon'
import { DocumentTextIcon } from './DocumentTextIcon'
import { FlagIcon } from './FlagIcon'
import { HomeIcon } from './HomeIcon'
import { KeyIcon } from './KeyIcon'
import { MediaIcon } from './MediaIcon'
import { PuzzlePieceIcon } from './PuzzlePieceIcon'
import { QuestionIcon } from './QuestionIcon'
import { SparklesIcon } from './SparklesIcon'
import { StreamIcon } from './StreamIcon'
import { WindowIcon } from './WindowIcon'

export type OutlineIconEnum =
  | 'academic-cap'
  | 'book'
  | 'cube'
  | 'database'
  | 'document-text'
  | 'flag'
  | 'home'
  | 'key'
  | 'media'
  | 'puzzle-piece'
  | 'question'
  | 'sparkles'
  | 'stream'
  | 'user'
  | 'window'

export function Icon(
  props: React.ComponentPropsWithoutRef<'svg'> & { icon: OutlineIconEnum },
) {
  if (props.icon === 'academic-cap') {
    return <AcademicCapIcon {...props} />
  }
  if (props.icon === 'book') {
    return <BookIcon {...props} />
  }
  if (props.icon === 'cube') {
    return <CubeIcon {...props} />
  }
  if (props.icon === 'database') {
    return <DatabaseIcon {...props} />
  }
  if (props.icon === 'document-text') {
    return <DocumentTextIcon {...props} />
  }
  if (props.icon === 'flag') {
    return <FlagIcon {...props} />
  }
  if (props.icon === 'home') {
    return <HomeIcon {...props} />
  }
  if (props.icon === 'key') {
    return <KeyIcon {...props} />
  }
  if (props.icon === 'media') {
    return <MediaIcon {...props} />
  }
  if (props.icon === 'puzzle-piece') {
    return <PuzzlePieceIcon {...props} />
  }
  if (props.icon === 'question') {
    return <QuestionIcon {...props} />
  }
  if (props.icon === 'sparkles') {
    return <SparklesIcon {...props} />
  }
  if (props.icon === 'stream') {
    return <StreamIcon {...props} />
  }
  if (props.icon === 'user') {
    return <UserIcon {...props} />
  }
  if (props.icon === 'window') {
    return <WindowIcon {...props} />
  }
  return <></>
}
