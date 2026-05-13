# Agent Instructions — Birthday Website

You are building a romantic birthday website for a young man to gift his girlfriend.
Read ALL context files below in order before implementing or making any decision.

## Context File Reading Order

1. `context/project-overview.md` — what we are building, all features, scope
2. `context/architecture.md` — stack, Supabase schema, storage model, invariants
3. `context/ui-context.md` — CRITICAL: design tokens, color palette, fonts, motifs
4. `context/code-standards.md` — TypeScript conventions, Next.js patterns, naming
5. `context/ai-workflow-rules.md` — how to scope and execute work
6. `context/progress-tracker.md` — current phase, completed work, what's next

After reading all six files, acknowledge which feature spec you are implementing,
mark it as in-progress in the progress tracker, then implement exactly as specified.

## Standing Rules

- Update `context/progress-tracker.md` after every meaningful change
- Never write hardcoded colors — always use CSS custom properties from ui-context
- Never modify files in `components/ui/` unless explicitly told to
- The shoutout upload form and the shoutouts feed are different pages/components
- The background music must autoplay on site load (muted by default, unmuted on first interaction)
- Every image must have lazy loading and responsive srcSet
- Never invent features not defined in project-overview.md
- You can go through the global workflows and add use them the project if they are relevant.

