import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SignalsClient } from "../client.js";
import { toolText } from "./_util.js";

const ENTITY_TYPES = [
  "journal",
  "experiment",
  "text",
  "chemicalDrawing",
  "grid",
  "asset",
  "bioSequence",
  "uploadedResource",
  "imageResource",
  "viewonly",
  "excel",
  "sample",
  "samplesContainer",
  "presentation",
  "spotfiredxp",
  "linkedTaskContainer",
  "task",
  "plateContainer",
  "materialsTable",
  "paraexp",
  "parasubexp",
  "paragrid",
  "paraLayout",
  "ado",
  "request",
  "taskContainer",
] as const;

const KNOWN_ENTITY_ATTRIBUTES: Record<string, z.ZodType> = {
  description: z.string(),
  status: z.string(),
  owner: z.string(),
  createdAt: z.string(),
  modifiedAt: z.string(),
};

export function registerEntityTools(server: McpServer, client: SignalsClient) {
  server.tool(
    "list_entities",
    "List entities in Signals Notebook with optional filtering by type, ownership, status, and date range",
    {
      includeTypes: z
        .string()
        .optional()
        .describe(
          `Comma-separated entity types to include: ${ENTITY_TYPES.join(", ")}`,
        ),
      excludeTypes: z
        .string()
        .optional()
        .describe("Comma-separated entity types to exclude"),
      includeOptions: z
        .string()
        .optional()
        .describe(
          "Comma-separated options: mine, other, shared, trashed, untrashed, trashedAncestor, starred, unstarred, template, nontemplate, systemTemplate, nonSystemTemplate",
        ),
      start: z
        .string()
        .optional()
        .describe("ISO datetime — only entities modified after this date"),
      end: z
        .string()
        .optional()
        .describe("ISO datetime — only entities modified before this date"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Pagination limit (max 100)"),
    },
    async (params) => {
      const result = await client.listEntities(params);
      return toolText(result);
    },
  );

  server.tool(
    "get_entity",
    "Get a single entity by its EID (Entity ID)",
    {
      eid: z.string().describe("Entity ID (e.g. experiment:uuid)"),
    },
    async ({ eid }) => {
      const result = await client.getEntity(eid);
      return toolText(result);
    },
  );

  server.tool(
    "create_entity",
    "Create a new entity (experiment, notebook, request, ADO, etc.) in Signals Notebook",
    {
      type: z.string().describe(`Entity type: ${ENTITY_TYPES.join(", ")}`),
      name: z.string().describe("Name of the entity"),
      description: z.string().optional().describe("Description of the entity"),
      templateEid: z
        .string()
        .optional()
        .describe("EID of the template to create from"),
      ancestorEid: z
        .string()
        .optional()
        .describe("EID of the parent container (e.g. notebook EID for an experiment)"),
      additionalAttributes: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe("Additional attributes as key-value pairs (known: description, status, owner, createdAt, modifiedAt)"),
      digest: z.string().optional().describe("Optimistic locking digest"),
      force: z.boolean().optional().describe("Skip digest check"),
    },
    async ({ type, name, description, templateEid, ancestorEid, additionalAttributes, digest, force }) => {
      const body: Record<string, unknown> = {
        data: {
          type: "entity",
          attributes: {
            type,
            name,
            ...(description ? { description } : {}),
            ...(additionalAttributes || {}),
          },
          relationships: {
            ...(templateEid
              ? { template: { data: { type: "entity", id: templateEid } } }
              : {}),
            ...(ancestorEid
              ? { ancestors: { data: [{ type: "entity", id: ancestorEid }] } }
              : {}),
          },
        },
      };
      const result = await client.createEntity(body, { digest, force });
      return toolText(result);
    },
  );

  server.tool(
    "delete_entity",
    "Delete (trash) an entity by its EID",
    {
      eid: z.string().describe("Entity ID to delete"),
      digest: z.string().optional().describe("Optimistic locking digest"),
      force: z.boolean().optional().describe("Skip digest check"),
    },
    async ({ eid, digest, force }) => {
      const result = await client.deleteEntity(eid, { digest, force });
      return toolText(result);
    },
  );

  server.tool(
    "get_entity_children",
    "Get children of a container entity (e.g. experiments in a notebook)",
    {
      eid: z.string().describe("Parent entity EID"),
      order: z
        .string()
        .optional()
        .describe('Ordering (e.g. "layout")'),
    },
    async ({ eid, order }) => {
      const result = await client.getEntityChildren(eid, { order });
      return toolText(result);
    },
  );

  server.tool(
    "get_entity_properties",
    "Get properties/metadata of an entity",
    {
      eid: z.string().describe("Entity ID"),
    },
    async ({ eid }) => {
      const result = await client.getEntityProperties(eid);
      return toolText(result);
    },
  );

  server.tool(
    "update_entity_properties",
    "Update properties of an entity",
    {
      eid: z.string().describe("Entity ID"),
      properties: z.record(z.unknown()).describe("Properties to update as key-value pairs"),
      digest: z.string().optional().describe("Optimistic locking digest"),
      force: z.boolean().optional().describe("Skip digest check"),
    },
    async ({ eid, properties, digest, force }) => {
      const body = {
        data: {
          type: "property",
          attributes: properties,
        },
      };
      const result = await client.updateEntityProperties(eid, body, { digest, force });
      return toolText(result);
    },
  );

  server.tool(
    "export_entity",
    "Export entity content (e.g. table as JSON or CSV)",
    {
      eid: z.string().describe("Entity ID to export"),
      format: z
        .enum(["json", "csv"])
        .optional()
        .describe("Export format"),
    },
    async ({ eid, format }) => {
      const result = await client.exportEntity(eid, format);
      const text =
        typeof result === "string" ? result : JSON.stringify(result, null, 2);
      return { content: [{ type: "text", text }] };
    },
  );

  server.tool(
    "get_template_fields",
    "Get the fields defined on a template, including which are required",
    {
      eid: z.string().describe("Template entity EID"),
    },
    async ({ eid }) => {
      const result = await client.getTemplateFields(eid);
      return toolText(result);
    },
  );
}
