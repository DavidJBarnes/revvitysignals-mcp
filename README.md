# Revvity Signals Notebook MCP Server

An MCP (Model Context Protocol) server that provides AI agents with direct access to the [Revvity Signals Notebook](https://revvitysignals.com/products/research/signals-notebook-eln) REST API. This allows LLM-powered tools to search experiments, manage entities, work with materials, handle user administration, and more — all through natural language.

## What It Does

This server exposes **48 tools** covering the full Signals Notebook REST API v1.0:

| Category | Tools | Examples |
|----------|-------|---------|
| **Entities** | 9 | List/create/delete experiments, notebooks, requests; get children, properties, export |
| **Search** | 1 | Full query DSL with `$match`, `$and`, `$or`, `$range` operators |
| **Users** | 6 | List, create, update, disable users; get current profile |
| **Groups & Roles** | 10 | CRUD groups, manage membership, list roles and privileges |
| **Materials** | 10 | Browse libraries, manage assets/batches, bulk import/export |
| **Attributes** | 6 | Manage attribute definitions and list options |
| **Tables & Stoichiometry** | 6 | Read/update Advanced Data Tables, stoichiometry grids |

## Prerequisites

- Node.js 18+
- A Revvity Signals Notebook tenant with API access
- An API key (from Configuration > System Settings > API Key)

## Build

```bash
git clone <this-repo>
cd revvitysignals-mcp
npm install
npm run build
```

## Configuration

The server requires two environment variables:

| Variable | Description |
|----------|-------------|
| `SIGNALS_API_HOST` | Your tenant URL, e.g. `https://yourcompany.signalsnotebook.com` |
| `SIGNALS_API_KEY` | API key from Configuration > System Settings > API Key |

---

## Installation by Agent

### Claude Code

Add to `~/.claude/mcp.json` (global) or `.mcp.json` (project-local):

```json
{
  "mcpServers": {
    "revvitysignals": {
      "command": "node",
      "args": ["/absolute/path/to/revvitysignals-mcp/dist/index.js"],
      "env": {
        "SIGNALS_API_HOST": "https://yourcompany.signalsnotebook.com",
        "SIGNALS_API_KEY": "your-api-key"
      }
    }
  }
}
```

Or via CLI:

```bash
claude mcp add revvitysignals -- node /absolute/path/to/revvitysignals-mcp/dist/index.js
```

### Claude Desktop

Edit the config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "revvitysignals": {
      "command": "node",
      "args": ["/absolute/path/to/revvitysignals-mcp/dist/index.js"],
      "env": {
        "SIGNALS_API_HOST": "https://yourcompany.signalsnotebook.com",
        "SIGNALS_API_KEY": "your-api-key"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "revvitysignals": {
      "command": "node",
      "args": ["/absolute/path/to/revvitysignals-mcp/dist/index.js"],
      "env": {
        "SIGNALS_API_HOST": "https://yourcompany.signalsnotebook.com",
        "SIGNALS_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "revvitysignals": {
      "command": "node",
      "args": ["/absolute/path/to/revvitysignals-mcp/dist/index.js"],
      "env": {
        "SIGNALS_API_HOST": "https://yourcompany.signalsnotebook.com",
        "SIGNALS_API_KEY": "your-api-key"
      }
    }
  }
}
```

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "revvitysignals": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/revvitysignals-mcp/dist/index.js"],
      "env": {
        "SIGNALS_API_HOST": "https://yourcompany.signalsnotebook.com",
        "SIGNALS_API_KEY": "${input:signals-api-key}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "signals-api-key",
      "description": "Revvity Signals API Key",
      "password": true
    }
  ]
}
```

### Cline

Edit `~/.cline/data/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "revvitysignals": {
      "command": "node",
      "args": ["/absolute/path/to/revvitysignals-mcp/dist/index.js"],
      "env": {
        "SIGNALS_API_HOST": "https://yourcompany.signalsnotebook.com",
        "SIGNALS_API_KEY": "your-api-key"
      },
      "disabled": false
    }
  }
}
```

---

## Tool Reference

### Entities

| Tool | Description |
|------|-------------|
| `list_entities` | List entities with filters (type, ownership, date range, starred/trashed) |
| `get_entity` | Get a single entity by EID |
| `create_entity` | Create an experiment, notebook, request, ADO, etc. |
| `delete_entity` | Trash an entity |
| `get_entity_children` | Get children of a container (e.g. experiments in a notebook) |
| `get_entity_properties` | Get entity metadata/properties |
| `update_entity_properties` | Update entity properties |
| `export_entity` | Export entity content as JSON or CSV |
| `get_template_fields` | Get fields defined on a template |

### Search

| Tool | Description |
|------|-------------|
| `search_entities` | Search with query DSL — supports `$match`, `$and`, `$or`, `$range` |

### Users & Profiles

| Tool | Description |
|------|-------------|
| `list_users` | List users with optional search/filter |
| `get_user` | Get a user by ID |
| `create_user` | Create a new user |
| `update_user` | Update user attributes |
| `disable_user` | Disable a user account |
| `get_my_profile` | Get current authenticated user's profile |

### Groups & Roles

| Tool | Description |
|------|-------------|
| `list_groups` | List all groups |
| `get_group` | Get a group by ID |
| `create_group` | Create a new group |
| `update_group` | Update group attributes |
| `delete_group` | Delete a group |
| `get_group_members` | List members of a group |
| `add_group_member` | Add a user to a group |
| `remove_group_member` | Remove a user from a group |
| `list_roles` | List all roles |
| `get_role` | Get a role with its privileges |

### Materials

| Tool | Description |
|------|-------------|
| `list_material_libraries` | List all material libraries |
| `get_material` | Get a material by MID |
| `get_material_asset` | Get an asset from a library |
| `create_material_asset` | Create an asset with batches |
| `get_material_batches` | Get batches for an asset |
| `create_material_batch` | Create a batch for an asset |
| `start_bulk_export` | Start a material library bulk export |
| `get_bulk_export_status` | Check bulk export job status |
| `start_bulk_import` | Start a material library bulk import |
| `get_bulk_import_status` | Check bulk import job status |

### Attributes

| Tool | Description |
|------|-------------|
| `list_attributes` | List all attribute definitions |
| `get_attribute` | Get an attribute by ID |
| `create_attribute` | Create a new attribute |
| `update_attribute` | Update an attribute |
| `get_attribute_options` | Get options for a list-type attribute |
| `add_attribute_option` | Add an option to a list-type attribute |

### Tables & Stoichiometry

| Tool | Description |
|------|-------------|
| `get_table_data` | Get Advanced Data Table data |
| `get_table_columns` | Get ADT column definitions |
| `get_table_row` | Get a specific ADT row |
| `update_table_data` | Update ADT rows |
| `get_stoichiometry` | Get stoichiometry data (reactants, products, solvents, conditions) |
| `get_stoichiometry_columns` | Get column definitions for a stoichiometry grid |

## API Details

- **Base path**: `{host}/api/rest/v1.0`
- **Auth**: `x-api-key` header
- **Format**: JSON:API (`application/vnd.api+json`)
- **Pagination**: `page[offset]` / `page[limit]` (max 100 per page)
- **Concurrency control**: Optimistic locking via `digest` parameter

## License

MIT

## Other

My voice is my passport, verify me.
