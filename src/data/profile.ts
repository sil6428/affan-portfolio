/**
 * Identity and contact data.
 * Source of truth: this portfolio, its linked project repositories, and the published resume PDF.
 */

export const profile = {
  name: 'Affan Shaikh',
  firstName: 'Affan',
  lastName: 'Shaikh',
  initials: 'AS',
  headline: 'Networking + IT Security',
  title: 'Networking and IT Security student',
  siteDescription: 'Networking, cybersecurity, and the things I build.',
  intro: "I'm Affan, a cybersecurity student who learns best by building.",
  location: 'Oshawa, Ontario',
  locationShort: 'Oshawa, ON',
  focus: 'Networks and cybersecurity',
  status: 'Open to co-op opportunities',
  /** Short rotating role labels used in the hero (from the site header and GitHub bio). */
  roles: ['Networking', 'IT Security', 'Security tooling', 'Network defense'],
  seeking: [
    'Network operations',
    'Security operations',
    'Systems administration',
    'Infrastructure security',
    'Security-focused development'
  ],
  certification: {
    name: 'CompTIA Security+',
    status: 'Self-study',
    note: 'Studying the objectives alongside coursework and the home lab; no exam date is claimed.'
  },
  education: {
    school: 'Ontario Tech University',
    location: 'Oshawa, ON',
    degree: 'Bachelor of Information Technology (Honours)',
    major: 'Networking and IT Security',
    start: '2024-09',
    expectedEnd: '2028-04',
    dateLabel: 'Sept. 2024 — Expected Apr. 2028',
    summary:
      'Coursework connects Cisco routing and switching, IPv4/IPv6 design, network services, operating systems, Python, cryptography, cybercrime, trust, and security controls.',
    coursework: [
      'Advanced Networking I',
      'Cybersecurity Foundations',
      'Programming I with Python',
      'Computer Systems'
    ],
    topics: [
      'Cisco routing and switching',
      'IPv4/IPv6 design',
      'Network services',
      'Operating systems',
      'Python',
      'Cryptography',
      'Cybercrime',
      'Trust',
      'Security controls'
    ]
  },
  /** Long-form bio ("A little context" on /info), lightly condensed. */
  bio: [
    "I'm completing Ontario Tech University's Networking and IT Security degree, with graduation expected in April 2028. My work moves between configuring routed and switched networks, examining how security controls fail, and building software that makes technical evidence understandable to the person operating it.",
    'I learn best by building and verifying. A Cisco lab makes a failed route observable through interface state, routing tables, packet captures, and end-to-end validation. A security application turns broad terms such as identity, authorization, integrity, replay protection, or recovery into decisions that have to survive malformed input and interrupted workflows.',
    'I co-founded SSIK with my Ontario Tech classmate Ghayas Sher as an early-stage student venture. We develop service scopes and review methods, and I independently built its public website and private, local-first SSIK Intelligence platform. I also support Google Workspace, account continuity, website-team coordination, hosting, and deployment for a developing nonprofit while studying Security+ objectives and expanding a Proxmox home lab.',
    'I am looking for co-op work where I can contribute to real infrastructure and learn from experienced operators. Network operations, security operations, systems administration, infrastructure security, and security-focused development all fit the direction of the work collected here.'
  ],
  /** A line from the /info page that summarizes how the work is documented. */
  thesis:
    'I would rather describe a smaller verified result accurately than make a broad claim that I cannot explain in an interview.',
} as const;

export const contact = {
  email: 'ffaanshake@gmail.com',
  github: { label: 'github.com/sil6428', href: 'https://github.com/sil6428', handle: 'sil6428' },
  linkedin: { label: 'linkedin.com/in/sil6428', href: 'https://www.linkedin.com/in/sil6428' },
  resume: { label: 'resume.pdf', href: '/Affan_Shaikh_Resume.pdf' },
  interactiveLab: { label: 'affan-interactive-lab.pages.dev', href: 'https://affan-interactive-lab.pages.dev' }
} as const;

/** "Documentation approach" — how the portfolio record is maintained (from /info). */
export const principles = [
  {
    id: '01',
    title: 'Current state',
    body: 'I separate completed, active, planned, private, and externally blocked work so a roadmap item never reads like a shipped feature.'
  },
  {
    id: '02',
    title: 'Evidence',
    body: 'I record controlled measurements, configurations, screenshots, public source, and live verification beside the specific claim each item supports.'
  },
  {
    id: '03',
    title: 'Boundaries',
    body: 'Every security project explains what it protects, which assumptions it requires, what it rejects, and what remains outside the current design.'
  },
  {
    id: '04',
    title: 'Lessons',
    body: 'I keep the decisions, failures, tradeoffs, and next steps that shaped the result so the record documents how the work developed, not only how it looks now.'
  }
] as const;
