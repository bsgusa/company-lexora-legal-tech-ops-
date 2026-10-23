# AI-Job-Automation — Career & Document Automation Engine

**Document intake, AI-assisted drafting, and case tracking for immigration and
legal paperwork. Every outbound action requires recorded user approval.**

This repository is part of the Balamonis Group. It is a working application, not
a finished product, and this README describes only what exists.

> **Correction notice (2026-09-18, reaffirmed 2026-10-22).** Earlier versions of
> this README claimed SOC 2, ISO 27001, HIPAA, CCPA, GDPR, and FedRAMP
> certifications; “500+ law firms” and “47 jurisdictions”; “2.4M+ documents” and
> “98% client satisfaction”; named customer testimonials; and a proprietary
> “LexLLM™” model. **None of those claims were true.** They have been removed.
> We hold no such certifications or third-party audits. We do not claim any
> customers, revenue, funding, or model of our own.

---

## What this is

A document-automation engine for career and immigration paperwork:

- **Document intake** — collect and structure the documents a case needs.
- **AI-assisted drafting** — draft and revise text through the Balamonis AI
  Gateway. We ask the gateway for a capability class (`fast`, `balanced`,
  `deep`); we do not name a model in this repository.
- **Case tracking** — follow a case through its stages.
- **Approval-gated automation** — any action with an effect outside our systems
  requires recorded human approval. Nothing is sent, filed, or submitted
  automatically.

## What this is not

- Not a law firm. It does not provide legal advice or representation. Any
  legal-information surface must be reviewed by a licensed attorney before it is
  offered publicly.
- Not certified. No SOC 2, ISO 27001, HIPAA, CCPA, GDPR, or FedRAMP
  certification is held. See “Security & compliance status” below.
- Not a proprietary model. There is no “LexLLM”. What exists is retrieval,
  grounding, prompting, and review around commercial models, called through the
  shared AI Gateway.

---

## Repository layout

```
├── index.html            # Main web entry point
├── css/                  # Styles
├── js/                   # Client interactions
├── assets/               # Brand and static assets
├── docs/                 # Architecture and deployment notes
├── supabase/             # Database schema, policies, edge functions
├── lexora-ui/            # React/Next.js UI components (in progress)
└── README.md
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for implementation detail.

---

## Security & compliance status (honest)

| Standard | Status |
|---|---|
| SOC 2 | **Not held** |
| ISO 27001 | **Not held** |
| HIPAA | **Not held** |
| CCPA / GDPR | **Readiness only — not certified** |
| FedRAMP | **Not held** |

What we do instead: a **security-readiness programme** tracked in the Command
Center's compliance baseline — access control, audit logging, encryption in
transit and at rest, and backup/restore, each with an evidence pointer. We do not
describe readiness as certification.

**Data handling principles we actually follow:**

- Secrets live in environment variables and a secret store, never in code.
- Database access is controlled by row-level security, not application code.
- The end user's own session token is used for AI calls; a service-role key is
  never exposed to client code.
- No personal data is used to train models.

---

## Architecture

- **Frontend:** static HTML/CSS/JS, with React components under `lexora-ui/`.
- **Backend:** Supabase (Postgres, auth, edge functions, storage).
- **AI:** the Balamonis AI Gateway. Request a capability class; never name a
  model here.
- **Deploy:** Vercel for the frontend, Supabase for the backend.

---

## Quick start

```bash
git clone https://github.com/bsgusa/AI-Job-Automation.git
cd AI-Job-Automation
open index.html          # macOS — or use any static server
# or, for live reload:
npx serve .
```

Environment variables (never commit these):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

---

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md). In short: work on a branch, never
`main`; keep commits small; do not add a public claim that cannot be evidenced;
do not add a table without RLS policies.

---

## Licence

MIT — see [`LICENSE`](LICENSE).

---

© 2026 Lexora AI LLC. Part of the Balamonis Group.
