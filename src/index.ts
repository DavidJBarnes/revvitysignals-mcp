#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SignalsClient } from "./client.js";
import { registerEntityTools } from "./tools/entities.js";
import { registerSearchTools } from "./tools/search.js";
import { registerUserTools } from "./tools/users.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerMaterialTools } from "./tools/materials.js";
import { registerAttributeTools } from "./tools/attributes.js";
import { registerTableTools } from "./tools/tables.js";

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const server = new McpServer({
  name: "revvitysignals",
  version: "1.0.0",
  description:
    "MCP server for the Revvity Signals Notebook REST API. Provides tools for managing entities (experiments, notebooks, requests), searching, user/group/role management, materials, attributes, and data tables.",
});

const client = new SignalsClient({
  apiHost: getEnvOrThrow("SIGNALS_API_HOST"),
  apiKey: getEnvOrThrow("SIGNALS_API_KEY"),
});

registerEntityTools(server, client);
registerSearchTools(server, client);
registerUserTools(server, client);
registerGroupTools(server, client);
registerMaterialTools(server, client);
registerAttributeTools(server, client);
registerTableTools(server, client);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Revvity Signals MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
