# PRD Conversation Guide

Use these questions to build a Product Requirements Document during the Focus phase.

## Intent Questions

1. **What problem are you solving?**
   - Who experiences this problem?
   - How painful is it? (frequency, severity)
   - What happens if we don't solve it?

2. **Who is the target user?**
   - Be specific (not "everyone")
   - What do they care about?
   - What's their technical level?

3. **What does success look like?**
   - How will we know it worked?
   - What metrics matter?
   - What's the minimum viable outcome?

## Scope Questions

4. **What's in scope for this cycle?**
   - Core features only
   - What's the smallest useful increment?

5. **What's explicitly out of scope?**
   - Future enhancements
   - Nice-to-haves

6. **What constraints apply?**
   - Technical constraints (languages, frameworks)
   - Time constraints
   - Integration requirements

## Technical Questions

7. **What systems does this interact with?**
   - Existing code to integrate with
   - External services
   - Data sources

8. **What are the key risks?**
   - Technical unknowns
   - Performance concerns
   - Security considerations

9. **What does the styleguide look like?**
   - Branding
   - Logo guidelines
   - Colors (primary, secondary etc.)
   - Typography (fonts)
   - Layout
   - Icons and imaging-language
   - Used language and tonality
   - Animations
   - Do's and don'ts
     Please be concrete and comprehensive at Question 9.

## Acceptance Questions

10. **How will we test this?**

- Key scenarios to verify
- Performance thresholds

11. **What would make us reject the implementation?**
    - Deal-breakers
    - Quality gates
    - Non-negotiables

## Goal Refinement Questions (GORE)

Once the Intent (problem statement, success criteria) is clear, refine it into a
goals tree before leaving Focus. For each root goal traced from the PRD:

12. **What must ALL be true for this goal to be met?** (AND-refinement)
    - List the necessary subgoals — every one of them is required.
    - Repeat recursively on each subgoal until it's concrete enough to become an
      Orchestrate task or a Refine acceptance criterion.

13. **Are there alternative ways to reach this goal?** (OR-refinement)
    - If more than one viable strategy exists, list them as OR-children instead of
      silently picking one.
    - Surface real alternatives to the user with `AskUserQuestion` — this is a
      scope/architecture decision, not a wording choice.

14. **Does every goal trace back to something in the PRD?**
    - If a goal doesn't trace to the problem statement or a success criterion, either
      the PRD is missing something (go fix it) or the goal doesn't belong.

## PRD Template

```markdown
# [Feature Name]

## Problem Statement

[What problem exists and for whom]

## Target Users

[Specific user description]

## Success Criteria

- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]

## In Scope

- [Feature 1]
- [Feature 2]

## Out of Scope

- [Deferred item 1]
- [Deferred item 2]

## Constraints

- [Technical constraint]
- [Other constraint]

## Key Risks

- [Risk 1]
- [Risk 2]

## System Context

[C4 L1 diagram or description]
```

## Goals Tree Template (`spec/<change-request?>/goals.md`)

```markdown
# Goals Tree

Derived from the Intents in `prd.md`. AND-refinement = all children required;
OR-refinement = at least one child required (alternative strategies).

## Tree

- **[G1]** [Root goal statement] — _source: [problem statement / success criterion]_
  - AND **[G1.1]** [Necessary subgoal]
    - OR **[G1.1.1]** [Alternative strategy A]
    - OR **[G1.1.2]** [Alternative strategy B]
  - AND **[G1.2]** [Necessary subgoal, leaf]

## Goal Register

| ID   | Statement | Refinement | Parent | Source Intent | Status |
| ---- | --------- | ---------- | ------ | ------------- | ------ |
| G1   |           | AND        | —      |               | Open   |
| G1.1 |           | OR         | G1     |               | Open   |
```
