import { Command, Option } from "commander";
import { log } from "../utils/logger.js";
import { type AgentName, ALL_AGENT_NAMES, getAgent } from "../setup/agents.js";
import { readJsonConfig, FORGE_MCP_SERVERS } from "../setup/mcp-writer.js";

const REQUIRED_MCPS = ["datafy", "prisma-mcp-server", "github-mcp-server", "context7"];
interface CheckOptions {
  project?: boolean;
  agent?: AgentName;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function registerCheckCommand(program: Command): void {
  program.command("check")
    .description("Check MCP configuration files; does not test live connections")
    .option("-p, --project", "Check project-level config instead of global")
    .addOption(new Option("--agent <agent>", "Check only this agent").choices(ALL_AGENT_NAMES))
    .action(async (options: CheckOptions) => {
      const scope = options.project ? "project" : "global";
      log.info(`Checking Forge MCP configuration (${scope} scope)...`);
      log.dim("Configuration only: authentication, executable availability and live database connections are not tested.");
      let found = false;
      let failed = false;
      for (const name of options.agent ? [options.agent] : ALL_AGENT_NAMES) {
        const agent = getAgent(name);
        const path = agent.mcpConfigPath(scope);
        let config: Record<string, unknown>;
        try {
          config = await readJsonConfig(path);
        } catch {
          log.error(`${agent.displayName}: config invalid or unreadable (${path})`);
          failed = true;
          continue;
        }
        if (Object.keys(config).length === 0) {
          if (options.agent) log.warn(`${agent.displayName}: no config found at ${path}`);
          continue;
        }
        found = true;
        log.info(`${agent.displayName}: ${path}`);
        const servers = config[agent.mcpConfigKey];
        if (servers !== undefined && !isRecord(servers)) {
          log.error("MCP server section must be an object/table.");
          failed = true;
          continue;
        }
        for (const mcp of REQUIRED_MCPS) {
          const entry = isRecord(servers) ? servers[mcp] : undefined;
          const transportPresent = isRecord(entry) && (
            (typeof entry.command === "string" && entry.command.trim().length > 0) ||
            (typeof entry.url === "string" && /^https?:\/\//.test(entry.url))
          );
          if (!transportPresent) {
            log.error(`${mcp}: missing or invalid configuration`);
            failed = true;
          } else if (JSON.stringify(entry).includes("/path/to/your/dbhub.toml")) {
            log.warn(`${mcp}: needs dbhub.toml path filled in`);
            failed = true;
          } else {
            log.success(`${mcp}: configuration present (connection untested)`);
          }
        }
        for (const mcp of Object.keys(FORGE_MCP_SERVERS).filter((mcp) => !REQUIRED_MCPS.includes(mcp))) {
          log.dim(`${mcp}: ${isRecord(servers) && mcp in servers ? "configuration present; connection untested" : "optional, not set"}`);
        }
      }
      if (!found) {
        log.warn("No agent configs found. Run `forge setup` first.");
        failed = true;
      }
      if (failed) throw new Error("MCP configuration check failed. Fix the reported configuration before connecting your agent.");
    });
}
