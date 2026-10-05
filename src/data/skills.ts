/**
 * Skills and tools. Source of truth: /info "Skills and tools" and the resume "Technical Skills".
 * `usedIn` links a skill only to case files whose journal or resume entry names it.
 */

export type SkillCategoryId = 'networking' | 'security' | 'development' | 'systems';

export interface Skill {
  name: string;
  category: SkillCategoryId;
  /** Project slugs from src/data/projects.ts */
  usedIn: string[];
  /** Optional simple-icons slug for the logo marquee. */
  icon?: string;
}

export interface SkillCategory {
  id: SkillCategoryId;
  index: string;
  title: string;
  blurb: string;
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'networking',
    index: '01',
    title: 'Networks',
    blurb: 'Routed and switched designs, planned on paper and proven with show commands, pings, traces, and captures.'
  },
  {
    id: 'security',
    index: '02',
    title: 'Security',
    blurb: 'Controls that have to survive malformed input, replays, tampering, interruption, and the person operating them.'
  },
  {
    id: 'development',
    index: '03',
    title: 'Development',
    blurb: 'Python services and tooling, browser workspaces, extensions, and web front ends.'
  },
  {
    id: 'systems',
    index: '04',
    title: 'Systems & tools',
    blurb: 'Operating systems, network tooling, source control, and the hosting that ships the result.'
  }
];

export const skills: Skill[] = [
  // Networking
  { name: 'IPv4 / IPv6', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'Subnetting', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'VLANs', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: '802.1Q trunking', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'Inter-VLAN routing', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'DHCP', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'DNS', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'NAT', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'STP', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'OSPF', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'EIGRP', category: 'networking', usedIn: ['cisco-networking-labs'] },
  { name: 'Routing & switching troubleshooting', category: 'networking', usedIn: ['cisco-networking-labs'] },

  // Security
  { name: 'TLS', category: 'security', usedIn: ['secure-file-transfer'] },
  { name: 'ChaCha20-Poly1305', category: 'security', usedIn: ['p2p-messaging'] },
  { name: 'Ed25519 / X25519', category: 'security', usedIn: ['p2p-messaging'] },
  { name: 'SHA-256', category: 'security', usedIn: ['file-integrity-monitor', 'secure-file-transfer'] },
  { name: 'scrypt password records', category: 'security', usedIn: ['secure-file-transfer'] },
  { name: 'File-integrity monitoring', category: 'security', usedIn: ['file-integrity-monitor'] },
  { name: 'Access control', category: 'security', usedIn: ['secure-file-transfer', 'archtech'] },
  { name: 'Audit logging', category: 'security', usedIn: ['secure-file-transfer', 'ssik'] },
  { name: 'RBAC', category: 'security', usedIn: ['ssik'] },
  { name: 'SSRF defenses', category: 'security', usedIn: ['ssik'] },
  { name: 'Threat analysis', category: 'security', usedIn: [] },
  { name: 'Hardening', category: 'security', usedIn: [] },
  { name: 'Firewalls', category: 'security', usedIn: [] },
  { name: 'IDS / IPS', category: 'security', usedIn: [] },
  { name: 'Incident response', category: 'security', usedIn: [] },

  // Development
  { name: 'Python', category: 'development', icon: 'python', usedIn: ['file-integrity-monitor', 'p2p-messaging', 'secure-file-transfer'] },
  { name: 'FastAPI', category: 'development', icon: 'fastapi', usedIn: ['p2p-messaging'] },
  { name: 'pytest', category: 'development', icon: 'pytest', usedIn: ['secure-file-transfer'] },
  { name: 'unittest', category: 'development', usedIn: ['file-integrity-monitor'] },
  { name: 'JSON', category: 'development', icon: 'json', usedIn: ['file-integrity-monitor'] },
  { name: 'TypeScript', category: 'development', icon: 'typescript', usedIn: [] },
  { name: 'JavaScript', category: 'development', icon: 'javascript', usedIn: ['otnow'] },
  { name: 'React', category: 'development', icon: 'react', usedIn: ['interactive-portfolio'] },
  { name: 'Next.js', category: 'development', icon: 'nextdotjs', usedIn: ['interactive-portfolio'] },
  { name: 'Node.js', category: 'development', icon: 'nodedotjs', usedIn: [] },
  { name: 'REST APIs', category: 'development', usedIn: ['otnow'] },
  { name: 'Chrome Manifest V3', category: 'development', icon: 'googlechrome', usedIn: ['otnow'] },
  { name: 'Three.js', category: 'development', icon: 'threedotjs', usedIn: ['interactive-portfolio'] },

  // Systems & tools
  { name: 'Linux', category: 'systems', icon: 'linux', usedIn: [] },
  { name: 'Windows Server', category: 'systems', usedIn: [] },
  { name: 'Cisco IOS', category: 'systems', icon: 'cisco', usedIn: ['cisco-networking-labs'] },
  { name: 'Packet Tracer', category: 'systems', usedIn: ['cisco-networking-labs'] },
  { name: 'Wireshark', category: 'systems', icon: 'wireshark', usedIn: ['cisco-networking-labs'] },
  { name: 'SecureCRT', category: 'systems', usedIn: [] },
  { name: 'Git', category: 'systems', icon: 'git', usedIn: [] },
  { name: 'GitHub', category: 'systems', icon: 'github', usedIn: ['otnow'] },
  { name: 'Cloudflare Pages', category: 'systems', icon: 'cloudflarepages', usedIn: ['interactive-portfolio'] },
  { name: 'GitHub Pages', category: 'systems', icon: 'githubpages', usedIn: ['ssik'] },
  { name: 'Google Workspace', category: 'systems', icon: 'google', usedIn: ['archtech'] },
  { name: 'Proxmox VE', category: 'systems', icon: 'proxmox', usedIn: [] }
];

