#!/usr/bin/env node
"use strict";
/** Check FORGE status and validate phase requirements. */

const fs = require("fs");
const path = require("path");

const ALL_PHASES = ["Focus", "Orchestrate", "Refine", "Generate", "Evaluate"];

function getCyclePhases(content) {
  const re = /<!-- FORGE_PHASE:(\w+):\w+ -->/g;
  const found = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    found.add(m[1]);
  }
  return ALL_PHASES.filter((p) => found.has(p));
}

function progress(phase) {
  if (phase.totalItems === 0) {
    return 0.0;
  }
  return (phase.completedItems / phase.totalItems) * 100;
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

function parseCycle(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const cycleId = path.basename(filePath, ".md");

  const phases = {};
  let activePhase = null;
  const cyclePhases = getCyclePhases(content);

  for (const phaseName of cyclePhases) {
    const markerRe = new RegExp(`<!-- FORGE_PHASE:${phaseName}:(\\w+) -->`);
    const markerMatch = markerRe.exec(content);

    let state;
    if (!markerMatch) {
      state = "Pending";
    } else {
      state = markerMatch[1];
      if (state === "Active") {
        activePhase = phaseName;
      }
    }

    const sectionRe = new RegExp(
      `## Phase \\d+: ${phaseName}[\\s\\S]*?(?=## Phase \\d+:|---\\s*$|$)`
    );
    const sectionMatch = sectionRe.exec(content);

    const items = [];
    if (sectionMatch) {
      const section = sectionMatch[0];
      const checkboxRe = /- \[([ xX])\] (.+?)(?:\n|$)/g;
      let m;
      while ((m = checkboxRe.exec(section)) !== null) {
        const completed = m[1].toLowerCase() === "x";
        const text = m[2].trim();
        items.push([completed, text]);
      }
    }

    const totalItems = items.length;
    const completedItems = items.filter(([completed]) => completed).length;

    phases[phaseName] = {
      name: phaseName,
      state,
      totalItems,
      completedItems,
      items,
    };
  }

  return {
    cycleId,
    path: filePath,
    activePhase: activePhase || cyclePhases[0],
    phases,
  };
}

function getActiveCycles() {
  const forgeDir = getForgeDir();
  const activeDir = path.join(forgeDir, "cycles", "active");

  if (!fs.existsSync(activeDir)) {
    return [];
  }

  return globMd(activeDir).map(parseCycle);
}

function printStatus(detailed) {
  const forgeDir = getForgeDir();

  if (!fs.existsSync(forgeDir)) {
    console.log("FORGE not initialized. Run forge_init.js first.");
    return;
  }

  const cycles = getActiveCycles();

  if (!cycles.length) {
    console.log("No active cycles.");
    console.log('Start one with: node forge_cycle.js new "feature-name"');
    return;
  }

  console.log("FORGE Status");
  console.log("=".repeat(50));

  for (const cycle of cycles) {
    console.log(`\nCycle: ${cycle.cycleId}`);
    console.log(`Active Phase: ${cycle.activePhase}`);
    console.log();

    for (const phaseName of Object.keys(cycle.phases)) {
      const phase = cycle.phases[phaseName];

      let indicator;
      if (phase.state === "Complete") {
        indicator = "[x]";
      } else if (phase.state === "Active") {
        indicator = "[>]";
      } else {
        indicator = "[ ]";
      }

      const progressStr =
        phase.totalItems > 0
          ? `${phase.completedItems}/${phase.totalItems}`
          : "-";

      console.log(`  ${indicator} ${phase.name}: ${progressStr}`);

      if (detailed && phase.items.length) {
        for (const [completed, text] of phase.items) {
          const check = completed ? "x" : " ";
          console.log(`      [${check}] ${text}`);
        }
      }
    }
  }
}

function validatePhase(cycle) {
  const phase = cycle.phases[cycle.activePhase];

  const incomplete = [];
  for (const [completed, text] of phase.items) {
    if (!completed) {
      incomplete.push(text);
    }
  }

  const canAdvance = incomplete.length === 0;
  return [canAdvance, incomplete];
}

function printValidation() {
  const forgeDir = getForgeDir();

  if (!fs.existsSync(forgeDir)) {
    console.log("FORGE not initialized.");
    return;
  }

  const cycles = getActiveCycles();

  if (!cycles.length) {
    console.log("No active cycles.");
    return;
  }

  for (const cycle of cycles) {
    console.log(`Validating: ${cycle.cycleId}`);
    console.log(`Current Phase: ${cycle.activePhase}`);
    console.log();

    const [canAdvance, incomplete] = validatePhase(cycle);

    if (canAdvance) {
      console.log("All requirements met. Ready to advance.");
      const phaseList = Object.keys(cycle.phases);
      if (cycle.activePhase !== phaseList[phaseList.length - 1]) {
        const nextIdx = phaseList.indexOf(cycle.activePhase) + 1;
        const nextPhase = phaseList[nextIdx];
        console.log(`Next phase: ${nextPhase}`);
        console.log();
        console.log("Advance with: node forge_phase.js advance");
      } else {
        console.log("Cycle complete. Archive with:");
        console.log(`  node forge_cycle.js complete ${cycle.cycleId}`);
      }
    } else {
      console.log("Incomplete items:");
      for (const item of incomplete) {
        console.log(`  - ${item}`);
      }
      console.log();
      console.log("Complete these items before advancing.");
    }
  }
}

function phaseToDict(phase) {
  return {
    state: phase.state,
    total_items: phase.totalItems,
    completed_items: phase.completedItems,
    progress: progress(phase),
    items: phase.items.map(([completed, text]) => ({ completed, text })),
  };
}

function statusData() {
  if (!fs.existsSync(getForgeDir())) {
    return { initialized: false, cycles: [] };
  }

  return {
    initialized: true,
    cycles: getActiveCycles().map((cycle) => ({
      cycle_id: cycle.cycleId,
      path: cycle.path,
      active_phase: cycle.activePhase,
      phases: Object.fromEntries(
        Object.entries(cycle.phases).map(([name, phase]) => [
          name,
          phaseToDict(phase),
        ])
      ),
    })),
  };
}

function validationData() {
  if (!fs.existsSync(getForgeDir())) {
    return { initialized: false, cycles: [] };
  }

  const cycles = [];
  for (const cycle of getActiveCycles()) {
    const [canAdvance, incomplete] = validatePhase(cycle);
    const phaseList = Object.keys(cycle.phases);
    let nextPhase = null;
    if (cycle.activePhase !== phaseList[phaseList.length - 1]) {
      nextPhase = phaseList[phaseList.indexOf(cycle.activePhase) + 1];
    }
    cycles.push({
      cycle_id: cycle.cycleId,
      active_phase: cycle.activePhase,
      can_advance: canAdvance,
      incomplete,
      next_phase: nextPhase,
    });
  }

  return { initialized: true, cycles };
}

function main() {
  const argv = process.argv.slice(2);
  const detailed = argv.some((a) => a === "--detailed" || a === "-d");
  const validate = argv.some((a) => a === "--validate" || a === "-v");
  const json = argv.some((a) => a === "--json");

  if (json) {
    const data = validate ? validationData() : statusData();
    console.log(JSON.stringify(data, null, 2));
  } else if (validate) {
    printValidation();
  } else {
    printStatus(detailed);
  }

  return 0;
}

process.exit(main());
