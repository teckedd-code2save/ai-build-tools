import { Command } from "commander";
import pc from "picocolors";
import { spawn } from "node:child_process";
import { readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { randomBytes } from "node:crypto";
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

function slugifyWorkspacePrompt(prompt: string): string {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "app",
    "application",
    "backend",
    "build",
    "create",
    "for",
    "me",
    "platform",
    "system",
    "the",
    "to",
  ]);

  const parts = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((part) => part.length > 0 && !stopWords.has(part));

  const chosen = parts.slice(0, 4);
  return chosen.length > 0 ? chosen.join("-") : "project";
}

export function buildWorkspaceName(prompt: string, runId: string): string {
  return `forge-${slugifyWorkspacePrompt(prompt)}-${runId}`;
}

const BUILD_STAGES = ["Design", "Build & preview", "Verify", "Deliver", "Live checks"] as const;

function renderHeader(
  runId: string,
  agent: GenerateOptions["agent"],
  workspace: string,
  phase: string,
  elapsed: string
) {
  const width = 64;
  const bar = "─".repeat(width);
  process.stdout.write("\x1b[1A\x1b[2K");
  process.stdout.write("\x1b[1A\x1b[2K");
  process.stdout.write("\x1b[1A\x1b[2K");
  process.stdout.write("\x1b[1A\x1b[2K");
  const title = pc.bold(pc.cyan("⚡ forge generate")) + pc.dim(` — run ${pc.white(runId)}`);
  const timer = pc.dim(`⏱  ${elapsed}`);
  const meta =
    pc.dim("agent ") +
    pc.green(agent) +
    pc.dim("  workspace ") +
    pc.white(workspace);
  const status = pc.yellow(phase);
  console.log(title + "  " + timer);
  console.log(meta);
  console.log(pc.dim(bar));
  console.log(status);
}

function formatElapsed(startMs: number): string {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function detectPhase(text: string): { label: string; emoji: string } | null {
  const match = text.match(/\[Forge stage: ([^\]\r\n]+)\]/);
  const stage = BUILD_STAGES.find(stage => stage === match?.[1]);
  return stage ? { label: `${stage} (agent-reported)`, emoji: "•" } : null;
}

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate <prompt>")
    .description("Autonomously generate an application using the Forge orchestrator")
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
          "Read SYSTEM_PROMPT.md and execute the Forge task. Exit when done.",
        ],
      };
    case "gemini":
      return {
        cmd: "gemini",
        args: [
          "-p",
          "Read SYSTEM_PROMPT.md and execute the Forge task. Exit when done.",
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
          "Read SYSTEM_PROMPT.md and execute the Forge task. Exit when done.",
        ],
      };
    default:
      throw new Error(`Unsupported agent: ${agent satisfies never}`);
  }
}

async function generateCommand(prompt: string, options: GenerateOptions): Promise<void> {
  const { cmd, args } = buildAgentInvocation(options.agent);
  if (options.deploy && options.deploy !== "vercel") {
    throw new Error(`Unsupported deployment target: ${options.deploy}`);
  }
  const runId = randomBytes(4).toString("hex");
  const targetDir = join(process.cwd(), buildWorkspaceName(prompt, runId));
  const startMs = Date.now();
  let currentPhase = `Spawning ${options.agent} agent...`;
  const updateHeader = () => {
    if (process.stdout.isTTY) {
      renderHeader(runId, options.agent, basename(targetDir), currentPhase, formatElapsed(startMs));
    }
  };
  if (process.stdout.isTTY) for (let i = 0; i < 4; i++) log.blank();
  log.info(`Workspace: ${targetDir}`);
  log.dim("Ctrl-C stops the agent and keeps the workspace for inspection.");

  await ensureDir(targetDir);
  await writeFile(join(targetDir, "SYSTEM_PROMPT.md"), `
# Forge Orchestrator Task
You are the **Forge Orchestrator**.

## Goal
${prompt}

## Workflow
1. Find and use the **forge** skill to fulfill this goal.
2. Respect explicit stack, framework, cloud, database version, ORM, and UI instructions.
3. Implement all major product surfaces implied by the business.
4. Check which tools and credentials are actually available; never assume a configured MCP server is connected.
5. Implement and verify the full stack. Report executed checks and remaining blockers separately.
6. Prepare deployment configuration, but leave resource creation and deployment to the caller's explicit provisioning step.
7. Start with a concise system-design breakdown: real components, one user request/data flow, local preview and selected delivery route, plus meaningful tradeoffs. Continue authorized work without waiting for routine design approval.
8. At meaningful transitions report [Forge stage: Design], [Forge stage: Build & preview], [Forge stage: Verify], [Forge stage: Deliver] or [Forge stage: Live checks], followed by what works, actual evidence, the next step and any blocker. These are stage reports, not completion claims.
9. This CLI generation run is noninteractive. State assumptions and keep a short .forge/build-status.md so the user can continue the same workspace in their interactive agent. Do not wait on an unanswered question. If a required decision or permission blocks execution, preserve the work and report it; elapsed time is never approval.
`, "utf-8");

  const agentProcess = spawn(cmd, args, {
    cwd: targetDir,
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
  });
  const headerTick = setInterval(updateHeader, 1000);
  let interrupted = false;
  let stopTimer: ReturnType<typeof setTimeout> | undefined;
  const onInterrupt = () => {
    if (interrupted) { agentProcess.kill("SIGKILL"); return; }
    interrupted = true;
    agentProcess.kill("SIGTERM");
    stopTimer = setTimeout(() => agentProcess.kill("SIGKILL"), 5000);
  };
  process.on("SIGINT", onInterrupt);
  let lineBuffer = "";
  const processChunk = (chunk: Buffer) => {
    const text = chunk.toString();
    process.stdout.write(pc.dim(text));
    const lines = (lineBuffer + text).split("\n");
    for (const line of lines) {
      const detected = detectPhase(line);
      if (detected) currentPhase = `${detected.emoji} ${detected.label}`;
    }
    // Bound memory when an agent emits a long line with no newline.
    lineBuffer = (lines.at(-1) ?? "").slice(-4096);
  };
  agentProcess.stdout?.on("data", processChunk);
  agentProcess.stderr?.on("data", processChunk);
  try {
    const result = await new Promise<{ code: number | null; signal: string | null }>((resolve, reject) => {
      agentProcess.once("error", () => reject(new Error(`Failed to start ${options.agent}. Check that it is installed and available.`)));
      agentProcess.once("close", (code, signal) => resolve({ code, signal }));
    });
    if (interrupted || result.signal) {
      process.exitCode = 130;
      throw new Error(`Generation stopped; partial workspace kept at ${targetDir}. No deployment started.`);
    }
    if (result.code !== 0) throw new Error(`Agent exited with code ${result.code}. Workspace kept at ${targetDir}.`);
  } finally {
    clearInterval(headerTick);
    clearTimeout(stopTimer);
    process.removeListener("SIGINT", onInterrupt);
  }

  const files = await readdir(targetDir);
  if (!files.some((file) => !["SYSTEM_PROMPT.md", ".git", ".forge", "AGENTS.md", "README.md"].includes(file))) {
    throw new Error(`Agent exited successfully but produced no application files. Workspace kept at ${targetDir}.`);
  }
  log.info(`Agent finished. Output: ${targetDir}`);
  log.info(`Total time: ${formatElapsed(startMs)}`);
  log.warn("Application checks have not been independently verified by Forge. Review the agent's results before treating the app as ready.");

  if (options.deploy === "vercel") {
    log.info("Deploying to Vercel as requested...");
    const deployProcess = spawn("npx", ["vercel", "deploy", "--prod", "--yes"], {
      cwd: targetDir,
      stdio: "inherit",
      shell: false,
    });
    await new Promise<void>((resolve, reject) => {
      deployProcess.once("error", () => reject(new Error("Could not start Vercel deployment.")));
      deployProcess.once("close", (code, signal) => {
        if (code === 0 && !signal) resolve();
        else reject(new Error(`Vercel deployment failed (exit ${code}, signal ${signal ?? "none"}).`));
      });
    });
    log.success("Vercel reported a successful deployment. Live application checks are still required.");
  }
}
