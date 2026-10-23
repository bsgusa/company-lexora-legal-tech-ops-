# Technology

> **Correction notice.** This page previously described a proprietary
> “LexLLM” model trained from scratch on 500M+ legal documents, with a 200K
> context window and claims of 99.99% uptime. **No such model exists.** The
> description below reflects what is actually built.

---

## Architecture

```
Browser (static HTML/CSS/JS, React components under lexora-ui/)
        │
        ▼
Supabase (Postgres, auth, edge functions, storage)
        │
        ▼
Balamonis AI Gateway  ──►  commercial model provider
```

### AI access

Code never names a model. A request asks the gateway for a capability tier:

- `fast` — short, low-latency tasks
- `balanced` — the default
- `deep` — longer documents and harder reasoning

The gateway chooses the provider. That keeps venture code provider-agnostic and
keeps spend visible in one place.

### Retrieval

Answers are grounded in the documents a matter actually contains. Outputs quote
the passages they rely on so a reviewer can check each one. Retrieval is not a
substitute for a lawyer.

### Approval gate

Any action with an effect outside our systems — sending, filing, submitting —
requires a recorded human approval. The system does not act on its own.

---

## What we do not claim

| Claim | Reality |
|---|---|
| Proprietary legal model | None. No “LexLLM” |
| 500M+ training documents | No model training |
| 200K context window | Depends on the provider and task |
| 99.99% uptime SLA | No SLA offered |
| 47-jurisdiction native coverage | Coverage grows as validated |

---

## Security

See **[[Security-and-Compliance]]**. In short: no third-party certification is
held; encryption and row-level security are design goals being implemented.

---

*© 2026 Lexora AI LLC*
