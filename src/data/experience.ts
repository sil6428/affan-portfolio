/**
 * Experience, education, and community record.
 * Source of truth: the published resume and the Interactive Lab record.
 */

export interface ExperienceEntry {
  id: string;
  org: string;
  location?: string;
  role: string;
  start: string; // 'YYYY-MM' or 'YYYY'
  end: string | 'Present';
  dateLabel: string;
  kind: 'education' | 'venture' | 'operations' | 'work' | 'community';
  summary: string;
  highlights: string[];
  /** Case-study slug when the entry has one. */
  caseStudy?: string;
}

export const experience: ExperienceEntry[] = [
  {
    id: 'ssik',
    org: 'SSIK IT Consulting & Solutions',
    location: 'Ontario, Canada',
    role: 'Co-Founder and Platform Developer',
    start: '2026-05',
    end: 'Present',
    dateLabel: 'May 2026 — Present',
    kind: 'venture',
    summary:
      'Co-founded an early-stage student IT and cybersecurity venture with Ontario Tech classmate Ghayas Sher. We develop service scopes, security-control review methods, privacy research, and the internal workflow for possible future authorized engagements.',
    highlights: [
      'Independently delivered the public website and the private, local-first SSIK Intelligence platform.',
      'Built multi-workspace RBAC, SSRF-hardened passive collection, durable jobs, evidence-linked review, approval-gated mock outreach, rescans, and backup and restore controls.',
      'Delivered a 12-stage local workflow spanning discovery, evidence review, approvals, rescans, export, and recovery.'
    ],
    caseStudy: 'ssik'
  },
  {
    id: 'archtech',
    org: 'Archtech',
    location: 'Oshawa, ON',
    role: 'Technical Operations and Hosting',
    start: '2026',
    end: 'Present',
    dateLabel: '2026 — Present',
    kind: 'operations',
    summary:
      'Established Google Workspace, coordinate the contributors building the private website, and own hosting and deployment for a developing nonprofit.',
    highlights: [
      'Organizational account ownership and recovery paths that do not depend on one person.',
      'Understandable handoffs, repeatable releases, and verification of the live result.'
    ],
    caseStudy: 'archtech'
  },
  {
    id: 'winners',
    org: 'Winners',
    location: 'Oshawa, ON',
    role: 'Sales Associate',
    start: '2025-05',
    end: 'Present',
    dateLabel: 'May 2025 — Present',
    kind: 'work',
    summary:
      'Support customers, process transactions accurately, maintain displays, and coordinate with the team during high-traffic periods.',
    highlights: []
  },
];

export const community = {
  totalHours: 430,
  headline: '430 hours spent helping people gather, learn, and participate.',
  entries: [
    {
      hours: 400,
      org: 'Al Arqam Islamic Centre',
      detail: 'Supporting registration, guest service, crowd flow, setup, and attendee needs.'
    },
    {
      hours: 30,
      org: 'YCC519 community event',
      detail: 'Coordinating logistics, setup, front-line support, and flow control.'
    }
  ]
} as const;
