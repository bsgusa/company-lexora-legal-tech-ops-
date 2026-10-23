# Security Policy

## Lexora AI security position

Lexora AI LLC builds document-preparation and review software. Legal data is
sensitive, so we would rather state a narrow truth than a broad claim.

**We hold no third-party security certification.** Specifically: no SOC 2, no
ISO 27001, no HIPAA certification, no FedRAMP authorization. CCPA/GDPR work is a
readiness effort, not a certification. If any page or document says otherwise,
that page is wrong and should be corrected.

---

## Supported versions

| Version | Supported |
|---|---|
| Current `main` | Active fixes |
| Older tags | Not supported |

---

## Certification status (honest)

| Standard | Status | Notes |
|---|---|---|
| SOC 2 Type II | **Not held** | No audit performed |
| ISO 27001 | **Not held** | No certification |
| GDPR | **Readiness only** | Not a certification |
| HIPAA | **Not held** | Do not send PHI |
| CCPA/CPRA | **Readiness only** | Not a certification |
| FedRAMP | **Not authorized** | Not a government-authorized service |

---

## Controls we are building

These are design intentions and partial implementations, not audited facts:

- **Encryption** — in transit and at rest.
- **Access control** — database access is intended to be governed by row-level
  security rather than application code alone.
- **Secrets** — environment variables and a secret store only; never in code.
- **AI calls** — made with the end user's session; no service-role key in client
  code.
- **Approvals** — any outbound action requires recorded human approval.
- **Training** — customer documents are not used to train models.

---

## Reporting a vulnerability

**Please do not open a public GitHub issue for a security vulnerability.**

Email **security@lexora.ai**.

Include:

- Type of vulnerability (e.g. XSS, SQL injection, auth bypass)
- Affected file paths or endpoints
- Reproduction steps
- Proof of concept, if available
- Potential impact

### Response targets

| Stage | Target |
|---|---|
| Acknowledgement | 3 business days |
| Triage | 10 business days |
| Fix | Depends on severity |

These are targets, not a contractual SLA.

---

## Bug bounty

We do not currently operate a paid bug bounty programme. We will credit
responsible reports if you would like to be named.

---

© 2026 Lexora AI LLC — security@lexora.ai
