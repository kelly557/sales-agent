import { Avatar, Dropdown, Layout, message } from "antd";
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AssistantPage,
  type AssistantDraftConversation,
} from "./AssistantPage";
import { ApprovalPage } from "./ApprovalPage";
import { CapabilityCenterPage } from "./CapabilityCenterPage";
import { ConnectionCenterPage } from "./ConnectionCenterPage";

import { AdminCenterPage } from "./EnterpriseAdminPage";
import { adminSubLinks, resolveAdminSection } from "./adminSections";
import { BusinessRulePage } from "./BusinessRulePage";
import { FilePreviewPage } from "./FilePreviewPage";
import { KnowledgeBasePage } from "./KnowledgeBasePage";
import { ProposalPage } from "./ProposalPage";
import { proposalHistoryConversations } from "./proposalData";
import { ProjectsPage } from "./ProjectsPage";
import { ScheduledTasksPage } from "./ScheduledTasksPage";
import { SkillsPage } from "./SkillsPage";
import { TemplatesPage } from "./TemplatesPage";
import { TaskDrawer } from "./TaskDrawer";
import { WorkspaceContent } from "./WorkspaceContent";
import { WorkspaceSidebar, type ActivePage } from "./WorkspaceSidebar";
import { clearAuthSession, readAuthSession } from "./authSession";
import {
  documentTasks,
  type DocumentTask,
  type TaskStatus,
  type TaskType,
} from "../data/documentTasks";
import { scheduledTaskHistory, scheduledTasks } from "../data/scheduledTasks";
import { useAssistantConversations } from "./useAssistantConversations";
import styles from "./DocumentWorkspace.module.css";

const { Header, Content } = Layout;
const hashPages = new Set<ActivePage>([
  "workspace",
  "assistant",
  "proposal",
  "projects",
  "knowledge",
  "template",
  "rule",
  "scheduled",
  "approval",
  "connection",
  "capability",
  "skills",
  "admin-permission",
  "admin-memory",
  "admin-approval",
  "admin",
  "filePreview",
]);

const disabledPages = new Set<ActivePage>([
  "scheduled",
  "approval",
  "connection",
  "capability",
  ...adminSubLinks
    .filter((link) => link.badge)
    .map((link) => `admin-${link.section}` as ActivePage),
]);

function isDisabledPage(page: ActivePage) {
  return disabledPages.has(page);
}

function matchesKeyword(task: DocumentTask, keyword: string) {
  const source = `${task.title} ${task.project} ${task.industry} ${task.owner} ${task.summary}`;
  return source.toLowerCase().includes(keyword.trim().toLowerCase());
}

export function DocumentWorkspace() {
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [view, setView] = useState<"table" | "list">("table");
  const [selectedTask, setSelectedTask] = useState<DocumentTask | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>(() => getPageFromHash() ?? "assistant");
  const [proposalInitialConversationId, setProposalInitialConversationId] = useState<string | null>(null);
  const [proposalInitialProjectId, setProposalInitialProjectId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ projectId: string; fileId: string } | null>(null);
  const conversationStore = useAssistantConversations();

  useEffect(() => {
    function handleHashChange() {
      const page = getPageFromHash();
      if (page) {
        setActivePage(page);
      }
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const filteredTasks = useMemo(() => {
    return documentTasks
      .filter((task) => matchesKeyword(task, keyword))
      .filter((task) => typeFilter === "all" || task.type === typeFilter)
      .filter((task) => statusFilter === "all" || task.status === statusFilter)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [keyword, statusFilter, typeFilter]);

  const activeConversation = useMemo(
    () => conversationStore.conversations.find((conversation) => conversation.id === conversationStore.activeConversationId) ?? null,
    [conversationStore.activeConversationId, conversationStore.conversations],
  );

  const saveAssistantConversation = useCallback((conversation: AssistantDraftConversation) => {
    conversationStore.saveConversation(conversation);
  }, [conversationStore]);

  const openAssistantConversation = useCallback((conversationId: string) => {
    conversationStore.setActiveConversationId(conversationId);
    setActivePage("assistant");
    window.location.hash = "assistant";
  }, [conversationStore]);

  const startNewAssistantConversation = useCallback(() => {
    conversationStore.setActiveConversationId(null);
  }, [conversationStore]);

  const openProjectHistory = useCallback(
    (projectId: string, projectName: string) => {
      const target = resolveProposalConversationIdForProject(projectId, projectName);
      setProposalInitialProjectId(projectId);
      setProposalInitialConversationId(target);
      setActivePage("proposal");
      window.location.hash = "proposal";
    },
    [],
  );

  const openFilePreview = useCallback((projectId: string, fileId: string) => {
    setPreviewFile({ projectId, fileId });
    setActivePage("filePreview");
    window.location.hash = "filePreview";
  }, []);

  const exitFilePreview = useCallback(() => {
    setPreviewFile(null);
    setActivePage("projects");
    window.location.hash = "projects";
  }, []);

  const selectProject = useCallback((projectId: string) => {
    setProposalInitialProjectId(projectId);
  }, []);

  const currentUser = useMemo(() => readAuthSession()?.username ?? "admin", []);

  const userMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "profile",
        label: currentUser,
        disabled: true,
        style: { color: "var(--color-muted)" },
      },
      { type: "divider" },
      {
        key: "settings",
        label: "设置",
        icon: <SettingOutlined />,
      },
      {
        key: "logout",
        label: "退出登录",
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
    [currentUser],
  );

  const handleUserMenuClick: MenuProps["onClick"] = useCallback(({ key }) => {
    if (key === "logout") {
      clearAuthSession();
      window.location.reload();
    } else if (key === "settings") {
      message.info("设置面板开发中");
    }
  }, []);

  return (
    <Layout className={styles.shell}>
      <WorkspaceSidebar
        activePage={activePage}
        activeProjectId={proposalInitialProjectId}
        onStartNewAssistantConversation={startNewAssistantConversation}
        onSelectProject={selectProject}
        setActivePage={setActivePage}
      />
      <Layout>
        <Header className={styles.header}>
          <div />
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button
              className={styles.userEntry}
              type="button"
              aria-label="用户菜单"
            >
              <Avatar size={32} icon={<UserOutlined />} />
            </button>
          </Dropdown>
        </Header>
        <Content
          className={`${styles.content} ${activePage === "proposal" ? styles.proposalContent : ""} ${isDisabledPage(activePage) ? styles.contentDisabled : ""}`}
          id="workspace"
        >
          {renderActivePage({
            activePage,
            conversationStore,
            activeConversation,
            saveAssistantConversation,
            openAssistantConversation,
            openProjectHistory,
            openFilePreview,
            exitFilePreview,
            previewFile,
            proposalInitialConversationId,
            proposalInitialProjectId,
            filteredTasks,
            keyword,
            typeFilter,
            statusFilter,
            view,
            isErrorVisible,
            setKeyword,
            setTypeFilter,
            setStatusFilter,
            setView,
            setSelectedTask,
            setIsErrorVisible,
          })}
        </Content>
      </Layout>

      <TaskDrawer selectedTask={selectedTask} onClose={() => setSelectedTask(null)} />
    </Layout>
  );
}

interface RenderActivePageArgs {
  activePage: ActivePage;
  conversationStore: ReturnType<typeof useAssistantConversations>;
  activeConversation: ReturnType<typeof useAssistantConversations>["conversations"][number] | null;
  saveAssistantConversation: (conversation: AssistantDraftConversation) => void;
  openAssistantConversation: (conversationId: string) => void;
  openProjectHistory: (projectId: string, projectName: string) => void;
  openFilePreview: (projectId: string, fileId: string) => void;
  exitFilePreview: () => void;
  previewFile: { projectId: string; fileId: string } | null;
  proposalInitialConversationId: string | null;
  proposalInitialProjectId: string | null;
  filteredTasks: DocumentTask[];
  keyword: string;
  typeFilter: TaskType | "all";
  statusFilter: TaskStatus | "all";
  view: "table" | "list";
  isErrorVisible: boolean;
  setKeyword: (value: string) => void;
  setTypeFilter: (value: TaskType | "all") => void;
  setStatusFilter: (value: TaskStatus | "all") => void;
  setView: (value: "table" | "list") => void;
  setSelectedTask: (task: DocumentTask) => void;
  setIsErrorVisible: (value: boolean) => void;
}

function resolveProposalConversationIdForProject(projectId: string, projectName: string): string | null {
  const byProject = proposalHistoryConversations.find(
    (conversation) => conversation.projectId === projectId,
  );
  if (byProject) return byProject.id;
  const byTitle = proposalHistoryConversations.find(
    (conversation) => conversation.title === projectName,
  );
  return byTitle ? byTitle.id : null;
}

function renderActivePage(args: RenderActivePageArgs) {
  const { activePage } = args;
  switch (activePage) {
    case "proposal":
      return (
        <ProposalPage
          initialProjectId={args.proposalInitialProjectId}
          initialConversationId={args.proposalInitialConversationId}
        />
      );
    case "knowledge":
      return <KnowledgeBasePage />;
    case "template":
      return <TemplatesPage />;
    case "rule":
      return <BusinessRulePage />;
    case "scheduled":
      return <ScheduledTasksPage initialTasks={scheduledTasks} history={scheduledTaskHistory} />;
    case "approval":
      return <ApprovalPage />;
    case "connection":
      return <ConnectionCenterPage />;
    case "capability":
      return <CapabilityCenterPage />;
    case "skills":
      return <SkillsPage />;
    case "admin-permission":
    case "admin-memory":
    case "admin-approval":
      return <AdminCenterPage section={resolveAdminSection(activePage)} />;
    case "admin":
      return <AdminCenterPage section="permission" />;
    case "projects":
      return <ProjectsPage onOpenProjectHistory={args.openProjectHistory} onOpenFilePreview={args.openFilePreview} />;
    case "filePreview":
      return args.previewFile ? (
        <FilePreviewPage
          projectId={args.previewFile.projectId}
          fileId={args.previewFile.fileId}
          onBack={args.exitFilePreview}
        />
      ) : (
        <FilePreviewPage projectId="" fileId="" onBack={args.exitFilePreview} />
      );
    case "assistant":
      return renderAssistantPage(args);
    default:
      return renderTaskWorkspace(args);
  }
}

function renderAssistantPage(args: RenderActivePageArgs) {
  const {
    conversationStore,
    activeConversation,
    saveAssistantConversation,
    openAssistantConversation,
  } = args;
  return (
    <AssistantPage
      conversations={conversationStore.conversations}
      activeConversationId={conversationStore.activeConversationId}
      activeConversation={activeConversation}
      onConversationChange={saveAssistantConversation}
      onOpenConversation={openAssistantConversation}
      onRenameConversation={conversationStore.renameConversation}
      onDeleteConversation={conversationStore.deleteConversation}
    />
  );
}

function renderTaskWorkspace(args: RenderActivePageArgs) {
  const {
    filteredTasks,
    keyword,
    typeFilter,
    statusFilter,
    view,
    isErrorVisible,
    setKeyword,
    setTypeFilter,
    setStatusFilter,
    setView,
    setSelectedTask,
    setIsErrorVisible,
  } = args;
  return (
    <WorkspaceContent
      filteredTasks={filteredTasks}
      keyword={keyword}
      typeFilter={typeFilter}
      statusFilter={statusFilter}
      view={view}
      isErrorVisible={isErrorVisible}
      setKeyword={setKeyword}
      setTypeFilter={setTypeFilter}
      setStatusFilter={setStatusFilter}
      setView={setView}
      setSelectedTask={setSelectedTask}
      setIsErrorVisible={setIsErrorVisible}
    />
  );
}

function getPageFromHash(): ActivePage | null {
  const hashPage = window.location.hash.replace("#", "") as ActivePage;
  return hashPages.has(hashPage) ? hashPage : null;
}
