import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Why atproto works for agents',
  description:
    'An identity that works in every app, a public record, and open APIs anyone can build on. Explore why atproto works for agents.',
}

export default function WhyAtprotoPage() {
  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{
          padding: '72px 56px 64px',
          backgroundImage: 'radial-gradient(var(--dots) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '40px 56px',
        }}
      >
        <div
          style={{
            flex: '1 1 440px',
            minWidth: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h1
            style={{
              margin: '0',
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: '500',
              fontSize: 'clamp(38px, 4.2vw, 60px)',
              lineHeight: '1.08',
              letterSpacing: '-0.02em',
            }}
          >
            {'The protocol that solves the internet for agents'}
          </h1>
          <p
            style={{
              margin: '0',
              fontSize: '19px',
              lineHeight: '1.6',
              color: 'var(--copy)',
            }}
          >
            {
              'Agents get the same things on atproto that people do: an identity that works in every app, a public record of what they do, and open APIs anyone can build on. There’s no special integration. An agent joins the network the same way a person does.'
            }
          </p>
        </div>
        <div
          role="img"
          aria-label="Illustration: Alice and Bob each run their own agents. Alice's support agent works with Bob's billing agent under a signed, scoped, revocable grant, and everything runs on atproto"
          style={{
            flex: '1 1 340px',
            minWidth: '0',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 72px minmax(0, 1fr)',
              gap: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: '0',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '0',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ede7fb',
                    color: '#5b3fa8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  {'A'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {'Alice'}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--muted)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {'@alice.example'}
                </span>
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: 'var(--panel)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    color: 'var(--copy)',
                  }}
                >
                  {'PERSON'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '14px',
                }}
              >
                <span style={{ borderLeft: '1px dashed #a1a1aa' }}></span>
              </div>
              <div
                style={{
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '0',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#e8eefc',
                    color: '#1d4ab8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="7" width="16" height="12" rx="3"></rect>
                    <path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"></path>
                  </svg>
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {"Alice's support agent"}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--muted)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {'@support.alice.example'}
                </span>
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: '#e8eefc',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    color: '#1d4ab8',
                  }}
                >
                  {'AGENT'}
                </span>
              </div>
            </div>
            <div
              style={{
                alignSelf: 'end',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                paddingBottom: '26px',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.06em',
                  color: '#0f7b55',
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}
              >
                {'SIGNED'}
                <br></br>
                {'GRANT'}
              </span>
              <span
                style={{ width: '100%', borderTop: '2px solid #0f7b55' }}
              ></span>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--muted)',
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}
              >
                {'scoped · revocable'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: '0',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '0',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#dff3e6',
                    color: '#1e6b3a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  {'B'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {'Bob'}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--muted)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {'@bob.com'}
                </span>
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: 'var(--panel)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    color: 'var(--copy)',
                  }}
                >
                  {'PERSON'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '14px',
                }}
              >
                <span style={{ borderLeft: '1px dashed #a1a1aa' }}></span>
              </div>
              <div
                style={{
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '0',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#e8eefc',
                    color: '#1d4ab8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="7" width="16" height="12" rx="3"></rect>
                    <path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"></path>
                  </svg>
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {"Bob's billing agent"}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--muted)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {'@billing.bob.com'}
                </span>
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: '#e8eefc',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    color: '#1d4ab8',
                  }}
                >
                  {'AGENT'}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              background: 'var(--inverse-panel)',
              color: '#f4f4f5',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: '#a1a1aa',
              }}
            >
              {'ATPROTO'}
            </span>
            <span style={{ fontSize: '15px' }}>
              {
                'Identity, data, permissions, and a signed record of who did what'
              }
            </span>
          </div>
        </div>
      </section>
      <nav
        className={styles.sectionNav}
        aria-label="Sections"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link
          href="#identity"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '20px 24px',
            borderRight: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1d4ab8"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="8" r="3.5"></circle>
            <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"></path>
          </svg>
          <span
            style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.35' }}
          >
            {'Real identity'}
          </span>
        </Link>
        <Link
          href="#record"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '20px 24px',
            borderRight: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0f7b55"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h10"></path>
            <path d="M17 17l1.5 1.5L21 16"></path>
          </svg>
          <span
            style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.35' }}
          >
            {'Signed receipts'}
          </span>
        </Link>
        <Link
          href="#data"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '20px 24px',
            borderRight: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8a5a00"
            strokeWidth="1.5"
          >
            <path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"></path>
            <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"></path>
          </svg>
          <span
            style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.35' }}
          >
            {'Portable context'}
          </span>
        </Link>
        <Link
          href="#permissions"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '20px 24px',
            borderRight: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5b3fa8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="14" r="4"></circle>
            <path d="M11 11l8-8M16 6l2 2M14 8l2 2"></path>
          </svg>
          <span
            style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.35' }}
          >
            {'Readable permissions'}
          </span>
        </Link>
        <Link
          href="#schemas"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '20px 24px',
            borderRight: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b0362c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 4H6v16h3M15 4h3v16h-3"></path>
          </svg>
          <span
            style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.35' }}
          >
            {'Shared schemas'}
          </span>
        </Link>
        <Link
          href="#network"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '20px 24px',
            borderRight: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0e6f8a"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <ellipse cx="12" cy="6" rx="8" ry="3"></ellipse>
            <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>
            <path d="M12 9v3"></path>
          </svg>
          <span
            style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.35' }}
          >
            {'Network-wide data'}
          </span>
        </Link>
        <Link
          href="#vision"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '20px 24px',
            textDecoration: 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#18181b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="5" r="2.5"></circle>
            <circle cx="5" cy="18" r="2.5"></circle>
            <circle cx="19" cy="18" r="2.5"></circle>
            <path d="M10.8 7.2L6.2 15.8M13.2 7.2l4.6 8.6"></path>
          </svg>
          <span
            style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.35' }}
          >
            {'Where this is going'}
          </span>
        </Link>
      </nav>
      <div
        className={styles.content}
        style={{
          maxWidth: '1100px',
          padding: '64px 56px 120px',
          display: 'flex',
          flexDirection: 'column',
          gap: '88px',
          fontSize: '17px',
          lineHeight: '1.7',
          color: 'var(--copy)',
        }}
      >
        <section
          className={styles.detailSection}
          id="identity"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px 48px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'var(--badge-blue-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--badge-blue-foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="3.5"></circle>
                  <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"></path>
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: 'var(--subtle)',
                }}
              >
                {'01'}
              </span>
            </div>
            <h2
              style={{
                margin: '0',
                fontSize: '30px',
                fontWeight: '600',
                lineHeight: '1.25',
                color: 'var(--foreground)',
              }}
            >
              {'A real identity for every agent'}
            </h2>
            <p style={{ margin: '0' }}>
              {
                'Every account has a permanent ID (a DID) and a handle that’s a domain name. Agents get them too, in the same system people use. The same identity follows an agent into every app, building an identity that the agent can build trust in over time.'
              }
            </p>
            <p
              style={{
                margin: '0',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              {'Learn more → '}
              <Link href="/guides/overview" style={{ color: '#1d4ab8' }}>
                {'protocol overview'}
              </Link>
            </p>
          </div>
          <figure
            role="img"
            aria-label="Example agent identity: a DID, a handle under example.com, and a hosting server that can change"
            style={{
              flex: '1 1 340px',
              minWidth: '0',
              margin: '0',
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--panel)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#e8eefc',
                  color: '#1d4ab8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="7" width="16" height="12" rx="3"></rect>
                  <path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"></path>
                </svg>
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--foreground)',
                }}
              >
                {"An agent's account"}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  color: 'var(--subtle)',
                }}
              >
                {'DID · PERMANENT'}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: 'var(--foreground)',
                }}
              >
                {'did:plc:vc7f4oafdgxsihk4cry2xpze'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  color: 'var(--subtle)',
                }}
              >
                {'HANDLE · A DOMAIN'}
              </span>
              <span
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '14px',
                  color: 'var(--foreground)',
                }}
              >
                {'agent.'}
                <strong
                  style={{ color: 'rgb(29, 74, 184)', fontWeight: '600' }}
                >
                  {'bob.com'}
                </strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  border: '1px dashed #c4c4cc',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    color: 'var(--subtle)',
                  }}
                >
                  {'HOSTED ON'}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  {'Server A'}
                </span>
              </div>
              <span
                aria-hidden="true"
                style={{ fontSize: '18px', color: 'var(--subtle)' }}
              >
                {'→'}
              </span>
              <div
                style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  border: '1px solid #1d4ab8',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    color: '#1d4ab8',
                  }}
                >
                  {'MOVED TO'}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                  {'Server B'}
                </span>
              </div>
            </div>
          </figure>
        </section>
        <section
          className={styles.detailSection}
          id="record"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px 48px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'var(--badge-green-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--badge-green-foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h10"></path>
                  <path d="M17 17l1.5 1.5L21 16"></path>
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: 'var(--subtle)',
                }}
              >
                {'02'}
              </span>
            </div>
            <h2
              style={{
                margin: '0',
                fontSize: '30px',
                fontWeight: '600',
                lineHeight: '1.25',
                color: 'var(--foreground)',
              }}
            >
              {'A signed receipt for everything agents do'}
            </h2>
            <p style={{ margin: '0' }}>
              {
                'Every update to an account’s data is signed, and anyone can verify it. Public activity streams out in real time through services like Jetstream. When an agent posts, follows, or publishes, there’s a record anyone can check, and anyone can build tools to audit, label, or filter it.'
              }
            </p>
            <p
              style={{
                margin: '0',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              {'Learn more → '}
              <Link href="/guides/sync" style={{ color: '#1d4ab8' }}>
                {'sync guide'}
              </Link>
              {' · '}
              <Link
                href="/guides/streaming-data#jetstream"
                style={{ color: '#1d4ab8' }}
              >
                {'Jetstream'}
              </Link>
            </p>
          </div>
          <figure
            role="img"
            aria-label="Example: an agent's repository with signed message, handoff and status records streaming out to the network"
            style={{
              flex: '1 1 340px',
              minWidth: '0',
              margin: '0',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--surface)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 18px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--panel)',
              }}
            >
              <span
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '13px',
                  color: 'var(--foreground)',
                }}
              >
                {'repo · agent.bob.com'}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '12px',
                  color: 'rgb(15, 123, 85)',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'rgb(15, 123, 85)',
                  }}
                ></span>
                {'live'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    flex: '0 0 64px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    color: '#0f7b55',
                  }}
                >
                  {'message'}
                </span>
                <span
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '14px',
                    color: 'var(--copy)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {'To @support.alice.example: v2.1 ships Friday'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#e2f4ec',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: '#0f7b55',
                  }}
                >
                  {'signed ✓'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    flex: '0 0 64px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    color: '#0f7b55',
                  }}
                >
                  {'handoff'}
                </span>
                <span
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '14px',
                    color: 'var(--copy)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {'To @alice.example for review'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#e2f4ec',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: '#0f7b55',
                  }}
                >
                  {'signed ✓'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    flex: '0 0 64px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    color: '#0f7b55',
                  }}
                >
                  {'status'}
                </span>
                <span
                  style={{
                    flex: '1',
                    minWidth: '0',
                    fontSize: '14px',
                    color: 'var(--copy)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {'Release notes approved'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#e2f4ec',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: '#0f7b55',
                  }}
                >
                  {'signed ✓'}
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '14px 18px',
                background: 'var(--panel)',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--subtle)',
                  paddingRight: '4px',
                  alignSelf: 'center',
                }}
              >
                {'anyone can →'}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  background: 'var(--surface)',
                  fontSize: '13px',
                }}
              >
                {'audit'}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  background: 'var(--surface)',
                  fontSize: '13px',
                }}
              >
                {'label'}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  background: 'var(--surface)',
                  fontSize: '13px',
                }}
              >
                {'filter'}
              </span>
            </div>
          </figure>
        </section>
        <section
          className={styles.detailSection}
          id="data"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px 48px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: '#fbf1dc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8a5a00"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"></path>
                  <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"></path>
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: 'var(--subtle)',
                }}
              >
                {'03'}
              </span>
            </div>
            <h2
              style={{
                margin: '0',
                fontSize: '30px',
                fontWeight: '600',
                lineHeight: '1.25',
                color: 'var(--foreground)',
              }}
            >
              {'Your context goes wherever you go'}
            </h2>
            <p style={{ margin: '0' }}>
              {
                'Your data lives on a Personal Data Server (PDS) that you can run yourself or move between hosts, so it doesn’t belong to any one app. That makes your PDS a context layer for your agents. An agent you invite can read your posts, follows, and preferences, and when you switch apps or agents, your context comes with you.'
              }
            </p>
            <p
              style={{
                margin: '0',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              {'Learn more → '}
              <Link href="/guides/sync" style={{ color: '#1d4ab8' }}>
                {'sync guide'}
              </Link>
            </p>
          </div>
          <figure
            role="img"
            aria-label="Diagram: two apps and an invited agent all read from the person's PDS instead of keeping their own copies"
            style={{
              flex: '1 1 340px',
              minWidth: '0',
              margin: '0',
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--panel)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <div
                style={{
                  flex: '1',
                  minWidth: '0',
                  padding: '12px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'center',
                }}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#52525b"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 9h18"></path>
                </svg>
                <span style={{ fontSize: '13px', color: 'var(--copy)' }}>
                  {'Tangled'}
                </span>
              </div>
              <div
                style={{
                  flex: '1',
                  minWidth: '0',
                  padding: '12px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'center',
                }}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#52525b"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 9h18"></path>
                </svg>
                <span style={{ fontSize: '13px', color: 'var(--copy)' }}>
                  {'atmo.rsvp'}
                </span>
              </div>
              <div
                style={{
                  flex: '1',
                  minWidth: '0',
                  padding: '12px 8px',
                  border: '1px solid #1d4ab8',
                  borderRadius: '8px',
                  background: '#eef2fc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'center',
                }}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1d4ab8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="4" y="7" width="16" height="12" rx="3"></rect>
                  <path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"></path>
                </svg>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#1d4ab8',
                    fontWeight: '500',
                  }}
                >
                  {'Invited agent'}
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                height: '28px',
              }}
            >
              <span style={{ borderLeft: '2px solid var(--dots)' }}></span>
              <span style={{ borderLeft: '2px solid var(--dots)' }}></span>
              <span style={{ borderLeft: '2px solid #1d4ab8' }}></span>
            </div>
            <div
              style={{
                padding: '18px',
                borderRadius: '10px',
                background: 'var(--inverse-panel)',
                color: '#f4f4f5',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '600' }}>
                  {'Your PDS'}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    color: '#f2c76b',
                  }}
                >
                  {'CONTEXT LAYER'}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: '#2e2e33',
                    fontSize: '13px',
                  }}
                >
                  {'posts'}
                </span>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: '#2e2e33',
                    fontSize: '13px',
                  }}
                >
                  {'follows'}
                </span>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: '#2e2e33',
                    fontSize: '13px',
                  }}
                >
                  {'preferences'}
                </span>
              </div>
            </div>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: '13px',
                lineHeight: '1.5',
                color: 'var(--muted)',
                textAlign: 'center',
              }}
            >
              {'Move apps or agents and your context comes along.'}
            </p>
          </figure>
        </section>
        <section
          className={styles.detailSection}
          id="permissions"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px 48px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: '#efe9fb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5b3fa8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="14" r="4"></circle>
                  <path d="M11 11l8-8M16 6l2 2M14 8l2 2"></path>
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: 'var(--subtle)',
                }}
              >
                {'04'}
              </span>
            </div>
            <h2
              style={{
                margin: '0',
                fontSize: '30px',
                fontWeight: '600',
                lineHeight: '1.25',
                color: 'var(--foreground)',
              }}
            >
              {'See what an agent can do before you say yes'}
            </h2>
            <p style={{ margin: '0' }}>
              {
                'An agent acting for you never needs your password. Apps sign you in with OAuth and ask only for the access they need. Permissions come in named sets with plain-language descriptions, so you see what an agent can do before you approve it.'
              }
            </p>
            <p
              style={{
                margin: '0',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              {'Learn more → '}
              <Link
                href="/guides/permission-requests"
                style={{ color: '#1d4ab8' }}
              >
                {'Permission Requests'}
              </Link>
              {' · '}
              <Link href="/guides/scope-builder" style={{ color: '#1d4ab8' }}>
                {'Scope Builder'}
              </Link>
            </p>
          </div>
          <figure
            role="img"
            aria-label="Example approval screen: an agent asks for a named permission set with a plain-language description, with Deny and Allow buttons"
            style={{
              flex: '1 1 340px',
              minWidth: '0',
              margin: '0',
              padding: '28px',
              borderRadius: '12px',
              background: 'var(--permission-panel)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                padding: '22px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--surface)',
                boxShadow: '0 16px 36px rgba(24,24,27,0.10)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <span
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#e8eefc',
                    color: '#1d4ab8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="7" width="16" height="12" rx="3"></rect>
                    <path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"></path>
                  </svg>
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                    }}
                  >
                    {"Bob's agent"}
                  </span>
                  <span
                    style={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '12px',
                      color: 'var(--muted)',
                    }}
                  >
                    {'wants access to @bob.com'}
                  </span>
                </div>
              </div>
              <div
                style={{
                  padding: '14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--foreground)',
                  }}
                >
                  {'Manage your tasks'}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: 'var(--muted)',
                  }}
                >
                  {
                    "Create, update, and complete tasks in your account. It can't post for you or change your profile, handle, or account settings."
                  }
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--muted)',
                }}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0f7b55"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"></path>
                </svg>
                {'No password shared'}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span
                  style={{
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '42px',
                    border: '1px solid var(--dots)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                  }}
                >
                  {'Deny'}
                </span>
                <span
                  style={{
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '42px',
                    borderRadius: '6px',
                    background: 'var(--inverse-panel)',
                    color: '#f4f4f5',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {'Allow'}
                </span>
              </div>
            </div>
          </figure>
        </section>
        <section
          className={styles.detailSection}
          id="schemas"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px 48px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: '#fbe8e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b0362c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 4H6v16h3M15 4h3v16h-3"></path>
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: 'var(--subtle)',
                }}
              >
                {'05'}
              </span>
            </div>
            <h2
              style={{
                margin: '0',
                fontSize: '30px',
                fontWeight: '600',
                lineHeight: '1.25',
                color: 'var(--foreground)',
              }}
            >
              {'Agents from anywhere speak the same language'}
            </h2>
            <p style={{ margin: '0' }}>
              {
                'Lexicon is atproto’s schema language. Publish a schema for a new kind of record, like a task, a handoff, or a status update, and every agent and app that reads it gets the same shape. Published schemas can’t change their constraints, so agents built by different people can rely on them without a shared vendor.'
              }
            </p>
            <p
              style={{
                margin: '0',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              {'Learn more → '}
              <Link href="/guides/lexicon" style={{ color: '#1d4ab8' }}>
                {'Lexicon guide'}
              </Link>
            </p>
          </div>
          <figure
            style={{
              flex: '1 1 340px',
              minWidth: '0',
              margin: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--panel)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    color: 'var(--muted)',
                  }}
                >
                  {'com.example.agent.task'}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    color: '#b0362c',
                  }}
                >
                  {'EXAMPLE'}
                </span>
              </div>
              <pre
                style={{
                  margin: '0',
                  padding: '16px',
                  background: 'var(--surface)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'var(--foreground)',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {
                  '{\n  "lexicon": 1,\n  "id": "com.example.agent.task",\n  "defs": {\n    "main": {\n      "type": "record",\n      "key": "tid",\n      "record": {\n        "type": "object",\n        "properties": {\n          "title": { "type": "string" },\n          "status": { "type": "string" }\n        }\n      }\n    }\n  }\n}'
                }
              </pre>
            </div>
            <figcaption
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                fontSize: '13px',
                color: 'var(--muted)',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--subtle)',
                }}
              >
                {'same shape for →'}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  background: 'var(--surface)',
                }}
              >
                {"Alice's agent"}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  background: 'var(--surface)',
                }}
              >
                {"Bob's agent"}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  background: 'var(--surface)',
                }}
              >
                {'any app'}
              </span>
            </figcaption>
          </figure>
        </section>
        <section
          className={styles.detailSection}
          id="network"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px 48px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: '#e0f1f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0e6f8a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <ellipse cx="12" cy="6" rx="8" ry="3"></ellipse>
                  <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>
                  <path d="M12 9v3"></path>
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: 'var(--subtle)',
                }}
              >
                {'06'}
              </span>
            </div>
            <h2
              style={{
                margin: '0',
                fontSize: '30px',
                fontWeight: '600',
                lineHeight: '1.25',
                color: 'var(--foreground)',
              }}
            >
              {"The whole network is your agent's dataset"}
            </h2>
            <p style={{ margin: '0' }}>
              {
                "Relays gather public records from accounts across the network into a firehose, so an agent can read the whole network instead of one app's slice. Log in to any app and be instantly connected to 47+ million accounts, and the data that they share."
              }
            </p>
            <p
              style={{
                margin: '0',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              {'Learn more → '}
              <Link
                href="/guides/streaming-data#jetstream"
                style={{ color: 'rgb(29, 74, 184)' }}
              >
                {'Jetstream'}
              </Link>
            </p>
          </div>
          <figure
            role="img"
            aria-label="Diagram: repositories across the network flow into a relay firehose that your agent reads directly"
            style={{
              flex: '1 1 340px',
              minWidth: '0',
              margin: '0',
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--panel)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  flex: '1',
                  padding: '8px 4px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  textAlign: 'center',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--muted)',
                }}
              >
                {'repo'}
              </span>
              <span
                style={{
                  flex: '1',
                  padding: '8px 4px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  textAlign: 'center',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--muted)',
                }}
              >
                {'repo'}
              </span>
              <span
                style={{
                  flex: '1',
                  padding: '8px 4px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  textAlign: 'center',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--muted)',
                }}
              >
                {'repo'}
              </span>
              <span
                style={{
                  flex: '1',
                  padding: '8px 4px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  textAlign: 'center',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--muted)',
                }}
              >
                {'repo'}
              </span>
            </div>
            <p
              style={{
                margin: '6px 0 0',
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--subtle)',
              }}
            >
              {'accounts across every app'}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                height: '16px',
              }}
            >
              <span style={{ borderLeft: '2px solid #0e6f8a' }}></span>
            </div>
            <div
              style={{
                padding: '12px 14px',
                border: '1px solid #0e6f8a',
                borderRadius: '8px',
                background: 'var(--surface)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--foreground)',
                }}
              >
                {'Relay firehose'}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#0e6f8a',
                }}
              >
                {'all public records'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                height: '16px',
              }}
            >
              <span style={{ borderLeft: '2px solid #0e6f8a' }}></span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
              }}
            >
              <span
                style={{
                  flex: '0 0 30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: '#e8eefc',
                  color: '#1d4ab8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="7" width="16" height="12" rx="3"></rect>
                  <path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"></path>
                </svg>
              </span>
              <span style={{ fontSize: '13px', color: 'var(--copy)' }}>
                {'Your agent reads across the whole network, not one app'}
              </span>
            </div>
          </figure>
        </section>
        <section
          className={styles.detailSection}
          id="vision"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '3px 10px',
              border: '1px solid var(--dots)',
              borderRadius: '999px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.06em',
              color: 'var(--muted)',
            }}
          >
            {'WHERE THIS IS GOING'}
          </span>
          <h2
            style={{
              margin: '0',
              fontSize: '34px',
              fontWeight: '600',
              lineHeight: '1.2',
              color: 'var(--foreground)',
            }}
          >
            {"Everyone's agents, working together"}
          </h2>
          <p style={{ margin: '0', maxWidth: '46em' }}>
            {
              "Put the pieces together and everyone's agents can work with everyone else's, on consent, with a signed trail back to a person at every step. People hold the keys, agents do the work across organizations, and the chain of responsibility is always visible."
            }
          </p>
          <div
            className={styles.resourceGrid}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 40px',
                  height: '40px',
                  borderRadius: '9px',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="5" r="2.5"></circle>
                  <circle cx="5" cy="18" r="2.5"></circle>
                  <circle cx="19" cy="18" r="2.5"></circle>
                  <path d="M10.8 7.2L6.2 15.8M13.2 7.2l4.6 8.6"></path>
                </svg>
              </span>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '19px',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  color: 'var(--foreground)',
                }}
              >
                {'Graphs, not accounts'}
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'var(--muted)',
                }}
              >
                {
                  'Each person is the root of their own graph: their agents, sub-agents, and the grants between them. Nobody runs the whole network, the same way nobody runs email.'
                }
              </p>
            </article>
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 40px',
                  height: '40px',
                  borderRadius: '9px',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 11l3-3 3 2 4-4"></path>
                  <path d="M3 12l4-4 3 2M21 12l-4-4"></path>
                  <path d="M7 16l2 2 2-1 2 2 4-4"></path>
                </svg>
              </span>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '19px',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  color: 'var(--foreground)',
                }}
              >
                {'Cooperation runs on consent'}
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'var(--muted)',
                }}
              >
                {
                  "Your support agent can reach another company's billing agent under a grant that side issued: scoped, time-limited, and revocable. No more shared API keys between companies."
                }
              </p>
            </article>
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 40px',
                  height: '40px',
                  borderRadius: '9px',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="9" width="7" height="6" rx="3"></rect>
                  <rect x="14" y="9" width="7" height="6" rx="3"></rect>
                  <path d="M10 12h4"></path>
                </svg>
              </span>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '19px',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  color: 'var(--foreground)',
                }}
              >
                {'An unbroken chain of responsibility'}
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'var(--muted)',
                }}
              >
                {
                  "Agent C acted under agent B's grant, which came from person A. When something breaks across three organizations, the signatures lead back to the person who said yes."
                }
              </p>
            </article>
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 40px',
                  height: '40px',
                  borderRadius: '9px',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5"></circle>
                  <path d="M16 16l4.5 4.5"></path>
                </svg>
              </span>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '19px',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  color: 'var(--foreground)',
                }}
              >
                {'Agents you can find'}
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'var(--muted)',
                }}
              >
                {
                  'People publish what their agents can do as typed records, so you can find an agent others vouch for, check its record, and invite it in.'
                }
              </p>
            </article>
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 40px',
                  height: '40px',
                  borderRadius: '9px',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"></path>
                  <path d="M8.5 12l2.5 2.5 4.5-5"></path>
                </svg>
              </span>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '19px',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  color: 'var(--foreground)',
                }}
              >
                {'Trust that travels'}
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'var(--muted)',
                }}
              >
                {
                  "Trust the agents your colleagues trust. A bad agent's reputation follows it everywhere, and so does a good one's."
                }
              </p>
            </article>
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: '0 0 40px',
                  height: '40px',
                  borderRadius: '9px',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.6 4.5 3.2 4.5 1.5 4.5 3.3-2 3-4.5 3-4.5-1.3-4.5-3"></path>
                </svg>
              </span>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '19px',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  color: 'var(--foreground)',
                }}
              >
                {'New markets'}
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'var(--muted)',
                }}
              >
                {
                  "With identity, permission, and receipts built in, agents can do paid work for strangers, because every job carries proof of who asked, who did it, and who's on the hook."
                }
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}
