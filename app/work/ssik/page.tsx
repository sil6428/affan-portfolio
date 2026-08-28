import type { Metadata } from "next";
import CaseStudy from "../case-study";

export const metadata: Metadata = {
  title: "SSIK IT Consulting & Solutions | Affan Shaikh",
  description: "Co-founding SSIK, building its public website, and developing its private internal intelligence platform.",
};

const data = {
  index: "02",
  title: "SSIK IT Consulting & Solutions",
  label: "IT consulting · Co-founder · Platform builder",
  summary:
    "I co-founded SSIK with Ghayas Sher, an Ontario Tech classmate. We share the consulting, security, privacy, and stakeholder responsibilities. I additionally built the public website and a private internal platform for controlled research and review.",
  facts: [
    ["Role", "Co-founder and platform builder"],
    ["Started", "May 2026"],
    ["Co-founder", "Ghayas Sher, Ontario Tech classmate"],
    ["Website", "Nine public pages"],
    ["Internal platform", "12-stage local V1"],
    ["Verification", "79 automated tests"],
    ["Hosting", "GitHub Pages"],
  ] as Array<[string, string]>,
  links: [
    { label: "Visit SSIK website", href: "https://sil6428.github.io/SSIK-website/index.html" },
    { label: "View website source", href: "https://github.com/sil6428/SSIK-website" },
  ],
  sections: [
    {
      title: "Co-founding SSIK",
      paragraphs: [
        "Ghayas and I are classmates in Ontario Tech University's Networking and IT Security program. We co-founded SSIK to provide practical IT and cybersecurity consulting for organizations that need clear, business-focused guidance.",
        "We hold the same consulting responsibilities: reviewing client IT and security environments, identifying control gaps and privacy risks, researching regulatory requirements, and turning technical findings into prioritized recommendations for stakeholders.",
      ],
    },
    {
      title: "Independent website delivery",
      paragraphs: [
        "I independently designed and built the nine-page public website covering the company overview, services, honest example engagement scenarios, consultations, contact, privacy, website terms, and responsible disclosure.",
        "The work required turning a broad consulting offer into understandable client-facing content, defining a written five-step engagement process, narrowing services to current capability, and publishing the static site through GitHub Pages.",
      ],
      bullets: [
        "Designed the visual system and page structure",
        "Built the complete public front end",
        "Organized services around client needs",
        "Added structured intake, privacy, terms, and responsible disclosure pages",
        "Created branded favicon and social-sharing assets",
        "Published and maintain the GitHub Pages deployment",
      ],
    },
    {
      title: "Private internal intelligence platform",
      paragraphs: [
        "I built SSIK Intelligence as a private, local-first Python and FastAPI system for authorized prospect research. Its workflow keeps collection passive, preserves source evidence, separates analyst and administrator permissions, and requires human review before any outreach draft advances.",
        "The completed V1 includes durable background jobs, SSRF and DNS-rebinding defenses, deterministic findings and scores, evidence review, exports, rescans and change comparisons, bounded overnight runs, integrity-checked backups, storage controls, and mock-only message delivery. The release passed 79 automated tests plus linting, strict type checks, migration checks, database integrity checks, and a secret scan.",
      ],
      bullets: [
        "Delivered the full 12-stage V1 specification",
        "Kept network collection passive and explicitly authorized",
        "Linked findings and scores back to retained evidence",
        "Added role-based access, audit history, and approval gates",
        "Implemented recovery, retention, deletion, and organization export controls",
        "Kept the source repository private and outbound delivery disabled",
      ],
    },
    {
      title: "Shared role, additional website ownership",
      paragraphs: [
        "Ghayas and I share SSIK's co-founder, consulting, security-assessment, privacy-research, and stakeholder-communication responsibilities. In addition to that shared work, I independently own the public website's design, development, publishing, and hosting maintenance, and I built the private SSIK Intelligence V1 platform.",
      ],
    },
  ],
};

export default function SsikCaseStudy() {
  return <CaseStudy data={data} />;
}
