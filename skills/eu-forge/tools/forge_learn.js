#!/usr/bin/env node
"use strict";
/** Manage FORGE learnings. */

const fs = require("fs");
const path = require("path");

const LEARNING_CATEGORIES = ["pattern", "anti-pattern", "decision", "tool"];

function getForgeDir() {
  return path.join(process.cwd(), ".adu");
}

function getLearningsPath() {
  return path.join(getForgeDir(), "learnings.md");
}

function addLearning(category, title, description, context = "") {
  const forgeDir = getForgeDir();

  if (!fs.existsSync(forgeDir)) {
    console.log("Error: FORGE not initialized.");
    return false;
  }

  const learningsPath = getLearningsPath();

  if (!fs.existsSync(learningsPath)) {
    console.log("Error: learnings.md not found.");
    return false;
  }

  const sectionMap = {
    pattern: "## Patterns",
    "anti-pattern": "## Anti-Patterns",
    decision: "## Decisions",
    tool: "## Tools",
  };

  const sectionHeader = sectionMap[category];
  if (!sectionHeader) {
    console.log(`Error: Unknown category '${category}'`);
    console.log(`Valid categories: ${LEARNING_CATEGORIES.join(", ")}`);
    return false;
  }

  let content = fs.readFileSync(learningsPath, "utf8");

  const timestamp = new Date().toISOString().slice(0, 10);
  let entry = `\n### ${title}\n`;
  entry += `*Added: ${timestamp}*\n\n`;
  entry += `${description}\n`;
  if (context) {
    entry += `\n**Context**: ${context}\n`;
  }

  const sectionPos = content.indexOf(sectionHeader);

  if (sectionPos === -1) {
    content += `\n${sectionHeader}\n${entry}`;
  } else {
    const nextSection = content.indexOf(
      "\n## ",
      sectionPos + sectionHeader.length
    );
    if (nextSection === -1) {
      content += entry;
    } else {
      content =
        content.slice(0, nextSection) + entry + content.slice(nextSection);
    }
  }

  fs.writeFileSync(learningsPath, content);

  console.log(`Added learning: ${title}`);
  console.log(`  Category: ${category}`);
  console.log(`  File: ${learningsPath}`);

  return true;
}

function listLearnings() {
  const learningsPath = getLearningsPath();

  if (!fs.existsSync(learningsPath)) {
    console.log("Error: learnings.md not found.");
    return false;
  }

  const content = fs.readFileSync(learningsPath, "utf8");

  console.log("FORGE Learnings");
  console.log("=".repeat(50));

  const sections = [
    ["Patterns", "## Patterns"],
    ["Anti-Patterns", "## Anti-Patterns"],
    ["Decisions", "## Decisions"],
    ["Tools", "## Tools"],
  ];

  for (const [category, sectionName] of sections) {
    const sectionPos = content.indexOf(sectionName);
    let count = 0;
    if (sectionPos !== -1) {
      const nextSection = content.indexOf(
        "\n## ",
        sectionPos + sectionName.length
      );
      const sectionContent =
        nextSection === -1
          ? content.slice(sectionPos)
          : content.slice(sectionPos, nextSection);
      const matches = sectionContent.match(/^### /gm);
      count = matches ? matches.length : 0;
    }
    console.log(`  ${category}: ${count} entries`);
  }

  console.log();
  console.log(`View: ${learningsPath}`);
  return true;
}

function printHelp() {
  console.log("Manage FORGE learnings");
  console.log();
  console.log("Commands:");
  console.log(
    "  add <category> <title> <description> [--context/-c <context>]"
  );
  console.log("  list");
}

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (command === "add") {
    const rest = argv.slice(1);
    const positional = [];
    let context = "";
    for (let i = 0; i < rest.length; i++) {
      const arg = rest[i];
      if (arg === "--context" || arg === "-c") {
        context = rest[++i];
      } else if (arg.startsWith("--context=")) {
        context = arg.slice("--context=".length);
      } else {
        positional.push(arg);
      }
    }
    const [category, title, description] = positional;
    if (!category || !title || !description) {
      console.error(
        "Error: 'category', 'title' and 'description' arguments are required."
      );
      return 1;
    }
    if (!LEARNING_CATEGORIES.includes(category)) {
      console.error(
        `Error: invalid category '${category}' (choose from ${LEARNING_CATEGORIES.join(", ")})`
      );
      return 1;
    }
    return addLearning(category, title, description, context) ? 0 : 1;
  } else if (command === "list") {
    return listLearnings() ? 0 : 1;
  } else {
    printHelp();
    return 1;
  }
}

process.exit(main());
