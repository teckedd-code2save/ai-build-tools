import { join } from "node:path";
import { homedir } from "node:os";
import { pathExists } from "../utils/fs.js";

export type AgentName = "antigravity" | "claude" | "vscode" | "gemini" | "codex";

export interface AgentConfig {
  name: AgentName;
  displayName: string;
  skillsDir: (scope: "project" | "global") => string;
  rulesDir: (scope: "project" | "global") => string;
  mcpConfigPath: (scope: "project" | "global") => string;
  mcpConfigKey: string;
  detect: {
    projectPaths: string[];
    globalPaths: string[];
  };
}

const agents: Record<AgentName, AgentConfig> = {
  // Antigravity / Gemini CLI — ~/.gemini/antigravity/
  antigravity: {
    name: "antigravity",
    displayName: "Antigravity (Gemini CLI)",
    skillsDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".gemini", "antigravity", "skills")
        : join(".agent", "skills"),
    rulesDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".gemini", "antigravity", "rules")
        : join(".agent", "rules"),
    mcpConfigPath: (scope) =>
      scope === "global"
        ? join(homedir(), ".gemini", "antigravity", "mcp_config.json")
        : join(".agent", "mcp_config.json"),
    mcpConfigKey: "mcpServers",
    detect: {
      projectPaths: [".agent"],
      globalPaths: [join(homedir(), ".gemini", "antigravity")],
    },
  },

  // Claude Code — ~/.claude/
  claude: {
    name: "claude",
    displayName: "Claude Code",
    skillsDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".claude", "skills")
        : join(".claude", "skills"),
    rulesDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".claude", "rules")
        : join(".claude", "rules"),
    mcpConfigPath: (scope) =>
      scope === "global"
        ? join(homedir(), ".claude.json")
        : join(".mcp.json"),
    mcpConfigKey: "mcpServers",
    detect: {
      projectPaths: [".mcp.json", ".claude"],
      globalPaths: [join(homedir(), ".claude")],
    },
  },

  // VS Code — uses .vscode/ for project-level config
  vscode: {
    name: "vscode",
    displayName: "VS Code (Copilot)",
    skillsDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".vscode", "skills")
        : join(".vscode", "skills"),
    rulesDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".vscode", "rules")
        : join(".vscode", "rules"),
    mcpConfigPath: (scope) =>
      scope === "global"
        ? join(homedir(), ".vscode", "mcp.json")
        : join(".vscode", "mcp.json"),
    mcpConfigKey: "servers",
    detect: {
      projectPaths: [".vscode"],
      globalPaths: [join(homedir(), ".vscode")],
    },
  },

  // Gemini CLI — ~/.gemini/settings.json
  gemini: {
    name: "gemini",
    displayName: "Gemini CLI",
    skillsDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".gemini", "skills")
        : join(".agent", "skills"),
    rulesDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".gemini", "rules")
        : join(".agent", "rules"),
    mcpConfigPath: (scope) =>
      scope === "global"
        ? join(homedir(), ".gemini", "settings.json")
        : join(".agent", "settings.json"),
    mcpConfigKey: "mcpServers",
    detect: {
      projectPaths: [".agent"],
      globalPaths: [join(homedir(), ".gemini", "settings.json")],
    },
  },
  
  // Codex — ~/.codex/config.toml
  codex: {
    name: "codex",
    displayName: "Codex",
    skillsDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".agents", "skills")
        : join(".agents", "skills"),
    rulesDir: (scope) =>
      scope === "global"
        ? join(homedir(), ".agents", "rules")
        : join(".agents", "rules"),
    mcpConfigPath: (scope) =>
      scope === "global"
        ? join(homedir(), ".codex", "config.toml")
        : join(".codex", "config.toml"),
    mcpConfigKey: "mcp_servers",
    detect: {
      projectPaths: [".codex"],
      globalPaths: [join(homedir(), ".codex")],
    },
  },
};

export function getAgent(name: AgentName): AgentConfig {
  return agents[name];
}

export const ALL_AGENT_NAMES = Object.keys(agents) as AgentName[];

export const AGENT_DISPLAY_NAMES: Record<AgentName, string> = {
  antigravity: "Antigravity (Gemini CLI)",
  claude: "Claude Code",
  vscode: "VS Code (Copilot)",
  gemini: "Gemini CLI",
  codex: "Codex",
};

export async function detectAgents(
  scope: "project" | "global"
): Promise<AgentName[]> {
  const detected: AgentName[] = [];
  for (const name of ALL_AGENT_NAMES) {
    const agent = agents[name];
    const paths =
      scope === "project" ? agent.detect.projectPaths : agent.detect.globalPaths;
    for (const p of paths) {
      if (await pathExists(p)) {
        detected.push(name);
        break;
      }
    }
  }
  return detected;
}
