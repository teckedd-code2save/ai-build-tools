import { Command } from "commander";
import pc from "picocolors";
import ora from "ora";
import { checkbox, input } from "@inquirer/prompts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { log } from "../utils/logger.js";
import { ensureDir } from "../utils/fs.js";
import {
  type AgentName,
  ALL_AGENT_NAMES,
  AGENT_DISPLAY_NAMES,
  getAgent,
  detectAgents,
} from "../setup/agents.js";
import {
  type SkillName,
  ALL_SKILLS,
  SKILL_DESCRIPTIONS,
  ORCHESTRATOR_SKILL,
  RULE_FILENAME,
} from "../constants.js";
import { installSkills } from "../setup/skill-writer.js";
import {
  readJsonConfig,
  mergeServerEntry,
  writeJsonConfig,
  B2DP_MCP_SERVERS,
} from "../setup/mcp-writer.js";
import { RULE_CONTENT } from "../setup/templates.js";

interface SetupOptions {
  antigravity?: boolean;
  claude?: boolean;
  cursor?: boolean;
  vscode?: boolean;
  gemini?: boolean;
  project?: boolean;
  yes?: boolean;
}

export function registerSetupCommand(program: Command): void {
  program
    .command("setup")
    .description("Set up the b2dp skill ecosystem for your AI coding agent")
    .option("--antigravity", "Set up for Antigravity / Gemini CLI")
    .option("--claude", "Set up for Claude Code")
    .option("--cursor", "Set up for Cursor")
    .option("--vscode", "Set up for VS Code (Copilot)")
    .option("--gemini", "Set up for Gemini CLI")
    .option(
      "-p, --project",
      "Configure for current project only (default: global)"
    )
    .option("-y, --yes", "Skip confirmation prompts, install everything")
    .action(async (options: SetupOptions) => {
      await setupCommand(options);
    });
}

function getSelectedAgentsFromOptions(options: SetupOptions): AgentName[] {
  const agents: AgentName[] = [];
  if (options.antigravity) agents.push("antigravity");
  if (options.claude) agents.push("claude");
  if (options.cursor) agents.push("cursor");
  if (options.vscode) agents.push("vscode");
  if (options.gemini) agents.push("gemini");
  return agents;
}

async function resolveTargetAgents(
  options: SetupOptions,
  scope: "project" | "global"
): Promise<AgentName[]> {
  let selected = getSelectedAgentsFromOptions(options);
  if (selected.length > 0) return selected;

  if (options.yes) {
    const spinner = ora("Detecting AI coding agents...").start();
    selected = await detectAgents(scope);
    spinner.stop();
    if (selected.length === 0) {
      log.warn(
        "No agents detected. Defaulting to Antigravity. Use a flag like --claude to target a specific agent."
      );
      return ["antigravity"];
    }
    log.info(
      `Auto-detected: ${selected.map((a) => AGENT_DISPLAY_NAMES[a]).join(", ")}`
    );
    return selected;
  }

  const detected = await detectAgents(scope);
  const choices = ALL_AGENT_NAMES.map((name) => ({
    name: AGENT_DISPLAY_NAMES[name],
    value: name,
    checked: detected.includes(name),
    description: detected.includes(name) ? pc.dim("(detected)") : "",
  }));

  return checkbox({
    message: "Which AI coding agents should b2dp be set up for?",
    choices,
    validate: (v) => (v.length > 0 ? true : "Please select at least one agent."),
  });
}

async function resolveTargetSkills(options: SetupOptions): Promise<SkillName[]> {
  if (options.yes) return [...ALL_SKILLS];

  const siblingSkills = ALL_SKILLS.filter((s) => s !== ORCHESTRATOR_SKILL);
  const choices = siblingSkills.map((skill) => ({
    name: `${skill}`,
    value: skill,
    checked: true,
    description: pc.dim(SKILL_DESCRIPTIONS[skill]),
  }));

  const picked = await checkbox<SkillName>({
    message:
      "Which sibling skills should be installed? (orchestrator is always included)",
    choices,
  });

  return [ORCHESTRATOR_SKILL, ...picked];
}

async function resolveTargetMCPs(options: SetupOptions): Promise<string[]> {
  const allMcps = Object.keys(B2DP_MCP_SERVERS);
  if (options.yes) return allMcps.filter((m) => m !== "redis");

  const choices = allMcps.map((name) => ({
    name,
    value: name,
    checked: name !== "redis",
  }));

  return checkbox({
    message: "Which MCP servers should be installed?",
    choices,
  });
}

async function installSkillFiles(skills: SkillName[], skillsDir: string) {
  const skillSpinner = ora(`Installing ${skills.length} skills...`).start();
  try {
    const results = await installSkills(skills, skillsDir);
    skillSpinner.stop();
    for (const r of results) {
      const prefix = r.alreadyExisted ? pc.dim("(updated) ") : "";
      log.success(`${prefix}${r.skill} → ${r.targetPath}`);
    }
  } catch (err) {
    skillSpinner.fail("Failed to install skills");
    log.error(err instanceof Error ? err.message : String(err));
  }
}

async function configureMCPServers(
  agent: Record<string, any>,
  mcpConfigPath: string,
  selectedMcps: string[],
  env: Record<string, string>
) {
  const mcpSpinner = ora("Writing MCP server entries...").start();
  try {
    const config = await readJsonConfig(mcpConfigPath);
    let updatedConfig = config;

    for (const serverName of selectedMcps) {
      const baseEntry = B2DP_MCP_SERVERS[serverName];
      const entry = { ...baseEntry };

      // Apply specific env vars to specific servers
      if (
        serverName === "github-mcp-server" &&
        env.GITHUB_PERSONAL_ACCESS_TOKEN
      ) {
        entry.env = {
          ...(entry.env as Record<string, string>),
          GITHUB_PERSONAL_ACCESS_TOKEN: env.GITHUB_PERSONAL_ACCESS_TOKEN,
        };
      }

      if (serverName === "context7" && env.CONTEXT7_API_KEY) {
        entry.args = [
          ...(entry.args as string[]),
          "--api-key",
          env.CONTEXT7_API_KEY,
        ];
      }

      const { config: merged, alreadyExists } = mergeServerEntry(
        updatedConfig,
        agent.mcpConfigKey,
        serverName,
        entry
      );
      updatedConfig = merged;
      if (!alreadyExists) {
        mcpSpinner.text = `Added MCP: ${serverName}`;
      }
    }

    await writeJsonConfig(mcpConfigPath, updatedConfig);
    mcpSpinner.succeed(`MCP config written → ${mcpConfigPath}`);
  } catch (err) {
    mcpSpinner.fail("Failed to write MCP config");
    log.error(err instanceof Error ? err.message : String(err));
  }
}

async function writeRuleFile(rulesDir: string) {
  const rulesSpinner = ora("Writing b2dp rule file...").start();
  try {
    await ensureDir(rulesDir);
    const rulePath = join(rulesDir, RULE_FILENAME);
    await writeFile(rulePath, RULE_CONTENT, "utf-8");
    rulesSpinner.succeed(`Rule written → ${rulePath}`);
  } catch (err) {
    rulesSpinner.fail("Failed to write rule file");
    log.error(err instanceof Error ? err.message : String(err));
  }
}

async function setupAgent(
  agentName: AgentName,
  scope: "project" | "global",
  skills: SkillName[],
  selectedMcps: string[],
  env: Record<string, string>
) {
  const agent = getAgent(agentName);
  log.info(pc.bold(`Setting up ${agent.displayName}...`));

  const skillsDir = agent.skillsDir(scope);
  const rulesDir = agent.rulesDir(scope);
  const mcpConfigPath = agent.mcpConfigPath(scope);

  await installSkillFiles(skills, skillsDir);
  await configureMCPServers(agent, mcpConfigPath, selectedMcps, env);
  await writeRuleFile(rulesDir);

  log.blank();
}

async function setupCommand(options: SetupOptions): Promise<void> {
  const scope: "project" | "global" = options.project ? "project" : "global";

  const selectedAgents = await resolveTargetAgents(options, scope);
  const selectedSkills = await resolveTargetSkills(options);
  const selectedMcps = await resolveTargetMCPs(options);

  // Ask for keys if not in -y mode
  const env: Record<string, string> = {};
  if (!options.yes) {
    log.blank();
    log.info(pc.yellow("Interactive Configuration:"));

    if (selectedMcps.includes("github-mcp-server")) {
      const githubToken = await input({
        message: "GitHub Personal Access Token (for github-mcp-server):",
        transformer: (val) => (val ? "*".repeat(val.length) : val),
      });
      if (githubToken) {
        env["GITHUB_PERSONAL_ACCESS_TOKEN"] = githubToken;
      }
    }

    if (selectedMcps.includes("context7")) {
      const context7Key = await input({
        message: "Context7 API Key (for context7):",
        transformer: (val) => (val ? "*".repeat(val.length) : val),
      });
      if (context7Key) {
        env["CONTEXT7_API_KEY"] = context7Key;
      }
    }
  }

  log.blank();

  for (const agentName of selectedAgents) {
    await setupAgent(agentName, scope, selectedSkills, selectedMcps, env);
  }

  log.success(pc.bold(pc.green("b2dp setup complete! 🚀")));
  log.blank();
  
  log.info(pc.bold("NEXT STEPS (ACTION REQUIRED):"));
  log.info(pc.bold("  1. Configure Datafy:"));
  log.info("     Create or update your " + pc.cyan("dbhub.toml") + " file to define your databases.");
  log.info("     Then, find the " + pc.yellow("datafy") + " entry in your agent's MCP config and update the ");
  log.info("     " + pc.cyan("--config") + " path to point to your " + pc.cyan("dbhub.toml") + ".");
  log.blank();
  log.info(pc.bold("  2. Restart Your Agent:"));
  log.info("     Restart your AI coding agent to pick up the new skills and MCP servers.");
  log.blank();
  log.info(pc.bold("  3. Start Building:"));
  log.info(pc.italic("     Try: \"Build me a SaaS platform for team task management\""));
  log.blank();

  log.info(pc.dim("Sample dbhub.toml can be found at:"));
  log.info(pc.blue("https://github.com/teckedd-code2save/ai-build-tools/blob/main/samples/dbhub.toml"));
  log.blank();
  log.dim("Run `b2dp check` to verify your MCP configuration at any time.");
}
