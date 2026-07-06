import { Command } from "commander";
import pc from "picocolors";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { input } from "@inquirer/prompts";
import { log } from "../utils/logger.js";
import { pathExists } from "../utils/fs.js";

export interface ShipToVpsConfig {
  vps_host: string;
  vps_user: string;
  ssh_key_path: string;
  ghcr_namespace: string;
  infisical_domain: string;
  domain?: string;
}

const CONFIG_DIR = join(homedir(), ".forge");
const CONFIG_PATH = join(CONFIG_DIR, "ship-to-vps-config.json");

const CONFIG_FIELDS: {
  key: keyof ShipToVpsConfig;
  label: string;
  default: string;
  secret: boolean;
}[] = [
  {
    key: "vps_host",
    label: "VPS IP address or hostname",
    default: "<your.vps.ip>",
    secret: false,
  },
  {
    key: "vps_user",
    label: "VPS SSH user",
    default: "root",
    secret: false,
  },
  {
    key: "ssh_key_path",
    label: "SSH private key path",
    default: "~/.ssh/<your-deploy-key>",
    secret: false,
  },
  {
    key: "ghcr_namespace",
    label: "GHCR namespace (GitHub username or org)",
    default: "<your-ghcr-namespace>",
    secret: false,
  },
  {
    key: "infisical_domain",
    label: "Self-hosted Infisical domain",
    default: "<your-infisical-domain>",
    secret: false,
  },
  {
    key: "domain",
    label: "Default domain (optional — set per-project)",
    default: "example.com",
    secret: false,
  },
];

export async function readShipToVpsConfig(): Promise<ShipToVpsConfig | null> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as ShipToVpsConfig;
  } catch {
    return null;
  }
}

export async function writeShipToVpsConfig(
  config: ShipToVpsConfig,
): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function registerConfigureCommand(program: Command): void {
  const configure = program
    .command("configure")
    .description("Configure Forge skill defaults");

  configure
    .command("ship-to-vps")
    .description(
      "Set VPS deployment defaults (VPS host, SSH key, GHCR namespace, Infisical domain)",
    )
    .action(async () => {
      await configureShipToVpsCommand();
    });

  configure
    .command("list")
    .description("Show current configuration")
    .action(async () => {
      await listConfigCommand();
    });
}

async function configureShipToVpsCommand(): Promise<void> {
  const existing = await readShipToVpsConfig();

  log.blank();
  log.info(pc.bold("Configure ship-to-vps defaults"));
  log.info(
    pc.dim(
      "These values will be used as defaults when deploying apps to your VPS.\n",
    ),
  );

  if (existing) {
    log.info(pc.dim("Current config shown as defaults. Press Enter to keep."));
    log.blank();
  }

  const config: ShipToVpsConfig = {} as ShipToVpsConfig;

  for (const field of CONFIG_FIELDS) {
    const currentValue = existing?.[field.key] ?? "";

    const answer = await input({
      message: `${field.label}:`,
      default: currentValue || field.default,
    });

    (config as any)[field.key] = answer;
  }

  await writeShipToVpsConfig(config);

  log.blank();
  log.success(`Configuration saved to ${pc.cyan(CONFIG_PATH)}`);
  log.blank();
  log.info(pc.bold("Summary:"));
  for (const field of CONFIG_FIELDS) {
    const val = (config as any)[field.key];
    log.info(
      `  ${pc.dim(field.label + ":")} ${val === field.default ? pc.yellow(val) : pc.green(val)}`,
    );
  }
  log.blank();
  log.dim(
    `Run ${pc.cyan("forge configure ship-to-vps")} again to update any value.`,
  );
}

async function listConfigCommand(): Promise<void> {
  const config = await readShipToVpsConfig();

  log.blank();
  log.info(pc.bold("Forge Configuration"));
  log.blank();

  if (!config) {
    log.warn(
      "No ship-to-vps configuration found. Run:",
    );
    log.info(pc.cyan("  forge configure ship-to-vps"));
    return;
  }

  log.info(pc.bold("ship-to-vps:"));
  for (const field of CONFIG_FIELDS) {
    const val = (config as any)[field.key];
    const display = val || pc.dim("(not set)");
    log.info(`  ${pc.dim(field.label + ":")} ${display}`);
  }

  log.blank();
  log.dim(`Config file: ${CONFIG_PATH}`);
}
