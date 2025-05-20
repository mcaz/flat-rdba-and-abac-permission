import type { Location, Params } from "react-router";
import { definePermissions } from "./utils";
import { grants } from "./grants";

export const RoleEnum = {
  ADMIN: "ADMIN",
  GENERAL: "GENERAL",
  DEVELOPER: "DEVELOPER",
} as const;

// ロール定義
export type Roles = (typeof RoleEnum)[keyof typeof RoleEnum];

// 型定義関連
export type Grants = typeof grants;
export type Resources = keyof Grants;
export type ResourceDynamicParam<T extends Resources> =
  T extends keyof Grants
    ? Grants[T] extends ReturnType<typeof definePermissions<infer U>>
      ? U
      : never
    : never;

export type Actions = "read" | "create" | "update" | "delete";

export type Contexts<T> = {
  urlParams?: Readonly<Params<string>>;
  location?: Location<undefined>;
  dynamicParam: T;
};

export type RolePermissionMap<T> = {
  [K in Roles]?: (context: Contexts<T>) => boolean;
};

export type GrantDefinition<T> = RolePermissionMap<T>;
export type ActionPermissions<T> = Partial<GrantDefinition<T>>;
export type PermissionError = {
  code: "PERMISSION_DENIED" | "INVALID_PERMISSION" | "SYSTEM_ERROR";
  message: string;
  details?: unknown;
}; 