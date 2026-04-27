import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignalsClient, SignalsApiError } from "../src/client.js";

const makeClient = () =>
  new SignalsClient({ apiHost: "https://example.com", apiKey: "test-key" });

describe("SignalsClient", () => {
  describe("buildUrl", () => {
    it("strips trailing slash from host", () => {
      const client = new SignalsClient({
        apiHost: "https://example.com/",
        apiKey: "test",
      });
      const url = client.buildUrl("/entities");
      expect(url).toBe("https://example.com/api/rest/v1.0/entities");
    });

    it("adds base path", () => {
      const client = makeClient();
      const url = client.buildUrl("/entities");
      expect(url).toBe("https://example.com/api/rest/v1.0/entities");
    });

    it("skips undefined params", () => {
      const client = makeClient();
      const url = client.buildUrl("/entities", { foo: undefined });
      expect(url).not.toContain("foo");
    });

    it("includes defined params", () => {
      const client = makeClient();
      const url = client.buildUrl("/entities", { limit: 10 });
      expect(url).toContain("limit=10");
    });
  });

  describe("request", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    it("parses JSON response", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: vi.fn().mockResolvedValue({ data: "test" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const client = makeClient();
      const result = await client.request("GET", "/test");

      expect(result).toEqual({ data: "test" });
    });

    it("throws SignalsApiError on 4xx", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: vi.fn().mockResolvedValue("Not found"),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const client = makeClient();
      await expect(client.request("GET", "/test")).rejects.toThrow(SignalsApiError);
    });

    it("throws SignalsApiError with isRetryable on 5xx", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: vi.fn().mockResolvedValue("Server error"),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const client = makeClient();
      let thrownError: SignalsApiError | null = null;
      try {
        await client.request("GET", "/test");
      } catch (e) {
        thrownError = e as SignalsApiError;
      }
      expect(thrownError).not.toBeNull();
      expect(thrownError!.status).toBe(500);
      expect(thrownError!.isRetryable).toBe(true);
    });

    it("returns text for non-JSON content-type", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "text/plain" }),
        text: vi.fn().mockResolvedValue("plain text"),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const client = makeClient();
      const result = await client.request("GET", "/test");

      expect(result).toBe("plain text");
    });

    it("includes x-api-key header", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: vi.fn().mockResolvedValue({ data: "test" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const client = makeClient();
      await client.request("GET", "/test");

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "test-key",
          }),
        }),
      );
    });
  });
});