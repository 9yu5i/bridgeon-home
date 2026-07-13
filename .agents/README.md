# BridgeOn Agent Context

This folder stores durable project context for human and AI agents.
Use it to avoid rebuilding the full project history inside one long chat.

## Read Order For New Chats

1. `AGENTS.md`
2. `.agents/README.md`
3. `.agents/project-spec.md`
4. `.agents/architecture.md`
5. `.agents/coding-rules.md`
6. `.agents/roadmap.md`
7. `.agents/decisions.md`
8. `docs/structure-plan.md`

## Folder Contents

- `project-spec.md`: product scope, pages, responsive expectations, and known constraints.
- `architecture.md`: high-level page, CSS, JavaScript, and asset relationships.
- `coding-rules.md`: practical editing and validation rules.
- `roadmap.md`: next planned cleanup and implementation work.
- `decisions.md`: important project decisions and why they were made.

## Maintenance Rules

- Update this folder when structure, ownership, shared behavior, or future plans change.
- Keep facts concrete and verifiable from the repository.
- Avoid writing guesses as facts. Mark uncertain items as "Needs verification".
- Prefer short, durable notes over detailed chat transcripts.
- Link back to source files when a rule depends on a specific implementation.

## Suggested Prompt For Future Chats

```text
Please read AGENTS.md and .agents/README.md first, then follow the project context before making changes.
```

