import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SignalsClient } from "../client.js";
import { toolText } from "./_util.js";

export function registerMaterialTools(server: McpServer, client: SignalsClient) {
  server.tool(
    "list_material_libraries",
    "List all active material libraries in Signals Notebook",
    {},
    async () => {
      const result = await client.listMaterialLibraries();
      return toolText(result);
    },
  );

  server.tool(
    "get_material",
    "Get a material by its MID (Material ID)",
    {
      mid: z.string().describe("Material ID"),
    },
    async ({ mid }) => {
      const result = await client.getMaterial(mid);
      return toolText(result);
    },
  );

  server.tool(
    "get_material_asset",
    "Get a specific asset from a material library",
    {
      libraryName: z.string().describe("Material library name"),
      assetId: z.string().describe("Asset ID"),
    },
    async ({ libraryName, assetId }) => {
      const result = await client.getMaterialAsset(libraryName, assetId);
      return toolText(result);
    },
  );

  server.tool(
    "create_material_asset",
    "Create a new asset (with optional batches) in a material library",
    {
      libraryName: z.string().describe("Material library name"),
      body: z.record(z.unknown()).describe("JSON:API formatted asset creation body"),
    },
    async ({ libraryName, body }) => {
      const result = await client.createMaterialAsset(libraryName, body);
      return toolText(result);
    },
  );

  server.tool(
    "get_material_batches",
    "Get batches for a material asset",
    {
      libraryName: z.string().describe("Material library name"),
      assetId: z.string().describe("Asset ID"),
    },
    async ({ libraryName, assetId }) => {
      const result = await client.getMaterialBatches(libraryName, assetId);
      return toolText(result);
    },
  );

  server.tool(
    "create_material_batch",
    "Create a new batch for an existing material asset",
    {
      libraryName: z.string().describe("Material library name"),
      assetName: z.string().describe("Asset name"),
      body: z.record(z.unknown()).describe("JSON:API formatted batch creation body"),
    },
    async ({ libraryName, assetName, body }) => {
      const result = await client.createMaterialBatch(libraryName, assetName, body);
      return toolText(result);
    },
  );

  server.tool(
    "start_bulk_export",
    "Start a bulk export job for a material library",
    {
      libraryName: z.string().describe("Material library name"),
    },
    async ({ libraryName }) => {
      const result = await client.startBulkExport(libraryName);
      return toolText(result);
    },
  );

  server.tool(
    "get_bulk_export_status",
    "Check the status of a bulk export job",
    {
      reportId: z.string().describe("Bulk export report ID"),
    },
    async ({ reportId }) => {
      const result = await client.getBulkExportStatus(reportId);
      return toolText(result);
    },
  );

  server.tool(
    "start_bulk_import",
    "Start a bulk import job for a material library",
    {
      libraryName: z.string().describe("Material library name"),
      body: z.record(z.unknown()).describe("Import data body"),
      rule: z
        .enum(["TREAT_AS_UNIQUE", "USE_MATCHES", "NO_DUPLICATED"])
        .optional()
        .describe("Duplicate handling rule"),
      importType: z
        .enum(["json", "zip"])
        .optional()
        .describe("Import data format"),
    },
    async ({ libraryName, body, rule, importType }) => {
      const result = await client.startBulkImport(libraryName, body, { rule, importType });
      return toolText(result);
    },
  );

  server.tool(
    "get_bulk_import_status",
    "Check the status of a bulk import job",
    {
      jobId: z.string().describe("Bulk import job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getBulkImportStatus(jobId);
      return toolText(result);
    },
  );
}
