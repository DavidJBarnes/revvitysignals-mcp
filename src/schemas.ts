import { z } from "zod";

export const EntitySchema = z.object({
  id: z.string(),
  type: z.string(),
  attributes: z.record(z.unknown()),
  relationships: z.record(z.unknown()).optional(),
});

export const EntityListResponseSchema = z.object({
  data: z.array(EntitySchema),
  links: z
    .object({
      self: z.string().optional(),
      first: z.string().optional(),
      next: z.string().optional(),
      prev: z.string().optional(),
    })
    .optional(),
  meta: z.record(z.unknown()).optional(),
  included: z.array(z.unknown()).optional(),
});

export const EntityResponseSchema = z.object({
  data: EntitySchema,
  links: z.record(z.string()).optional(),
  meta: z.record(z.unknown()).optional(),
  included: z.array(z.unknown()).optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  type: z.literal("user"),
  attributes: z.object({
    userName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    enabled: z.boolean(),
  }),
  relationships: z.record(z.unknown()).optional(),
});

export const UserListResponseSchema = z.object({
  data: z.array(UserSchema),
  meta: z.record(z.unknown()).optional(),
});

export const UserResponseSchema = z.object({
  data: UserSchema,
  meta: z.record(z.unknown()).optional(),
});

export const GroupSchema = z.object({
  id: z.string(),
  type: z.literal("group"),
  attributes: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
});

export const GroupListResponseSchema = z.object({
  data: z.array(GroupSchema),
  meta: z.record(z.unknown()).optional(),
});

export const GroupResponseSchema = z.object({
  data: GroupSchema,
  meta: z.record(z.unknown()).optional(),
});

export const RoleSchema = z.object({
  id: z.string(),
  type: z.literal("role"),
  attributes: z.object({
    name: z.string(),
    privileges: z.array(z.string()),
  }),
});

export const RoleListResponseSchema = z.object({
  data: z.array(RoleSchema),
  meta: z.record(z.unknown()).optional(),
});

export const ProfileSchema = z.object({
  id: z.string(),
  type: z.literal("user"),
  attributes: z.object({
    userName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    tenantId: z.string(),
    roles: z.array(z.string()),
  }),
});

export const ProfileResponseSchema = z.object({
  data: ProfileSchema,
  meta: z.record(z.unknown()).optional(),
});

export const AttributeSchema = z.object({
  id: z.string(),
  type: z.literal("attribute"),
  attributes: z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
  }),
});

export const AttributeListResponseSchema = z.object({
  data: z.array(AttributeSchema),
  meta: z.record(z.unknown()).optional(),
});

export const MaterialLibrarySchema = z.object({
  id: z.string(),
  type: z.literal("materialLibrary"),
  attributes: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
});

export const MaterialLibraryListResponse = z.object({
  data: z.array(MaterialLibrarySchema),
  meta: z.record(z.unknown()).optional(),
});

export type Entity = z.infer<typeof EntitySchema>;
export type EntityListResponse = z.infer<typeof EntityListResponseSchema>;
export type EntityResponse = z.infer<typeof EntityResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type GroupListResponse = z.infer<typeof GroupListResponseSchema>;
export type GroupResponse = z.infer<typeof GroupResponseSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type RoleListResponse = z.infer<typeof RoleListResponseSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type AttributeListResponse = z.infer<typeof AttributeListResponseSchema>;
export type MaterialLibrary = z.infer<typeof MaterialLibrarySchema>;
export type MaterialLibraryList = z.infer<typeof MaterialLibraryListResponse>;