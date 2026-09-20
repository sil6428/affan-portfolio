import type { Metadata } from "next";
import CaseStudy from "../case-study";

export const metadata: Metadata = {
  title: "P2P Messaging | Affan Shaikh",
  description: "A collaborative Python messaging prototype with a local browser interface, verified peer identities, authenticated encryption, replay protection, and 75 automated tests.",
};

const data = {
  index: "03",
  title: "P2P Messaging",
  label: "Secure communications · Collaborative work in progress",
  summary:
    "Ghayas Sher and I are building an educational Python prototype for direct communication between explicitly verified peers. Its local browser workspace combines identity protection, authenticated encryption, separate conversations, encrypted history, and defensive protocol limits without presenting an unaudited system as production ready.",
  facts: [
    ["Status", "Public work in progress"],
    ["Collaboration", "Affan Shaikh and Ghayas Sher"],
    ["Language", "Python 3.11+"],
    ["Identity", "Ed25519 and X25519"],
    ["Encryption", "ChaCha20-Poly1305"],
    ["Interface", "Local FastAPI browser workspace"],
    ["Verification", "75 automated tests"],
    ["Transport", "Direct TCP"],
  ] as Array<[string, string]>,
  links: [
    { label: "View public repository", href: "https://github.com/sil6428/P2P-messaging" },
  ],
  sections: [
    {
      title: "What the prototype does",
      paragraphs: [
        "Each device creates password-protected signing and key-exchange identities. Peers exchange self-signed public cards and verify their fingerprints through a separate trusted channel before messaging.",
        "Messages and delivery acknowledgements use authenticated encryption and signatures. The receiver validates the intended recipient, sender key, timestamp, signature, ciphertext, and replay state before accepting content.",
        "The local interface unlocks the device identity and history only for the running process. It organizes verified contacts into separate conversations with authenticated replies, search, local drafts, pinned, muted and archived views, and live peer-listener status.",
      ],
      bullets: [
        "Verified contact book with explicit out-of-band fingerprint confirmation",
        "Two-way chat and one-shot send/listen workflows",
        "Local browser workspace with CSRF-protected mutations and HTTP-only same-site sessions",
        "Authenticated replies, search, drafts, and pinned, muted, and archived conversation views",
        "Encrypted local message history with authenticated metadata",
        "Signed filename, size, and SHA-256 attachment references",
        "Persistent replay rejection, frame limits, rate limits, and read timeouts",
      ],
    },
    {
      title: "How we verify it",
      paragraphs: [
        "The current 75-test suite covers local setup and unlock, CSRF enforcement, conversation controls, identity protection, encryption, signatures, recipient validation, replay persistence, replies, acknowledgements, verified contacts, local history, attachment references, rate limiting, malformed inputs, and end-to-end local delivery.",
        "The repository also documents the protocol and threat model so that the implementation can be reviewed against explicit assumptions rather than a broad claim of security.",
      ],
    },
    {
      title: "Current limits",
      paragraphs: [
        "This is an educational prototype, not an audited messaging product. It does not currently provide forward secrecy, automatic key rotation, NAT traversal, multi-device synchronization, automatic file transfer, or independent security assurance.",
        "Those limits remain visible because communicating what a security system cannot guarantee is part of building it responsibly.",
      ],
    },
  ],
  nextSlug: "/work/secure-file-transfer",
  nextTitle: "Secure File Transfer",
};

export default function P2PMessagingCaseStudy() {
  return <CaseStudy data={data} />;
}
