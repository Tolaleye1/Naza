# AI Workflow Rules

## Core Principle

You are the implementation engine. The human is the architect.
Build exactly what the spec says. Nothing more. Nothing less.

## Scope Rules

1. **One feature spec at a time.** Never combine two separate feature units in one session.
2. **Never touch files outside your spec's scope** without explicit instruction.
   - If a change requires touching an out-of-scope file, STOP and report it.
3. **Never invent features.** If something isn't in the spec, don't build it.
4. **Never rename existing files** unless the spec explicitly says to.
5. **Never restructure the folder hierarchy** unless specified.

## Before Writing Any Code

1. Read `CLAUDE.md`
2. Read ALL six context files in order
3. Read the specific feature spec for this session
4. Acknowledge the task: state what you are building and what files you will touch
5. State what files you will NOT touch
6. Then and only then begin implementation

## Verification After Each Unit

After implementing a feature spec, verify:
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] No ESLint errors on modified files
- [ ] `npm run build` passes
- [ ] The acceptance criteria in the spec are met

## Handling Ambiguity

If the spec is unclear on a specific detail:
1. Use the `ui-context.md` and `architecture.md` to infer the correct answer
2. If still unclear, implement the simpler/safer option
3. Leave a `// NOTE: assumed X because Y — confirm with architect` comment

## Handling Errors

If you encounter a build error or runtime error during implementation:
1. Do NOT spiral into making multiple unrelated changes
2. Isolate the error to its root cause
3. Fix only that specific thing
4. Re-verify

## Progress Tracker Updates

- When starting a unit: mark it as `🔄 In Progress`
- When completing a unit: mark it as `✅ Complete` and add a one-line note
- Add any significant architectural decisions to the "Decisions Log" section

## What Counts as Done

A unit is done when:
1. All acceptance criteria are checked off
2. TypeScript compiles clean
3. The build passes
4. The feature is visually correct against the ui-context spec

A unit is NOT done just because the code compiles.
Visually verify against the design spec before marking complete.
