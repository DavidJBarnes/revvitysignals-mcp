import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SignalsClient } from "../client.js";

export function registerGroupTools(server: McpServer, client: SignalsClient) {
  server.tool(
    "list_groups",
    "List all groups in Signals Notebook",
    {
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
      limit: z.number().int().min(1).optional().describe("Pagination limit"),
    },
    async (params) => {
      const result = await client.listGroups(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_group",
    "Get a single group by its ID",
    {
      groupId: z.string().describe("Group ID"),
    },
    async ({ groupId }) => {
      const result = await client.getGroup(groupId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "create_group",
    "Create a new group",
    {
      name: z.string().describe("Group name"),
      description: z.string().optional().describe("Group description"),
    },
    async ({ name, description }) => {
      const body = {
        data: {
          type: "group",
          attributes: {
            name,
            ...(description ? { description } : {}),
          },
        },
      };
      const result = await client.createGroup(body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "update_group",
    "Update a group's attributes",
    {
      groupId: z.string().describe("Group ID"),
      name: z.string().optional().describe("New group name"),
      description: z.string().optional().describe("New group description"),
      force: z.boolean().optional().describe("Force update"),
    },
    async ({ groupId, name, description, force }) => {
      const body = {
        data: {
          type: "group",
          attributes: {
            ...(name ? { name } : {}),
            ...(description ? { description } : {}),
          },
        },
      };
      const result = await client.updateGroup(groupId, body, force);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "delete_group",
    "Delete a group",
    {
      groupId: z.string().describe("Group ID to delete"),
    },
    async ({ groupId }) => {
      const result = await client.deleteGroup(groupId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_group_members",
    "Get the members of a group",
    {
      groupId: z.string().describe("Group ID"),
    },
    async ({ groupId }) => {
      const result = await client.getGroupMembers(groupId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "add_group_member",
    "Add a user to a group",
    {
      groupId: z.string().describe("Group ID"),
      userId: z.string().describe("User ID to add"),
      force: z.boolean().optional().describe("Force add"),
    },
    async ({ groupId, userId, force }) => {
      const body = {
        data: {
          attributes: {
            userId,
          },
        },
      };
      const result = await client.addGroupMember(groupId, body, force);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "remove_group_member",
    "Remove a user from a group",
    {
      groupId: z.string().describe("Group ID"),
      userId: z.string().describe("User ID to remove"),
    },
    async ({ groupId, userId }) => {
      const result = await client.removeGroupMember(groupId, userId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "list_roles",
    "List all available roles in Signals Notebook",
    {
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
      limit: z.number().int().min(1).optional().describe("Pagination limit"),
    },
    async (params) => {
      const result = await client.listRoles(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_role",
    "Get a single role by ID, including its privileges",
    {
      roleId: z.string().describe("Role ID"),
    },
    async ({ roleId }) => {
      const result = await client.getRole(roleId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
