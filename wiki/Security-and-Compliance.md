# Security & Compliance

> **Correction notice.** Earlier versions of this page listed SOC 2 Type II,
> ISO 27001, GDPR, HIPAA, CCPA, and FedRAMP as certified or compliant. **None of
> those certifications or audits are held.** This page now states the actual
> status.

---

## Certification status

| Standard | Status | Notes |
|---|---|---|
| SOC 2 Type II | **Not held** | No audit performed |
| ISO 27001 | **Not held** | No certification |
| GDPR | **Readiness only** | Not a certification |
| HIPAA | **Not held** | Do not send PHI |
| CCPA/CPRA | **Readiness only** | Not a certification |
| FedRAMP | **Not authorized** | Not a government-authorized service |

An item marked “readiness only” means we are working on the controls, not that
an auditor has confirmed them.

---

## Controls

| Area | Current state |
|---|---|
| Encryption in transit | Design goal; TLS at the edge |
| Encryption at rest | Depends on the storage provider |
| Access control | Row-level security intended for all tables |
| Secrets | Environment variables only |
| Audit logging | Planned |
| Backup / restore | Depends on the provider; not yet drilled |
| Key management | No HSM claim |

---

## Data handling

- Customer documents are not used to train models.
- Data residency depends on the deployment region and is stated per engagement.
- AI calls use the end user's session; a service-role key is never exposed to
  client code.
- Privileged material requires per-matter isolation and legal review.

---

## What we will not say

We do not claim to be “HIPAA compliant”, “GDPR certified”, “SOC 2 certified”, or
“FedRAMP authorized”. A vendor that says those things without an audit report is
telling you something about their sales process, not their security.

---

## Reporting

Email **security@lexora.ai**. Do not open a public issue for a vulnerability.

---

*© 2026 Lexora AI LLC*
