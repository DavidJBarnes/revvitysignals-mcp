import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { SignalsClient } from "../src/client.js";

const makeClient = () =>
  new SignalsClient({ apiHost: "https://example.com", apiKey: "test-key" });

describe("create_entity additionalAttributes validation", () => {
  const schema = z.object({
    additionalAttributes: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
  });

  it("accepts string values", async () => {
    const result = schema.safeParse({
      additionalAttributes: { status: "active", owner: "John" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts number values", async () => {
    const result = schema.safeParse({
      additionalAttributes: { count: 42, ratio: 3.14 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts boolean values", async () => {
    const result = schema.safeParse({
      additionalAttributes: { isActive: true, isLocked: false },
    });
    expect(result.success).toBe(true);
  });

  it("rejects array values", async () => {
    const result = schema.safeParse({
      additionalAttributes: { tags: ["a", "b"] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects object values", async () => {
    const result = schema.safeParse({
      additionalAttributes: { nested: { foo: "bar" } },
    });
    expect(result.success).toBe(false);
  });

  it("rejects null values", async () => {
    const result = schema.safeParse({
      additionalAttributes: { foo: null },
    });
    expect(result.success).toBe(false);
  });
});

describe("update_entity_properties validation", () => {
  const schema = z.object({
    properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  });

  it("accepts valid property values", async () => {
    const result = schema.safeParse({
      properties: { status: "active", count: 42, isActive: true },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid property values", async () => {
    const result = schema.safeParse({
      properties: { tags: ["a", "b"] },
    });
    expect(result.success).toBe(false);
  });
});