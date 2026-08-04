#!/usr/bin/env node
"use strict";
/** Initialize FORGE in a project directory. */

const fs = require("fs");
const path = require("path");

function getForgeDir(baseDir) {
  const base = baseDir || process.cwd();
  return path.join(base, ".adu");
}

function yamlScalar(value) {
  // Mirrors pyyaml's default behavior of quoting scalars that contain
  // YAML-significant characters (ISO timestamps need this for ':' and '+').
  if (/[:#{}\[\],&*!|>'"%@`]/.test(value) || value !== value.trim()) {
    return `'${value.replace(/'/g, "''")}'`;
  }
  return value;
}

function createConfig(forgeDir, projectName) {
  const created = new Date().toISOString().replace("Z", "+00:00");
  const lines = [
    `project: ${yamlScalar(projectName)}`,
    `version: 2.0.0`,
    `created: ${yamlScalar(created)}`,
    `phases:`,
    `- Focus`,
    `- Orchestrate`,
    `- Refine`,
    `- Generate`,
    `- Evaluate`,
    "",
  ];
  fs.writeFileSync(path.join(forgeDir, "config.yaml"), lines.join("\n"));
}

function createContext(forgeDir, projectName) {
  const content = `# ${projectName} - FORGE Context

## Project Overview

<!-- Describe the project purpose and scope -->

## Architecture Decisions

<!-- Document key architectural choices -->

## Vocabulary

<!-- Define project-specific terms -->

## Conventions

<!-- Document coding standards and patterns -->
`;
  fs.writeFileSync(path.join(forgeDir, "context.md"), content);
}

function createLearnings(forgeDir) {
  const content = `# FORGE Learnings

Accumulated knowledge from development cycles.

## Patterns

<!-- Successful approaches to reuse -->

## Anti-Patterns

<!-- Approaches to avoid -->

## Decisions

<!-- Key decisions and their rationale -->

## Tools

<!-- Useful tools and techniques -->
`;
  fs.writeFileSync(path.join(forgeDir, "learnings.md"), content);
}

function initialize(baseDir, projectName) {
  const base = baseDir || process.cwd();
  const forgeDir = getForgeDir(base);

  if (fs.existsSync(forgeDir)) {
    console.log(`FORGE already initialized at ${forgeDir}`);
    return false;
  }

  if (!projectName) {
    projectName = path.basename(base);
  }

  fs.mkdirSync(forgeDir, { recursive: true });
  fs.mkdirSync(path.join(forgeDir, "cycles", "active"), { recursive: true });
  fs.mkdirSync(path.join(forgeDir, "cycles", "completed"), { recursive: true });

  createConfig(forgeDir, projectName);
  createContext(forgeDir, projectName);
  createLearnings(forgeDir);

  console.log(`FORGE initialized at ${forgeDir}`);
  console.log(`  - config.yaml: Project configuration`);
  console.log(`  - context.md: AI assistant context`);
  console.log(`  - learnings.md: Knowledge base`);
  console.log(`  - cycles/: Development cycle storage`);
  console.log();
  console.log(
    "Next: Start a cycle with 'node forge_cycle.js new \"feature-name\"'"
  );

  return true;
}

function parseArgs(argv) {
  const args = { dir: null, name: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") {
      args.dir = argv[++i];
    } else if (arg.startsWith("--dir=")) {
      args.dir = arg.slice("--dir=".length);
    } else if (arg === "--name") {
      args.name = argv[++i];
    } else if (arg.startsWith("--name=")) {
      args.name = arg.slice("--name=".length);
    } else if (arg === "-h" || arg === "--help") {
      console.log("Initialize FORGE in a project directory");
      console.log();
      console.log("Options:");
      console.log(
        "  --dir <path>   Directory to initialize (default: current directory)"
      );
      console.log("  --name <name>  Project name (default: directory name)");
      process.exit(0);
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseDir = args.dir ? path.resolve(args.dir) : null;
  const success = initialize(baseDir, args.name);
  return success ? 0 : 1;
}

process.exit(main());
