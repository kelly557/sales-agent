import {
  AppstoreOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Tag,
} from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import {
  projectFileTypeLabels,
  projectStatusLabels,
  projects as initialProjects,
  type ProjectFile,
  type ProjectItem,
  type ProjectStatus,
} from "./projectData";
import { ProjectCreateModal } from "./ProjectCreateModal";
import styles from "./ProjectsPage.module.css";

const statusColors: Record<ProjectStatus, string> = {
  active: "processing",
  reviewing: "warning",
  done: "success",
};

type ViewMode = "card" | "list";

interface ProjectsPageProps {
  onOpenProjectHistory: (projectId: string, projectName: string) => void;
  onOpenFilePreview: (projectId: string, fileId: string) => void;
}

export function ProjectsPage({ onOpenProjectHistory, onOpenFilePreview }: ProjectsPageProps) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [view, setView] = useState<ViewMode>("card");
  const [projectList, setProjectList] = useState<ProjectItem[]>(initialProjects);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    return projectList
      .filter((project) => matchesKeyword(project, keyword))
      .filter((project) => status === "all" || project.status === status)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [projectList, keyword, status]);

  function openWorkspace(project: ProjectItem) {
    onOpenProjectHistory(project.id, project.name);
  }

  function handleDelete(projectId: string) {
    setProjectList((list) => list.filter((project) => project.id !== projectId));
  }

  return (
    <section className={styles.page} aria-label="项目管理">
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateOpen(true)}
          >
            新建项目
          </Button>
          <Input.Search
            allowClear
            placeholder="搜索项目名称"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className={styles.search}
          />
          <Select
            value={status}
            className={styles.statusFilter}
            options={[
              { value: "all", label: "全部状态" },
              ...Object.entries(projectStatusLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={setStatus}
          />
        </div>
        <Segmented
          value={view}
          onChange={(value) => setView(value as ViewMode)}
          options={[
            { value: "card", label: <AppstoreOutlined aria-label="卡片视图" /> },
            { value: "list", label: <UnorderedListOutlined aria-label="列表视图" /> },
          ]}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <Empty description="没有匹配的项目" className={styles.empty}>
          <Button onClick={() => setKeyword("")}>清空搜索</Button>
        </Empty>
      ) : view === "card" ? (
        <div className={styles.cardGrid}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => openWorkspace(project)}
              onDelete={() => handleDelete(project.id)}
              onOpenFilePreview={onOpenFilePreview}
            />
          ))}
        </div>
      ) : (
        <ProjectTable
          projects={filteredProjects}
          onOpen={openWorkspace}
          onDelete={handleDelete}
          onOpenFilePreview={onOpenFilePreview}
        />
      )}

      <ProjectCreateModal
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onSubmit={() => setIsCreateOpen(false)}
      />
    </section>
  );
}

interface ProjectCardProps {
  project: ProjectItem;
  onOpen: () => void;
  onDelete: () => void;
  onOpenFilePreview: (projectId: string, fileId: string) => void;
}

function ProjectCard({ project, onOpen, onDelete, onOpenFilePreview }: ProjectCardProps) {
  return (
    <article
      className={styles.card}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{project.name}</h3>
        <ProjectActions onDelete={onDelete} />
      </header>
      <div className={styles.cardMeta}>
        <Tag color={statusColors[project.status]}>
          {projectStatusLabels[project.status]}
        </Tag>
        <span className={styles.cardMetaText}>
          {project.customer} · {project.owner}
        </span>
        <span className={styles.cardMetaTime}>{project.updatedAt}</span>
      </div>
      <p className={styles.cardSummary}>{project.summary}</p>
      <footer className={styles.cardFooter}>
        <ProjectFilesPopover
          projectId={project.id}
          files={project.files}
          onOpenFilePreview={onOpenFilePreview}
        />
        <span className={styles.cardFilesHint}>
          {project.files.length} 个文件
        </span>
      </footer>
    </article>
  );
}

interface ProjectTableProps {
  projects: ProjectItem[];
  onOpen: (project: ProjectItem) => void;
  onDelete: (projectId: string) => void;
  onOpenFilePreview: (projectId: string, fileId: string) => void;
}

function ProjectTable({ projects, onOpen, onDelete, onOpenFilePreview }: ProjectTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span>项目名称</span>
        <span>客户</span>
        <span>负责人</span>
        <span>状态</span>
        <span>更新时间</span>
        <span>文件</span>
        <span aria-label="操作" />
      </div>
      {projects.map((project) => (
        <div
          key={project.id}
          className={styles.tableRow}
          onClick={() => onOpen(project)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen(project);
            }
          }}
        >
          <span className={styles.tableName}>{project.name}</span>
          <span>{project.customer}</span>
          <span>{project.owner}</span>
          <span>
            <Tag color={statusColors[project.status]}>
              {projectStatusLabels[project.status]}
            </Tag>
          </span>
          <span>{project.updatedAt}</span>
          <span onClick={(event) => event.stopPropagation()}>
            <ProjectFilesPopover
              projectId={project.id}
              files={project.files}
              compact
              onOpenFilePreview={onOpenFilePreview}
            />
          </span>
          <span onClick={(event) => event.stopPropagation()}>
            <ProjectActions onDelete={() => onDelete(project.id)} compact />
          </span>
        </div>
      ))}
    </div>
  );
}

interface ProjectActionsProps {
  onDelete: () => void;
  compact?: boolean;
}

function ProjectActions({ onDelete, compact = false }: ProjectActionsProps) {
  const items: MenuProps["items"] = [
    {
      key: "delete",
      label: (
        <Popconfirm
          title="确认删除该项目？"
          description="删除后无法恢复"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={(event) => {
            event?.stopPropagation();
            onDelete();
          }}
          onCancel={(event) => event?.stopPropagation()}
        >
          <span className={styles.deleteLabel}>
            <DeleteOutlined /> 删除
          </span>
        </Popconfirm>
      ),
    },
  ];
  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        size={compact ? "small" : "middle"}
        icon={<EllipsisOutlined />}
        onClick={(event) => event.stopPropagation()}
        aria-label="更多操作"
      />
    </Dropdown>
  );
}

interface ProjectFilesPopoverProps {
  projectId: string;
  files: ProjectFile[];
  compact?: boolean;
  onOpenFilePreview: (projectId: string, fileId: string) => void;
}

function ProjectFilesPopover({
  projectId,
  files,
  compact = false,
  onOpenFilePreview,
}: ProjectFilesPopoverProps) {
  const [open, setOpen] = useState(false);

  function handleOpenFile(fileId: string) {
    setOpen(false);
    onOpenFilePreview(projectId, fileId);
  }

  const content = (
    <div className={styles.filePopover}>
      <header className={styles.filePopoverHeader}>
        <FolderOpenOutlined /> 项目文件
      </header>
      {files.length === 0 ? (
        <div className={styles.filePopoverEmpty}>暂无文件</div>
      ) : (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li
              key={file.id}
              className={styles.fileItem}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenFile(file.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenFile(file.id);
                }
              }}
            >
              <FileTextOutlined className={styles.fileIcon} />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileVersion}>{file.version}</span>
              <Tag className={styles.fileType}>
                {projectFileTypeLabels[file.type]}
              </Tag>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const trigger = compact ? (
    <Button type="link" size="small" onClick={() => setOpen(true)}>
      <FolderOpenOutlined /> {files.length}
    </Button>
  ) : (
    <Button type="link" size="small" onClick={() => setOpen(true)}>
      <FolderOpenOutlined /> 查看文件
    </Button>
  );

  return (
    <>
      {trigger}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={520}
        title={
          <span>
            <FolderOpenOutlined /> 项目文件
          </span>
        }
        destroyOnClose
      >
        {content}
      </Modal>
    </>
  );
}

function matchesKeyword(project: ProjectItem, keyword: string) {
  const source = `${project.name} ${project.customer} ${project.owner} ${project.summary}`;
  return source.toLowerCase().includes(keyword.trim().toLowerCase());
}
