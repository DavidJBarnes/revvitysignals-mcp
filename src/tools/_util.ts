import { SignalsApiError } from "../client.js";

export type McpToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export function toolText(data: unknown): McpToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function runTool<P>(
  fn: (params: P) => Promise<McpToolResult>,
): (params: P) => Promise<McpToolResult> {
  return async (params: P) => {
    try {
      return await fn(params);
    } catch (err) {
      if (err instanceof SignalsApiError) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Signals API error ${err.status} ${err.statusText}: ${err.body}`,
            },
          ],
        };
      }
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }],
      };
    }
  };
}