import { Command } from "commander";
import pc from "picocolors";
import ora from "ora";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { log } from "../utils/logger.js";
import { ensureDir } from "../utils/fs.js";

interface GenerateOptions {
  agent: "claude" | "gemini" | "cursor";
  deploy?: string;
}

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate <prompt>")
    .description("Autonomously generate an application using b2dp orchestrator")
    .option("--agent <agent>", "Which agent to spawn (claude, gemini, cursor)", "claude")
    .option("--deploy <target>", "Where to deploy after generation (e.g., vercel)")
    .action(async (prompt: string, options: GenerateOptions) => {
      await generateCommand(prompt, options);
    });
}

async function generateCommand(prompt: string, options: GenerateOptions): Promise<void> {
  const runId = randomBytes(4).toString("hex");
  const targetDir = join(process.cwd(), `b2dp-app-${runId}`);

  log.info(`🚀 Starting b2dp generate run: ${pc.cyan(runId)}`);
  log.info(`📂 Workspace: ${pc.dim(targetDir)}`);

  const spinner = ora("Scaffolding workspace...").start();
  try {
    await ensureDir(targetDir);
    
    // Write the prompt to a planning document
    const systemPrompt = `
# b2dp Orchestrator Task
You are the **Business-to-Data-Platform (b2dp) Orchestrator**. You are an autonomous AI coding agent with full shell access and a powerful ecosystem of MCP servers.

## Goal
${prompt}

## Mandates & Workflow
1. **Cloud Solution Architect & Infrastructure**: 
   - Design the data model and infrastructure.
   - If you require infrastructure (like PostgreSQL or Redis), write a \`docker-compose.yml\` and actively run \`docker-compose up -d\` using your shell tools to spin it up.
   - IMPORTANT: Leverage the \`datafy\` MCP server. Datafy supports SQL databases (PostgreSQL, MySQL, SQLite, etc.), Redis, and Elasticsearch. Datafy can even CREATE databases if they don't exist. Use it to provision and inspect your data stores.
   - Use the \`prisma-mcp-server\` if using Prisma for ORM.
2. **Database & API Generation**:
   - Create the actual database schemas and migration scripts. Run the necessary shell commands (like \`npx prisma db push\`) to apply them.
   - Generate fully functional backend APIs. DO NOT leave boilerplate.
3. **Frontend Data Consumer**:
   - Build the actual frontend UI components to consume the APIs. 
   - Implement real application logic (e.g., actual stateful "Add to Cart" functionality, functional login forms).
   - DO NOT leave default framework boilerplate.
4. **Context & Tracking**:
   - Use the \`context7\` MCP server to document your progress, architectural decisions, and current state.
5. **Completion Criteria**:
   - You MUST actively verify that your infrastructure is running, your database is connected, your APIs return data, and your frontend builds successfully without TypeScript errors.
   - If you get stuck on infrastructure, prompt for human intervention.
   - Do NOT exit until the full stack is implemented, connected, and verified.
`;
    await writeFile(join(targetDir, "SYSTEM_PROMPT.md"), systemPrompt, "utf-8");
    spinner.succeed("Workspace ready.");
  } catch (err) {
    spinner.fail("Failed to scaffold workspace.");
    log.error(String(err));
    return;
  }

  log.blank();
  log.info(`🤖 Spawning agent: ${pc.green(options.agent)}`);

  // Define the command based on the selected agent
  let cmd = "";
  let args: string[] = [];

  switch (options.agent) {
    case "claude":
      cmd = "npx";
      args = ["@anthropic-ai/claude-code", "--print", "--permission-mode", "bypassPermissions", "Read SYSTEM_PROMPT.md and execute the b2dp task. Exit when done."];
      break;
    case "gemini":
      cmd = "gemini"; // Assuming gemini CLI is installed globally
      args = ["-p", "'Read SYSTEM_PROMPT.md and execute the b2dp task. Exit when done.'", "--yolo"];
      break;
    case "cursor":
      log.error("Cursor does not currently support headless CLI generation.");
      return;
    default:
      log.error(`Unsupported agent: ${options.agent}`);
      return;
  }

  // Execute the Agent
  const agentProcess = spawn(cmd, args, {
    cwd: targetDir,
    stdio: "inherit", // Pipe output directly to user's terminal
    shell: true,
  });

  agentProcess.on("close", async (code) => {
    if (code !== 0) {
      log.error(`Agent exited with code ${code}. Skipping deployment.`);
      return;
    }

    log.success("✅ Agent successfully completed the generation.");

    // Handle Deployment if requested
    if (options.deploy === "vercel") {
      log.blank();
      const deploySpinner = ora("Deploying to Vercel...").start();
      try {
        const deployProcess = spawn("npx", ["vercel", "deploy", "--prod", "--yes"], {
          cwd: targetDir,
          shell: true,
        });

        let output = "";
        deployProcess.stdout.on("data", (data) => (output += data.toString()));
        deployProcess.stderr.on("data", (data) => (output += data.toString()));

        deployProcess.on("close", (deployCode) => {
          if (deployCode === 0) {
            deploySpinner.succeed("Deployed successfully!");
            log.info(pc.blue(output.trim()));
          } else {
            deploySpinner.fail("Deployment failed.");
            log.error(output);
          }
        });
      } catch (err) {
        deploySpinner.fail("Deployment execution failed.");
        log.error(String(err));
      }
    } else if (options.deploy) {
      log.warn(`Unknown deployment target: ${options.deploy}`);
    }
  });
}
