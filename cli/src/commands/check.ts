import { Command } from "commander";
import pc from "picocolors";
import ora from "ora";

import { log } from "../utils/logger.js";
import {
  type AgentName,
  ALL_AGENT_NAMES,
  AGENT_DISPLAY_NAMES,
  getAgent,
} from "../setup/agents.js";
import { readJsonConfig } from "../setup/mcp-writer.js";
import { B2DP_MCP_SERVERS } from "../setup/mcp-writer.js";

const REQUIRED_MCPS = ["datafy", "prisma-mcp-server", "github-mcp-server", "context7"];

interface CheckOptions {
  project?: boolean;
}

export function registerCheckCommand(program: Command): void {
  program
    .command("check")
    .description(
      "Verify that the b2dp MCP servers are configured for your AI coding agents"
    )
    .option("-p, --project", "Check project-level config instead of global")
    .action(async (options: CheckOptions) => {
      await checkCommand(options);
    });
}

async function checkCommand(options: CheckOptions): Promise<void> {
  const scope: "project" | "global" = options.project ? "project" : "global";

  log.info(
    pc.bold(`Checking b2dp MCP configuration (${scope} scope)...`)
  );
  log.blank();

  let anyAgentFound = false;

  for (const agentName of ALL_AGENT_NAMES as AgentName[]) {
    const agent = getAgent(agentName);
    const mcpConfigPath = agent.mcpConfigPath(scope);

    const spinner = ora(
      `Reading ${agent.displayName} config...`
    ).start();

    let config: Record<string, unknown>;
    try {
      config = await readJsonConfig(mcpConfigPath);
    } catch {
      spinner.warn(`${agent.displayName}: config not readable (${mcpConfigPath})`);
      continue;
    }

    const servers = (
      config[agent.mcpConfigKey] as Record<string, unknown> | undefined
    ) ?? {};

    if (Object.keys(servers).length === 0 && Object.keys(config).length === 0) {
      spinner.warn(
        `${agent.displayName}: no config found at ${mcpConfigPath}`
      );
      continue;
    }

    spinner.stop();
    anyAgentFound = true;

    console.log(pc.bold(`\n  ${agent.displayName}`));
    console.log(pc.dim(`  ${mcpConfigPath}`));

    for (const mcp of REQUIRED_MCPS) {
      const isPresent = mcp in servers;
      const entry = servers[mcp] as Record<string, unknown> | undefined;

      // Check for unfilled placeholders
      const hasPlaceholder =
        isPresent &&
        JSON.stringify(entry).includes("/path/to/your/dbhub.toml");

      const icon = !isPresent
        ? pc.red("✖")
        : hasPlaceholder
          ? pc.yellow("⚠")
          : pc.green("✔");

      const note = !isPresent
        ? pc.dim(" (missing — run `b2dp setup` to add)")
        : hasPlaceholder
          ? pc.yellow(" (needs dbhub.toml path filled in)")
          : pc.dim(" (configured)");

      console.log(`    ${icon} ${mcp}${note}`);
    }

    // Check for optional MCPs from b2dp ecosystem
    const optionalMcps = Object.keys(B2DP_MCP_SERVERS).filter(
      (s) => !REQUIRED_MCPS.includes(s)
    );
    for (const mcp of optionalMcps) {
      const isPresent = mcp in servers;
      const icon = isPresent ? pc.green("✔") : pc.dim("○");
      const label = isPresent ? pc.dim(" (configured)") : pc.dim(" (optional, not set)");
      console.log(`    ${icon} ${pc.dim(mcp)}${label}`);
    }
  }

  log.blank();

  if (!anyAgentFound) {
    log.warn(
      "No agent configs found. Run `b2dp setup` to install the b2dp skill ecosystem."
    );
  } else {
    log.dim("Run `b2dp setup` to add any missing MCPs or reinstall skills.");
  }
}
