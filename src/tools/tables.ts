import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SignalsClient } from "../client.js";
import { toolText } from "./_util.js";

export function registerTableTools(server: McpServer, client: SignalsClient) {
  server.tool(
    "get_table_data",
    "Get data from an Advanced Data Table (ADT)",
    {
      eid: z.string().describe("Table entity EID"),
      value: z
        .string()
        .optional()
        .describe('Value representation (e.g. "normalized")'),
    },
    async ({ eid, value }) => {
      const result = await client.getTableData(eid, value);
      return toolText(result);
    },
  );

  server.tool(
    "get_table_columns",
    "Get column definitions for an Advanced Data Table",
    {
      eid: z.string().describe("Table entity EID"),
    },
    async ({ eid }) => {
      const result = await client.getTableColumns(eid);
      return toolText(result);
    },
  );

  server.tool(
    "get_table_row",
    "Get a specific row from an Advanced Data Table",
    {
      eid: z.string().describe("Table entity EID"),
      rowId: z.string().describe("Row ID"),
    },
    async ({ eid, rowId }) => {
      const result = await client.getTableRow(eid, rowId);
      return toolText(result);
    },
  );

  server.tool(
    "update_table_data",
    "Update rows in an Advanced Data Table",
    {
      eid: z.string().describe("Table entity EID"),
      rows: z
        .array(z.record(z.unknown()))
        .describe("Array of row update objects with row IDs and cell values"),
    },
    async ({ eid, rows }) => {
      const body = {
        data: rows.map((row) => ({
          type: "adtRow",
          ...row,
        })),
      };
      const result = await client.updateTableData(eid, body);
      return toolText(result);
    },
  );

  server.tool(
    "get_stoichiometry",
    "Get stoichiometry data for an experiment or chemical drawing",
    {
      eid: z.string().describe("Entity EID (experiment or chemical drawing)"),
      fields: z
        .string()
        .optional()
        .describe(
          'Comma-separated fields to include: reactants, products, solvents, conditions',
        ),
    },
    async ({ eid, fields }) => {
      const result = await client.getStoichiometry(eid, fields);
      return toolText(result);
    },
  );

  server.tool(
    "get_stoichiometry_columns",
    "Get column definitions for a stoichiometry data grid",
    {
      eid: z.string().describe("Entity EID"),
      dataGridKind: z
        .enum(["reactants", "products", "solvents", "conditions"])
        .describe("Which grid to get columns for"),
    },
    async ({ eid, dataGridKind }) => {
      const result = await client.getStoichiometryColumns(eid, dataGridKind);
      return toolText(result);
    },
  );
}
