import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

// Exercise the bundled npm entry point, with no real agents, MCPs or cloud CLIs.
const cli = resolve(dirname(fileURLToPath(import.meta.url)), "../../dist/index.js");
const fixtures: string[] = [];
async function fixture() {
  const cwd = await mkdtemp(join(tmpdir(), "forge-cli-"));
  fixtures.push(cwd);
  const bin = join(cwd, "bin");
  await mkdir(bin);
  return { cwd, bin, env: { PATH: bin, NO_COLOR: "1", TERM: "dumb" } };
}
async function fake(bin: string, name: string, body: string) {
  const path = join(bin, name);
  await writeFile(path, `#!${process.execPath}\n${body}\n`);
  await chmod(path, 0o755);
}
function run(f: Awaited<ReturnType<typeof fixture>>, args: string[]) {
  const r = spawnSync(process.execPath, [cli, ...args], { cwd: f.cwd, env: f.env, encoding: "utf-8", timeout: 15000 });
  expect(r.error).toBeUndefined();
  return { code: r.status, output: r.stdout + r.stderr };
}
const setup = ["setup", "--codex", "--project", "--yes"];
const check = ["check", "--agent", "codex", "--project"];
const generate = ["generate", "fixture app", "--agent", "codex"];
async function workspace(f: Awaited<ReturnType<typeof fixture>>) {
  return join(f.cwd, (await readdir(f.cwd)).find((name) => name.startsWith("forge-"))!);
}
afterEach(async () => { await Promise.all(fixtures.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });

describe("CLI entry point", () => {
  it("installs full skills and heals a partial older installation without deleting local additions", async () => {
    const f = await fixture();
    expect(run(f, setup).code).toBe(0);
    const ref = join(f.cwd, ".agents/skills/ship-to-vps/references/shippability-contract.md");
    const design = join(f.cwd, ".agents/skills/frontend-design-review/references/quick-checklist.md");
    expect((await readFile(ref, "utf-8")).length).toBeGreaterThan(100);
    expect((await readFile(design, "utf-8")).length).toBeGreaterThan(100);
    const gc = await readFile(join(f.cwd, ".agents/skills/forge/references/groundcontrol.md"), "utf-8");
    expect(gc).toContain("deployment.create_options");
    expect(gc).toContain("older server");
    const conversation = await readFile(join(f.cwd, ".agents/skills/forge/references/build-conversation.md"), "utf-8");
    expect(conversation).toContain("Stage exit evidence");
    const rules = await readFile(join(f.cwd, "AGENTS.md"), "utf-8");
    expect(rules).not.toContain("Always use Datafy");
    expect(rules).not.toContain("Required MCPs");
    expect(rules).toContain("Datafy is optional");
    expect(rules).toContain("system-design breakdown");
    expect(rules).toContain("Live checks");
    expect(rules).toContain("Vercel or GC");
    expect(await readFile(join(f.cwd, ".agents/skills/forge/references/deployment-choice.md"), "utf-8")).toContain("One complete deployment contract");
    expect(await readFile(join(f.cwd, ".agents/skills/ship-to-vps/references/vercel.md"), "utf-8")).toContain("real write/read flow");
    expect(await readFile(join(f.cwd, ".agents/skills/forge/SKILL.md"), "utf-8")).not.toContain("~/.claude/skills/");
    await rm(ref);
    const extra = join(f.cwd, ".agents/skills/ship-to-vps/local-note.txt");
    await writeFile(extra, "keep my note");
    expect(run(f, setup).code).toBe(0);
    expect((await readFile(ref, "utf-8")).length).toBeGreaterThan(100);
    expect(await readFile(extra, "utf-8")).toBe("keep my note");
  });
  it.each(["toml", "json"])("preserves invalid %s exactly without leaking parser excerpts or claiming success", async (format) => {
    const f = await fixture();
    await mkdir(join(f.cwd, ".codex"));
    const path = join(f.cwd, format === "toml" ? ".codex/config.toml" : ".mcp.json");
    const original = format === "toml" ? 'model = "unfinished-synthetic-secret\n' : '{"token":"synthetic-secret",';
    await writeFile(path, original);
    const r = run(f, ["setup", format === "toml" ? "--codex" : "--claude", "--project", "--yes"]);
    expect(r.code).not.toBe(0);
    expect(r.output).toContain("Invalid configuration");
    expect(r.output).not.toContain("synthetic-secret");
    expect(r.output).not.toContain("setup complete");
    expect(await readFile(path, "utf-8")).toBe(original);
    expect(await readdir(f.cwd)).not.toContain(".agents");
  });
  it("preserves unrelated settings and custom servers in valid config", async () => {
    const f = await fixture();
    await mkdir(join(f.cwd, ".codex"));
    await writeFile(join(f.cwd, ".codex/config.toml"), 'model = "custom-model"\n[mcp_servers.custom]\ncommand = "custom-server"\n');
    expect(run(f, setup).code).toBe(0);
    const raw = await readFile(join(f.cwd, ".codex/config.toml"), "utf-8");
    expect(raw).toContain('model = "custom-model"');
    expect(raw).toContain('command = "custom-server"');
  });
  it("fails on unreadable config and rules write errors instead of reporting success", async () => {
    const f = await fixture();
    await writeFile(join(f.cwd, ".codex"), "not a directory");
    const unreadable = run(f, setup);
    expect(unreadable.code).not.toBe(0);
    expect(unreadable.output).not.toContain("setup complete");
    expect(await readFile(join(f.cwd, ".codex"), "utf-8")).toBe("not a directory");
    await rm(join(f.cwd, ".codex"));
    await mkdir(join(f.cwd, ".agents"));
    await mkdir(join(f.cwd, "AGENTS.md"));
    const blocked = run(f, setup);
    expect(blocked.code).not.toBe(0);
    expect(blocked.output).toContain("Failed to write rule file");
    expect(blocked.output).not.toContain("setup complete");
  });
  it.each(["AGENTS.md", "AGENTS.override.md"])("updates the active Codex %s without losing custom instructions or duplicating the block", async (name) => {
    const f = await fixture();
    const path = join(f.cwd, name);
    await writeFile(path, "# Custom instructions\nKeep the existing conventions.\n");
    expect(run(f, setup).code).toBe(0);
    const first = await readFile(path, "utf-8");
    expect(first).toMatch(/^# Custom instructions\nKeep the existing conventions.\n/);
    expect(first).toContain("forge:instructions:start");
    expect(first).toContain("GroundControl");
    expect(run(f, setup).code).toBe(0);
    expect(await readFile(path, "utf-8")).toBe(first);
  });
  it("fails config checks for empty projects, placeholders and invalid server sections", async () => {
    const f = await fixture();
    expect(run(f, check).code).not.toBe(0);
    expect(run(f, setup).code).toBe(0);
    const placeholder = run(f, check);
    expect(placeholder.code).not.toBe(0);
    expect(placeholder.output).toContain("needs dbhub.toml path");
    await writeFile(join(f.cwd, ".codex/config.toml"), 'mcp_servers = "wrong-shape"\n');
    const malformed = run(f, check);
    expect(malformed.code).not.toBe(0);
    expect(malformed.output).toContain("must be an object/table");
  });
  it("labels valid config as untested and can check Codex alone", async () => {
    const f = await fixture();
    expect(run(f, setup).code).toBe(0);
    const path = join(f.cwd, ".codex/config.toml");
    await writeFile(path, (await readFile(path, "utf-8")).replace("/path/to/your/dbhub.toml", "/fixture/dbhub.toml"));
    const r = run(f, check);
    expect(r.code).toBe(0);
    expect(r.output).toContain("connection untested");
    expect(r.output).not.toContain("Claude");
  });
  it.each([23, 0])("never deploys when an agent exits %s with no app", async (code) => {
    const f = await fixture();
    await fake(f.bin, "codex", `process.exit(${code});`);
    await fake(f.bin, "npx", 'require("node:fs").writeFileSync("DEPLOY_WAS_CALLED", "bad");');
    const r = run(f, [...generate, "--deploy", "vercel"]);
    expect(r.code).not.toBe(0);
    expect(r.output).not.toContain("Generation complete");
    expect(await readdir(await workspace(f))).not.toContain("DEPLOY_WAS_CALLED");
  });
  it("does not deploy when the only output is a build-stage note", async () => {
    const f = await fixture();
    await fake(f.bin, "codex", 'const fs = require("node:fs"); fs.mkdirSync(".forge"); fs.writeFileSync(".forge/build-status.md", "Design complete; app not built.");');
    await fake(f.bin, "npx", 'require("node:fs").writeFileSync("DEPLOY_WAS_CALLED", "bad");');
    expect(run(f, [...generate, "--deploy", "vercel"]).code).not.toBe(0);
    expect(await readdir(await workspace(f))).not.toContain("DEPLOY_WAS_CALLED");
  });
  it("fails if the agent is missing and rejects unknown targets before creating a workspace", async () => {
    const f = await fixture();
    expect(run(f, [...generate, "--deploy", "unknown"]).code).not.toBe(0);
    expect(await readdir(f.cwd)).toEqual(["bin"]);
    const r = run(f, generate);
    expect(r.code).not.toBe(0);
    expect(r.output).toContain("Failed to start codex");
  });
  it("distinguishes agent completion from app readiness and propagates deployment failure", async () => {
    const f = await fixture();
    await fake(f.bin, "codex", 'require("node:fs").writeFileSync("app.js", "// fixture");');
    const r = run(f, generate);
    expect(r.code).toBe(0);
    expect(r.output).toContain("not been independently verified");
    await fake(f.bin, "npx", "process.exit(42);");
    const failed = run(f, [...generate, "--deploy", "vercel"]);
    expect(failed.code).not.toBe(0);
    expect(failed.output).toContain("deployment failed");
    expect(failed.output).not.toContain("successful deployment");
  });
  it("never deploys after cancellation even if the stopped agent exits zero", async () => {
    const f = await fixture();
    await fake(f.bin, "codex", 'require("node:fs").writeFileSync("app.js", "fixture"); process.on("SIGTERM", () => process.exit(0)); console.log("FIXTURE_READY"); setInterval(() => {}, 100);');
    await fake(f.bin, "npx", 'require("node:fs").writeFileSync("DEPLOY_WAS_CALLED", "bad");');
    const child = spawn(process.execPath, [cli, ...generate, "--deploy", "vercel"], { cwd: f.cwd, env: f.env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let sent = false;
    const code = await new Promise<number | null>((resolve, reject) => {
      const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("Cancellation fixture timed out")); }, 10000);
      child.stdout.on("data", (chunk) => {
        output += chunk.toString();
        if (!sent && output.includes("FIXTURE_READY")) { sent = true; child.kill("SIGINT"); }
      });
      child.stderr.on("data", (chunk) => { output += chunk.toString(); });
      child.on("error", (error) => { clearTimeout(timer); reject(error); });
      child.on("close", (code) => { clearTimeout(timer); resolve(code); });
    });
    expect(code).toBe(130);
    expect(output).toContain("partial workspace kept");
    expect(await readdir(await workspace(f))).not.toContain("DEPLOY_WAS_CALLED");
  });
});
