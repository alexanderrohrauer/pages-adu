import "server-only";

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const TEMPLATE_REPO_URL =
  process.env.TEMPLATE_REPO_URL ??
  "https://github.com/apostrophecms/starter-kit-astro-apollo.git";

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "artifact";
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function reserveTechnicalName(
  name: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const workdir = process.env.WORKDIR;
  if (!workdir) throw new Error("WORKDIR is not configured");

  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  while (
    (await isTaken(candidate)) ||
    (await pathExists(path.join(workdir, candidate)))
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function cloneTemplateRepo(technicalName: string): Promise<void> {
  const workdir = process.env.WORKDIR;
  if (!workdir) throw new Error("WORKDIR is not configured");

  await fs.mkdir(workdir, { recursive: true });
  const dest = path.join(workdir, technicalName);
  await execFileAsync("git", [
    "clone",
    "--depth",
    "1",
    TEMPLATE_REPO_URL,
    dest,
  ]);
}
