import { ActionPermissions, Actions, Contexts, GrantDefinition, Grants, Resources, RoleEnum, RolePermissionMap, Roles } from "./types";

function whiteList<T>(def: Partial<GrantDefinition<T>>): GrantDefinition<T> {
  const defaultGrant = Object.values(RoleEnum).reduce<GrantDefinition<T>>((acc, role) => {
    acc[role] = () => false;
    return acc;
  }, {} as GrantDefinition<T>);

  return {
    ...defaultGrant,
    ...def,
  };
}

export function definePermissions<T = undefined>(def?: {
  read?: ActionPermissions<T>;
  create?: ActionPermissions<T>;
  update?: ActionPermissions<T>;
  delete?: ActionPermissions<T>;
}) {
  return {
    read: whiteList(def?.read ?? {}),
    create: whiteList(def?.create ?? {}),
    update: whiteList(def?.update ?? {}),
    delete: whiteList(def?.delete ?? {}),
  } as const;
}

export function handlePermissionError(error: {
  code: "INVALID_PERMISSION" | "SYSTEM_ERROR";
  message: string;
  details?: unknown;
}): false {
  console.error(`Permission Error: ${error.code} - ${error.message}`, error.details);
  return false;
}

export function verifyPermission({
  grants,
  role,
  action,
  resource,
  context,
}: {
  grants: Grants;
  role?: Roles;
  action?: Actions;
  resource?: Resources;
  context: Contexts<unknown>;
}): boolean {
  console.log('verifyPermission', grants, role, action, resource, context);

  if (!role || !action || !resource) {
    return handlePermissionError({
      code: "INVALID_PERMISSION",
      message: `Role or action or resource is not defined for role: ${role}, action: ${action}, resource: ${resource}`,
    });
  }

  const permission = grants[resource]?.[action] as RolePermissionMap<unknown>;
  const actionName = String(action);
  const resourceName = String(resource);

  if (!permission) {
    return handlePermissionError({
      code: "INVALID_PERMISSION",
      message: `Permission not defined for action: ${actionName}, resource: ${resourceName}`,
    });
  }

  try {
    const hasPermission = permission[role]?.(context);

    console.log('hasPermission', hasPermission);

    if (typeof hasPermission !== "boolean") {
      return handlePermissionError({
        code: "INVALID_PERMISSION",
        message: `Invalid permission result for action: ${actionName}, resource: ${resourceName}`,
      });
    }

    return hasPermission;
  } catch (error) {
    return handlePermissionError({
      code: "SYSTEM_ERROR",
      message: `Permission check failed for action: ${actionName}, resource: ${resourceName}`,
      details: error,
    });
  }
} 