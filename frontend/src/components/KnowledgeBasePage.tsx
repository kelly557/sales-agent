import {
  AppstoreOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExperimentOutlined,
  FileOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  PlusOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Dropdown,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Tabs,
  Tag,
  Upload,
  message,
} from "antd";
import type { UploadProps } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  formatFileSize,
  initialApiConnections,
  initialDatabaseConnections,
  initialImportRecords,
  initialKnowledgeEntries,
  initialKnowledgeFiles,
  initialTags,
  knowledgeFolders as initialFolders,
  migrateApiConnections,
  migrateDatabaseConnections,
  migrateImportRecords,
  migrateKnowledgeFiles,
  migrateTags,
  type ApiConnection,
  type DatabaseConnection,
  type ExternalSourceConfig,
  type ImportRecord,
  type ImportSourceType,
  type KnowledgeEntry,
  type KnowledgeFile,
  type KnowledgeFolder,
  type Tag as TagModel,
} from "./knowledgeBaseData";
import {
  ApiSourcePanel,
  DatabaseSourcePanel,
  ExternalSourcePanel,
} from "./KnowledgeSourceConfig";
import { KnowledgeFolderView } from "./KnowledgeFolderView";
import { TagManagementPanel } from "./TagManagementPanel";
import { usePersistedState } from "./usePersistedState";
import styles from "./KnowledgeBasePage.module.css";

type ViewMode = "card" | "list";
type TabKey = "files" | "database" | "api" | "external" | "tags";
const FOLDER_HASH_PREFIX = "knowledge/";

const TAB_META: Record<
  TabKey,
  { label: string; icon: React.ReactNode; tag?: { text: string; color: string } }
> = {
  files: { label: "本地文件", icon: <FolderOpenOutlined /> },
  database: { label: "数据库", icon: <DatabaseOutlined /> },
  api: { label: "API 接口", icon: <GlobalOutlined /> },
  external: { label: "外部知识库", icon: <ExperimentOutlined /> },
  tags: { label: "标签", icon: <TagsOutlined /> },
};

const EXTERNAL_SOURCE_CONFIG: ExternalSourceConfig = { apis: [], bindings: [] };

export function KnowledgeBasePage() {
  const [folders, setFolders] = usePersistedState<KnowledgeFolder[]>(
    "doctech:knowledge-folders",
    initialFolders,
  );
  const [files, setFiles] = usePersistedState<KnowledgeFile[]>(
    "doctech:knowledge-files",
    initialKnowledgeFiles,
    migrateKnowledgeFiles,
  );
  const [entries, setEntries] = usePersistedState<KnowledgeEntry[]>(
    "doctech:knowledge-entries",
    initialKnowledgeEntries,
  );
  const [importRecords, setImportRecords] = usePersistedState<ImportRecord[]>(
    "doctech:knowledge-import-records",
    initialImportRecords,
    migrateImportRecords,
  );
  const [dbConnections, setDbConnections] = usePersistedState<DatabaseConnection[]>(
    "doctech:knowledge-db-connections",
    initialDatabaseConnections,
    migrateDatabaseConnections,
  );
  const [apiConnections, setApiConnections] = usePersistedState<ApiConnection[]>(
    "doctech:knowledge-api-connections",
    initialApiConnections,
    migrateApiConnections,
  );
  const [externalConfig, setExternalConfig] = usePersistedState<ExternalSourceConfig>(
    "doctech:knowledge-external-config",
    EXTERNAL_SOURCE_CONFIG,
  );
  const [tags, setTags] = usePersistedState<TagModel[]>(
    "doctech:knowledge-tags",
    initialTags,
    migrateTags,
  );

  const [view, setView] = useState<ViewMode>("list");
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(
    () => readFolderIdFromHash(),
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("files");

  useEffect(() => {
    function handlePopState() {
      setActiveFolderId(readFolderIdFromHash());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (activeFolderId && !folders.some((f) => f.id === activeFolderId)) {
      setActiveFolderId(null);
    }
  }, [activeFolderId, folders]);

  useEffect(() => {
    if (activeFolderId) {
      window.history.pushState(
        { folderId: activeFolderId },
        "",
        `#${FOLDER_HASH_PREFIX}${activeFolderId}`,
      );
    } else if (window.location.hash.startsWith(`#${FOLDER_HASH_PREFIX}`)) {
      window.history.pushState({}, "", "#knowledge");
    }
  }, [activeFolderId]);

  const filteredFolders = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return folders;
    return folders.filter((folder) => folder.name.toLowerCase().includes(kw));
  }, [folders, keyword]);

  const filteredEntries = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return entries;
    return entries.filter((entry) => entry.name.toLowerCase().includes(kw));
  }, [entries, keyword]);

  type MixedItem =
    | { kind: "folder"; data: KnowledgeFolder }
    | { kind: "entry"; data: KnowledgeEntry };

  const mixedItems = useMemo<MixedItem[]>(() => {
    const list: MixedItem[] = [
      ...filteredFolders.map((f) => ({ kind: "folder" as const, data: f })),
      ...filteredEntries.map((e) => ({ kind: "entry" as const, data: e })),
    ];
    return list.sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt));
  }, [filteredFolders, filteredEntries]);

  const isAllSelected =
    mixedItems.length > 0 && selectedIds.length === mixedItems.length;
  const isPartialSelected =
    selectedIds.length > 0 && selectedIds.length < mixedItems.length;

  function toggleSelectAll() {
    setSelectedIds(isAllSelected ? [] : mixedItems.map((item) => item.data.id));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function backToFolders() {
    setActiveFolderId(null);
  }

  function handleCreate() {
    const id = `F-${Date.now()}`;
    const folder: KnowledgeFolder = {
      id,
      name: "未命名文件夹",
      fileCount: 0,
      createdAt: "刚刚",
    };
    setFolders((list) => [folder, ...list]);
    setEditingId(id);
    setEditingName(folder.name);
    setSelectedIds([]);
  }

  function commitRename() {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) {
      message.warning("文件夹名不能为空");
      return;
    }
    setFolders((list) =>
      list.map((f) => (f.id === editingId ? { ...f, name } : f)),
    );
    setEditingId(null);
    setEditingName("");
  }

  function cancelRename() {
    setEditingId(null);
    setEditingName("");
  }

  function deleteOne(id: string) {
    setFolders((list) => list.filter((f) => f.id !== id));
    setFiles((list) => list.filter((file) => file.folderId !== id));
    setImportRecords((list) => list.filter((r) => r.folderId !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function deleteSelected() {
    setFolders((list) => list.filter((f) => !selectedIds.includes(f.id)));
    setFiles((list) => list.filter((file) => !selectedIds.includes(file.folderId)));
    setEntries((list) => list.filter((e) => !selectedIds.includes(e.id)));
    setImportRecords((list) => list.filter((r) => !selectedIds.includes(r.folderId)));
    setSelectedIds([]);
  }

  function openUploadModal() {
    setPendingFiles([]);
    setIsUploadOpen(true);
  }

  function closeUploadModal() {
    setIsUploadOpen(false);
    setPendingFiles([]);
  }

  function confirmUpload() {
    if (pendingFiles.length === 0) {
      message.warning("请选择要上传的文件");
      return;
    }
    pendingFiles.forEach((file) => addEntry(file));
    message.success(`已上传 ${pendingFiles.length} 个文件`);
    closeUploadModal();
  }

  function addEntry(file: File) {
    const entry: KnowledgeEntry = {
      id: `ENTRY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type || "file",
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploader: "当前用户",
      createdAt: new Date().toISOString(),
    };
    setEntries((list) => [entry, ...list]);
  }

  function deleteEntry(id: string) {
    setEntries((list) => list.filter((e) => e.id !== id));
  }

  function handleUpload(folderId: string, file: File, tags: string[] = []) {
    const knowledgeFile: KnowledgeFile = {
      id: `FILE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      folderId,
      name: file.name,
      size: file.size,
      type: file.type || "file",
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploader: "当前用户",
      source: { kind: "local", uploader: "当前用户" },
      tags: Array.from(new Set(tags)),
    };
    setFiles((list) => [knowledgeFile, ...list]);
    setFolders((list) =>
      list.map((f) => (f.id === folderId ? { ...f, fileCount: f.fileCount + 1 } : f)),
    );
    message.success(`已添加「${file.name}」`);
  }

  function handleDeleteFile(folderId: string, fileId: string) {
    setFiles((list) => list.filter((file) => file.id !== fileId));
    setFolders((list) =>
      list.map((f) =>
        f.id === folderId ? { ...f, fileCount: Math.max(0, f.fileCount - 1) } : f,
      ),
    );
    message.success("文件已删除");
  }

  function handleDeleteFiles(folderId: string, fileIds: string[]) {
    setFiles((list) => list.filter((file) => !fileIds.includes(file.id)));
    setFolders((list) =>
      list.map((f) =>
        f.id === folderId
          ? { ...f, fileCount: Math.max(0, f.fileCount - fileIds.length) }
          : f,
      ),
    );
    message.success(`已删除 ${fileIds.length} 个文件`);
  }

  function updateFileTags(fileId: string, tags: string[]) {
    const deduped = Array.from(new Set(tags));
    setFiles((list) =>
      list.map((file) => (file.id === fileId ? { ...file, tags: deduped } : file)),
    );
  }

  function handleCreateImport(record: ImportRecord) {
    setImportRecords((list) => [record, ...list]);
  }

  function handleUpdateImport(record: ImportRecord) {
    setImportRecords((list) => list.map((r) => (r.id === record.id ? record : r)));
  }

  function handleDeleteImport(recordId: string) {
    setImportRecords((list) => list.filter((r) => r.id !== recordId));
  }

  function renameTagInFiles(from: string, to: string) {
    setFiles((list) =>
      list.map((file) =>
        file.tags?.includes(from)
          ? {
              ...file,
              tags: file.tags.map((t) => (t === from ? to : t)),
            }
          : file,
      ),
    );
  }

  function removeTagFromFiles(name: string) {
    setFiles((list) =>
      list.map((file) =>
        file.tags?.includes(name)
          ? { ...file, tags: file.tags.filter((t) => t !== name) }
          : file,
      ),
    );
  }

  function handleTagsChange(
    next: TagModel[],
    renamedFrom?: string,
    renamedTo?: string,
  ) {
    setTags(next);
    if (renamedFrom && renamedTo) {
      renameTagInFiles(renamedFrom, renamedTo);
    } else if (renamedFrom && !renamedTo) {
      removeTagFromFiles(renamedFrom);
    }
  }

  if (activeFolderId) {
    const folder = folders.find((f) => f.id === activeFolderId);
    if (folder) {
      const folderFiles = files.filter((f) => f.folderId === activeFolderId);
      const folderImports = importRecords.filter((r) => r.folderId === activeFolderId);
      return (
        <KnowledgeFolderView
          folder={folder}
          files={folderFiles}
          imports={folderImports}
          dbConnections={dbConnections}
          apiConnections={apiConnections}
          externalConfig={externalConfig}
          tags={tags}
          onBack={backToFolders}
          onUpload={(file, tags) => handleUpload(activeFolderId, file, tags)}
          onDelete={(fileId) => handleDeleteFile(activeFolderId, fileId)}
          onDeleteSelected={(ids) => handleDeleteFiles(activeFolderId, ids)}
          onCreateImport={handleCreateImport}
          onUpdateImport={handleUpdateImport}
          onDeleteImport={handleDeleteImport}
          onUpdateFileTags={updateFileTags}
          onCreateTag={(name) => {
            if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) return null;
            const next: TagModel = {
              id: `TAG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name,
              createdAt: new Date().toISOString(),
            };
            setTags((list) => [next, ...list]);
            return next;
          }}
        />
      );
    }
  }

  return (
    <section className={styles.page} aria-label="知识库">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        className={styles.tabs}
        items={[
          {
            key: "files",
            label: <TabLabel tabKey="files" />,
            children: (
              <LocalSourceView
                view={view}
                setView={setView}
                keyword={keyword}
                setKeyword={setKeyword}
                selectedCount={selectedIds.length}
                isAllSelected={isAllSelected}
                isPartialSelected={isPartialSelected}
                onToggleSelectAll={toggleSelectAll}
                onUpload={openUploadModal}
                onCreate={handleCreate}
                onClearSelection={() => setSelectedIds([])}
                onBatchDelete={deleteSelected}
              >
                {mixedItems.length === 0 ? (
                  <Empty description="暂无文件夹" className={styles.empty}>
                    <Button type="primary" onClick={handleCreate}>
                      新建文件夹
                    </Button>
                  </Empty>
                ) : view === "list" ? (
                  <MixedTable
                    items={mixedItems}
                    selectedIds={selectedIds}
                    editingId={editingId}
                    editingName={editingName}
                    onSelect={toggleSelect}
                    onActivate={(item) => {
                      if (item.kind === "folder") {
                        setActiveFolderId(item.data.id);
                      }
                    }}
                    onStartRename={(folder) => {
                      setEditingId(folder.id);
                      setEditingName(folder.name);
                    }}
                    onCommitRename={commitRename}
                    onCancelRename={cancelRename}
                    onChangeEditingName={setEditingName}
                    onDeleteFolder={deleteOne}
                    onDeleteEntry={deleteEntry}
                  />
                ) : (
                  <MixedCardGrid
                    items={mixedItems}
                    selectedIds={selectedIds}
                    editingId={editingId}
                    editingName={editingName}
                    onSelect={toggleSelect}
                    onActivate={(item) => {
                      if (item.kind === "folder") {
                        setActiveFolderId(item.data.id);
                      }
                    }}
                    onStartRename={(folder) => {
                      setEditingId(folder.id);
                      setEditingName(folder.name);
                    }}
                    onCommitRename={commitRename}
                    onCancelRename={cancelRename}
                    onChangeEditingName={setEditingName}
                    onDeleteFolder={deleteOne}
                    onDeleteEntry={deleteEntry}
                  />
                )}
              </LocalSourceView>
            ),
          },
          {
            key: "database",
            label: <TabLabel tabKey="database" />,
            children: (
              <DatabaseSourcePanel
                connections={dbConnections}
                onChange={setDbConnections}
              />
            ),
          },
          {
            key: "api",
            label: <TabLabel tabKey="api" />,
            children: (
              <ApiSourcePanel
                connections={apiConnections}
                onChange={setApiConnections}
              />
            ),
          },
          {
            key: "external",
            label: <TabLabel tabKey="external" />,
            children: (
              <ExternalSourcePanel
                config={externalConfig}
                onChange={setExternalConfig}
              />
            ),
          },
          {
            key: "tags",
            label: <TabLabel tabKey="tags" />,
            children: (
              <TagManagementPanel
                tags={tags}
                files={files}
                onChange={handleTagsChange}
              />
            ),
          },
        ]}
      />

      <UploadModal
        open={isUploadOpen}
        pendingFiles={pendingFiles}
        onChangePending={setPendingFiles}
        onCancel={closeUploadModal}
        onConfirm={confirmUpload}
      />
    </section>
  );
}

function TabLabel({ tabKey }: { tabKey: TabKey }) {
  const meta = TAB_META[tabKey];
  return (
    <span className={styles.tabLabel}>
      {meta.icon}
      <span>{meta.label}</span>
      {meta.tag ? (
        <Tag color={meta.tag.color} bordered={false} className={styles.tabTag}>
          {meta.tag.text}
        </Tag>
      ) : null}
    </span>
  );
}

interface LocalSourceViewProps {
  view: ViewMode;
  setView: (mode: ViewMode) => void;
  keyword: string;
  setKeyword: (value: string) => void;
  selectedCount: number;
  isAllSelected: boolean;
  isPartialSelected: boolean;
  onToggleSelectAll: () => void;
  onUpload: () => void;
  onCreate: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  children: React.ReactNode;
}

function LocalSourceView({
  view,
  setView,
  keyword,
  setKeyword,
  selectedCount,
  isAllSelected,
  isPartialSelected,
  onToggleSelectAll,
  onUpload,
  onCreate,
  onClearSelection,
  onBatchDelete,
  children,
}: LocalSourceViewProps) {
  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={onUpload}
          >
            上传文件
          </Button>
          <Button icon={<PlusOutlined />} onClick={onCreate}>
            新建文件夹
          </Button>
        </div>
        <div className={styles.toolbarRight}>
          <Input.Search
            allowClear
            placeholder="搜索文件夹"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className={styles.search}
          />
          <Checkbox
            checked={isAllSelected}
            indeterminate={isPartialSelected}
            onChange={onToggleSelectAll}
          >
            多选
          </Checkbox>
          <Segmented
            value={view}
            onChange={(value) => setView(value as ViewMode)}
            options={[
              { value: "card", label: <AppstoreOutlined aria-label="卡片视图" /> },
              { value: "list", label: <UnorderedListOutlined aria-label="列表视图" /> },
            ]}
          />
        </div>
      </div>

      {selectedCount > 0 ? (
        <div className={styles.batchBar}>
          <span>已选 {selectedCount} 项</span>
          <Popconfirm
            title="删除选中的文件夹？"
            description="删除后无法恢复"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={onBatchDelete}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              批量删除
            </Button>
          </Popconfirm>
          <Button size="small" onClick={onClearSelection}>
            取消
          </Button>
        </div>
      ) : null}

      {children}
    </>
  );
}

function readFolderIdFromHash(): string | null {
  const raw = window.location.hash.replace("#", "");
  if (raw.startsWith(FOLDER_HASH_PREFIX)) {
    return raw.slice(FOLDER_HASH_PREFIX.length) || null;
  }
  return null;
}

type MixedItem =
  | { kind: "folder"; data: KnowledgeFolder }
  | { kind: "entry"; data: KnowledgeEntry };

interface MixedListProps {
  items: MixedItem[];
  selectedIds: string[];
  editingId: string | null;
  editingName: string;
  onSelect: (id: string) => void;
  onActivate: (item: MixedItem) => void;
  onStartRename: (folder: KnowledgeFolder) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onChangeEditingName: (value: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}

function MixedTable(props: MixedListProps) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span className={styles.colCheck} />
        <span className={styles.colName}>名称</span>
        <span className={styles.colCount}>类型</span>
        <span className={styles.colTime}>创建时间</span>
        <span className={styles.colAction} aria-label="操作" />
      </div>
      {props.items.map((item) => (
        <MixedRow
          key={item.data.id}
          item={item}
          selected={props.selectedIds.includes(item.data.id)}
          isEditing={
            item.kind === "folder" && props.editingId === item.data.id
          }
          editingName={props.editingName}
          onSelect={props.onSelect}
          onActivate={props.onActivate}
          onStartRename={props.onStartRename}
          onCommitRename={props.onCommitRename}
          onCancelRename={props.onCancelRename}
          onChangeEditingName={props.onChangeEditingName}
          onDeleteFolder={props.onDeleteFolder}
          onDeleteEntry={props.onDeleteEntry}
        />
      ))}
    </div>
  );
}

interface MixedRowProps {
  item: MixedItem;
  selected: boolean;
  isEditing: boolean;
  editingName: string;
  onSelect: (id: string) => void;
  onActivate: (item: MixedItem) => void;
  onStartRename: (folder: KnowledgeFolder) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onChangeEditingName: (value: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}

function MixedRow({
  item,
  selected,
  isEditing,
  editingName,
  onSelect,
  onActivate,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onChangeEditingName,
  onDeleteFolder,
  onDeleteEntry,
}: MixedRowProps) {
  const isFolder = item.kind === "folder";
  const folder = isFolder ? (item.data as KnowledgeFolder) : null;
  const entry = !isFolder ? (item.data as KnowledgeEntry) : null;
  return (
    <div
      className={`${styles.tableRow} ${selected ? styles.rowSelected : ""}`}
      onClick={() => {
        if (!isEditing) onActivate(item);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!isEditing) onActivate(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className={styles.colCheck} onClick={(event) => event.stopPropagation()}>
        <Checkbox
          checked={selected}
          onChange={() => onSelect(item.data.id)}
          aria-label={`选择 ${item.data.name}`}
        />
      </span>
      <span className={styles.colName}>
        {isFolder ? (
          <FolderOpenOutlined className={styles.folderIcon} />
        ) : (
          <FileOutlined className={styles.fileIcon} />
        )}
        {isEditing && folder ? (
          <Input
            autoFocus
            value={editingName}
            onChange={(event) => onChangeEditingName(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onPressEnter={onCommitRename}
            onBlur={onCommitRename}
            onKeyDown={(event) => {
              if (event.key === "Escape") onCancelRename();
            }}
            size="small"
            className={styles.renameInput}
          />
        ) : (
          <span className={styles.folderName}>{item.data.name}</span>
        )}
      </span>
      <span className={styles.colCount}>
        {isFolder && folder ? (
          <Tag bordered={false}>{folder.fileCount} 个文件</Tag>
        ) : entry ? (
          <Tag bordered={false}>{formatFileSize(entry.size)}</Tag>
        ) : null}
      </span>
      <span className={styles.colTime}>{item.data.createdAt}</span>
      <span
        className={styles.colAction}
        onClick={(event) => event.stopPropagation()}
      >
        {folder ? (
          <FolderActions
            onRename={() => onStartRename(folder)}
            onDelete={() => onDeleteFolder(folder.id)}
          />
        ) : entry ? (
          <EntryActions onDelete={() => onDeleteEntry(entry.id)} />
        ) : null}
      </span>
    </div>
  );
}

function MixedCardGrid(props: MixedListProps) {
  return (
    <div className={styles.cardGrid}>
      {props.items.map((item) => {
        const isFolder = item.kind === "folder";
        const folder = isFolder ? (item.data as KnowledgeFolder) : null;
        const entry = !isFolder ? (item.data as KnowledgeEntry) : null;
        const isEditing = isFolder && props.editingId === item.data.id;
        return (
          <div
            key={item.data.id}
            className={`${styles.card} ${props.selectedIds.includes(item.data.id) ? styles.cardSelected : ""}`}
            onClick={() => props.onActivate(item)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.cardTop}>
              <Checkbox
                checked={props.selectedIds.includes(item.data.id)}
                onChange={() => props.onSelect(item.data.id)}
                onClick={(event) => event.stopPropagation()}
              />
              {folder ? (
                <FolderActions
                  onRename={() => props.onStartRename(folder)}
                  onDelete={() => props.onDeleteFolder(folder.id)}
                />
              ) : entry ? (
                <EntryActions onDelete={() => props.onDeleteEntry(entry.id)} />
              ) : null}
            </div>
            <div className={styles.cardIcon}>
              {isFolder ? <FolderOpenOutlined /> : <FileOutlined />}
            </div>
            {isEditing && folder ? (
              <Input
                autoFocus
                value={props.editingName}
                onChange={(event) => props.onChangeEditingName(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onPressEnter={props.onCommitRename}
                onBlur={props.onCommitRename}
                onKeyDown={(event) => {
                  if (event.key === "Escape") props.onCancelRename();
                }}
                size="small"
              />
            ) : (
              <div className={styles.cardName}>{item.data.name}</div>
            )}
            <div className={styles.cardMeta}>
              {isFolder && folder ? (
                <span>
                  <FolderOutlined /> {folder.fileCount} 个文件 · {folder.createdAt}
                </span>
              ) : entry ? (
                <span>
                  <FileOutlined /> {formatFileSize(entry.size)} · {entry.createdAt}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FolderActions({
  onRename,
  onDelete,
}: {
  onRename: () => void;
  onDelete: () => void;
}) {
  const items: MenuProps["items"] = [
    {
      key: "rename",
      label: (
        <span>
          <EditOutlined /> 重命名
        </span>
      ),
      onClick: onRename,
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="删除该文件夹？"
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
          <span className={styles.dangerLabel}>
            <DeleteOutlined /> 删除
          </span>
        </Popconfirm>
      ),
    },
  ];
  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Button
        type="text"
        size="small"
        icon={<EllipsisOutlined />}
        aria-label="更多操作"
      />
    </Dropdown>
  );
}

function EntryActions({ onDelete }: { onDelete: () => void }) {
  const items: MenuProps["items"] = [
    {
      key: "delete",
      label: (
        <Popconfirm
          title="删除该知识文件？"
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
          <span className={styles.dangerLabel}>
            <DeleteOutlined /> 删除
          </span>
        </Popconfirm>
      ),
    },
  ];
  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Button
        type="text"
        size="small"
        icon={<EllipsisOutlined />}
        aria-label="更多操作"
      />
    </Dropdown>
  );
}

interface UploadModalProps {
  open: boolean;
  pendingFiles: File[];
  onChangePending: (files: File[]) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function UploadModal({
  open,
  pendingFiles,
  onChangePending,
  onCancel,
  onConfirm,
}: UploadModalProps) {
  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      onChangePending([...pendingFiles, file]);
      return false;
    },
  };

  function removePending(index: number) {
    onChangePending(pendingFiles.filter((_, i) => i !== index));
  }

  return (
    <Modal
      title="上传文件"
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="开始上传"
      cancelText="取消"
      width={520}
      destroyOnClose
    >
      <div className={styles.uploadSection}>
        <div className={styles.uploadLabel}>选择文件</div>
        <Upload.Dragger {...uploadProps} className={styles.dragger}>
          <p className={styles.draggerIcon}>
            <CloudUploadOutlined />
          </p>
          <p className={styles.draggerText}>
            点击或拖拽文件到此区域上传（可多选）
          </p>
        </Upload.Dragger>
        {pendingFiles.length > 0 ? (
          <ul className={styles.pendingList}>
            {pendingFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className={styles.pendingItem}>
                <FileOutlined />
                <span className={styles.pendingName}>{file.name}</span>
                <span className={styles.pendingSize}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removePending(index)}
                  aria-label={`移除 ${file.name}`}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Modal>
  );
}

export type { ImportSourceType };
