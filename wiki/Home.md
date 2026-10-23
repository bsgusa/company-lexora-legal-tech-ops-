# Welcome to Lexora AI

> **AI-assisted document review for legal and career paperwork**

Lexora AI LLC builds software that helps people read, check, and draft
documents. It is document-preparation and review assistance. **It is not a law
firm and does not provide legal advice or representation.**

> **Correction notice.** Earlier versions of this wiki claimed SOC 2, ISO 27001,
> HIPAA, CCPA, GDPR, and FedRAMP certifications; a proprietary “LexLLM” model
> trained on 500M+ documents; 500+ customers; 47 jurisdictions; and named
> investors. **None of that was true.** It has been removed.

---

## Wiki navigation

| Page | Description |
|---|---|
| **[[Home]]** | Platform overview (this page) |
| **[[Getting-Started]]** | Quick start & setup |
| **[[Products]]** | What each module is — and its status |
| **[[Technology]]** | Architecture, honestly described |
| **[[Security-and-Compliance]]** | Security status, not certifications |
| **[[API-Reference]]** | Developer integration |
| **[[Deployment]]** | Hosting & deployment |
| **[[FAQ]]** | Frequently asked questions |
| **[[Roadmap]]** | Current state and next work |
| **[[Contributing]]** | How to contribute |

---

## What exists today

- **Document intake** — collect and structure the documents a case needs.
- **AI-assisted drafting** — through the Balamonis AI Gateway. Code requests a
  capability tier (`fast`, `balanced`, `deep`) and never names a model.
- **Structured output with citations** — answers quote the passages they rely on.
- **Approval-gated actions** — anything with an effect outside our systems needs
  a recorded human approval.

## What does not exist

- No proprietary model. There is no “LexLLM”.
- No SOC 2, ISO 27001, HIPAA, or FedRAMP certification.
- No published customer results or accuracy benchmarks.
- No claim of complete jurisdiction coverage.
- No outside funding is disclosed.

---

## Security status

- Encryption in transit and at rest is part of the design.
- Database access is intended to be governed by row-level security.
- Secrets live in environment variables, never in code.
- Certifications: **none claimed**.

---

## Entity

Lexora AI LLC — a United States limited liability company. Part of the Balamonis
Group.

---

*© 2026 Lexora AI LLC*
