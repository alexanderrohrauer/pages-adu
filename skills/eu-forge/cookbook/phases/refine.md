# Refine Phase Guide

**Purpose**: Precision - What specifically does "done" look like?

## Key Question

Does every task have acceptance criteria (and goals) specific enough to test, with documented constraints?

## CRITICAL RULES

- **No code is written in this phase.** Specifications only.
- **Non-technical acceptance criteria and constraints need to be shown to the user as clarification-form:**
  - Show the acceptance criteria and constraints in ONE string-array field
  - Each criteria is one textarea field

## Required Outputs

1. **Acceptance Criteria** - Given-When-Then format. Please give the acceptance-criteria as form so that the user can edit/add some.
2. **Interface Specifications** - Inputs, outputs, error contracts
3. **Constraints vs Criteria** - How to build vs what to build

## Given-When-Then Format

```gherkin
Given [starting situation/preconditions]
When [action is taken]
Then [expected outcome]
```

Example:

```gherkin
Given a user is logged in
When they click the logout button
Then their session is invalidated
And they are redirected to the login page
```

## Constraints vs Criteria

**Criteria** (what to build):

- Functional requirements
- Acceptance tests
- Success conditions

**Constraints** (how to build):

- Technology choices
- Performance requirements
- Security requirements
- Accessibility requirements

## Interface Specification

For each component interface, document:

- **Inputs**: Parameters, types, validation rules
- **Outputs**: Return types, response formats
- **Errors**: Error conditions, error messages, error codes

## Completion Checklist

- [ ] Every task has Given-When-Then criteria
- [ ] Interface specifications documented
- [ ] Constraints documented
- [ ] Out-of-scope explicitly listed per task
- [ ] NO CODE WRITTEN
- [ ] The user was able to edit/add acceptance-criteria and/or constraints via a clarification form.

## Commit Checkpoint

After completing the Refine checklist, commit all specification artifacts:

- `spec/<change-request?>/acceptance-criteria.md` — Given-When-Then scenarios
- `spec/<change-request?>/interfaces.md` — input/output/error contracts
- `.adu/` state files — phase status

```
git add spec/<change-request?>/acceptance-criteria.md spec/<change-request?>/interfaces.md .adu/
git commit -m "refine: add acceptance criteria and specs for <change-request?>/"
```

**Reminder**: No code should appear in this commit — specifications only.

## Common Mistakes

- Writing code before criteria are complete
- Vague acceptance criteria ("works correctly")
- Confusing constraints with criteria
- Just printing the criteria without letting the user edit them

## Next Phase

When Refine is complete, advance to **Generate** where AI writes code following TDD.
