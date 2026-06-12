export type AdminSection =
  | "permission"
  | "memory"
  | "approval"
  | "capability"
  | "connection";

export const adminSectionLabels: Record<AdminSection, string> = {
  permission: "权限管理",
  memory: "记忆系统",
  approval: "审批配置",
  capability: "能力中心",
  connection: "连接中心",
};

export const adminSubLinks: Array<{ section: AdminSection; label: string; badge?: string }> = [
  { section: "permission", label: "权限管理", badge: "待开发" },
  { section: "memory", label: "记忆系统", badge: "待开发" },
  { section: "approval", label: "审批配置", badge: "待开发" },
  { section: "capability", label: "能力中心", badge: "待开发" },
  { section: "connection", label: "连接中心", badge: "待开发" },
];

export const adminDefaultSection: AdminSection = "permission";

export const adminSectionToActivePage: Record<AdminSection, string> = {
  permission: "admin-permission",
  memory: "admin-memory",
  approval: "admin-approval",
  capability: "capability",
  connection: "connection",
};

export const adminActivePages: string[] = Object.values(adminSectionToActivePage);

export function resolveAdminSection(activePage: string): AdminSection {
  const match = (Object.entries(adminSectionToActivePage) as Array<[AdminSection, string]>).find(
    ([, page]) => page === activePage,
  );
  return match ? match[0] : adminDefaultSection;
}
