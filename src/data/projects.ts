/**
 * Case files. Source of truth: https://affan-interactive-lab.pages.dev/work/* (project journals,
 * updated September 30, 2026), the current public repositories, and the published resume.
 * Copy is condensed for the UI, but every number, status, link, and limitation maps to
 * a current public source.
 */

export type StatusTone = 'verified' | 'active' | 'wip' | 'private' | 'ongoing';

export interface ProjectMetric {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  /** Use thousands separators when rendering. */
  separator?: boolean;
  detail?: string;
  /** Coverage areas listed under the value, worded as in the journal. */
  chips?: string[];
}

export interface ProjectSection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
  /** 'steps' renders as an ordered procedure, 'bullets' as an unordered list. */
  listStyle?: 'steps' | 'bullets';
}

export interface ProjectLink {
  label: string;
  href: string;
  kind: 'repo' | 'live' | 'release';
}

export interface Project {
  slug: string;
  /** Display order in this portfolio (not the order on the original site). */
  index: string;
  title: string;
  shortTitle: string;
  kicker: string;
  category:
    | 'Security tooling'
    | 'Secure communications'
    | 'Infrastructure'
    | 'Platform & early-stage venture'
    | 'Web & extensions';
  status: string;
  statusTone: StatusTone;
  /** One sentence for cards, menus, and list rows. */
  summary: string;
  /** Opening paragraph of the case study. */
  lead: string;
  role: string;
  collaborators?: string[];
  stack: string[];
  facts: { label: string; value: string }[];
  metrics: ProjectMetric[];
  links: ProjectLink[];
  sections: ProjectSection[];
  /** Explicit limits — what the project does not claim. */
  boundaries: string[];
  next: string[];
  /**
   * Heading for the `next` list when it is not a plain to-do queue (e.g. gaps to study, or conditions a
   * future integration would need). Set, the list renders as plain bullets rather than checkboxes.
   */
  nextLabel?: string;
  /** Optional one-line note under the `next` heading, taken from the journal. */
  nextNote?: string;
  /** Suggested ReactBits background for the case-study header (one WebGL effect per page). */
  theme: 'Scanner' | 'WebThreads' | 'LightTunnel' | 'Radar' | 'SlicedWaves' | 'Threads' | 'Grainient' | 'Prism';
  /** Accent used by posters and highlights; always one of the design-system colors. */
  accent: 'phosphor' | 'chalk' | 'rust';
  featured: boolean;
  /** Path of the full journal in the Interactive Lab. */
  sourcePath: string;
}

export const JOURNAL_UPDATED = 'October 5, 2026';
export const SOURCE_SITE = 'https://affan-interactive-lab.pages.dev';

const projectCatalog: Project[] = [
  {
    slug: 'file-integrity-monitor',
    index: '01',
    title: 'File Integrity Monitor',
    shortTitle: 'Integrity Monitor',
    kicker: 'Security tooling · Python · Public source',
    category: 'Security tooling',
    status: 'Public source',
    statusTone: 'verified',
    summary:
      'A dependency-free SHA-256 integrity monitor with a loopback-only dashboard and a CLI that share one deterministic engine.',
    lead: 'I built a dependency-free integrity application with two deliberate operating modes: Integrity Desk for visual local review and a command-line interface for automation. Both paths use the same SHA-256 baseline engine and produce deterministic evidence for added, modified, deleted, moved, and unreadable files.',
    role: 'Independent build',
    stack: ['Python', 'SHA-256', 'JSON', 'unittest'],
    facts: [
      { label: 'Language', value: 'Python standard library' },
      { label: 'Integrity', value: 'SHA-256' },
      { label: 'Interface', value: 'Loopback-only browser dashboard + CLI' },
      { label: 'Evidence', value: 'Deterministic JSON' },
      { label: 'Fixture set', value: '500 files' },
      { label: 'Validation', value: '45/45 changes · zero scan errors' },
      { label: 'Repository', value: 'Public' }
    ],
    metrics: [
      { value: 45, suffix: '/45', label: 'controlled changes detected', detail: '20 modifications · 10 deletions · 10 additions · 5 moves' },
      { value: 500, label: 'fixture files scanned' },
      { value: 0, label: 'scan errors' },
    ],
    links: [{ label: 'View public repository', href: 'https://github.com/sil6428/file-integrity-monitor', kind: 'repo' }],
    sections: [
      {
        id: 'why',
        heading: 'Why I built it',
        paragraphs: [
          'A file-integrity tool should answer more than whether two hashes differ. An operator needs to know what baseline was trusted, what was added or removed, which metadata changed, whether the scan completed, and whether the evidence itself was protected from casual alteration.',
          'The engine stays small enough to inspect, uses only the Python standard library, and exposes the same behavior through a CLI and Integrity Desk, a local browser interface for people who do not want to manage every scan from a terminal.'
        ]
      },
      {
        id: 'baseline',
        heading: 'Baseline lifecycle',
        paragraphs: [
          'The first scan creates a deterministic inventory of the selected tree. Each record binds a normalized relative path to file type, size, timestamps where appropriate, and SHA-256 content evidence. Later scans compare current observations with the chosen baseline and classify additions, removals, content changes, and metadata changes.',
          'Baseline creation is intentionally separate from accepting a new trusted state. If every change automatically became the new baseline, an unauthorized modification could erase its own evidence during the next run.'
        ]
      },
      {
        id: 'interface',
        heading: 'Interface and reports',
        paragraphs: [
          'Integrity Desk lets the user select a directory, create or load a baseline, run a comparison, review grouped changes, and export a report. The UI calls the same core functions as the CLI, which reduces the chance that automation and the visible result disagree.',
          'Reports are deterministic so equivalent input produces comparable output. Clear statuses distinguish a completed clean scan from an error, skipped path, permission problem, or interrupted run.'
        ]
      },
      {
        id: 'failure',
        heading: 'Failure cases',
        paragraphs: [
          'The scanner handles unreadable files, disappearing paths, symbolic-link decisions, permission errors, malformed baselines, large trees, and files that change during observation. A result is not labelled clean when important paths could not be examined.'
        ]
      },
      {
        id: 'verification',
        heading: 'Verification and tradeoffs',
        paragraphs: [
          'In a controlled 500-file fixture set, the monitor detected 45 of 45 expected changes: 20 modifications, 10 deletions, 10 additions, and 5 moves, with zero scan errors.',
          'Verification covers deterministic scanning, change classification, same-size content tampering, rename inference, saved dashboard evidence, required-path validation, reports, error states, and agreement between the interface and core engine.',
          'Using only the standard library keeps installation and review simple, but the project does not depend on a database, background task queue, kernel event feed, or real-time filesystem watcher. It favours reproducible point-in-time evidence over continuous monitoring.'
        ]
      },
      {
        id: 'lessons',
        heading: 'Lessons',
        paragraphs: [
          'The main lesson is that integrity is a lifecycle, not a hash function. Trust in the initial state, protection of the baseline, completeness of observation, review of changes, and controlled acceptance of a new state all matter.'
        ]
      }
    ],
    boundaries: [
      'If an attacker can modify both the monitored files and the baseline or reporting environment, hashing alone cannot establish truth.',
      'Point-in-time evidence, not continuous real-time monitoring — there is no kernel event feed or filesystem watcher.',
      'Baselines need separate access control, backups, or signed external storage depending on the threat model.'
    ],
    next: [
      'Signed baseline manifests',
      'Scheduled scans',
      'Stronger platform-specific metadata',
      'Protected remote evidence',
      'Performance profiles for larger trees',
      'Documented recovery actions for each class of finding'
    ],
    nextLabel: 'Possible next steps',
    theme: 'Scanner',
    accent: 'rust',
    featured: true,
    sourcePath: '/work/file-integrity-monitor'
  },
  {
    slug: 'p2p-messaging',
    index: '02',
    title: 'P2P Messaging',
    shortTitle: 'P2P Messaging',
    kicker: 'Secure communications · Collaborative work in progress',
    category: 'Secure communications',
    status: 'Public work in progress',
    statusTone: 'wip',
    summary:
      'An educational Python prototype for direct, authenticated, encrypted messaging between explicitly verified peers.',
    lead: 'Ghayas Sher and I are building an educational Python prototype for direct communication between explicitly verified peers. Its local browser workspace combines identity protection, authenticated encryption, separate conversations, encrypted history, and defensive protocol limits — without presenting an unaudited system as production ready.',
    role: 'Co-developer',
    collaborators: ['Ghayas Sher'],
    stack: ['Python', 'FastAPI', 'Ed25519', 'X25519', 'ChaCha20-Poly1305', 'TCP'],
    facts: [
      { label: 'Status', value: 'Public work in progress' },
      { label: 'Collaboration', value: 'Affan Shaikh and Ghayas Sher' },
      { label: 'Language', value: 'Python 3.11+' },
      { label: 'Identity', value: 'Ed25519 and X25519' },
      { label: 'Encryption', value: 'ChaCha20-Poly1305' },
      { label: 'Limits', value: '64 KiB frame · 4 KiB plaintext' },
      { label: 'Interface', value: 'Local FastAPI browser workspace' },
      { label: 'Security checks', value: 'Adversarial, browser-flow, end-to-end' },
      { label: 'Transport', value: 'Direct TCP' }
    ],
    metrics: [],
    links: [{ label: 'View public repository', href: 'https://github.com/sil6428/P2P-messaging', kind: 'repo' }],
    sections: [
      {
        id: 'why',
        heading: 'Why direct peer messaging',
        paragraphs: [
          'The project began as an attempt to understand what secure messaging requires beneath the interface. Encrypting a string is only one part. Devices need identities, users need a way to verify keys, messages need authenticated structure and freshness, replays need rejection, local history needs protection, and delivery needs evidence from the intended peer.',
          'The application provides a usable local interface for identity setup, contacts, conversation history, message composition, verification, delivery state, and security information while keeping a CLI path for testing and automation.'
        ]
      },
      {
        id: 'crypto',
        heading: 'Cryptographic responsibilities',
        paragraphs: [
          'Long-term identity and per-message protection are separated conceptually. The protocol signs the authenticated message structure, derives encryption material for the intended peer, attaches nonces and sequence information, and verifies everything before plaintext is accepted into conversation state.',
          'Key fingerprints give users a comparison point, but fingerprint display is not the same as successful out-of-band verification. The interface therefore distinguishes a known key from a verified contact rather than presenting encryption as automatic proof of identity.'
        ]
      },
      {
        id: 'state',
        heading: 'Local state and conversation behavior',
        paragraphs: [
          'Conversations are organized by contact and retain the status needed to explain whether a message was prepared, sent, acknowledged, rejected, or failed. Parsing and size limits are applied before untrusted content can consume unlimited resources or mutate stored history.',
          'The design also considers duplicate messages, reordered delivery, restarts, changed contact keys, malformed envelopes, and acknowledgements that do not correspond to an accepted message — so failure remains visible instead of silently appearing as success.'
        ]
      },
      {
        id: 'verification',
        heading: 'Adversarial verification',
        paragraphs: [
          'The implemented paths are exercised against browser authentication failures, CSRF attempts, malformed input, tampering, spoofing, replay attempts, invalid acknowledgements, persistence problems, attachment-reference errors, and end-to-end delivery failures.',
          'That verification is evidence for the current prototype, not a substitute for an independent security audit.'
        ]
      },
      {
        id: 'collab',
        heading: 'Collaboration and roadmap',
        paragraphs: [
          'The repository uses documented suggestions and roadmap material so each contributor has a clear place to continue. Protocol documentation and repeatable verification let changes be evaluated against shared assumptions rather than merged because the interface appears to work.',
          'Comparable secure messengers show important gaps to study, from audited protocol libraries and forward secrecy to abuse controls and metadata minimization (the full list is below). These are references for learning, not features the project currently claims.'
        ]
      },
      {
        id: 'lessons',
        heading: 'Lessons',
        paragraphs: [
          'The project changed my understanding of secure communication from “use encryption” to maintaining a chain of identity, authorization, freshness, integrity, confidentiality, parsing limits, acknowledgement, and protected local state. A weakness at one boundary can invalidate confidence created by the others.'
        ]
      }
    ],
    boundaries: [
      'Not production ready and not independently audited.',
      'No forward secrecy, anonymous metadata, or NAT traversal.',
      'No automatic file transfer or multi-device synchronization.',
      'No protection after an endpoint is compromised.'
    ],
    next: [
      'Audited protocol libraries, prekeys, and forward secrecy',
      'Safety-number workflows and attachment lifecycle',
      'Device linking and key changes',
      'Abuse controls and backup policy',
      'Metadata minimization and recovery'
    ],
    nextLabel: 'Gaps to study: references for learning, not features the project claims',
    theme: 'WebThreads',
    accent: 'chalk',
    featured: true,
    sourcePath: '/work/p2p-messaging'
  },
  {
    slug: 'secure-file-transfer',
    index: '03',
    title: 'Secure File Transfer',
    shortTitle: 'Secure Transfer',
    kicker: 'Security application · Private source · Completed prototype',
    category: 'Security tooling',
    status: 'Completed prototype',
    statusTone: 'private',
    summary:
      'An authenticated TLS file-transfer service with a loopback-only Transfer Desk, resumable uploads, and verified, quarantined downloads.',
    lead: "I built an authenticated file-transfer application with a loopback-only browser workspace and a command-line workflow. A user can create local certificates and accounts, run the server, choose a file, review a recipient inbox, and complete a verified download without bypassing the service's TLS, isolation, resume, or integrity controls.",
    role: 'Independent build',
    stack: ['Python', 'TLS', 'SHA-256', 'scrypt', 'pytest'],
    facts: [
      { label: 'Status', value: 'Completed prototype' },
      { label: 'Source', value: 'Private' },
      { label: 'Language', value: 'Python' },
      { label: 'Transport', value: 'Authenticated TLS' },
      { label: 'Interface', value: 'Transfer Desk browser workspace + CLI' },
      { label: 'Integrity', value: 'SHA-256' },
      { label: 'Validation', value: '8 verified round trips · resume recovery' },
      { label: 'Measured transfer', value: '13,632,512 bytes' }
    ],
    metrics: [
      { value: 8, label: 'verified upload/download round trips', detail: '13,632,512 bytes total' },
      { value: 2097152, separator: true, label: 'byte upload resumed after interruption', detail: 'interrupted at 700,000 bytes' }
    ],
    links: [],
    sections: [
      {
        id: 'why',
        heading: 'Why this is a separate service',
        paragraphs: [
          'Secure file movement has different failure modes from secure text messaging. A signed file reference can state what a file should be, but transferring the bytes also requires recipient authorization, interruption handling, destination safety, integrity verification, quarantine, and an understandable operator workflow.',
          'I kept this service separate from P2P Messaging so those boundaries remain visible. Integration is a future design task rather than an implied capability.'
        ]
      },
      {
        id: 'workflow',
        heading: 'Operator workflow',
        paragraphs: [
          'Transfer Desk is a loopback-only browser workspace backed by the same Python core as the command-line interface. It guides a local operator through certificate generation, account creation, server startup, file selection, recipient choice, inbox review, and verified download destinations.',
          'Passwords remain request-scoped in the interface. Dashboard request logging and caching are disabled, and a random per-session token protects local actions.'
        ]
      },
      {
        id: 'trust',
        heading: 'Trust boundaries',
        paragraphs: [
          'TLS protects transport only after certificate trust is established. The service therefore separates certificate setup, account authentication, recipient authorization, storage isolation, audit records, and post-transfer digest verification.'
        ],
        list: [
          'Passwords are stored as scrypt-derived verifiers rather than plaintext.',
          'Authentication attempts are throttled.',
          'Recipient inboxes are isolated from one another.',
          'Paths and filenames are normalized to resist traversal.',
          'Upload and download records bind expected sizes and SHA-256 digests.',
          'Audit output avoids recording reusable passwords.'
        ],
        listStyle: 'bullets'
      },
      {
        id: 'quarantine',
        heading: 'Failure and quarantine behavior',
        paragraphs: [
          'Interrupted uploads can resume from a validated offset. Downloads are written to a temporary destination, checked against the expected size and digest, and promoted only after verification. A mismatch or unsafe destination prevents the file from being presented as successful and leaves evidence for review.',
          'The service also rejects malformed framing, unauthorized recipients, traversal attempts, and inconsistent metadata. These application-level checks complement TLS rather than being replaced by it.'
        ]
      },
      {
        id: 'measurements',
        heading: 'Measurements',
        paragraphs: [
          'I verified eight upload/download round trips totaling 13,632,512 bytes and resumed a 2,097,152-byte upload after interruption at 700,000 bytes. The verification also exercises authentication, throttling, recipient isolation, traversal attempts, interruption, tampering, quarantine, dashboard setup, and password-safe audit logging.'
        ]
      },
      {
        id: 'tradeoffs',
        heading: 'Tradeoffs',
        paragraphs: [
          'The application favours an inspectable Python implementation and a restrained local interface over distributed storage or a large service framework. That keeps the security boundaries understandable but leaves multi-device identity, NAT traversal, external deployment, key lifecycle, and formal review outside the current result.'
        ]
      }
    ],
    boundaries: [
      'Measurements prove specific controlled paths, not internet-scale throughput.',
      'No claim of resistance to every denial-of-service strategy.',
      'No independent cryptographic review.',
      'The local interface is not designed for exposure to an untrusted network.'
    ],
    next: [
      'Explicit mapping between messaging identities and transfer accounts',
      'Authorization for each attachment',
      'Recovery after either peer disconnects',
      'A single user-visible record of message and file status'
    ],
    nextLabel: 'Future integration with P2P Messaging would require',
    theme: 'LightTunnel',
    accent: 'phosphor',
    featured: true,
    sourcePath: '/work/secure-file-transfer'
  },
  {
    slug: 'ssik',
    index: '04',
    title: 'SSIK IT Consulting & Solutions',
    shortTitle: 'SSIK',
    kicker: 'Student venture · Co-founder · Platform builder',
    category: 'Platform & early-stage venture',
    status: 'Active',
    statusTone: 'active',
    summary:
      'An early-stage student IT and cybersecurity venture — I built its public website and the private, local-first SSIK Intelligence platform.',
    lead: 'I co-founded SSIK with Ghayas Sher, an Ontario Tech classmate. We are developing potential service scopes, review methods, and the boundaries an authorized engagement would require. I additionally built the public website and a private internal platform for controlled research and review.',
    role: 'Co-founder and platform builder',
    collaborators: ['Ghayas Sher'],
    stack: ['Website', 'GitHub Pages', 'RBAC', 'SSRF defenses', 'Durable jobs', 'Audit logging'],
    facts: [
      { label: 'Role', value: 'Co-founder and platform builder' },
      { label: 'Started', value: 'May 2026' },
      { label: 'Co-founder', value: 'Ghayas Sher, Ontario Tech classmate' },
      { label: 'Website', value: 'Nine public pages' },
      { label: 'Internal platform', value: '12-stage local V1' },
      { label: 'Controls', value: 'Lint, type, migration, integrity, secret checks' },
      { label: 'Hosting', value: 'GitHub Pages' }
    ],
    metrics: [
      { value: 12, label: 'workflow stages from discovery through recovery' },
      { value: 9, label: 'public website pages' }
    ],
    links: [
      { label: 'Visit SSIK website', href: 'https://sil6428.github.io/SSIK-website/index.html', kind: 'live' },
      { label: 'View website source', href: 'https://github.com/sil6428/SSIK-website', kind: 'repo' }
    ],
    sections: [
      {
        id: 'why',
        heading: 'Why SSIK started',
        paragraphs: [
          'SSIK IT Consulting & Solutions began as a shared effort to turn classroom knowledge into a controlled, reviewable workflow for a possible future service. We share the planning, security, privacy-research, and stakeholder-communication work. I independently built the public website and the private SSIK Intelligence V1 platform that supports that internal process.',
          'The project is intentionally passive by design. It organizes public business information and non-intrusive observations; it does not send outreach automatically, exploit systems, bypass access controls, or perform invasive testing. Any future engagement would require explicit authorization and a clearly defined scope.'
        ]
      },
      {
        id: 'public',
        heading: 'Public information structure',
        paragraphs: [
          'The nine-page public website had to explain what the organization does without implying work that has not occurred. Service descriptions separate readiness reviews, infrastructure guidance, privacy research, and possible future authorized assessments. Internal research and customer material stay outside the public repository.'
        ]
      },
      {
        id: 'workflow',
        heading: 'SSIK Intelligence workflow',
        paragraphs: [
          'The local-first internal platform uses a twelve-stage workflow so research does not become an unreviewed pile of targets. Work moves through stages including discovery, normalization, evidence collection, deduplication, review, prioritization, approval, export, rescanning, recovery, and audit. Durable jobs let the platform resume after interruption instead of silently abandoning a run.'
        ],
        list: [
          'Workspaces separate unrelated research and permissions.',
          'Role-based access control limits administrative and review actions.',
          'URL and network validation reduce server-side request forgery risk.',
          'Runtime and queue limits keep unattended work bounded.',
          'Evidence and audit records explain why an item changed state.',
          'Previously reviewed targets can be deprioritized while new coverage areas refill the queue.'
        ],
        listStyle: 'bullets'
      },
      {
        id: 'verification',
        heading: 'Verification',
        paragraphs: [
          'The private platform uses lint, type, migration, integrity, secret, authorization, recovery, and workflow checks. Outbound delivery remains disabled and mock-only, so validation cannot accidentally contact a researched organization.',
          'The public website is maintained through GitHub Pages. Deployment status, source ownership, and public claims are checked separately so the site does not describe internal capabilities that the platform has not demonstrated.'
        ]
      },
      {
        id: 'risk',
        heading: 'Risk boundaries',
        paragraphs: [
          'The platform stores business research and operational history, so authentication, authorization, auditability, and export control matter even when the underlying sources are public. Public information can still become sensitive when it is aggregated, scored, or associated with internal decisions.'
        ]
      },
      {
        id: 'lessons',
        heading: 'Lessons',
        paragraphs: [
          'The largest lesson is that workflow design is a security control. A technically correct scanner can still create risk if it lacks ownership, review gates, bounded execution, evidence retention, or a clear stop condition.'
        ]
      }
    ],
    boundaries: [
      'No automated penetration testing or guaranteed vulnerability discovery.',
      'No customer authorization, production-scale scanning, or regulatory certification is claimed.',
      'Internal verification covers application logic and known defensive boundaries. It is not an independent security assessment or proof that every future deployment configuration is safe.',
      'Outbound delivery is disabled and mock-only.'
    ],
    next: [
      'Refine the review experience',
      'Improve recovery reporting',
      'Validate deployment assumptions',
      'Document an authorized engagement lifecycle',
      'Separate reusable public components from private operational logic'
    ],
    theme: 'Radar',
    accent: 'phosphor',
    featured: true,
    sourcePath: '/work/ssik'
  },
  {
    slug: 'otnow',
    index: '05',
    title: 'OTNow',
    shortTitle: 'OTNow',
    kicker: 'Chrome extension · Student productivity · Local-first',
    category: 'Web & extensions',
    status: 'Published',
    statusTone: 'verified',
    summary:
      'An unofficial, local-first Chrome extension that keeps Ontario Tech Canvas deadlines visible without sending identifiable coursework to the developer.',
    lead: 'I built an unofficial Chrome extension that gives Ontario Tech Canvas users a persistent deadline panel, moved-date detection, local reminders, and direct course navigation without asking for a Canvas password or sending identifiable coursework to the developer.',
    role: 'Independent build',
    stack: ['JavaScript', 'Chrome Manifest V3', 'Canvas APIs'],
    facts: [
      { label: 'Platform', value: 'Chrome Manifest V3' },
      { label: 'Data source', value: 'Two read-only Canvas endpoints' },
      { label: 'Storage', value: 'Local Chrome storage' },
      { label: 'Optional statistics', value: 'Explicit opt-in · numerical totals only' },
      { label: 'Validation', value: 'Live Canvas + GitHub and store packages' },
      { label: 'Live validation', value: 'Ontario Tech Canvas · Sep. 24, 2026' },
      { label: 'Distribution', value: 'Chrome Web Store · GitHub release' }
    ],
    metrics: [
      {
        value: 380,
        label: 'Canvas items organized',
        detail: 'public opt-in dashboard · 8 reporting installations · October 5, 2026'
      }
    ],
    links: [
      { label: 'Install from Chrome Web Store', href: 'https://chromewebstore.google.com/detail/otnow/ekaachncjiajgiikgikhpafcnepompkn', kind: 'live' },
      { label: 'View public repository', href: 'https://github.com/sil6428/OTNow', kind: 'repo' },
      { label: 'Download latest release', href: 'https://github.com/sil6428/OTNow/releases/latest', kind: 'release' },
      { label: 'View aggregate statistics', href: 'https://otnow-stats.sil6428-archtech.workers.dev/dashboard', kind: 'live' }
    ],
    sections: [
      {
        id: 'problem',
        heading: 'The student problem',
        paragraphs: [
          'Canvas contains the required data, but deadlines can be spread across planner items, course pages, quizzes, assignments, discussions, events, and announcements. OTNow began as a local companion that keeps the upcoming workload visible in a side panel without asking the student to create another account.',
          "The design was inspired by WatNow with permission from its creator, but it was rebuilt for Ontario Tech's Canvas environment and its own visual language. It remains explicitly unofficial and does not claim endorsement by Ontario Tech University or Instructure."
        ]
      },
      {
        id: 'architecture',
        heading: 'Extension architecture',
        paragraphs: [
          "OTNow uses the student's existing authenticated Canvas session. A tightly scoped content bridge reads two read-only Canvas endpoints, normalizes the returned planner data, and sends it to the extension side panel, which groups entries by time, course, and type while preserving links back to the original Canvas item."
        ],
        list: [
          'Assignments, quizzes, discussions, events, planner notes, and other dated items are retained when Canvas returns them.',
          'Course, type, and grouping controls separate immediate work from the full queue.',
          'Moved-deadline detection makes silent date changes visible.',
          'Local reminders and course shortcuts reduce repeated navigation.',
          "Light, dark, and system themes follow the student's preference."
        ],
        listStyle: 'bullets'
      },
      {
        id: 'privacy',
        heading: 'Privacy and permission decisions',
        paragraphs: [
          "The extension does not request a Canvas password and does not send identifiable course data to the developer. Planner data, local deadline adjustments, reminder history, and preferences remain in Chrome's local storage. There is no advertising identifier, tracking pixel, analytics SDK, or OTNow user account.",
          'Anonymous global statistics are separate and off by default. After explicit consent and a separately granted host permission, OTNow can send only a random installation identifier, its version, bounded numerical totals, and an optional 1–5 rating. It excludes names, courses, coursework titles, URLs, dates, grades, emails, student numbers, Canvas identifiers, passwords, and authentication data; opting out deletes the reporting row.'
        ]
      },
      {
        id: 'offline',
        heading: 'Offline and failure behavior',
        paragraphs: [
          'The last successful local snapshot remains available when Canvas is temporarily unreachable. The interface distinguishes cached data from a fresh synchronization and provides a manual refresh path. Invalid or partial responses fail visibly instead of being interpreted as an empty schedule.'
        ]
      },
      {
        id: 'install',
        heading: 'Installation and updates',
        paragraphs: [
          'Version 1.5.0 is published on the Chrome Web Store, which is now the recommended installation path and provides automatic updates. The packaged GitHub release remains available for transparent manual installation, with a separate non-technical guide for setup, updates, troubleshooting, and removal.'
        ]
      },
      {
        id: 'verification',
        heading: 'Verification and limits',
        paragraphs: [
          'Release validation covers strict anonymous-report validation, Canvas normalization, submitted and graded states, moved dates, pagination safety, grouping, settings migration, version checks, local activity, deadline adjustments, public-statistics privacy controls, cache behavior, rating rules, and both the GitHub and Chrome Web Store packages.'
        ]
      }
    ],
    boundaries: [
      'The Chrome Web Store listing does not imply Ontario Tech or Instructure endorsement.',
      'Not built for every Canvas institution.',
      "No access once the user's Ontario Tech session has expired."
    ],
    next: [
      'Additional accessibility review',
      'Broader testing with consenting students',
      'Use store feedback to prioritize practical fixes',
      'Clearer edge-case reporting',
      'Changes justified by real feedback rather than feature count'
    ],
    theme: 'SlicedWaves',
    accent: 'chalk',
    featured: true,
    sourcePath: '/work/otnow'
  },
  {
    slug: 'cisco-networking-labs',
    index: '06',
    title: 'Cisco Networking Labs',
    shortTitle: 'Cisco Labs',
    kicker: 'Applied infrastructure · Cisco IOS · Coursework',
    category: 'Infrastructure',
    status: 'Ongoing university lab record',
    statusTone: 'ongoing',
    summary:
      'Routed and switched Cisco topologies — planned, configured, broken, and verified with evidence that traffic follows the intended path.',
    lead: 'My Cisco labs are the closest repeated simulation of real network operations in my current experience. Each exercise turns requirements into an address plan and topology, coordinates configuration across multiple devices, verifies the resulting state, introduces or reveals faults, and requires evidence that the final network works for the intended reason.',
    role: 'University coursework',
    stack: ['Cisco IOS', 'Packet Tracer', 'Wireshark'],
    facts: [
      { label: 'Environment', value: 'Cisco IOS and Packet Tracer' },
      { label: 'Addressing', value: 'IPv4 and IPv6' },
      { label: 'Switching', value: 'VLANs, trunks, STP' },
      { label: 'Routing', value: 'Static, inter-VLAN, OSPF, EIGRP' },
      { label: 'Services', value: 'DHCP, DNS, NAT' },
      { label: 'Evidence', value: 'Show commands, pings, traces, packet captures' },
      { label: 'Status', value: 'Ongoing university lab record' }
    ],
    metrics: [],
    links: [],
    sections: [
      {
        id: 'why',
        heading: 'Why these labs lead the work',
        paragraphs: [
          'Requirements become a topology and address plan, several device configurations have to agree, and evidence must prove that traffic follows the intended path.',
          'They also produce useful failures. A host can have the right address but the wrong gateway; a trunk can be active but omit one VLAN; a routing adjacency can form while a network statement is incomplete; or NAT can hide an addressing problem until traffic crosses a particular boundary.'
        ]
      },
      {
        id: 'planning',
        heading: 'Planning and topology',
        paragraphs: [
          'Before configuration, I identify networks, broadcast domains, device roles, gateways, routing boundaries, services, and expected traffic flows. IPv4 subnets and IPv6 prefixes are assigned deliberately so verification output can be compared with the intended plan.',
          'The topology record includes interface names, link types, VLAN IDs, trunk expectations, routed networks, DHCP scopes, DNS assumptions, and the commands that should prove each layer.'
        ]
      },
      {
        id: 'layer2',
        heading: 'Layer 2 configuration',
        paragraphs: [
          'Switching work includes VLAN creation, access-port assignment, 802.1Q trunks, native-VLAN and allowed-VLAN checks, spanning-tree observation, and router-on-a-stick where inter-VLAN routing is required.',
          'Verification uses interface status, VLAN tables, trunk state, MAC learning, spanning-tree output, and end-host traffic checks. A configured command is not accepted as evidence until operational state and traffic agree.'
        ]
      },
      {
        id: 'routing',
        heading: 'Routing and services',
        paragraphs: [
          'Routed labs include static and default routes together with introductory OSPF and EIGRP behavior. I inspect routing tables, next hops, administrative distance, metrics, neighbor state, advertised networks, passive interfaces, and the effect of a failure or changed path.',
          'Supporting services include DHCP, DNS, NAT, IPv4 and IPv6 gateways, and selected access controls — tested from the client perspective as well as from the device providing them.'
        ]
      },
      {
        id: 'troubleshooting',
        heading: 'Troubleshooting sequence',
        paragraphs: ['I start with the intended path and narrow the fault domain instead of changing several devices at once.'],
        list: [
          'Confirm the endpoint address, prefix, gateway, and DNS information.',
          'Check physical and data-link interface state.',
          'Verify VLAN membership and trunk carriage.',
          'Inspect neighbor tables and local routes.',
          'Follow the routing table hop by hop.',
          'Check service-specific state such as DHCP bindings, NAT translations, or routing neighbors.',
          'Use ping, traceroute, IOS show commands, Wireshark, and packet-level evidence where needed.',
          'Make one justified correction and retest the original path.'
        ],
        listStyle: 'steps'
      },
      {
        id: 'evidence',
        heading: 'Evidence and documentation',
        paragraphs: [
          'Each lab should preserve the requirement, topology, address plan, relevant configuration, initial symptom, observed state, likely fault domain, corrective action, and final verification. This makes the work reproducible and exposes cases where a local ping succeeds while the complete end-to-end requirement still fails.'
        ]
      }
    ],
    boundaries: [
      'Packet Tracer and CML are controlled learning environments.',
      'They do not reproduce every hardware behavior, provider dependency, wireless condition, licensing issue, scale limit, or operational process of a production network.'
    ],
    next: [
      'Connect these skills to the Proxmox home lab',
      'Segmented virtual networks with routing and firewall boundaries',
      'Windows and Linux services, traffic capture, and centralized logs',
      'Backups and recovery exercises'
    ],
    theme: 'Threads',
    accent: 'chalk',
    featured: true,
    sourcePath: '/work/cisco-networking-labs'
  },
  {
    slug: 'archtech',
    index: '07',
    title: 'Archtech Nonprofit Technology Operations',
    shortTitle: 'Archtech Ops',
    kicker: 'Nonprofit infrastructure · Active',
    category: 'Infrastructure',
    status: 'Active, private development',
    statusTone: 'active',
    summary:
      'Google Workspace, access ownership, contributor coordination, and the hosting and deployment path for a developing nonprofit.',
    lead: 'I set up the collaboration foundation for a developing nonprofit, coordinate the contributors building its website, and own the hosting and deployment path that turns private team work into a stable release. The work combines account administration, access ownership, technical communication, release coordination, and hands-on implementation support.',
    role: 'Google Workspace and web hosting',
    stack: ['Google Workspace', 'Hosting', 'Deployment', 'Access management'],
    facts: [
      { label: 'Role', value: 'Google Workspace and web hosting' },
      { label: 'Status', value: 'Active, private development' },
      { label: 'Team', value: 'Website team coordination' },
      { label: 'Repository', value: 'Private' },
      { label: 'Focus', value: 'Collaboration, hosting, reliable releases' }
    ],
    metrics: [],
    links: [],
    sections: [
      {
        id: 'foundation',
        heading: 'Why the operational foundation comes first',
        paragraphs: [
          'Archtech is a developing nonprofit, so the technical problem is larger than producing a website that looks finished on one computer. The organization needs durable ownership of its accounts, a release path that another authorized person can understand, and a recovery route that does not depend on one contributor remembering an undocumented password.',
          'I established the Google Workspace environment, coordinate the contributors building the private website, and own the hosting and deployment path. My central responsibility is continuity across people, accounts, source code, hosting, and the eventual public release.'
        ]
      },
      {
        id: 'release',
        heading: 'How work moves toward a release',
        paragraphs: [
          'The working process separates contribution from publication. A release becomes ready only after ownership, source state, hosting configuration, and the public result agree.'
        ],
        list: [
          'Confirm which organizational account owns each service.',
          'Keep recovery options associated with the organization rather than one personal inbox.',
          'Define who can contribute, who can review, and who can publish.',
          'Record the source revision and deployment destination for a release.',
          'Verify the deployed page directly instead of assuming a successful build means the public service works.',
          'Keep rollback information available before a change is treated as complete.'
        ],
        listStyle: 'steps'
      },
      {
        id: 'access',
        heading: 'Access decisions and handoffs',
        paragraphs: [
          'Access is granted for a role and a task, not simply because someone is part of the project. That reduces accidental changes and makes offboarding easier.',
          'Handoffs explain the service owner, authorized administrators, billing or renewal responsibility, recovery path, deployment steps, and current limitations — so another authorized contributor can continue without reconstructing the environment from chat history.'
        ]
      },
      {
        id: 'evidence',
        heading: 'Evidence',
        paragraphs: [
          'The strongest evidence is operational: organization-owned accounts exist, responsibilities are separated, the deployment path is documented, and the public result will be checked from outside the development environment. The project is still active, so I do not describe the website as publicly launched until that is true.'
        ]
      },
      {
        id: 'teaching',
        heading: 'What this work is teaching me',
        paragraphs: [
          'The project makes the gap between building a page and operating a service concrete. A front end can be correct while account recovery is unclear, a domain renewal is tied to the wrong person, a deployment cannot be reproduced, or the public host serves an older revision.'
        ]
      }
    ],
    boundaries: [
      'The website source and unfinished organizational material remain private.',
      'The website is not described as publicly launched until that is true.',
      'No credentials, internal discussions, or unreleased work are exposed here.'
    ],
    next: ['Production launch', 'A verified release checklist', 'A recovery exercise', 'A concise handoff guide for future administrators'],
    theme: 'Grainient',
    accent: 'rust',
    featured: false,
    sourcePath: '/work/archtech'
  },
  {
    slug: 'interactive-portfolio',
    index: '08',
    title: 'Interactive Lab',
    shortTitle: 'Interactive Lab',
    kicker: 'Three.js · React · Next.js · Cloudflare Pages',
    category: 'Web & extensions',
    status: 'Public source',
    statusTone: 'verified',
    summary:
      'My Three.js room portfolio — procedural 3D objects, the AFFAN_OS file environment, and long-form journals with deployment checks.',
    lead: 'My 3D portfolio is both a presentation layer and a documented software project. It combines an interactive Three.js room, the AFFAN_OS file environment, long-form project and interest pages, a searchable object index, responsive non-3D navigation, adaptive rendering, structured metadata, and deployment checks so the visual idea does not replace usability or evidence.',
    role: 'Independent build',
    stack: ['Three.js', 'React', 'Next.js', 'Cloudflare Pages'],
    facts: [
      { label: 'Framework', value: 'Next.js 16 + React 19' },
      { label: 'Rendering', value: 'Three.js 0.185' },
      { label: 'Build', value: 'Vinext + Vite' },
      { label: 'Interfaces', value: '3D room + AFFAN_OS + standard pages' },
      { label: 'Delivery', value: 'Cloudflare Pages + permanent legacy redirects' },
      { label: 'Accessibility', value: 'Object index, semantic pages, reduced-motion handling' },
      { label: 'Repository', value: 'Public' }
    ],
    metrics: [],
    links: [
      { label: 'Open the live room', href: 'https://affan-interactive-lab.pages.dev', kind: 'live' },
      { label: 'View public repository', href: 'https://github.com/sil6428/affan-interactive-lab', kind: 'repo' }
    ],
    sections: [
      {
        id: 'room',
        heading: 'Why the room exists',
        paragraphs: [
          'The first view should communicate more than a grid of project cards. The room connects technical work and personal interests to physical objects: the workstation opens AFFAN_OS, the rack represents networking and the home lab, the printer explains fabrication, the racket opens badminton, the camera opens photography, and the bookshelf opens reading.',
          'The visual idea only works if visitors can understand it, so the page explains how to move and select, highlights complete targets, records viewed objects, provides a numbered index, and keeps conventional pages available outside the 3D scene.'
        ]
      },
      {
        id: 'construction',
        heading: 'Room construction',
        paragraphs: [
          'The desk, workstation, printer, rack, bookshelf, sports equipment, props, and cat are procedural Three.js models built from reusable geometry and materials. Lighting, shadows, camera targets, object labels, and movement limits are tuned together so the room stays readable.'
        ]
      },
      {
        id: 'os',
        heading: 'AFFAN_OS',
        paragraphs: [
          "Powering on the room's computer opens a React interface designed like a small personal operating system, with folders for projects, labs, education, experience, interests, contact paths, and the resume — plus window state, a launcher, file search, keyboard access, and a Bash-inspired terminal."
        ]
      },
      {
        id: 'performance',
        heading: 'Performance strategy',
        paragraphs: [
          'Bloom and glTF parsing load only when required, nonessential model work is deferred until the browser is idle, hidden tabs pause rendering, and idle scenes use a reduced update rate. Pixel ratio, shadow maps, reflections, and geometry detail respond to device capability.'
        ]
      },
      {
        id: 'accessibility',
        heading: 'Accessibility and evidence',
        paragraphs: [
          'The WebGL canvas is a presentation layer, not the only document structure. Before a release, lint checks the source, the production build renders every route, and generated output is inspected for core content, metadata, and project facts.'
        ]
      }
    ],
    boundaries: [
      'Three.js is not free: the renderer remains the largest client-side dependency, so the work bounds repeated effort and preserves a useful non-3D route.'
    ],
    next: ['Keep the record current: problem, decisions, evidence, limits, and next step for every new entry'],
    theme: 'Prism',
    accent: 'phosphor',
    featured: false,
    sourcePath: '/work/portfolio'
  }
];

/**
 * Recruiter-facing order: lead with the three clearest flagship stories, then supporting
 * security tools and the earlier-stage/private work. The catalog above stays grouped by its
 * original source history; display indices are assigned from this focused order.
 */
const PROJECT_ORDER = [
  'otnow',
  'cisco-networking-labs',
  'p2p-messaging',
  'file-integrity-monitor',
  'secure-file-transfer',
  'ssik',
  'archtech',
  'interactive-portfolio'
] as const;

export const projects: Project[] = PROJECT_ORDER.map((slug, position) => {
  const project = projectCatalog.find((entry) => entry.slug === slug);
  if (!project) throw new Error(`Missing project in catalog: ${slug}`);
  return { ...project, index: String(position + 1).padStart(2, '0') };
});

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] };
}
