import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SignalsClient } from "../client.js";

export function registerUserTools(server: McpServer, client: SignalsClient) {
  server.tool(
    "list_users",
    "List users in Signals Notebook with optional search and filters",
    {
      q: z.string().optional().describe("Search query to filter users by name/email"),
      enabled: z.boolean().optional().describe("Filter by enabled/disabled status"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
      limit: z.number().int().min(1).optional().describe("Pagination limit"),
    },
    async (params) => {
      const result = await client.listUsers(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_user",
    "Get a single user by their user ID",
    {
      userId: z.string().describe("User ID"),
    },
    async ({ userId }) => {
      const result = await client.getUser(userId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "create_user",
    "Create a new user in Signals Notebook",
    {
      userName: z.string().describe("Username (typically email)"),
      firstName: z.string().describe("First name"),
      lastName: z.string().describe("Last name"),
      email: z.string().describe("Email address"),
      roleId: z.string().optional().describe("Role ID to assign"),
      additionalAttributes: z.record(z.unknown()).optional().describe("Additional user attributes"),
    },
    async ({ userName, firstName, lastName, email, roleId, additionalAttributes }) => {
      const body: Record<string, unknown> = {
        data: {
          type: "user",
          attributes: {
            userName,
            firstName,
            lastName,
            email,
            ...(additionalAttributes || {}),
          },
          ...(roleId
            ? { relationships: { role: { data: { type: "role", id: roleId } } } }
            : {}),
        },
      };
      const result = await client.createUser(body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "update_user",
    "Update an existing user's attributes",
    {
      userId: z.string().describe("User ID to update"),
      attributes: z.record(z.unknown()).describe("Attributes to update (e.g. firstName, lastName, email)"),
    },
    async ({ userId, attributes }) => {
      const body = {
        data: {
          type: "user",
          attributes,
        },
      };
      const result = await client.updateUser(userId, body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "disable_user",
    "Disable (soft-delete) a user account",
    {
      userId: z.string().describe("User ID to disable"),
    },
    async ({ userId }) => {
      const result = await client.deleteUser(userId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_my_profile",
    "Get the profile of the currently authenticated user, including tenant info and roles",
    {},
    async () => {
      const result = await client.getMyProfile();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
