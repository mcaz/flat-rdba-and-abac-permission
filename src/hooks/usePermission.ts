import { Actions, grants, ResourceDynamicParam, Resources, verifyPermission } from "@rdba-abac-auth/permission";
import { useCallback } from "react";
import { useLocation, useParams } from "react-router";

type Can = <
  TAction extends Actions,
  TResource extends Resources,
  TDynamicParam extends ResourceDynamicParam<TResource>
>(
  action?: TAction,
  resource?: TResource,
  dynamicParam?: TDynamicParam
) => boolean;

export function usePermission(): { can: Can; hasPermission: null; }
export function usePermission<
  TAction extends Actions,
  TResource extends Resources,
  TDynamicParam extends ResourceDynamicParam<TResource>
>(
  action: TAction, 
  resource: TResource,
  dynamicParam: TDynamicParam
): { 
  can: Can; 
  hasPermission: boolean;
}
export function usePermission<
  TAction extends Actions,
  TResource extends Resources,
  TDynamicParam extends ResourceDynamicParam<TResource>
>(
  action?: TAction, 
  resource?: TResource,
  dynamicParam?: TDynamicParam
) {
  const urlParams = useParams();
  const location = useLocation();
  const role = "GENERAL"; // 明示的なロールは必要に応じて注入

  const can = useCallback(
    (
      action?: TAction,
      resource?: TResource,
      dynamicParam?: ResourceDynamicParam<TResource>
    ) => {
      return verifyPermission({
        grants,
        role,
        action,
        resource,
        context: {
          urlParams,
          location,
          dynamicParam,
        },
      });
    },
    [urlParams, location, role]
  );

  if (action && resource && dynamicParam) {
    return {
      can,
      hasPermission: can(action, resource, dynamicParam),
    };
  } else {
    return {
      can,
      hasPermission: null
    };
  }
} 