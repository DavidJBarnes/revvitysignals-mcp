import { describe, it, expect, vi } from "vitest";
import { toolText, runTool } from "../src/tools/_util.js";
import { SignalsApiError } from "../src/client.js";

describe("toolText", () => {
  it("wraps object in MCP response format", () => {
    const result = toolText({ foo: "bar" });
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ foo: "bar" });
  });

  it("handles string response", () => {
    const result = toolText("hello");
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toBe("hello");
  });

  it("handles null", () => {
    const result = toolText(null);
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toBeNull();
  });
});

describe("runTool", () => {
  it("returns result on success", async () => {
    const handler = runTool(async () => ({ content: [{ type: "text", text: "ok" }] }));
    const result = await handler({});
    expect(result).toEqual({ content: [{ type: "text", text: "ok" }] });
  });

  it("catches SignalsApiError and returns error response", async () => {
    const error = new SignalsApiError(404, "Not Found", "Entity not found");
    const handler = runTool(async () => {
      throw error;
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Signals API error 404");
  });

  it("catches generic Error and returns error response", async () => {
    const handler = runTool(async () => {
      throw new Error("Something went wrong");
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error: Something went wrong");
  });
});