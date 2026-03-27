import { describe, expect, it } from "vitest";
import { buildAgentInvocation, buildWorkspaceName } from "../commands/generate.js";

describe("generate command", () => {
  it("builds the codex invocation with the full instruction as one argument", () => {
    const invocation = buildAgentInvocation("codex");

    expect(invocation.cmd).toBe("codex");
    expect(invocation.args).toEqual([
      "exec",
      "--skip-git-repo-check",
      "--full-auto",
      "Read SYSTEM_PROMPT.md and execute the b2dp task. Exit when done.",
    ]);
  });

  it("builds the gemini invocation with the prompt bound to -p", () => {
    const invocation = buildAgentInvocation("gemini");

    expect(invocation.cmd).toBe("gemini");
    expect(invocation.args).toEqual([
      "-p",
      "Read SYSTEM_PROMPT.md and execute the b2dp task. Exit when done.",
      "--yolo",
    ]);
  });

  it("builds a workspace name from the product prompt", () => {
    expect(buildWorkspaceName("Build a platform for a subscription meal-kit service", "abcd1234"))
      .toBe("b2dp-subscription-meal-kit-service-abcd1234");
  });

  it("falls back to a generic workspace name when the prompt is too vague", () => {
    expect(buildWorkspaceName("Build a platform", "abcd1234"))
      .toBe("b2dp-project-abcd1234");
  });
});
