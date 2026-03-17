import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname } from "node:path";
import * as toml from "smol-toml";

export async function readJsonConfig(
  filePath: string
): Promise<Record<string, unknown>> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch {
    return {};
  }
  raw = raw.trim();
  if (!raw) return {};

  if (extname(filePath) === ".toml") {
    try {
      return toml.parse(raw) as Record<string, unknown>;
    } catch (err) {
      console.error(`Failed to parse TOML at ${filePath}:`, err);
      return {};
    }
  }

  return JSON.parse(raw) as Record<string, unknown>;
}

export function mergeServerEntry(
  existing: Record<string, unknown>,
  configKey: string,
  serverName: string,
  entry: Record<string, unknown>
): { config: Record<string, unknown>; alreadyExists: boolean } {
  const section =
    (existing[configKey] as Record<string, unknown> | undefined) ?? {};

  // If server already exists, we might still want to merge env vars if they were empty
  if (serverName in section) {
    const existingEntry = section[serverName] as Record<string, any>;
    const newEnv = (entry.env as Record<string, string>) ?? {};
    const existingEnv = (existingEntry.env as Record<string, string>) ?? {};

    let envChanged = false;
    for (const [key, value] of Object.entries(newEnv)) {
      if (value && existingEnv[key] !== value) {
        existingEnv[key] = value;
        envChanged = true;
      }
    }

    if (!envChanged) {
      return { config: existing, alreadyExists: true };
    }

    return {
      config: {
        ...existing,
        [configKey]: {
          ...section,
          [serverName]: { ...existingEntry, env: existingEnv },
        },
      },
      alreadyExists: true,
    };
  }

  return {
    config: {
      ...existing,
      [configKey]: { ...section, [serverName]: entry },
    },
    alreadyExists: false,
  };
}

export async function writeJsonConfig(
  filePath: string,
  config: Record<string, unknown>
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const content =
    extname(filePath) === ".toml"
      ? toml.stringify(config)
      : JSON.stringify(config, null, 2) + "\n";
  await writeFile(filePath, content, "utf-8");
}

/** MCP server entries for the b2dp ecosystem */
export const B2DP_MCP_SERVERS: Record<string, Record<string, unknown>> = {
  datafy: {
    command: "npx",
    args: [
      "@teckedd-code2save/datafy@latest",
      "--config",
      "/path/to/your/dbhub.toml",
      "--transport",
      "stdio",
    ],
  },
  "prisma-mcp-server": {
    command: "npx",
    args: ["-y", "prisma", "mcp"],
  },
  "github-mcp-server": {
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "-e",
      "GITHUB_PERSONAL_ACCESS_TOKEN",
      "ghcr.io/github/github-mcp-server",
    ],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: "",
    },
  },
  context7: {
    command: "npx",
    args: ["-y", "@upstash/context7-mcp"],
  },
  redis: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-redis"],
    env: {
      REDIS_URL: "",
    },
  },
};
