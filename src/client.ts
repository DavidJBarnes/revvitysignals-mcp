/**
 * Revvity Signals Notebook REST API Client
 *
 * Base path: {host}/api/rest/v1.0
 * Auth: x-api-key header
 * Content-Type: application/vnd.api+json (JSON:API)
 */

export interface SignalsClientConfig {
  apiHost: string;
  apiKey: string;
}

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface JsonApiResponse<T = unknown> {
  data: T;
  links?: {
    self?: string;
    first?: string;
    next?: string;
    prev?: string;
  };
  meta?: Record<string, unknown>;
  included?: unknown[];
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface ParamMapping {
  key: string;
  remap?: string;
}

export function buildParams<T extends object>(
  obj: T | undefined,
  mappings: ParamMapping[],
): QueryParams {
  if (!obj) return {};
  const result: QueryParams = {};
  for (const { key, remap } of mappings) {
    const value = (obj as Record<string, unknown>)[key];
    if (value !== undefined) {
      result[remap ?? key] = value as string | number | boolean | undefined;
    }
  }
  return result;
}

export class SignalsApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
    public isRetryable: boolean = false,
  ) {
    super(`Signals API Error ${status} ${statusText}: ${body}`);
    this.name = "SignalsApiError";
  }
}

export class SignalsClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: SignalsClientConfig) {
    // Strip trailing slash
    const host = config.apiHost.replace(/\/+$/, "");
    this.baseUrl = `${host}/api/rest/v1.0`;
    this.headers = {
      "x-api-key": config.apiKey,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    };
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options: {
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.params);
    const fetchOptions: RequestInit = {
      method,
      headers: { ...this.headers, ...options.headers },
    };

    if (options.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const body = await response.text();
      const isRetryable = response.status >= 500;
      throw new SignalsApiError(response.status, response.statusText, body, isRetryable);
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      contentType.includes("json") ||
      contentType.includes("application/vnd.api+json")
    ) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }

  // --- Entities ---

  async listEntities(params?: {
    includeTypes?: string;
    excludeTypes?: string;
    includeOptions?: string;
    start?: string;
    end?: string;
    offset?: number;
    limit?: number;
  }): Promise<JsonApiResponse> {
    const queryParams = buildParams(
      {
        includeTypes: params?.includeTypes,
        excludeTypes: params?.excludeTypes,
        includeOptions: params?.includeOptions,
        start: params?.start,
        end: params?.end,
        offset: params?.offset,
        limit: params?.limit,
      },
      [
        { key: "includeTypes" },
        { key: "excludeTypes" },
        { key: "includeOptions" },
        { key: "start" },
        { key: "end" },
        { key: "offset", remap: "page[offset]" },
        { key: "limit", remap: "page[limit]" },
      ],
    );
    return this.request("GET", "/entities", { params: queryParams });
  }

  async getEntity(eid: string): Promise<JsonApiResponse> {
    return this.request("GET", `/entities/${encodeURIComponent(eid)}`);
  }

  async createEntity(body: unknown, params?: { digest?: string; force?: boolean }): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [
      { key: "digest" },
      { key: "force" },
    ]);
    return this.request("POST", "/entities", { body, params: queryParams });
  }

  async deleteEntity(eid: string, params?: { digest?: string; force?: boolean }): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [
      { key: "digest" },
      { key: "force" },
    ]);
    return this.request("DELETE", `/entities/${encodeURIComponent(eid)}`, { params: queryParams });
  }

  async getEntityChildren(eid: string, params?: { order?: string }): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [{ key: "order" }]);
    return this.request("GET", `/entities/${encodeURIComponent(eid)}/children`, { params: queryParams });
  }

  async getEntityProperties(eid: string): Promise<JsonApiResponse> {
    return this.request("GET", `/entities/${encodeURIComponent(eid)}/properties`);
  }

  async updateEntityProperties(
    eid: string,
    body: unknown,
    params?: { digest?: string; force?: boolean },
  ): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [
      { key: "digest" },
      { key: "force" },
    ]);
    return this.request("PATCH", `/entities/${encodeURIComponent(eid)}/properties`, {
      body,
      params: queryParams,
    });
  }

  async exportEntity(eid: string, format?: string): Promise<unknown> {
    const queryParams = buildParams({ format }, [{ key: "format" }]);
    return this.request("GET", `/entities/${encodeURIComponent(eid)}/export`, { params: queryParams });
  }

  async getTemplateFields(eid: string): Promise<JsonApiResponse> {
    return this.request("GET", `/entities/templates/${encodeURIComponent(eid)}/fields`);
  }

  // --- Search ---

  async searchEntities(
    query: unknown,
    params?: { source?: string; offset?: number; limit?: number },
  ): Promise<JsonApiResponse> {
    const queryParams = buildParams(
      { source: params?.source, offset: params?.offset, limit: params?.limit },
      [
        { key: "source" },
        { key: "offset", remap: "page[offset]" },
        { key: "limit", remap: "page[limit]" },
      ],
    );
    return this.request("POST", "/entities/search", { body: query, params: queryParams });
  }

  // --- Users ---

  async listUsers(params?: {
    q?: string;
    enabled?: boolean;
    offset?: number;
    limit?: number;
  }): Promise<JsonApiResponse> {
    const queryParams = buildParams(
      { q: params?.q, enabled: params?.enabled, offset: params?.offset, limit: params?.limit },
      [
        { key: "q" },
        { key: "enabled" },
        { key: "offset" },
        { key: "limit" },
      ],
    );
    return this.request("GET", "/users", { params: queryParams });
  }

  async getUser(userId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/users/${encodeURIComponent(userId)}`);
  }

  async createUser(body: unknown): Promise<JsonApiResponse> {
    return this.request("POST", "/users", { body });
  }

  async updateUser(userId: string, body: unknown): Promise<JsonApiResponse> {
    return this.request("PATCH", `/users/${encodeURIComponent(userId)}`, { body });
  }

  async deleteUser(userId: string): Promise<JsonApiResponse> {
    return this.request("DELETE", `/users/${encodeURIComponent(userId)}`);
  }

  // --- Groups ---

  async listGroups(params?: PaginationParams): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [
      { key: "offset" },
      { key: "limit" },
    ]);
    return this.request("GET", "/groups", { params: queryParams });
  }

  async getGroup(groupId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/groups/${encodeURIComponent(groupId)}`);
  }

  async createGroup(body: unknown): Promise<JsonApiResponse> {
    return this.request("POST", "/groups", { body });
  }

  async updateGroup(groupId: string, body: unknown, force?: boolean): Promise<JsonApiResponse> {
    const queryParams = buildParams({ force }, [{ key: "force" }]);
    return this.request("PATCH", `/groups/${encodeURIComponent(groupId)}`, { body, params: queryParams });
  }

  async deleteGroup(groupId: string): Promise<JsonApiResponse> {
    return this.request("DELETE", `/groups/${encodeURIComponent(groupId)}`);
  }

  async getGroupMembers(groupId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/groups/${encodeURIComponent(groupId)}/members`);
  }

  async addGroupMember(groupId: string, body: unknown, force?: boolean): Promise<JsonApiResponse> {
    const queryParams = buildParams({ force }, [{ key: "force" }]);
    return this.request("POST", `/groups/${encodeURIComponent(groupId)}/members`, { body, params: queryParams });
  }

  async removeGroupMember(groupId: string, userId: string): Promise<JsonApiResponse> {
    return this.request(
      "DELETE",
      `/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}`,
    );
  }

  // --- Roles ---

  async listRoles(params?: PaginationParams): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [
      { key: "offset" },
      { key: "limit" },
    ]);
    return this.request("GET", "/roles", { params: queryParams });
  }

  async getRole(roleId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/roles/${encodeURIComponent(roleId)}`);
  }

  // --- Profiles ---

  async getMyProfile(): Promise<JsonApiResponse> {
    return this.request("GET", "/profiles/me");
  }

  // --- Materials ---

  async listMaterialLibraries(): Promise<JsonApiResponse> {
    return this.request("GET", "/materials/libraries");
  }

  async getMaterial(mid: string): Promise<JsonApiResponse> {
    return this.request("GET", `/materials/${encodeURIComponent(mid)}`);
  }

  async getMaterialAsset(libraryName: string, assetId: string): Promise<JsonApiResponse> {
    return this.request(
      "GET",
      `/materials/${encodeURIComponent(libraryName)}/assets/id/${encodeURIComponent(assetId)}`,
    );
  }

  async createMaterialAsset(libraryName: string, body: unknown): Promise<JsonApiResponse> {
    return this.request("POST", `/materials/${encodeURIComponent(libraryName)}/assets`, { body });
  }

  async getMaterialBatches(libraryName: string, assetId: string): Promise<JsonApiResponse> {
    return this.request(
      "GET",
      `/materials/${encodeURIComponent(libraryName)}/assets/${encodeURIComponent(assetId)}/batches`,
    );
  }

  async createMaterialBatch(libraryName: string, assetName: string, body: unknown): Promise<JsonApiResponse> {
    return this.request(
      "POST",
      `/materials/${encodeURIComponent(libraryName)}/assets/${encodeURIComponent(assetName)}/batches`,
      { body },
    );
  }

  async startBulkExport(libraryName: string): Promise<JsonApiResponse> {
    return this.request("POST", `/materials/${encodeURIComponent(libraryName)}/bulkExport`);
  }

  async getBulkExportStatus(reportId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/materials/bulkExport/reports/${encodeURIComponent(reportId)}`);
  }

  async startBulkImport(
    libraryName: string,
    body: unknown,
    params?: { rule?: string; importType?: string },
  ): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [
      { key: "rule" },
      { key: "importType" },
    ]);
    return this.request("POST", `/materials/${encodeURIComponent(libraryName)}/bulkImport`, {
      body,
      params: queryParams,
    });
  }

  async getBulkImportStatus(jobId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/materials/bulkImport/jobs/${encodeURIComponent(jobId)}`);
  }

  // --- Attributes ---

  async listAttributes(params?: PaginationParams): Promise<JsonApiResponse> {
    const queryParams = buildParams(params, [
      { key: "offset" },
      { key: "limit" },
    ]);
    return this.request("GET", "/attributes", { params: queryParams });
  }

  async getAttribute(attrId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/attributes/${encodeURIComponent(attrId)}`);
  }

  async createAttribute(body: unknown): Promise<JsonApiResponse> {
    return this.request("POST", "/attributes", { body });
  }

  async updateAttribute(attrId: string, body: unknown): Promise<JsonApiResponse> {
    return this.request("PATCH", `/attributes/${encodeURIComponent(attrId)}`, { body });
  }

  async getAttributeOptions(attrId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/attributes/${encodeURIComponent(attrId)}/options`);
  }

  async addAttributeOption(attrId: string, body: unknown): Promise<JsonApiResponse> {
    return this.request("POST", `/attributes/${encodeURIComponent(attrId)}/options`, { body });
  }

  async deleteAttributeOption(attrId: string, body: unknown): Promise<JsonApiResponse> {
    return this.request("DELETE", `/attributes/${encodeURIComponent(attrId)}/options`, { body });
  }

  // --- ADT (Advanced Data Tables) ---

  async getTableData(eid: string, value?: string): Promise<JsonApiResponse> {
    const queryParams = buildParams({ value }, [{ key: "value" }]);
    return this.request("GET", `/adt/${encodeURIComponent(eid)}`, { params: queryParams });
  }

  async getTableColumns(eid: string): Promise<JsonApiResponse> {
    return this.request("GET", `/adt/${encodeURIComponent(eid)}/_column`);
  }

  async getTableRow(eid: string, rowId: string): Promise<JsonApiResponse> {
    return this.request("GET", `/adt/${encodeURIComponent(eid)}/${encodeURIComponent(rowId)}`);
  }

  async updateTableData(eid: string, body: unknown): Promise<JsonApiResponse> {
    return this.request("PATCH", `/adt/${encodeURIComponent(eid)}`, { body });
  }

  // --- Stoichiometry ---

  async getStoichiometry(eid: string, fields?: string): Promise<JsonApiResponse> {
    const queryParams = buildParams({ fields }, [{ key: "fields" }]);
    return this.request("GET", `/stoichiometry/${encodeURIComponent(eid)}`, { params: queryParams });
  }

  async getStoichiometryColumns(eid: string, dataGridKind: string): Promise<JsonApiResponse> {
    return this.request(
      "GET",
      `/stoichiometry/${encodeURIComponent(eid)}/columns/${encodeURIComponent(dataGridKind)}`,
    );
  }
}
