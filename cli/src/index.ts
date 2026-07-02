import { Command } from "commander";
import figlet from "figlet";
import pc from "picocolors";

import { VERSION } from "./constants.js";
import { registerSetupCommand } from "./commands/setup.js";
import { registerCheckCommand } from "./commands/check.js";
import { registerSkillsCommand } from "./commands/skills.js";
import { registerGenerateCommand } from "./commands/generate.js";

function printBanner(): void {
  const banner = figlet.textSync("forge", {
    font: "Small",
    horizontalLayout: "default",
  });
  console.log(pc.cyan(banner));
  console.log(
    pc.dim(
      "  Forge Orchestrator CLI — skill setup in one command\n"
    )
  );
}

const program = new Command();

printBanner();

program
  .name("forge")
  .description(
    "Set up the Forge skill ecosystem for your AI coding agent"
  )
  .version(VERSION, "-v, --version", "Output the current version");

registerSetupCommand(program);
registerCheckCommand(program);
registerSkillsCommand(program);
registerGenerateCommand(program);

program.parse(process.argv);
