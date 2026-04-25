# ScopeBuilder

Two interactive web components for working with AT Protocol OAuth scopes:

- **`<scope-builder>`** — embedded at `/guides/scope-builder`. Pick from a curated catalog of permission sets and individual scopes; the widget assembles the final space-separated scope string that goes into `oauth-client-metadata.json`.
- **`<permission-author>`** — embedded at `/guides/permission-set-builder`. Compose individual permissions and emit a permission-set Lexicon JSON document suitable for `goat lex publish`.

Both are vanilla JS custom elements. They run in the browser, share a small data layer, and have zero runtime dependencies on the React parts of the site beyond a thin loader that registers the element on mount.

## File map

```
src/components/ScopeBuilder/
├── README.md                    ← you are here
├── index.ts                     ← public exports for MDX consumers
├── ScopeBuilderLoader.tsx       ← 'use client' React loader for <scope-builder>
├── PermissionAuthorLoader.tsx   ← 'use client' React loader for <permission-author>
├── registerElements.ts          ← named exports that import the element modules
├── elementTypes.d.ts            ← JSX type declarations for the custom tags
├── scope-builder.ts             ← <scope-builder> custom element class + render
├── permission-author.ts         ← <permission-author> custom element class + render
├── scopeData.ts                 ← curated catalog: apps, permission sets, individual scopes
├── scopeUtils.ts                ← scope-string helpers (wrappers over @atproto/oauth-scopes)
├── scopeUtils.test.ts           ← Vitest unit tests for the helpers
└── types.ts                     ← shared TypeScript types
```

## Architecture in three layers

```
┌──────────────────────────────────────────────────────────────────┐
│  Rendering layer                                                 │
│  scope-builder.ts, permission-author.ts                          │
│  Custom element classes, HTML templates, event delegation        │
├──────────────────────────────────────────────────────────────────┤
│  Logic layer                                                     │
│  scopeUtils.ts                                                   │
│  Pure functions wrapping @atproto/oauth-scopes                   │
├──────────────────────────────────────────────────────────────────┤
│  Data layer                                                      │
│  scopeData.ts, types.ts                                          │
│  Static catalog + shared TypeScript types                        │
└──────────────────────────────────────────────────────────────────┘
```

The rendering layer never builds scope strings by hand — every transformation goes through `scopeUtils`. The logic layer never touches the DOM. The data layer never imports anything from the others.

## Loading into Next.js

Custom element registration must happen client-side. The two `*Loader.tsx` files are minimal React wrappers used in MDX:

```mdx
import { ScopeBuilderLoader } from '@/components/ScopeBuilder'
<ScopeBuilderLoader />
```

The loader does a `useEffect`-triggered dynamic import of `registerElements.ts`, which calls `customElements.define()` exactly once. After that, the `<scope-builder>` tag is recognized and the loader renders it. Until registration completes, a brief "Loading…" placeholder shows.

`elementTypes.d.ts` augments React's JSX type definitions so `<scope-builder>` and `<permission-author>` type-check inside `.tsx` files.

## State and rendering model

Both elements use the same pattern: state lives as private fields on the class; rendering is a `_render()` method that constructs the entire `innerHTML` from current state; user interactions update state and call either a full `_render()` or a targeted DOM patch.

### Event delegation

Each element attaches three listeners on itself in `connectedCallback`:

- `change` — handles checkbox toggles
- `input` — handles text-field typing (aud overrides, NSID inputs, set metadata)
- `click` — handles app pills, copy buttons, add/remove permission buttons

Handlers identify the relevant target by `data-*` attributes (`data-scope-id`, `data-app-pill`, `data-action`, `data-aud-for`, `data-permission-id`, …). This means `_render()` can replace the entire DOM tree without re-attaching listeners.

### Targeted updates vs full re-render

Three categories of interaction trigger different update strategies:

| Interaction | Strategy | Why |
|---|---|---|
| Checkbox toggle | Full `_render()` + scroll-anchor compensation | Cascade rules (e.g. checking a superset auto-unchecks subsumed scopes) and dependent UI elements (aud inputs, "Included via" notes) make a targeted update fragile. |
| App pill click | Targeted DOM swap (`_swapActiveApp`) | Only the pill bar's active state and the permission-set list change. Avoids rebuilding the (often very long) list and the scroll-jump that comes with it. |
| Aud input typing | Targeted output update (`_updateOutput`) | Updating `innerHTML` mid-keystroke would steal focus. We update only the sticky scope-string `<pre>` and the copy button's `data-copy-text`. |

### Scroll anchoring

When a checkbox toggle triggers a full `_render()`, the position of the clicked element can shift in the viewport — the sticky scope string at the top grows by a line, the item itself may gain an aud input, or an "Included via" note may appear. `_handleChange` records the clicked input's `getBoundingClientRect().top` before the render and `window.scrollBy()`s the delta after, so the cursor stays over the element it just clicked.

## `<scope-builder>` specifics

### Layout

```
┌─ Sticky header (top: 14, alphabetical-sorted scope string + Copy)
│
├─ Individual Scopes
│    blob:*/*, account:email, account:email?action=manage,
│    identity:handle, identity:*, account:repo?action=manage
│
└─ Permission Sets
     ├─ App pill row (Beacon Bits, Bluesky, Checkmate, Margin, Pckt, Streamplace)
     └─ List of the active app's permission sets
```

### State

```ts
private selectedIds = new Set<string>()        // which scope ids are checked
private audOverrides = new Map<string, string>() // user-edited aud per scope
private activeAppId: string                    // which pill is active
```

`audOverrides` survives un-check/re-check so a user can tweak without losing their edit.

### Notable per-scope behaviors

- **`defaultAud`** (on `CuratedScope`): when set, the widget renders an editable "Audience" text input below the scope's description while the scope is selected. The override flows into the assembled string immediately on every keystroke. Empty string explicitly means "omit aud."
- **`supersededBy`** (on `CuratedScope`): when the named superset is also selected, this scope's checkbox auto-unchecks, disables, dims, and shows an "Included via [superset label]" note. Selecting a superset removes any subsumed selections from `selectedIds` automatically (cascade in `_handleChange`).
- **`warning`** (on `CuratedScope`): renders a small amber badge next to the scope label. Used today on `identity:handle` and `identity:*`.

## `<permission-author>` specifics

### Layout

```
┌─ Add Permission              │  Permission Set Metadata
│  resource type dropdown +    │  NSID, Title, Description
│  per-resource fields,        │  + "See an example" link
│  + Add button                │
└──────────────────────────────┴──────────────────────────────┐
│ Permissions list — added permissions, each with Remove btn  │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ Output                                                       │
│ One permission, no metadata → single scope string            │
│ Multiple permissions OR metadata filled → Lexicon JSON +     │
│   include: scope reference                                   │
└──────────────────────────────────────────────────────────────┘
```

### Resource types

Only `repo` and `rpc` resources can be bundled in a permission set per the atproto spec. The Add Permission form's dropdown is restricted to those two; `blob`, `account`, and `identity` always require direct scope requests and live in the Scope Builder's "Individual Scopes" section instead.

### Focus preservation

Typing in any text field triggers a re-render (because `validate state` and `output panel` depend on multiple inputs together). To keep the input from losing focus mid-keystroke, `_render()` captures the active element's `data-field` value and selection range before swapping `innerHTML`, then re-focuses the corresponding new element after.

## Adding to the catalog

The data layer (`scopeData.ts`) is the source of truth for what the Scope Builder offers. Adding new content is a data-only change.

### Add a new app

1. Capture the app's DID (the repo that publishes its Lexicons, found via `lexicon.garden` or the developer):

   ```ts
   const ACME_DID = 'did:plc:somethingsomething'
   ```

2. Append to `apps[]`, keeping it alphabetical:

   ```ts
   { id: 'acme', name: 'Acme', did: ACME_DID },
   ```

3. Append one or more permission-set entries with `appId: 'acme'`. Pull the Lexicon's `title`, `detail`, and `permissions` from the published record (the `lexicon.garden/lexicon/{did}/{nsid}/llms.txt` URL is the easiest source). For each permission set:

   ```ts
   {
     id: 'acme.app.authFull',                 // the NSID; also used as scope target
     appId: 'acme',
     label: 'Full Acme Access',               // from Lexicon `title`
     description: 'Short one-line summary.',  // hand-written for the checkbox
     kind: 'permission-set',
     resourceType: 'include',
     scopeString: 'include:acme.app.authFull',
     defaultAud: 'did:web:acme.example#api',  // ONLY if the set has rpc with inheritAud
     expandedPermissions: {
       repo: [
         { collection: 'acme.app.thing', actions: [...ALL_WRITE_ACTIONS] },
       ],
       rpc: ['acme.app.getThings'],
     },
     specLink: lexiconGardenLink(ACME_DID, 'acme.app.authFull'),
     explanation: 'Longer prose for the disclosure.',
   }
   ```

   Notes:
   - Only emit `defaultAud` when the underlying Lexicon contains rpc permissions with `inheritAud: true`. For repo-only sets, omit it; the include scope string then has no `?aud=` suffix and the widget doesn't render an aud input.
   - The audience constant in `defaultAud` is in **unencoded** form (raw `#`); the library handles `%23` encoding on emission.

### Add a new individual scope

Append to `individualScopes[]`:

```ts
{
  id: 'unique-id',
  label: 'What the user sees',
  description: 'One-line.',
  kind: 'individual',
  resourceType: 'blob' | 'account' | 'identity',
  scopeString: 'blob:image/png',           // hand-rolled exact scope
  specLink: '/specs/permission#blob',
  explanation: 'Longer prose.',
  warning: 'Warning',                       // optional, renders amber badge
  supersededBy: 'other-scope-id',          // optional subset relationship
  replacesTransition: 'transition:email',   // optional, indicates legacy migration
}
```

Individual scopes have no `appId`. They render at the top of the Scope Builder, above the app pills.

### Add a subset relationship

Set `supersededBy` on the narrower scope, pointing at the broader one's `id`. The widget handles the rest: cascading uncheck, disable state, "Included via" note. No new code required.

## Helpers in `scopeUtils.ts`

| Helper | Purpose | Backed by library? |
|---|---|---|
| `isValidNsid` | NSID syntactic check | Yes — re-exports `isNsid` from `@atproto/oauth-scopes` |
| `isPartialWildcard` | Reject partial wildcards like `app.bsky.*` | No (UI rule) |
| `buildScopeString` | Render one `Permission` (form state) as a scope string | Yes — dispatches per resource to library classes |
| `assembleScopeString` | Join individual scope strings into the canonical space-separated value | Yes — `normalizeAtprotoOauthScope` (with our dedup) |
| `buildIncludeScopeString` | Build `include:nsid?aud=…` | Yes — `new IncludeScope(...).toString()` |
| `emitCuratedScopeString` | Aud-override-aware emission for curated permission sets | Yes — wrapper over `IncludeScope` |
| `isInSetNamespace` | Namespace-hierarchy check | No (library equivalent is `protected`) |
| `buildPermissionSetLexicon` | Generate the permission-set Lexicon JSON | No (library parses, doesn't author) |

The library is the canonical serializer maintained alongside the spec. Wrapping rather than re-exporting keeps the function signatures the widget uses stable while delegating the actual format work to `@atproto/oauth-scopes`.

## Tests

`scopeUtils.test.ts` covers the pure helpers in `scopeUtils.ts`. Run with:

```bash
npm test          # one-shot
npm run test:watch
```

The widget rendering layer has no unit tests — it's exercised manually via the dev server. The pure helpers are the only place where bugs are realistically introduced; the rendering layer is mostly template literals.

## Common gotchas

- **`#` in audiences must be percent-encoded** to `%23` when embedded in any URL context. The library does this automatically inside `IncludeScope.toString()` and the per-resource permission classes. Only worry about it if you're writing raw scope strings somewhere.
- **The assembled scope string is sorted alphabetically.** The library's `normalizeAtprotoOauthScope` enforces this. Don't be surprised that `account:email` precedes `atproto` in the output — the auth server treats scopes as a set, so order doesn't matter functionally.
- **Re-render replaces all DOM.** Don't store transient state in DOM nodes (e.g., a half-typed value in a non-`data-*`-tracked input). Anything that needs to survive a render must live in a class field.
- **Custom element registration is one-shot.** `customElements.define()` throws if called twice with the same tag. `registerElements.ts` is the only place that calls it; the loaders import that module behind a `customElements.get()` guard.
