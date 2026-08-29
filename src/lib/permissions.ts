import {
  useAuthStore,
  type CompanyAdminAccess,
  type CompanyAdminPermissionAction,
} from "@/store/auth-store";

export function hasCompanyAdminPermission(
  action: CompanyAdminPermissionAction,
  access: CompanyAdminAccess = "READ",
): boolean {
  const { authType, user } = useAuthStore.getState();

  if (authType !== "company_admin") {
    return true;
  }

  const permission = user?.permissions?.find((item) => item.action === action);

  if (!permission) {
    return false;
  }

  if (access === "READ") {
    return permission.access === "READ" || permission.access === "WRITE";
  }

  return permission.access === "WRITE";
}
