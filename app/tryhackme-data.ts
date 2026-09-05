export type TryHackMeEntry = {
  id: `tryhackme-room-${string}`;
  date: string;
  year: string;
  month: string;
  monthLabel: string;
  title: string;
  itemType: "Room" | "Badge" | "Path";
  level: string;
  summary: string;
  takeaways: string[];
  sourceUrl: string;
};

export const tryHackMeEntries = [
  {
    id: "tryhackme-room-soc-role-in-blue-team",
    date: "2026-09-05",
    year: "2026",
    month: "09",
    monthLabel: "September",
    title: "SOC Role in Blue Team",
    itemType: "Room",
    level: "Beginner SOC foundations",
    summary:
      "Reviewed where a security operations centre fits within a blue team and how analysts contribute to monitoring, investigation, escalation, and response.",
    takeaways: [
      "A SOC coordinates people, processes, and security technology rather than relying on one monitoring tool.",
      "Analysts need to distinguish normal activity from events that deserve investigation or escalation.",
      "Clear documentation and handoffs matter because incidents may move between analysts and specialist teams.",
    ],
    sourceUrl: "https://tryhackme.com/room/socroleinblueteam",
  },
  {
    id: "tryhackme-room-soc-fundamentals",
    date: "2026-09-05",
    year: "2026",
    month: "09",
    monthLabel: "September",
    title: "SOC Fundamentals",
    itemType: "Room",
    level: "Beginner SOC foundations",
    summary:
      "Built a clearer picture of SOC responsibilities, the flow from security telemetry to an alert, and the importance of consistent triage procedures.",
    takeaways: [
      "Security monitoring becomes useful when collected events have context and an analyst can prioritise them.",
      "Triage should establish what happened, which systems or users are affected, and how urgent the event may be.",
      "Repeatable procedures help analysts investigate consistently while preserving evidence for later review.",
    ],
    sourceUrl: "https://tryhackme.com/room/socfundamentals",
  },
  {
    id: "tryhackme-room-junior-security-analyst-intro",
    date: "2026-09-05",
    year: "2026",
    month: "09",
    monthLabel: "September",
    title: "Junior Security Analyst Intro",
    itemType: "Room",
    level: "Role introduction",
    summary:
      "Explored the day-to-day purpose of a junior security analyst and connected alert review, investigation, escalation, and communication into one workflow.",
    takeaways: [
      "An entry-level analyst is expected to investigate carefully and escalate with useful context, not solve every incident alone.",
      "Networking and operating-system knowledge make logs and alerts easier to interpret.",
      "Concise notes and evidence are part of the technical work because other responders depend on them.",
    ],
    sourceUrl: "https://tryhackme.com/room/jrsecanalystintrouxo",
  },
  {
    id: "tryhackme-room-inside-a-computer",
    date: "2026-09-05",
    year: "2026",
    month: "09",
    monthLabel: "September",
    title: "Inside a Computer",
    itemType: "Room",
    level: "Computer foundations",
    summary:
      "Refreshed how core computer components work together and why hardware, storage, memory, and operating-system context matter during troubleshooting and security analysis.",
    takeaways: [
      "Processor, memory, storage, and input/output components have different roles but operate as one system.",
      "Understanding where data is processed and stored helps narrow down both technical failures and security evidence.",
      "Strong security analysis still depends on accurate computing and operating-system fundamentals.",
    ],
    sourceUrl: "https://tryhackme.com/room/insideacomputer",
  },
  {
    id: "tryhackme-room-careers-in-cyber",
    date: "2026-09-04",
    year: "2026",
    month: "09",
    monthLabel: "September",
    title: "Careers in Cyber",
    itemType: "Room",
    level: "Career orientation",
    summary:
      "Reviewed how cybersecurity work is divided across different roles and used that overview to place my networking, defensive-security, and systems interests more clearly.",
    takeaways: [
      "Cybersecurity is a collection of distinct roles rather than one universal job description.",
      "A strong early-career profile needs depth in a few connected areas instead of claiming every security skill.",
      "Networking, defensive security, systems work, and evidence-based projects remain the most credible direction for my current experience.",
    ],
    sourceUrl: "https://tryhackme.com/room/careersincybersn",
  },
  {
    id: "tryhackme-room-defensive-security-intro",
    date: "2026-09-04",
    year: "2026",
    month: "09",
    monthLabel: "September",
    title: "Defensive Security Intro",
    itemType: "Room",
    level: "Beginner refresher",
    summary:
      "Refreshed the defensive side of security: building visibility, examining suspicious activity, and responding within a structured process.",
    takeaways: [
      "Defensive work depends on useful visibility before an analyst can investigate an event.",
      "Prevention, detection, analysis, and response are related but distinct parts of the job.",
      "The next useful step is applying these ideas in deeper labs rather than treating an introduction as mastery.",
    ],
    sourceUrl: "https://tryhackme.com/room/defensivesecurityintroezn39",
  },
  {
    id: "tryhackme-room-offensive-security-intro",
    date: "2026-09-04",
    year: "2026",
    month: "09",
    monthLabel: "September",
    title: "Offensive Security Intro",
    itemType: "Room",
    level: "Beginner refresher",
    summary:
      "Restarted from the fundamentals and revisited how authorized offensive testing approaches a target from an attacker's perspective.",
    takeaways: [
      "Offensive security is useful for finding weaknesses before a real attacker does.",
      "Permission and clearly defined scope are required before testing any system.",
      "Foundational practice is most valuable when it leads into deeper labs and original home-lab work.",
    ],
    sourceUrl: "https://tryhackme.com/room/offensivesecurityintrokKx12",
  },
] as const satisfies readonly TryHackMeEntry[];
