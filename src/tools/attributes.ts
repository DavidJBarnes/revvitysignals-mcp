import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SignalsClient } from "../client.js";

export function registerAttributeTools(server: McpServer, client: SignalsClient) {
  server.tool(
    "list_attributes",
    "List all attributes defined in Signals Notebook",
    {
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
      limit: z.number().int().min(1).optional().describe("Pagination limit"),
    },
    async (params) => {
      const result = await client.listAttributes(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_attribute",
    "Get a single attribute by ID",
    {
      attrId: z.string().describe("Attribute ID (e.g. attribute:123)"),
    },
    async ({ attrId }) => {
      const result = await client.getAttribute(attrId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "create_attribute",
    "Create a new attribute definition",
    {
      name: z.string().describe("Attribute name"),
      type: z.string().describe("Attribute data type"),
      additionalAttributes: z.record(z.unknown()).optional().describe("Additional attribute properties"),
    },
    async ({ name, type, additionalAttributes }) => {
      const body = {
        data: {
          type: "attribute",
          attributes: {
            name,
            type,
            ...(additionalAttributes || {}),
          },
        },
      };
      const result = await client.createAttribute(body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "update_attribute",
    "Update an existing attribute",
    {
      attrId: z.string().describe("Attribute ID"),
      attributes: z.record(z.unknown()).describe("Attributes to update"),
    },
    async ({ attrId, attributes }) => {
      const body = {
        data: {
          type: "attribute",
          attributes,
        },
      };
      const result = await client.updateAttribute(attrId, body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_attribute_options",
    "Get the options/choices for a list-type attribute",
    {
      attrId: z.string().describe("Attribute ID"),
    },
    async ({ attrId }) => {
      const result = await client.getAttributeOptions(attrId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "add_attribute_option",
    "Add an option to a list-type attribute",
    {
      attrId: z.string().describe("Attribute ID"),
      value: z.string().describe("Option value to add"),
    },
    async ({ attrId, value }) => {
      const body = {
        data: {
          type: "option",
          attributes: { value },
        },
      };
      const result = await client.addAttributeOption(attrId, body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
