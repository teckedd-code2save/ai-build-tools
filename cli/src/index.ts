import { Command } from "commander";
import figlet from "figlet";
import pc from "picocolors";

import { VERSION } from "./constants.js";
import { registerSetupCommand } from "./commands/setup.js";
import { registerCheckCommand } from "./commands/check.js";
import { registerSkillsCommand } from "./commands/skills.js";

function printBanner(): void {
  const banner = figlet.textSync("b2dp", {
    font: "Small",
    horizontalLayout: "default",
  });
  console.log(pc.cyan(banner));
  console.log(
    pc.dim(
      "  Business-to-Data-Platform Orchestrator CLI — skill setup in one command\n"
    )
  );
}

const program = new Command();

printBanner();

program
  .name("b2dp")
  .description(
    "Set up the business-to-data-platform skill ecosystem for your AI coding agent"
  )
  .version(VERSION, "-v, --version", "Output the current version");

registerSetupCommand(program);
registerCheckCommand(program);
registerSkillsCommand(program);

program.parse(process.argv);
