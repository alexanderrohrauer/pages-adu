# Focus Phase Guide

**Purpose**: Clarity - What are you actually building?

Ask the user questions about the intents with the application. Give the user hints - since most of the users are not exactly aware.

## Key Question

Can you explain what you're building to someone unfamiliar with it in under two minutes, and have them understand both the problem and what success looks like?

## Required Outputs

1. **Problem Statement** - What problem exists and for whom?
2. **Target Users** - Who specifically will use this?
3. **Success Criteria** - Testable outcomes (not vague aspirations)
4. **System Context Diagram** - C4 Level 1 showing system boundaries
5. **Scope Boundaries** - What you explicitly WON'T build
6. **Goals Tree** - Intents refined into an AND/OR goal hierarchy (GORE)

## Success Criteria Quality

Bad: "The system should be fast"
Good: "Page loads in under 2 seconds on 3G connections"

Bad: "Users should find it easy to use"
Good: "New users complete onboarding in under 3 minutes without help"

## C4 Level 1: System Context

Shows your system as a box in the center with:

- Users/actors on the outside
- External systems it integrates with
- Data flows between them

## Goal-Oriented Refinement (GORE)

Intents alone ("why we're doing this") are too coarse to hand to Orchestrate. Refine
each Intent into a **goals tree** using GORE-style AND/OR decomposition, so the
tree — not prose — is the traceable link between "why" (Intent) and "what we'll
build" (Orchestrate's tasks, Refine's acceptance criteria).

**Where goals come from**: every root goal must trace back to something already
in the PRD — the problem statement or a success criterion. Don't invent goals that
aren't grounded in an Intent; if you find yourself doing that, the PRD is incomplete
and you should go back and fix it first, not patch it over in the goals tree.

**Refinement operators** (apply recursively until a goal is concrete enough to
become a task in Orchestrate or an acceptance criterion in Refine):

- **AND-refinement** — the parent goal is satisfied only if **all** child goals are
  satisfied. Use it to decompose a goal into its necessary parts.
- **OR-refinement** — the parent goal is satisfied if **at least one** child goal is
  satisfied. Use it to represent alternative strategies or design options for
  reaching the same goal — this is where you surface trade-offs to the user instead
  of silently picking one.

Stop refining a branch once a leaf goal is small and concrete enough that Orchestrate
could turn it directly into a task, or Refine could turn it directly into a
Given-When-Then criterion. Don't refine past that point — deeper decomposition is
Orchestrate/Refine's job, not Focus's.

**Notation** (nested list, each node tagged with its refinement type and an ID):

```markdown
- **[G1]** <Root goal statement> — _source: Intent "<problem statement / success criterion>"_
  - AND **[G1.1]** <Necessary subgoal>
    - OR **[G1.1.1]** <Alternative strategy A>
    - OR **[G1.1.2]** <Alternative strategy B>
  - AND **[G1.2]** <Necessary subgoal, leaf — ready for Orchestrate/Refine>
```

When a goal has OR-children representing real design alternatives (not just
phrasing variants), surface the choice to the user with `AskUserQuestion` rather
than picking silently — this is a scope/architecture decision, not a wording one.

Persist the tree in `spec/<change-request?>/goals.md`, including a flat goal
register (ID, statement, refinement type, parent, source Intent, status) alongside
the tree so Orchestrate and Refine can reference goal IDs directly.

## Completion Checklist

- [ ] Problem statement clearly articulates the pain point
- [ ] Target users are specific (not "everyone")
- [ ] Success criteria are measurable and testable
- [ ] System context diagram exists
- [ ] Out-of-scope items are explicitly listed
- [ ] Goals tree exists, every root goal traces to an Intent, and leaf goals are concrete

## Commit Checkpoint

After completing the Focus checklist, commit all phase artifacts:

- `spec/<change-request?>/prd.md` — problem statement, users, success criteria, scope
- `spec/<change-request?>/system-context.md` — C4 Level 1 diagram
- `spec/<change-request?>/goals.md` — AND/OR goals tree derived from Intents
- `.adu/` state files — cycle creation and phase status

```
git add spec/<change-request?>/prd.md spec/<change-request?>/system-context.md spec/<change-request?>/goals.md .adu/
git commit -m "focus: add PRD, system context, and goals tree for <change-request?>"
```

## Common Mistakes

- Starting with solutions instead of problems
- Vague success criteria that can't be tested
- Scope that's too large for one cycle
- Skipping the "what we won't build" section

## Next Phase

When Focus is complete, advance to **Orchestrate** where you'll break the work into session-sized pieces.
