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
