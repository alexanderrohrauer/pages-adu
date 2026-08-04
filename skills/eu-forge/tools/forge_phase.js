#!/usr/bin/env node
"use strict";
/** Manage FORGE phase transitions and tasks. */

const fs = require("fs");
const path = require("path");

const ALL_PHASES = ["Focus", "Orchestrate", "Refine", "Generate", "Evaluate"];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getCyclePhases(content) {
  const re = /<!-- FORGE_PHASE:(\w+):\w+ -->/g;
  const found = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    found.add(m[1]);
  }
  return ALL_PHASES.filter((p) => found.has(p));
}

function getForgeDir() {
  return path.join(process.cwd(), ".adu");
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

function getActiveCycle() {
  const forgeDir = getForgeDir();
  const activeDir = path.join(forgeDir, "cycles", "active");

  if (!fs.existsSync(activeDir)) {
    return null;
  }

  const cycles = globMd(activeDir).reverse();
  return cycles.length ? cycles[0] : null;
}

function getActivePhase(content) {
  const match = content.match(/<!-- FORGE_PHASE:(\w+):Active -->/);
  return match ? match[1] : null;
}

function getPhaseItems(content, phaseName) {
  const sectionRe = new RegExp(
    `## Phase \\d+: ${phaseName}[\\s\\S]*?(?=## Phase \\d+:|---\\s*$|$)`
  );
  const sectionMatch = sectionRe.exec(content);

  if (!sectionMatch) {
    return [];
  }

  const section = sectionMatch[0];
  const items = [];
  const checkboxRe = /- \[([ xX])\] (.+?)(?:\n|$)/g;
  let m;
  while ((m = checkboxRe.exec(section)) !== null) {
    const completed = m[1].toLowerCase() === "x";
    const text = m[2].trim();
    items.push([completed, text]);
  }

  return items;
}

function updatePhaseState(content, phaseName, newState) {
  const re = new RegExp(`(<!-- FORGE_PHASE:${phaseName}:)\\w+( -->)`);
  return content.replace(re, `$1${newState}$2`);
}

function advancePhase(force) {
  const cyclePath = getActiveCycle();

  if (!cyclePath) {
    console.log("Error: No active cycle found.");
    return false;
  }

  let content = fs.readFileSync(cyclePath, "utf8");
  const currentPhase = getActivePhase(content);

  if (!currentPhase) {
    console.log("Error: Could not determine current phase.");
    return false;
  }

  const phases = getCyclePhases(content);

  if (!phases.length) {
    console.log("Error: No phases found in cycle file.");
    return false;
  }

  if (currentPhase === phases[phases.length - 1]) {
    console.log(`Already at final phase (${currentPhase}).`);
    console.log(
      `Complete the cycle with: node forge_cycle.js complete ${path.basename(cyclePath, ".md")}`
    );
    return false;
  }

  if (!phases.includes(currentPhase)) {
    console.log(`Error: Current phase ${currentPhase} not found in cycle.`);
    return false;
  }

  const items = getPhaseItems(content, currentPhase);
  const incomplete = items
    .filter(([completed]) => !completed)
    .map(([, text]) => text);

  if (incomplete.length && !force) {
    console.log(
      `Cannot advance: ${incomplete.length} incomplete items in ${currentPhase}:`
    );
    for (const item of incomplete) {
      console.log(`  - ${item}`);
    }
    console.log();
    console.log("Complete these items or use --force to skip validation.");
    return false;
  }

  if (incomplete.length && force) {
    console.log(
      `Warning: Forcing advance with ${incomplete.length} incomplete items.`
    );
  }

  const currentIdx = phases.indexOf(currentPhase);
  const nextPhase = phases[currentIdx + 1];

  content = updatePhaseState(content, currentPhase, "Complete");
  content = updatePhaseState(content, nextPhase, "Active");

  fs.writeFileSync(cyclePath, content);

  console.log(`Advanced: ${currentPhase} -> ${nextPhase}`);
  console.log();

  const guidance = {
    Orchestrate: [
      "Design Container architecture (C4 L2)",
      "Design Component architecture (C4 L3)",
      "Create dependency map",
      "Break into session-sized tasks",
    ],
    Refine: [
      "Write Given-When-Then acceptance criteria",
      "Document interface specifications",
      "Remember: NO CODE in this phase",
    ],
    Generate: [
      "Follow TDD: RED -> GREEN -> REFACTOR",
      "One task per session",
      "Write failing tests first",
      "Minimum 80% coverage",
    ],
    Evaluate: [
      "Verify against acceptance criteria",
      "Complete security review",
      "Cycle review summary -> spec/<change-request?>/review.md (+HTML)",
      "Make disposition decision",
    ],
  };

  if (guidance[nextPhase]) {
    console.log(`Next steps for ${nextPhase}:`);
    for (const step of guidance[nextPhase]) {
      console.log(`  - ${step}`);
    }
  }

  return true;
}

function completeTask(description) {
  const cyclePath = getActiveCycle();

  if (!cyclePath) {
    console.log("Error: No active cycle found.");
    return false;
  }

  let content = fs.readFileSync(cyclePath, "utf8");
  const currentPhase = getActivePhase(content);

  if (!currentPhase) {
    console.log("Error: Could not determine current phase.");
    return false;
  }

  const snippet = escapeRegExp(description.slice(0, 20));
  const fuzzyRe = new RegExp(`- \\[ \\] ([^\\n]*${snippet}[^\\n]*)`, "i");
  const match = fuzzyRe.exec(content);

  if (match) {
    const oldText = match[0];
    const newText = oldText.replace("- [ ]", "- [x]");
    content = content.replace(oldText, newText);
    fs.writeFileSync(cyclePath, content);
    console.log(`Completed: ${match[1]}`);
    return true;
  }

  const exactRe = new RegExp(`- \\[ \\] ${escapeRegExp(description)}`);
  if (exactRe.test(content)) {
    content = content.replace(exactRe, `- [x] ${description}`);
    fs.writeFileSync(cyclePath, content);
    console.log(`Completed: ${description}`);
    return true;
  }

  console.log(`Task not found: ${description}`);
  console.log();
  console.log("Available tasks in current phase:");
  const items = getPhaseItems(content, currentPhase);
  for (const [completed, text] of items) {
    if (!completed) {
      console.log(`  - ${text}`);
    }
  }

  return false;
}

function addTask(description) {
  const cyclePath = getActiveCycle();

  if (!cyclePath) {
    console.log("Error: No active cycle found.");
    return false;
  }

  let content = fs.readFileSync(cyclePath, "utf8");
  const currentPhase = getActivePhase(content);

  if (!currentPhase) {
    console.log("Error: Could not determine current phase.");
    return false;
  }

  const sectionRe = new RegExp(
    `(## Phase \\d+: ${currentPhase}[\\s\\S]*?)((?=## Phase \\d+:)|(?=---\\s*$)|$)`
  );
  const match = sectionRe.exec(content);

  if (!match) {
    console.log(`Error: Could not find ${currentPhase} section.`);
    return false;
  }

  const groupStart = match.index;
  const section = match[1];

  const newTask = `- [ ] ${description}\n`;

  let lastCheckboxEnd = null;
  const checkboxRe = /- \[[ xX]\] .+\n/g;
  let cbMatch;
  while ((cbMatch = checkboxRe.exec(section)) !== null) {
    lastCheckboxEnd = cbMatch.index + cbMatch[0].length;
  }

  if (lastCheckboxEnd !== null) {
    const insertPos = groupStart + lastCheckboxEnd;
    content = content.slice(0, insertPos) + newTask + content.slice(insertPos);
  } else {
    const notesMatch = /(### \w+\n\n)/.exec(section);
    if (notesMatch) {
      const insertPos = groupStart + notesMatch.index + notesMatch[0].length;
      content =
        content.slice(0, insertPos) + newTask + content.slice(insertPos);
    } else {
      console.log("Error: Could not find insertion point.");
      return false;
    }
  }

  fs.writeFileSync(cyclePath, content);
  console.log(`Added task: ${description}`);
  return true;
}

function printHelp() {
  console.log("Manage FORGE phases and tasks");
  console.log();
  console.log("Commands:");
  console.log("  advance [--force/-f]");
  console.log("  complete-task <description>");
  console.log("  add-task <description>");
}

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (command === "advance") {
    const force = argv.slice(1).some((a) => a === "--force" || a === "-f");
    return advancePhase(force) ? 0 : 1;
  } else if (command === "complete-task") {
    const description = argv[1];
    if (!description) {
      console.error("Error: 'description' argument is required.");
      return 1;
    }
    return completeTask(description) ? 0 : 1;
  } else if (command === "add-task") {
    const description = argv[1];
    if (!description) {
      console.error("Error: 'description' argument is required.");
      return 1;
    }
    return addTask(description) ? 0 : 1;
  } else {
    printHelp();
    return 1;
  }
}

process.exit(main());
