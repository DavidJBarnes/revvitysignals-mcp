import { describe, it, expect } from "vitest";
import { buildParams } from "../src/client.js";

describe("buildParams", () => {
  it("returns empty object for undefined input", () => {
    const result = buildParams(undefined, [{ key: "foo" }]);
    expect(result).toEqual({});
  });

  it("maps keys to query params", () => {
    const result = buildParams({ foo: "bar" }, [{ key: "foo" }]);
    expect(result).toEqual({ foo: "bar" });
  });

  it("remaps keys when remap is specified", () => {
    const result = buildParams({ offset: 0, limit: 10 }, [
      { key: "offset", remap: "page[offset]" },
      { key: "limit", remap: "page[limit]" },
    ]);
    expect(result).toEqual({ "page[offset]": 0, "page[limit]": 10 });
  });

  it("filters out undefined values", () => {
    const result = buildParams({ foo: "bar", baz: undefined }, [
      { key: "foo" },
      { key: "baz" },
    ]);
    expect(result).toEqual({ foo: "bar" });
  });

  it("handslesPaginationParams interface", () => {
    const params = { offset: 5, limit: 20 };
    const result = buildParams(params, [
      { key: "offset" },
      { key: "limit" },
    ]);
    expect(result).toEqual({ offset: 5, limit: 20 });
  });
});