import { describe, it, expect } from "vitest";
import { mergeServerEntry } from "@/setup/mcp-writer.js";

describe("mcp-writer.ts", () => {
  describe("mergeServerEntry", () => {
    it("should merge a new server entry", () => {
      const existing = { mcpServers: {} };
      const entry = { command: "test", args: [] };
      const { config, alreadyExists } = mergeServerEntry(
        existing,
        "mcpServers",
        "test-server",
        entry
      );

      expect(alreadyExists).toBe(false);
      expect(config.mcpServers).toHaveProperty("test-server");
      expect((config.mcpServers as any)["test-server"]).toEqual(entry);
    });

    it("should merge env variables for an existing server if they were missing or different", () => {
      const existing = {
        mcpServers: {
          "test-server": {
            command: "test",
            args: [],
            env: { OLD: "val" }
          }
        }
      };
      const entry = { env: { NEW: "token" } };
      const { config, alreadyExists } = mergeServerEntry(
        existing,
        "mcpServers",
        "test-server",
        entry as any
      );

      expect(alreadyExists).toBe(true);
      const updatedEnv = (config.mcpServers as any)["test-server"].env;
      expect(updatedEnv.NEW).toBe("token");
      expect(updatedEnv.OLD).toBe("val");
    });

    it("should not change config if server exists and env is identical", () => {
      const existing = {
        mcpServers: {
          "test-server": {
            command: "test",
            env: { KEY: "VAL" }
          }
        }
      };
      const entry = { env: { KEY: "VAL" } };
      const { alreadyExists } = mergeServerEntry(
        existing as any,
        "mcpServers",
        "test-server",
        entry as any
      );

      expect(alreadyExists).toBe(true);
    });
  });
});
