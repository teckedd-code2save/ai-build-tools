import { Command } from "commander";
import pc from "picocolors";

import { log } from "../utils/logger.js";
import { ALL_SKILLS, SKILL_DESCRIPTIONS, ORCHESTRATOR_SKILL } from "../constants.js";
import {
  getAvailableSkills,
  readSkillFile,
  parseSkillDescription,
} from "../setup/skill-writer.js";

export function registerSkillsCommand(program: Command): void {
  const skills = program
    .command("skills")
    .description("Manage b2dp skills");

  // b2dp skills list
  skills
    .command("list")
    .description("List all available b2dp skills")
    .action(async () => {
      await listSkillsCommand();
    });

  // b2dp skills info <name>
  skills
    .command("info <skillName>")
    .description("Show details about a specific skill")
    .action(async (skillName: string) => {
      await infoSkillCommand(skillName);
    });
}

async function listSkillsCommand(): Promise<void> {
  log.blank();
  console.log(pc.bold("Available b2dp skills:"));
  log.blank();

  const available = await getAvailableSkills();

  for (const { name, available: isAvailable } of available) {
    const isOrchestrator = name === ORCHESTRATOR_SKILL;
    const statusIcon = isAvailable ? pc.green("✔") : pc.red("✖");
    const label = isOrchestrator
      ? pc.bold(pc.cyan(name)) + pc.cyan(" (orchestrator)")
      : pc.white(name);
    const desc = pc.dim(SKILL_DESCRIPTIONS[name]);
    const missing = isAvailable ? "" : pc.red(" [SKILL.md not found]");

    console.log(`  ${statusIcon} ${label}${missing}`);
    console.log(`     ${desc}`);
    log.blank();
  }

  const availableCount = available.filter((s) => s.available).length;
  log.dim(
    `${availableCount}/${ALL_SKILLS.length} skills available locally.`
  );
  log.dim(
    "Run `b2dp setup` to install all skills into your AI coding agent."
  );
}

async function infoSkillCommand(skillName: string): Promise<void> {
  const validSkill = ALL_SKILLS.find((s) => s === skillName);
  if (!validSkill) {
    log.error(
      `Unknown skill: "${skillName}". Run \`b2dp skills list\` to see available skills.`
    );
    process.exit(1);
  }

  const content = await readSkillFile(validSkill);
  if (!content) {
    log.error(
      `SKILL.md not found for "${validSkill}". Ensure the skills/ directory is intact.`
    );
    process.exit(1);
  }

  const description = parseSkillDescription(content) ?? SKILL_DESCRIPTIONS[validSkill];
  const isOrchestrator = validSkill === ORCHESTRATOR_SKILL;

  log.blank();
  console.log(
    pc.bold(
      isOrchestrator ? pc.cyan(`${validSkill} (orchestrator)`) : pc.white(validSkill)
    )
  );
  log.blank();
  console.log(`  ${pc.dim(description)}`);
  log.blank();

  // Count lines in the SKILL.md as a rough size indicator
  const lineCount = content.split("\n").length;
  log.dim(`  ${lineCount} lines · SKILL.md`);
  log.blank();

  log.dim(
    `Install with: b2dp setup --yes  (or select it during interactive setup)`
  );
}
