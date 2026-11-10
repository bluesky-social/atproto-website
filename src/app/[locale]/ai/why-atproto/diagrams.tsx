import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import clsx from 'clsx'
import { Code } from '@/components/Code'
import { Tag } from '@/components/Tag'
import { RobotIcon as AgentIcon } from '@/components/icons/outline/RobotIcon'
import { UserIcon } from '@/components/icons/outline/UserIcon'

function AppIcon(props: ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </svg>
  )
}

function DiagramFrame({
  label,
  variant = 'padded',
  className,
  children,
}: {
  label: string
  variant?: 'padded' | 'table' | 'permissions'
  className?: string
  children: ReactNode
}) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={clsx(
        'min-w-0 rounded-xl text-[14px] leading-[1.7] text-zinc-700 [overflow-wrap:anywhere] dark:text-zinc-300',
        variant === 'permissions'
          ? 'flex justify-center bg-[#f4f1fb] p-7 dark:bg-[#2b2538]'
          : 'border border-zinc-200 dark:border-zinc-700',
        variant === 'padded' && 'bg-zinc-50 p-6 dark:bg-zinc-800',
        variant === 'table' && 'overflow-hidden bg-white dark:bg-zinc-900',
        className,
      )}
    >
      {children}
    </figure>
  )
}

const sectionAccents = {
  identity: 'bg-[#e8eefc] text-[#1d4ab8] dark:bg-[#1d4ab8] dark:text-[#e8eefc]',
  record: 'bg-[#e2f4ec] text-[#0f7b55] dark:bg-[#0f7b55] dark:text-[#e2f4ec]',
  data: 'bg-[#fbf1dc] text-[#8a5a00] dark:bg-[#8a5a00] dark:text-[#fbf1dc]',
  permissions:
    'bg-[#ede7fb] text-[#5b3fa8] dark:bg-[#5b3fa8] dark:text-[#ede7fb]',
  schemas: 'bg-[#fbe8e6] text-[#b0362c] dark:bg-[#b0362c] dark:text-[#fbe8e6]',
  network: 'bg-[#e0f1f6] text-[#0e6f8a] dark:bg-[#0e6f8a] dark:text-[#e0f1f6]',
}

export type SectionId = keyof typeof sectionAccents

function IconBadge({
  children,
  tone = 'identity',
  size = 'account',
}: {
  children: ReactNode
  tone?: SectionId
  size?: 'account' | 'section' | 'compact'
}) {
  return (
    <span
      className={clsx(
        'flex shrink-0 items-center justify-center',
        size === 'compact' ? 'size-[30px] rounded-lg' : 'rounded-[10px]',
        size === 'account' && 'size-10',
        size === 'section' && 'size-12',
        sectionAccents[tone],
      )}
    >
      {children}
    </span>
  )
}

function AgentBadge({ compact = false }: { compact?: boolean }) {
  return (
    <IconBadge size={compact ? 'compact' : 'account'}>
      <AgentIcon className={compact ? 'size-4' : 'size-[22px]'} />
    </IconBadge>
  )
}

export function SectionIcon({
  id,
  className,
  colored = false,
}: {
  id: SectionId
  className?: string
  colored?: boolean
}) {
  const colors: Record<SectionId, string> = {
    identity: 'text-[#1d4ab8] dark:text-[#e8eefc]',
    record: 'text-[#0f7b55] dark:text-[#e2f4ec]',
    data: 'text-[#8a5a00] dark:text-[#fbf1dc]',
    permissions: 'text-[#5b3fa8] dark:text-[#ede7fb]',
    schemas: 'text-[#b0362c] dark:text-[#fbe8e6]',
    network: 'text-[#0e6f8a] dark:text-[#e0f1f6]',
  }
  const paths: Record<SectionId, ReactNode> = {
    identity: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
      </>
    ),
    record: (
      <>
        <path d="M4 6h16M4 12h16M4 18h10" />
        <path d="M17 17l1.5 1.5L21 16" />
      </>
    ),
    data: (
      <>
        <path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z" />
        <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      </>
    ),
    permissions: (
      <>
        <circle cx="8" cy="14" r="4" />
        <path d="M11 11l8-8M16 6l2 2M14 8l2 2" />
      </>
    ),
    schemas: <path d="M9 4H6v16h3M15 4h3v16h-3" />,
    network: (
      <>
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M12 9v3" />
      </>
    ),
  }
  return (
    <svg
      aria-hidden="true"
      className={clsx('shrink-0', colored && colors[id], className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[id]}
    </svg>
  )
}

export function SectionMarker({
  id,
  number,
}: {
  id: SectionId
  number: number
}) {
  return (
    <div
      aria-hidden="true"
      className="not-prose mb-4 flex items-center gap-3.5"
    >
      <IconBadge tone={id} size="section">
        <SectionIcon id={id} className="size-6" />
      </IconBadge>
      <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
        {String(number).padStart(2, '0')}
      </span>
    </div>
  )
}

function Panel({
  children,
  className,
  border = 'neutral',
}: {
  children: ReactNode
  className?: string
  border?: 'neutral' | 'dashed' | 'blue' | 'cyan'
}) {
  return (
    <div
      className={clsx(
        'min-w-0 rounded-lg border bg-white px-3.5 py-3 dark:bg-zinc-900',
        border === 'neutral' && 'border-zinc-200 dark:border-zinc-700',
        border === 'dashed' &&
          'border-dashed border-[#c4c4cc] dark:border-zinc-600',
        border === 'blue' && 'border-[#1d4ab8] dark:border-[#e8eefc]',
        border === 'cyan' && 'border-[#0e6f8a] dark:border-[#e0f1f6]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function PanelLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'font-mono text-[11px] tracking-[0.08em]',
        className ?? 'text-zinc-500 dark:text-zinc-400',
      )}
    >
      {children}
    </div>
  )
}

function Pill({
  children,
  variant = 'outline',
}: {
  children: ReactNode
  variant?: 'outline' | 'signed' | 'inverse'
}) {
  return (
    <span
      className={clsx(
        'shrink-0 rounded-full',
        variant === 'outline' &&
          'border border-zinc-200 bg-white px-2.5 py-1 text-[13px] dark:border-zinc-700 dark:bg-zinc-900',
        variant === 'signed' &&
          'bg-[#e2f4ec] px-2 py-0.5 font-mono text-[11px] text-[#0f7b55] dark:bg-[#0f7b55] dark:text-[#e2f4ec]',
        variant === 'inverse' &&
          'bg-[#2e2e33] px-2.5 py-[3px] text-[13px] text-zinc-100',
      )}
    >
      {children}
    </span>
  )
}

function DiagramPanel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={clsx(
        'min-w-0 rounded-sm border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900',
        className,
      )}
    >
      {children}
    </div>
  )
}

function DiagramLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-2xs text-zinc-500 dark:text-zinc-400">
      {children}
    </div>
  )
}

function Connector() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-4 w-px bg-zinc-300 dark:bg-zinc-600"
    />
  )
}

function AccountCard({
  name,
  handle,
  person = false,
}: {
  name: string
  handle: string
  person?: boolean
}) {
  const Icon = person ? UserIcon : AgentIcon
  return (
    <DiagramPanel className="flex flex-col items-start gap-1">
      <Icon className="mb-1 size-6 shrink-0" />
      <div className="text-sm font-medium leading-snug">{name}</div>
      <div className="break-all font-mono text-2xs text-zinc-500 dark:text-zinc-400">
        {handle}
      </div>
      <Tag color={person ? 'zinc' : 'sky'}>{person ? 'PERSON' : 'AGENT'}</Tag>
    </DiagramPanel>
  )
}

export function AgentNetworkDiagram() {
  return (
    <figure
      role="img"
      aria-label="Illustration: Alice and Bob each run their own agents. Alice's support agent works with Bob's billing agent under a signed, scoped, revocable grant, and everything runs on atproto"
      className="space-y-4 text-sm"
    >
      <div className="grid grid-cols-2 gap-x-4">
        <AccountCard name="Alice" handle="@alice.example" person />
        <AccountCard name="Bob" handle="@bob.com" person />
        <Connector />
        <Connector />
        <AccountCard
          name="Alice's support agent"
          handle="@support.alice.example"
        />
        <AccountCard name="Bob's billing agent" handle="@billing.bob.com" />
      </div>
      <div className="text-center">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-emerald-300 dark:bg-emerald-700" />
          <Tag color="emerald">SIGNED GRANT</Tag>
          <span className="h-px flex-1 bg-emerald-300 dark:bg-emerald-700" />
        </div>
        <div className="text-2xs text-zinc-500 dark:text-zinc-400">
          scoped · revocable
        </div>
      </div>
      <DiagramPanel>
        <DiagramLabel>ATPROTO</DiagramLabel>
        <p className="mt-1">
          Identity, data, permissions, and a signed record of who did what
        </p>
      </DiagramPanel>
    </figure>
  )
}

export function IdentityDiagram() {
  return (
    <DiagramFrame
      label="Example agent identity: a DID, a handle under example.com, and a hosting server that can change"
      className="space-y-3.5"
    >
      <div className="flex items-center gap-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <AgentBadge />
        An agent&apos;s account
      </div>
      <Panel className="space-y-1">
        <PanelLabel>DID · PERMANENT</PanelLabel>
        <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
          did:plc:vc7f4oafdgxsihk4cry2xpze
        </div>
      </Panel>
      <Panel className="space-y-1">
        <PanelLabel>HANDLE · A DOMAIN</PanelLabel>
        <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
          agent.
          <strong className="font-semibold text-[#1d4ab8] dark:text-[#e8eefc]">
            bob.com
          </strong>
        </div>
      </Panel>
      <div className="flex items-center gap-2.5">
        <Panel border="dashed" className="flex-1 space-y-1">
          <PanelLabel>HOSTED ON</PanelLabel>
          <div className="text-zinc-600 dark:text-zinc-400">Server A</div>
        </Panel>
        <span
          aria-hidden="true"
          className="text-lg text-zinc-500 dark:text-zinc-400"
        >
          →
        </span>
        <Panel border="blue" className="flex-1 space-y-1">
          <PanelLabel className="text-[#1d4ab8] dark:text-[#e8eefc]">
            MOVED TO
          </PanelLabel>
          <div className="text-zinc-900 dark:text-zinc-100">Server B</div>
        </Panel>
      </div>
    </DiagramFrame>
  )
}

export function RecordDiagram() {
  return (
    <DiagramFrame
      variant="table"
      label="Example: an agent's repository with signed message, handoff and status records streaming out to the network"
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-[18px] py-3 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="font-mono text-[13px] text-zinc-900 dark:text-zinc-100">
          repo · agent.bob.com
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[12px] text-[#0f7b55] dark:text-[#e2f4ec]">
          <span className="size-[7px] rounded-full bg-[#0f7b55] dark:bg-[#e2f4ec]" />
          live
        </span>
      </div>
      {[
        {
          type: 'message',
          text: 'To @support.alice.example: v2.1 ships Friday',
        },
        { type: 'handoff', text: 'To @alice.example for review' },
        { type: 'status', text: 'Release notes approved' },
      ].map(({ type, text }) => (
        <div
          key={type}
          className="flex items-center gap-3 border-b border-zinc-200 px-[18px] py-3.5 dark:border-zinc-700"
        >
          <span className="w-16 shrink-0 font-mono text-[12px] text-[#0f7b55] dark:text-[#e2f4ec]">
            {type}
          </span>
          <span className="min-w-0 flex-1 truncate">{text}</span>
          <Pill variant="signed">signed ✓</Pill>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2 bg-zinc-50 px-[18px] py-3.5 dark:bg-zinc-800">
        <span className="pr-1 font-mono text-[12px] text-zinc-500 dark:text-zinc-400">
          anyone can →
        </span>
        {['audit', 'label', 'filter'].map((label) => (
          <Pill key={label}>{label}</Pill>
        ))}
      </div>
    </DiagramFrame>
  )
}

export function ContextDiagram() {
  return (
    <DiagramFrame label="Diagram: two apps and an invited agent all read from the person's PDS instead of keeping their own copies">
      <div className="grid grid-cols-3 gap-2.5">
        {['Tangled', 'atmo.rsvp', 'Invited agent'].map((label, index) => {
          const Icon = index === 2 ? AgentIcon : AppIcon
          return (
            <div
              key={label}
              className={clsx(
                'flex min-w-0 flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-[13px]',
                index === 2
                  ? 'border-[#1d4ab8] bg-[#e8eefc] font-medium text-[#1d4ab8] dark:border-[#e8eefc] dark:bg-[#1d4ab8] dark:text-[#e8eefc]'
                  : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900',
              )}
            >
              <Icon
                className={clsx(
                  'size-5 shrink-0',
                  index !== 2 && 'text-zinc-600 dark:text-zinc-400',
                )}
              />
              {label}
            </div>
          )
        })}
      </div>
      <div aria-hidden="true" className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={clsx(
              'mx-auto h-7 w-0.5',
              index === 2
                ? 'bg-[#1d4ab8] dark:bg-[#e8eefc]'
                : 'bg-zinc-300 dark:bg-zinc-700',
            )}
          />
        ))}
      </div>
      <div className="space-y-2.5 rounded-[10px] bg-zinc-900 p-[18px] text-zinc-100 dark:bg-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold">Your PDS</span>
          <PanelLabel className="text-[#f2c76b]">CONTEXT LAYER</PanelLabel>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['posts', 'follows', 'preferences'].map((label) => (
            <Pill key={label} variant="inverse">
              {label}
            </Pill>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-[13px] leading-normal text-zinc-600 dark:text-zinc-400">
        Move apps or agents and your context comes along.
      </p>
    </DiagramFrame>
  )
}

export function PermissionsDiagram() {
  return (
    <DiagramFrame
      variant="permissions"
      label="Example approval screen: an agent asks for a named permission set with a plain-language description, with Deny and Allow buttons"
    >
      <div className="flex w-full max-w-[340px] flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-[22px] shadow-[0_16px_36px_rgba(24,24,27,0.10)] dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <AgentBadge />
          <div className="min-w-0 space-y-0.5">
            <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
              Bob&apos;s agent
            </div>
            <div className="font-mono text-[12px] text-zinc-600 dark:text-zinc-400">
              wants access to @bob.com
            </div>
          </div>
        </div>
        <div className="space-y-1.5 rounded-lg border border-zinc-200 p-3.5 dark:border-zinc-700">
          <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
            Manage your tasks
          </p>
          <p className="leading-normal text-zinc-600 dark:text-zinc-400">
            Create, update, and complete tasks in your account. It can&apos;t
            post for you or change your profile, handle, or account settings.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
          <svg
            className="size-4 shrink-0 text-[#0f7b55] dark:text-[#e2f4ec]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
          </svg>
          No password shared
        </div>
        {/* These are illustrative controls inside an image, not interactive buttons. */}
        <div className="flex gap-2.5 text-center">
          <span className="flex min-h-[42px] flex-1 items-center justify-center rounded-md border border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
            Deny
          </span>
          <span className="flex min-h-[42px] flex-1 items-center justify-center rounded-md bg-zinc-900 font-semibold text-zinc-100 dark:bg-zinc-800">
            Allow
          </span>
        </div>
      </div>
    </DiagramFrame>
  )
}

const taskSchema = `{
  "lexicon": 1,
  "id": "com.example.agent.task",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "status": { "type": "string" }
        }
      }
    }
  }
}`

export function SchemaDiagram() {
  return (
    <figure className="min-w-0 space-y-3 text-[13px] leading-[1.7] text-zinc-600 [overflow-wrap:anywhere] dark:text-zinc-400">
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">
          <span className="text-[12px]">com.example.agent.task</span>
          <span className="text-[11px] tracking-[0.06em] text-[#b0362c] dark:text-[#fbe8e6]">
            EXAMPLE
          </span>
        </div>
        <pre
          translate="no"
          className="notranslate whitespace-pre-wrap bg-white p-4 font-mono text-[13px] leading-[1.6] text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <Code>{taskSchema}</Code>
        </pre>
      </div>
      <figcaption className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] text-zinc-500 dark:text-zinc-400">
          same shape for →
        </span>
        {["Alice's agent", "Bob's agent", 'any app'].map((label) => (
          <Pill key={label}>{label}</Pill>
        ))}
      </figcaption>
    </figure>
  )
}

export function NetworkDiagram() {
  return (
    <DiagramFrame label="Diagram: repositories across the network flow into a relay firehose that your agent reads directly">
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="rounded-md border border-zinc-200 bg-white px-1 py-2 text-center font-mono text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
          >
            repo
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-center text-[12px] text-zinc-500 dark:text-zinc-400">
        accounts across every app
      </p>
      <div
        aria-hidden="true"
        className="mx-auto h-4 w-0.5 bg-[#0e6f8a] dark:bg-[#e0f1f6]"
      />
      <Panel border="cyan" className="flex items-center justify-between gap-2">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          Relay firehose
        </span>
        <span className="font-mono text-[11px] text-[#0e6f8a] dark:text-[#e0f1f6]">
          all public records
        </span>
      </Panel>
      <div
        aria-hidden="true"
        className="mx-auto h-4 w-0.5 bg-[#0e6f8a] dark:bg-[#e0f1f6]"
      />
      <Panel className="flex items-center gap-2.5">
        <AgentBadge compact />
        <span className="text-[13px]">
          Your agent reads across the whole network, not one app
        </span>
      </Panel>
    </DiagramFrame>
  )
}
