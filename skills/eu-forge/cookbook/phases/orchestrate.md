# Orchestrate Phase Guide

**Purpose**: Planning - How do you break the intents into pieces (subgoals)?

Refine intents to **subgoals** to create a "goals-tree". Whenever there are uncertainties, NEVER make any assumptions. Ask the user for clarification. This process is called "Goal-Refinement".

The leave-goals (programming-goals) are called `tasks`.

## Key Question

Do you have a complete list of tasks in order, each small enough for one AI session, where you can trace how pieces connect to form the whole?

## Required Outputs

1. **Container Architecture** - C4 Level 2 (deployable units)
2. **Component Architecture** - C4 Level 3 (internal structure)
3. **Dependency Map** - What must exist before what
4. **Task List** - Session-sized work items

## C4 Level 2: Containers

Shows deployable/runnable units:

- Web applications, APIs, databases
- Mobile apps, CLI tools
- Message queues, file systems

## C4 Level 3: Components

Shows internal structure of each container:

- Controllers, services, repositories
- Modules, packages, classes
- How they interact

## Task Sizing

A task is the right size when:

- Completable in one AI conversation
- Has clear inputs and outputs
- Can be tested independently
- Doesn't require holding too much context

## Dependency Mapping

For each task, identify:

- What must exist before starting (prerequisites)
- What it produces that others need (outputs)
- Whether it can run in parallel with other tasks

## Completion Checklist

- [ ] Container architecture designed
- [ ] Component architecture designed
- [ ] Dependencies mapped
- [ ] Tasks sized for single sessions
- [ ] Build order established
- [ ] Nothing was assumed during Goal-Refinement

## Commit Checkpoint

After completing the Orchestrate checklist, commit all phase artifacts:

- `spec/tasks.md` — session-sized task breakdown
- `spec/<change-request?>/containers.md` — C4 Level 2 architecture
- `spec/<change-request?>/components.md` — C4 Level 3 architecture
- `.adu/` state files — dependency map and phase status

```
git add spec/<change-request?>/tasks.md spec/<change-request?>/containers.md spec/<change-request?>/components.md .adu/
git commit -m "orchestrate: add architecture and task breakdown for <change-request?>"
```

## Common Mistakes

- Tasks too large (spanning multiple sessions)
- Missing dependencies (getting stuck mid-implementation)
- No clear interfaces between components
- Parallel work that actually has hidden dependencies
- Assumptions by the agent during refining intents to tasks

## Next Phase

When Orchestrate is complete, advance to **Refine** where you'll define exactly what "done" looks like for each task (refine intents to goals).
