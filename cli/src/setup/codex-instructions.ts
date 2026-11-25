import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { RULE_CONTENT } from "./templates.js";

const START = "<!-- forge:instructions:start -->";
const END = "<!-- forge:instructions:end -->";
async function readOptional(path: string): Promise<string | null> {
  try { return await readFile(path, "utf-8"); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(`Cannot read Codex instructions at ${path}; the file was not changed.`);
  }
}

/** Update only Forge's block, preserving the operator's instructions byte-for-byte. */
export async function writeCodexInstructions(directory: string): Promise<string> {
  const override = join(directory, "AGENTS.override.md");
  const overrideText = await readOptional(override);
  const path = overrideText?.trim() ? override : join(directory, "AGENTS.md");
  const original = (path === override ? overrideText : await readOptional(path)) ?? "";
  const start = original.indexOf(START);
  const end = original.indexOf(END);
  if ((start === -1) !== (end === -1) || (start !== -1 && (end < start || original.indexOf(START, start + START.length) !== -1 || original.indexOf(END, end + END.length) !== -1))) {
    throw new Error(`Invalid Forge instruction markers at ${path}; the file was not changed.`);
  }
  const block = `${START}\n${RULE_CONTENT.replace(/^---\n[\s\S]*?\n---\n*/, "").trim()}\n${END}`;
  const content = start === -1
    ? original + (original ? "\n\n" : "") + block + "\n"
    : original.slice(0, start) + block + original.slice(end + END.length);
  await mkdir(directory, { recursive: true });
  await writeFile(path, content, "utf-8");
  return path;
}
