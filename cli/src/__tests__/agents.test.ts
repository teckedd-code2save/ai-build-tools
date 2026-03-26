import { describe, it, expect, vi } from "vitest";
import { getAgent, detectAgents, ALL_AGENT_NAMES } from "../setup/agents.js";
import { pathExists } from "../utils/fs.js";

vi.mock("../utils/fs.js", () => ({
  pathExists: vi.fn(),
}));

describe("agents.ts", () => {
  it("should return valid agent config for all registered agents", () => {
    for (const name of ALL_AGENT_NAMES) {
      const agent = getAgent(name);
      expect(agent).toBeDefined();
      expect(agent.name).toBe(name);
      expect(typeof agent.skillsDir("global")).toBe("string");
    }
  });

  describe("detectAgents", () => {
    it("should detect agents based on path existence", async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true); // first check
      vi.mocked(pathExists).mockResolvedValue(false); // others

      const detected = await detectAgents("global");
      expect(detected.length).toBeGreaterThan(0);
      expect(detected[0]).toBe(ALL_AGENT_NAMES[0]);
    });

    it("should return empty array if no agents detected", async () => {
      vi.mocked(pathExists).mockResolvedValue(false);
      const detected = await detectAgents("project");
      expect(detected).toEqual([]);
    });
  });
});
