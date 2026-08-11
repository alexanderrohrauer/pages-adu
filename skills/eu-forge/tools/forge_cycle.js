#!/usr/bin/env node
"use strict";
/** Manage FORGE development cycles. */

const fs = require("fs");
const path = require("path");

const CYCLE_TEMPLATE = `# Cycle: {name}

**Created**: {created}
**Priority**: {priority}
**Status**: Active

## Overview

<!-- Describe what this cycle aims to accomplish -->

---

<!-- FORGE_PHASE:Focus:Active -->
## Phase 1: Focus

**Purpose**: Define what you're building and why.

### Required Outputs
- [ ] Problem statement and target users defined
- [ ] Testable success criteria written
- [ ] System Context diagram (C4 L1) created
- [ ] Clear boundaries on what you WON'T build
- [ ] Goals tree (GORE AND/OR refinement) derived from Intents and saved to goals.md

### Notes

<!-- Document Focus phase work here -->

---

<!-- FORGE_PHASE:Orchestrate:Pending -->
## Phase 2: Orchestrate

**Purpose**: Break the work into session-sized pieces.

### Required Outputs
- [ ] Container architecture (C4 L2) designed
- [ ] Component architecture (C4 L3) designed
- [ ] Dependency map created
- [ ] Tasks sized for single AI sessions

### Tasks

<!-- List tasks here -->

---

<!-- FORGE_PHASE:Refine:Pending -->
## Phase 3: Refine

**Purpose**: Define exactly what "done" looks like.

### Required Outputs
- [ ] Acceptance criteria in Given-When-Then format
- [ ] Interface specifications documented
- [ ] Constraints vs criteria documented

**CRITICAL**: No code in this phase - specifications only.

### Specifications

<!-- Document specifications here -->

---

<!-- FORGE_PHASE:Generate:Pending -->
## Phase 4: Generate

**Purpose**: AI writes code following TDD.

### Process
- [ ] RED: Write failing tests
- [ ] GREEN: Minimal code to pass
- [ ] REFACTOR: Improve while green
- [ ] Code review: Linter and type checks pass
- [ ] Code review: TDD compliance verified
- [ ] Code review: Acceptance criteria alignment checked

### Implementation Notes

<!-- Document implementation progress here -->

---

<!-- FORGE_PHASE:Evaluate:Pending -->
## Phase 5: Evaluate

**Purpose**: Verify output matches intent.

### Checklist
- [ ] Criteria verified line-by-line
- [ ] Code review: Full test suite passes with coverage threshold met
- [ ] Code review: Security review completed
- [ ] Code review: Integration and interface contracts verified
- [ ] Cycle review summary emitted (spec/<change-request?>/review.md + HTML sibling)
- [ ] Disposition decision made

### Disposition

<!-- Accept / Accept with issues / Revise / Reject -->

---

## Learnings

<!-- Capture learnings during and after the cycle -->
`;

const HIL_CYCLE_TEMPLATE = `# Cycle: {name}

**Created**: {created}
**Priority**: {priority}
**Status**: Active
**Mode**: HIL (Human-in-the-Loop)

## Overview

<!-- Describe the change/update this iteration addresses -->

---

<!-- FORGE_PHASE:Refine:Active -->
## Phase 1: Refine

**Purpose**: Define exactly what "done" looks like for this change.

### Required Outputs
- [ ] Acceptance criteria in Given-When-Then format
- [ ] Interface changes documented (if any)
- [ ] Constraints vs criteria documented

**CRITICAL**: No code in this phase - specifications only.

### Specifications

<!-- Document specifications here -->

---

<!-- FORGE_PHASE:Generate:Pending -->
## Phase 2: Generate

**Purpose**: Implement the change following TDD.

### Process
- [ ] RED: Write failing tests
- [ ] GREEN: Minimal code to pass
- [ ] REFACTOR: Improve while green
- [ ] Code review: Linter and type checks pass
- [ ] Code review: TDD compliance verified
- [ ] Code review: Acceptance criteria alignment checked

### Implementation Notes

<!-- Document implementation progress here -->

---

<!-- FORGE_PHASE:Evaluate:Pending -->
## Phase 3: Evaluate

**Purpose**: Verify output matches intent.

### Checklist
- [ ] Criteria verified line-by-line
- [ ] Code review: Full test suite passes with coverage threshold met
- [ ] Code review: Security review completed
- [ ] Code review: Integration and interface contracts verified
- [ ] Cycle review summary emitted (spec/<change-request?>/review.md + HTML sibling)
- [ ] Disposition decision made

### Disposition

<!-- Accept / Accept with issues / Revise / Reject -->

---

## Learnings

<!-- Capture learnings during and after the cycle -->
`;

function getForgeDir() {
  return path.join(process.cwd(), ".adu");
}

function slugify(name) {
  let slug = name.toLowerCase();
  slug = slug.replace(/[^a-z0-9]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
}

function formatTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key]);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function newCycle(name, priority = "medium", mode = "full") {
  const forgeDir = getForgeDir();

  if (!fs.existsSync(forgeDir)) {
    console.log("Error: FORGE not initialized. Run forge_init.js first.");
    return false;
  }

  const timestamp = new Date();
  const datePrefix = `${timestamp.getUTCFullYear()}${pad2(timestamp.getUTCMonth() + 1)}${pad2(timestamp.getUTCDate())}`;
  const slug = slugify(name);
  if (!slug) {
    console.log("Error: Cycle name must contain at least one letter or digit.");
    return false;
  }
  const cycleId = `${datePrefix}-${slug}`;
  const filename = `${cycleId}.md`;

  const activeDir = path.join(forgeDir, "cycles", "active");
  const cyclePath = path.join(activeDir, filename);

  if (fs.existsSync(cyclePath)) {
    console.log(`Error: Cycle already exists: ${cyclePath}`);
    return false;
  }

  const template = mode === "hil" ? HIL_CYCLE_TEMPLATE : CYCLE_TEMPLATE;
  const content = formatTemplate(template, {
    name,
    created: timestamp.toISOString().replace("Z", "+00:00"),
    priority,
  });

  fs.writeFileSync(cyclePath, content);

  const startPhase = mode === "hil" ? "Refine" : "Focus";
  console.log(`Created cycle: ${cycleId}`);
  console.log(`  File: ${cyclePath}`);
  console.log(`  Mode: ${mode === "hil" ? "HIL (Human-in-the-Loop)" : "Full"}`);
  console.log(`  Phase: ${startPhase} (Active)`);
  console.log();

  if (mode === "hil") {
    console.log("HIL mode: Refine → Generate → Evaluate");
    console.log();
    console.log("Next steps:");
    console.log("  1. Write acceptance criteria (Given-When-Then)");
    console.log("  2. Document interface changes");
    console.log("  3. Document constraints vs criteria");
  } else {
    console.log("Next steps:");
    console.log("  1. Define problem statement and target users");
    console.log("  2. Write testable success criteria");
    console.log("  3. Create C4 L1 System Context diagram");
    console.log("  4. Set clear boundaries");
    console.log("  5. Refine Intents into a GORE AND/OR goals tree (goals.md)");
  }
  console.log();
  console.log("Check status: node forge_status.js");

  return true;
}

function getActivePhase(content) {
  const match = content.match(/<!-- FORGE_PHASE:(\w+):Active -->/);
  return match ? match[1] : "Unknown";
}

function listCycles() {
  const forgeDir = getForgeDir();

  if (!fs.existsSync(forgeDir)) {
    console.log("Error: FORGE not initialized. Run forge_init.js first.");
    return;
  }

  const activeDir = path.join(forgeDir, "cycles", "active");
  const completedDir = path.join(forgeDir, "cycles", "completed");

  console.log("FORGE Cycles");
  console.log("=".repeat(40));

  console.log("\nActive:");
  const activeCycles = globMd(activeDir);
  if (activeCycles.length) {
    for (const cycle of activeCycles) {
      const cycleId = path.basename(cycle, ".md");
      const content = fs.readFileSync(cycle, "utf8");
      const phase = getActivePhase(content);
      console.log(`  - ${cycleId} [${phase}]`);
    }
  } else {
    console.log("  (none)");
  }

  console.log("\nCompleted:");
  const completedCycles = globMd(completedDir);
  if (completedCycles.length) {
    for (const cycle of completedCycles) {
      const cycleId = path.basename(cycle, ".md");
      console.log(`  - ${cycleId}`);
    }
  } else {
    console.log("  (none)");
  }
}

function globMd(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => path.join(dir, f));
}

function completeCycle(cycleId) {
  const forgeDir = getForgeDir();

  if (!fs.existsSync(forgeDir)) {
    console.log("Error: FORGE not initialized.");
    return false;
  }

  const activeDir = path.join(forgeDir, "cycles", "active");
  const completedDir = path.join(forgeDir, "cycles", "completed");

  let cyclePath = null;
  for (const p of globMd(activeDir)) {
    if (path.basename(p, ".md").includes(cycleId)) {
      cyclePath = p;
      break;
    }
  }

  if (!cyclePath) {
    console.log(`Error: Cycle not found: ${cycleId}`);
    console.log("Available cycles:");
    for (const p of globMd(activeDir)) {
      console.log(`  - ${path.basename(p, ".md")}`);
    }
    return false;
  }

  const content = fs.readFileSync(cyclePath, "utf8");
  const activePhase = getActivePhase(content);

  if (activePhase !== "Evaluate") {
    console.log(`Error: Cycle is in ${activePhase} phase, not Evaluate.`);
    console.log("Complete all phases before finishing the cycle.");
    return false;
  }

  const destPath = path.join(completedDir, path.basename(cyclePath));
  fs.renameSync(cyclePath, destPath);

  console.log(`Completed cycle: ${path.basename(cyclePath, ".md")}`);
  console.log(`  Archived to: ${destPath}`);

  return true;
}

function printHelp() {
  console.log("Manage FORGE development cycles");
  console.log();
  console.log("Commands:");
  console.log(
    "  new <name> [--priority low|medium|high|critical] [--mode full|hil]"
  );
  console.log("  list");
  console.log("  complete <cycle_id>");
}

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (command === "new") {
    let name = null;
    let priority = "medium";
    let mode = "full";
    for (let i = 1; i < argv.length; i++) {
      const arg = argv[i];
      if (arg === "--priority") {
        priority = argv[++i];
      } else if (arg.startsWith("--priority=")) {
        priority = arg.slice("--priority=".length);
      } else if (arg === "--mode") {
        mode = argv[++i];
      } else if (arg.startsWith("--mode=")) {
        mode = arg.slice("--mode=".length);
      } else if (name === null) {
        name = arg;
      }
    }
    if (!name) {
      console.error("Error: 'name' argument is required.");
      return 1;
    }
    if (!["low", "medium", "high", "critical"].includes(priority)) {
      console.error(
        `Error: invalid --priority '${priority}' (choose from low, medium, high, critical)`
      );
      return 1;
    }
    if (!["full", "hil"].includes(mode)) {
      console.error(`Error: invalid --mode '${mode}' (choose from full, hil)`);
      return 1;
    }
    return newCycle(name, priority, mode) ? 0 : 1;
  } else if (command === "list") {
    listCycles();
    return 0;
  } else if (command === "complete") {
    const cycleId = argv[1];
    if (!cycleId) {
      console.error("Error: 'cycle_id' argument is required.");
      return 1;
    }
    return completeCycle(cycleId) ? 0 : 1;
  } else {
    printHelp();
    return 1;
  }
}

process.exit(main());
