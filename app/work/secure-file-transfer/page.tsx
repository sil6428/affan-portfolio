import type { Metadata } from "next";
import CaseStudy from "../case-study";

export const metadata: Metadata = {
  title: "Secure File Transfer | Affan Shaikh",
  description: "A private-source Python file-transfer project using authenticated TLS, recipient isolation, resumable transfers, SHA-256 verification, and 14 automated tests.",
};

const data = {
  index: "04",
  title: "Secure File Transfer",
  label: "Security tooling · Private source · Completed prototype",
  summary:
    "I built an authenticated file-transfer service that verifies server identity, isolates recipient storage, resumes interrupted transfers, and rejects files that fail integrity checks. The source remains private, so this case study documents the implementation and measured verification without exposing the repository.",
  facts: [
    ["Status", "Completed prototype"],
    ["Source", "Private"],
    ["Language", "Python"],
    ["Transport", "Authenticated TLS"],
    ["Integrity", "SHA-256"],
    ["Verification", "14 automated tests"],
    ["Measured transfer", "13,632,512 bytes"],
  ] as Array<[string, string]>,
  links: [],
  sections: [
    {
      title: "Transfer and access controls",
      paragraphs: [
        "The service verifies the certificate and hostname before accepting a TLS connection, stores password records with scrypt, and keeps each recipient's files in an isolated storage scope.",
        "Strict filename validation and path controls reduce traversal risk, while throttled authentication and password-safe audit records support investigation without writing secrets to logs.",
      ],
      bullets: [
        "Certificate and hostname verification",
        "scrypt password records",
        "Recipient-scoped storage",
        "Strict filename and path validation",
        "Authentication throttling and audit logging",
      ],
    },
    {
      title: "Resuming without trusting partial state",
      paragraphs: [
        "Uploads and downloads resume only from verified byte offsets. Before serving a download, the service re-hashes the stored file; the receiver also validates the final SHA-256 digest before accepting it.",
        "A mismatch moves the affected file into quarantine instead of allowing it to pass as a successful transfer.",
      ],
    },
    {
      title: "Measured verification",
      paragraphs: [
        "I verified eight upload-and-download round trips totaling 13,632,512 bytes and resumed a 2,097,152-byte upload after an interruption at 700,000 bytes.",
        "Fourteen automated tests cover authentication, throttling, recipient isolation, traversal attempts, interrupted transfers, at-rest tampering, quarantine behavior, and password-safe audit logs.",
      ],
    },
    {
      title: "Relationship to P2P Messaging",
      paragraphs: [
        "The public P2P Messaging project currently binds a file's name, size, and SHA-256 digest into a signed message. This transfer service is the separate foundation for eventually moving those bytes securely, after the integration and failure-recovery work is complete.",
      ],
    },
  ],
};

export default function SecureFileTransferCaseStudy() {
  return <CaseStudy data={data} />;
}
