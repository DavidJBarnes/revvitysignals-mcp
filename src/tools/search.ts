import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SignalsClient } from "../client.js";
import { toolText } from "./_util.js";

export function registerSearchTools(server: McpServer, client: SignalsClient) {
  server.tool(
    "search_entities",
    `Search for entities in Signals Notebook using the query DSL. Supports operators: $match (keyword/text matching), $and/$or (boolean logic), $range (date/number ranges). Example query: {"query":{"$and":[{"$match":{"field":"type","value":"experiment","mode":"keyword"}},{"$match":{"field":"name","value":"my experiment","mode":"keyword"}}]},"options":{"sort":{"modifiedAt":"desc"}}}`,
    {
      query: z
        .record(z.unknown())
        .describe(
          'Search query object. Use $match for field matching, $and/$or for boolean logic, $range for ranges. Example: {"$match":{"field":"name","value":"test","mode":"keyword"}}',
        ),
      options: z
        .record(z.unknown())
        .optional()
        .describe(
          'Search options (sort, etc.). Example: {"sort":{"modifiedAt":"desc"}}',
        ),
      source: z
        .enum(["SN", "CONNECTED", "IVT", "CHEMICALS"])
        .optional()
        .describe(
          "Data source: SN (Signals Notebook), CONNECTED (Connected Archive), IVT (Inventory), CHEMICALS (Chemical Drawings)",
        ),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Pagination limit (max 100, default 10)"),
    },
    async ({ query, options, source, offset, limit }) => {
      const body: Record<string, unknown> = { query };
      if (options) body.options = options;
      const result = await client.searchEntities(body, { source, offset, limit });
      return toolText(result);
    },
  );
}
