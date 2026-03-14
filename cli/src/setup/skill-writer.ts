import { readFile, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDir, pathExists } from "../utils/fs.js";
import { type SkillName, ALL_SKILLS } from "../constants.js";

// After tsup bundles src/ → dist/index.js, __dirname === cli/dist/
// The skills/ directory lives at cli/../skills (one level up from cli/)
const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_REPO_DIR = resolve(__dirname, "..", "..", "skills");

export interface InstallResult {
  skill: SkillName;
  targetPath: string;
  alreadyExisted: boolean;
}

/**
 * Read the SKILL.md for a given skill name from the local skills/ directory.
 */
export async function readSkillFile(skill: SkillName): Promise<string | null> {
  const skillPath = join(SKILLS_REPO_DIR, skill, "SKILL.md");
  try {
    return await readFile(skillPath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Install a single skill into the target directory.
 * Creates <targetDir>/<skillName>/SKILL.md
 */
export async function installSkill(
  skill: SkillName,
  targetDir: string
): Promise<InstallResult> {
  const skillDir = join(targetDir, skill);
  const targetPath = join(skillDir, "SKILL.md");

  const alreadyExisted = await pathExists(targetPath);
  const content = await readSkillFile(skill);

  if (!content) {
    throw new Error(`Could not read SKILL.md for skill: ${skill}`);
  }

  if (alreadyExisted) {
    const existingContent = await readFile(targetPath, "utf-8");
    if (existingContent === content) {
      return { skill, targetPath, alreadyExisted: true };
    }
  }

  await ensureDir(skillDir);
  await writeFile(targetPath, content, "utf-8");

  return { skill, targetPath, alreadyExisted };
}

/**
 * Install multiple skills into the target directory.
 */
export async function installSkills(
  skills: SkillName[],
  targetDir: string
): Promise<InstallResult[]> {
  const results: InstallResult[] = [];
  for (const skill of skills) {
    const result = await installSkill(skill, targetDir);
    results.push(result);
  }
  return results;
}

/**
 * Get which skills are available in the local skills/ directory.
 */
export async function getAvailableSkills(): Promise<
  { name: SkillName; available: boolean }[]
> {
  return Promise.all(
    ALL_SKILLS.map(async (skill) => ({
      name: skill,
      available: await pathExists(join(SKILLS_REPO_DIR, skill, "SKILL.md")),
    }))
  );
}

/**
 * Extract the description line from a SKILL.md frontmatter.
 */
export function parseSkillDescription(content: string): string | null {
  const match = /^description:\s*[>|]?\s*\n?([\s\S]*?)(?=\n\w|\n---)/m.exec(content);
  if (!match) return null;
  return match[1]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, 120);
}
