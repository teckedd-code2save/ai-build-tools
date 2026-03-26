import { Command } from "commander";
import pc from "picocolors";
import { spawn, type ChildProcess } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import readline from "node:readline";
import { log } from "../utils/logger.js";
import { ensureDir } from "../utils/fs.js";

interface GenerateOptions {
  agent: "claude" | "gemini" | "codex";
  deploy?: string;
}

interface AgentInvocation {
  cmd: string;
  args: string[];
}

const PHASE_PATTERNS: Array<{ pattern: RegExp; label: string; emoji: string }> = [
  { pattern: /analyz|understand|reading|planning|architect/i, label: "Analyzing requirements", emoji: "🔍" },
  { pattern: /schema|database|table|model|migration/i, label: "Designing database schema", emoji: "🗄️ " },
  { pattern: /backend|express|api|route|server|prisma/i, label: "Scaffolding backend", emoji: "⚙️ " },
  { pattern: /frontend|next|react|vue|component|tailwind/i, label: "Building frontend", emoji: "🎨" },
  { pattern: /test|spec|jest|vitest|supertest/i, label: "Writing tests", emoji: "🧪" },
  { pattern: /docker|k8s|kubernetes|deploy|infra|terraform/i, label: "Setting up infrastructure", emoji: "🚀" },
  { pattern: /install|npm|yarn|pnpm|package/i, label: "Installing dependencies", emoji: "📦" },
  { pattern: /writing|creating|generating|scaffolding/i, label: "Generating files", emoji: "✍️ " },
  { pattern: /complete|done|finished|success/i, label: "Wrapping up", emoji: "✅" },
];

function renderHeader(runId: string, phase: string, elapsed: string) {
  const width = 64;
  const bar = "─".repeat(width);
  process.stdout.write("\x1b[1A\x1b[2K");
  process.stdout.write("\x1b[1A\x1b[2K");
  process.stdout.write("\x1b[1A\x1b[2K");
  const title = pc.bold(pc.cyan("⚡ b2dp generate")) + pc.dim(` — run ${pc.white(runId)}`);
  const timer = pc.dim(`⏱  ${elapsed}`);
  const status = pc.yellow(phase);
  console.log(title + "  " + timer);
  console.log(pc.dim(bar));
  console.log(status);
}

function formatElapsed(startMs: number): string {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function detectPhase(text: string): { label: string; emoji: string } | null {
  for (const phase of PHASE_PATTERNS) {
    if (phase.pattern.test(text)) return { label: phase.label, emoji: phase.emoji };
  }
  return null;
}

async function showInterruptMenu(
  agentProcess: ChildProcess,
  targetDir: string
): Promise<"continue" | "abort" | "keep"> {
  agentProcess.stdout?.pause();
  agentProcess.stderr?.pause();

  console.log("\n");
  console.log(pc.yellow("⚠  Interrupt received. What do you want to do?\n"));
  console.log(`  ${pc.bold("1")}  Continue running`);
  console.log(`  ${pc.bold("2")}  Stop and keep what's been built so far`);
  console.log(`  ${pc.bold("3")}  Abort and clean up workspace`);
  console.log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(pc.dim("  Choice [1/2/3]: "), (answer) => {
      rl.close();
      const choice = answer.trim();

      if (choice === "2") {
        console.log(`\n${pc.green("✔")} Stopped. Partial build kept at:\n  ${pc.cyan(targetDir)}`);
        agentProcess.kill("SIGTERM");
        resolve("keep");
      } else if (choice === "3") {
        console.log(`\n${pc.red("✖")} Aborting and cleaning up...`);
        agentProcess.kill("SIGTERM");
        resolve("abort");
      } else {
        console.log(`\n${pc.green("✔")} Resuming...\n`);
        agentProcess.stdout?.resume();
        agentProcess.stderr?.resume();
        resolve("continue");
      }
    });
  });
}

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate <prompt>")
    .description("Autonomously generate an application using b2dp orchestrator")
    .option("--agent <agent>", "Which agent to spawn (claude, gemini, codex)", "claude")
    .option("--deploy <target>", "Where to deploy after generation (e.g., vercel)")
    .action(async (prompt: string, options: GenerateOptions) => {
      await generateCommand(prompt, options);
    });
}

export function buildAgentInvocation(agent: GenerateOptions["agent"]): AgentInvocation {
  switch (agent) {
    case "claude":
      return {
        cmd: "npx",
        args: [
          "@anthropic-ai/claude-code",
          "--print",
          "--permission-mode",
          "bypassPermissions",
          "Read SYSTEM_PROMPT.md and execute the b2dp task. Exit when done.",
        ],
      };
    case "gemini":
      return {
        cmd: "gemini",
        args: [
          "-p",
          "Read SYSTEM_PROMPT.md and execute the b2dp task. Exit when done.",
          "--yolo",
        ],
      };
    case "codex":
      return {
        cmd: "codex",
        args: [
          "exec",
          "--skip-git-repo-check",
          "--full-auto",
          "Read SYSTEM_PROMPT.md and execute the b2dp task. Exit when done.",
        ],
      };
    default:
      throw new Error(`Unsupported agent: ${agent satisfies never}`);
  }
}

async function generateCommand(prompt: string, options: GenerateOptions): Promise<void> {
  const runId = randomBytes(4).toString("hex");
  const targetDir = join(process.cwd(), `b2dp-app-${runId}`);
  const startMs = Date.now();

  console.log("");
  console.log("");
  console.log("");

  let currentPhase = `🤖 Spawning ${pc.green(options.agent)} agent...`;
  const updateHeader = () => renderHeader(runId, currentPhase, formatElapsed(startMs));
  updateHeader();

  try {
    await ensureDir(targetDir);
    const systemPrompt = `
# b2dp Orchestrator Task
You are the **Business-to-Data-Platform (b2dp) Orchestrator**. 

## Goal
${prompt}

## Workflow
1. Find and use the **business-to-data-platform** skill to fulfill this goal.
2. You have full shell access and a powerful ecosystem of MCP servers (Datafy, Prisma, Context7, GitHub, etc.).
3. Do NOT exit until the full stack is implemented, connected, and verified.
`;
    await writeFile(join(targetDir, "SYSTEM_PROMPT.md"), systemPrompt, "utf-8");
    currentPhase = `📂 Workspace ready — ${pc.dim(targetDir)}`;
    updateHeader();
  } catch (err) {
    log.error(`Failed to scaffold workspace: ${String(err)}`);
    return;
  }

  const { cmd, args } = buildAgentInvocation(options.agent);
  const agentProcess = spawn(cmd, args, {
    cwd: targetDir,
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
  });

  const headerTick = setInterval(updateHeader, 1000);

  agentProcess.on("error", (err) => {
    clearInterval(headerTick);
    console.log("");
    log.error(`Failed to start ${options.agent}: ${err.message}`);
  });

  let lineBuffer = "";
  const processChunk = (chunk: Buffer) => {
    const text = chunk.toString();
    lineBuffer += text;
    process.stdout.write(pc.dim(text));

    const lines = lineBuffer.split("\n");
    for (const line of lines) {
      const detected = detectPhase(line);
      if (detected) {
        currentPhase = `${detected.emoji} ${detected.label}`;
      }
    }
    lineBuffer = lines[lines.length - 1] ?? "";
  };

  agentProcess.stdout?.on("data", processChunk);
  agentProcess.stderr?.on("data", processChunk);

  let interrupted = false;
  process.on("SIGINT", async () => {
    if (interrupted) return;
    interrupted = true;
    clearInterval(headerTick);

    const choice = await showInterruptMenu(agentProcess, targetDir);

    if (choice === "continue") {
      interrupted = false;
      const resumedTick = setInterval(updateHeader, 1000);
      agentProcess.on("close", () => clearInterval(resumedTick));
    } else {
      process.exit(choice === "abort" ? 1 : 0);
    }
  });

  agentProcess.on("close", async (code) => {
    clearInterval(headerTick);

    if (code !== 0 && !interrupted) {
      console.log("");
      log.error(`Agent exited with code ${code}.`);
      return;
    }

    console.log("");
    console.log(pc.dim("─".repeat(64)));
    log.success(pc.bold("Generation complete!"));
    log.info(`📂 Output: ${pc.cyan(targetDir)}`);
    log.info(`⏱  Total time: ${pc.white(formatElapsed(startMs))}`);

    if (options.deploy === "vercel") {
      log.blank();
      log.info("🚀 Deploying to Vercel...");

      const deployProcess = spawn("npx", ["vercel", "deploy", "--prod", "--yes"], {
        cwd: targetDir,
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });

      deployProcess.stdout?.on("data", (chunk: Buffer) => {
        process.stdout.write(chunk);
      });
      deployProcess.stderr?.on("data", (chunk: Buffer) => {
        process.stderr.write(chunk);
      });

      deployProcess.on("close", (deployCode) => {
        if (deployCode === 0) {
          log.success("Deployed successfully!");
        } else {
          log.error("Deployment failed.");
        }
      });
    } else if (options.deploy) {
      log.warn(`Unknown deployment target: ${options.deploy}`);
    }
  });
}
