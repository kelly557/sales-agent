import {
  AuditOutlined,
  BookOutlined,
  BuildOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  SolutionOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import type { Dispatch, MouseEvent, ReactNode, SetStateAction } from "react";
import { useState } from "react";
import { AdminCenterGroup } from "./AdminCenterGroup";
import { proposalProjectGroups } from "./proposalData";
import styles from "./DocumentWorkspace.module.css";

const { Sider } = Layout;

export type ActivePage =
  | "workspace"
  | "assistant"
  | "proposal"
  | "projects"
  | "knowledge"
  | "template"
  | "rule"
  | "scheduled"
  | "approval"
  | "connection"
  | "capability"
  | "skills"
  | "admin-permission"
  | "admin-memory"
  | "admin-approval"
  | "admin";

interface WorkspaceSidebarProps {
  activePage: ActivePage;
  activeProjectId: string | null;
  onStartNewAssistantConversation: () => void;
  onSelectProject: (projectId: string, projectName: string) => void;
  setActivePage: Dispatch<SetStateAction<ActivePage>>;
}

const sidebarProjects = proposalProjectGroups.filter(
  (group) => group.projectId !== "UNGROUPED",
);

export function WorkspaceSidebar({
  activePage,
  activeProjectId,
  onStartNewAssistantConversation,
  onSelectProject,
  setActivePage,
}: WorkspaceSidebarProps) {
  const [isAdminOpen, setIsAdminOpen] = useState(true);

  function openAssistant() {
    onStartNewAssistantConversation();
    window.location.hash = "assistant";
    window.dispatchEvent(new Event("doctech:new-assistant-chat"));
    setActivePage("assistant");
  }

  function openPage(page: ActivePage) {
    setActivePage(page);
    window.location.hash = page;
  }

  function handleOpenPage(page: ActivePage) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      openPage(page);
    };
  }

  function handleSelectProject(projectId: string, projectName: string) {
    onSelectProject(projectId, projectName);
    setActivePage("proposal");
    window.location.hash = "proposal";
  }

  return (
    <Sider className={styles.sidebar} breakpoint="lg" collapsedWidth={0} width={248}>
      <div className={styles.brand}>
        <FileSearchOutlined />
        <span>销售助手Agent</span>
      </div>
      <nav className={styles.nav} aria-label="工作台导航">
        <NewProjectButton onClick={openAssistant} />
        {sidebarProjects.map((group) => {
          const isActive = activePage === "proposal" && activeProjectId === group.projectId;
          return (
            <ProjectNavLink
              key={group.projectId}
              isActive={isActive}
              icon={<SolutionOutlined />}
              label={group.title}
              onClick={() => handleSelectProject(group.projectId, group.title)}
            />
          );
        })}
        <div className={styles.navDivider} />
        <NavLink page="projects" activePage={activePage} icon={<BuildOutlined />} label="项目管理" onOpen={handleOpenPage} />
        <NavLink page="skills" activePage={activePage} icon={<ThunderboltOutlined />} label="技能" onOpen={handleOpenPage} />
        <NavLink page="knowledge" activePage={activePage} icon={<BookOutlined />} label="知识库" onOpen={handleOpenPage} />
        <NavLink page="template" activePage={activePage} icon={<FileTextOutlined />} label="文档模版" onOpen={handleOpenPage} />
        <NavLink page="rule" activePage={activePage} icon={<SolutionOutlined />} label="业务规则" onOpen={handleOpenPage} />
        <NavLink page="scheduled" activePage={activePage} icon={<ClockCircleOutlined />} label="定时任务" badge="待开发" disabled onOpen={handleOpenPage} />
        <NavLink page="approval" activePage={activePage} icon={<AuditOutlined />} label="审批流程" badge="待开发" disabled onOpen={handleOpenPage} />
        <div className={styles.navDivider} />
        <AdminCenterGroup
          isOpen={isAdminOpen}
          activePage={activePage}
          onToggle={() => setIsAdminOpen((value) => !value)}
          onOpen={handleOpenPage}
        />
      </nav>
    </Sider>
  );
}

function NewProjectButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.newChatButton} type="button" onClick={onClick}>
      <span>+</span>
      新项目
    </button>
  );
}

interface NavLinkProps {
  page: ActivePage;
  activePage: ActivePage;
  icon: ReactNode;
  label: string;
  badge?: string;
  disabled?: boolean;
  onOpen: (page: ActivePage) => (event: MouseEvent<HTMLAnchorElement>) => void;
}

function NavLink({ page, activePage, icon, label, badge, disabled, onOpen }: NavLinkProps) {
  return (
    <a
      className={[
        activePage === page && !disabled ? styles.navItemActive : undefined,
        disabled ? styles.navItemDisabled : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      href={disabled ? undefined : `#${page}`}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onOpen(page)}
    >
      {icon}
      <span className={styles.navItemLabel}>{label}</span>
      {badge ? <span className={styles.navItemBadge}>{badge}</span> : null}
    </a>
  );
}

function ProjectNavLink({
  isActive,
  icon,
  label,
  onClick,
}: {
  isActive: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <a
      className={[isActive ? styles.navItemActive : undefined].filter(Boolean).join(" ")}
      href="#proposal"
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {icon}
      <span className={styles.navItemLabel}>{label}</span>
    </a>
  );
}
