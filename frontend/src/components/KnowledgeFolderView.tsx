import {
  ApiOutlined,
  AppstoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  ExperimentOutlined,
  FileOutlined,
  ImportOutlined,
  LoadingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Tag,
  Upload,
  type UploadProps,
  message,
} from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import {
  formatFileSize,
  type ApiConnection,
  type DatabaseConnection,
  type ExternalSourceConfig,
  type ImportRecord,
  type ImportSourceType,
  type KnowledgeFile,
  type KnowledgeFolder,
  type Tag as TagModel,
} from "./knowledgeBaseData";
import styles from "./KnowledgeFolderView.module.css";

type ViewMode = "card" | "list";

type ListItem =
  | { kind: "file"; data: KnowledgeFile; time: string }
  | { kind: "import"; data: ImportRecord; time: string };

interface KnowledgeFolderViewProps {
  folder: KnowledgeFolder;
  files: KnowledgeFile[];
  imports: ImportRecord[];
  dbConnections: DatabaseConnection[];
  apiConnections: ApiConnection[];
  externalConfig: ExternalSourceConfig;
  tags: TagModel[];
  onBack: () => void;
  onUpload: (file: File) => void;
  onDelete: (fileId: string) => void;
  onDeleteSelected: (fileIds: string[]) => void;
  onCreateImport: (record: ImportRecord) => void;
  onUpdateImport: (record: ImportRecord) => void;
  onDeleteImport: (recordId: string) => void;
  onUpdateFileTags: (fileId: string, tags: string[]) => void;
  onCreateTag: (name: string) => TagModel | null;
}

export function KnowledgeFolderView({
  folder,
  files,
  imports,
  dbConnections,
  apiConnections,
  externalConfig,
  tags,
  onBack,
  onUpload,
  onDelete,
  onDeleteSelected,
  onCreateImport,
  onUpdateImport,
  onDeleteImport,
  onUpdateFileTags,
  onCreateTag,
}: KnowledgeFolderViewProps) {
  const { modal, message: appMessage } = App.useApp();
  const [view, setView] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm] = Form.useForm<{ tags: string[] }>();
  const [pendingUpload, setPendingUpload] = useState<File[]>([]);
  const [editingFile, setEditingFile] = useState<KnowledgeFile | null>(null);

  const sortedFiles = useMemo(
    () => [...files].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    [files],
  );

  const mixedItems = useMemo<ListItem[]>(() => {
    const fileItems: ListItem[] = sortedFiles.map((f) => ({
      kind: "file" as const,
      data: f,
      time: f.uploadedAt,
    }));
    const importItems: ListItem[] = imports.map((r) => ({
      kind: "import" as const,
      data: r,
      time: r.lastSyncedAt ?? r.createdAt,
    }));
    return [...fileItems, ...importItems].sort((a, b) => b.time.localeCompare(a.time));
  }, [sortedFiles, imports]);

  const isAllSelected =
    mixedItems.length > 0 && selectedIds.length === mixedItems.length;
  const isPartialSelected =
    selectedIds.length > 0 && selectedIds.length < mixedItems.length;

  function toggleSelectAll() {
    setSelectedIds(isAllSelected ? [] : mixedItems.map((m) => m.data.id));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function openUpload() {
    setPendingUpload([]);
    uploadForm.resetFields();
    setUploadOpen(true);
  }

  function handleUploadConfirm() {
    if (pendingUpload.length === 0) {
      appMessage.warning("请选择要上传的文件");
      return;
    }
    const tagValues = uploadForm.getFieldValue("tags") as string[] | undefined;
    const tagsToApply = tagValues ?? [];
    pendingUpload.forEach((file) => onUpload(file, tagsToApply));
    appMessage.success(`已上传 ${pendingUpload.length} 个文件`);
    setUploadOpen(false);
    setPendingUpload([]);
    uploadForm.resetFields();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      droppedFiles.forEach((file) => onUpload(file, []));
    }
  }

  function handleRemoveTagFromFile(file: KnowledgeFile, tag: string) {
    onUpdateFileTags(
      file.id,
      (file.tags ?? []).filter((t) => t !== tag),
    );
  }

  return (
    <section className={styles.page} aria-label={folder.name}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            aria-label="返回知识库"
          />
          <h1 className={styles.folderName}>{folder.name}</h1>
        </div>
        <div className={styles.toolbarRight}>
          <Button icon={<CloudUploadOutlined />} onClick={openUpload}>
            上传文件
          </Button>
          <Button type="primary" icon={<ImportOutlined />} onClick={() => setImportOpen(true)}>
            导入
          </Button>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isPartialSelected}
            onChange={toggleSelectAll}
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

      {selectedIds.length > 0 ? (
        <div className={styles.batchBar}>
          <span>已选 {selectedIds.length} 项</span>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              onDeleteSelected(selectedIds);
              setSelectedIds([]);
            }}
          >
            批量删除
          </Button>
          <Button size="small" onClick={() => setSelectedIds([])}>
            取消
          </Button>
        </div>
      ) : null}

      <div
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {sortedFiles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.ghost}>
              <span className={styles.ghostBody} />
              <span className={styles.ghostEyeLeft} />
              <span className={styles.ghostEyeRight} />
              <span className={styles.ghostArmLeft} />
              <span className={styles.ghostArmRight} />
            </div>
            <div className={styles.emptyText}>暂无文件，可上传或从数据源导入</div>
          </div>
        ) : view === "list" ? (
          <MixedTable
            items={mixedItems}
            tags={tags}
            selectedIds={selectedIds}
            onSelect={toggleSelect}
            onDelete={(id) => {
              onDelete(id);
              setSelectedIds((prev) => prev.filter((x) => x !== id));
            }}
            onRemoveTag={handleRemoveTagFromFile}
            onEditTags={setEditingFile}
            onSyncImport={(record) => handleSync(record, onUpdateImport, appMessage)}
            onDeleteImport={(id) => {
              modal.confirm({
                title: "删除该导入记录?",
                content: "该记录对应的文件不会被删除。",
                okText: "删除",
                okButtonProps: { danger: true },
                cancelText: "取消",
                onOk: () => onDeleteImport(id),
              });
            }}
            dbConnections={dbConnections}
            apiConnections={apiConnections}
            externalConfig={externalConfig}
          />
        ) : (
          <MixedCardGrid
            items={mixedItems}
            tags={tags}
            selectedIds={selectedIds}
            onSelect={toggleSelect}
            onDelete={(id) => {
              onDelete(id);
              setSelectedIds((prev) => prev.filter((x) => x !== id));
            }}
            onRemoveTag={handleRemoveTagFromFile}
            onEditTags={setEditingFile}
            onSyncImport={(record) => handleSync(record, onUpdateImport, appMessage)}
            onDeleteImport={(id) => {
              modal.confirm({
                title: "删除该导入记录?",
                content: "该记录对应的文件不会被删除。",
                okText: "删除",
                okButtonProps: { danger: true },
                cancelText: "取消",
                onOk: () => onDeleteImport(id),
              });
            }}
            dbConnections={dbConnections}
            apiConnections={apiConnections}
            externalConfig={externalConfig}
          />
        )}
      </div>

      <ImportDialog
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        folderId={folder.id}
        dbConnections={dbConnections}
        apiConnections={apiConnections}
        externalConfig={externalConfig}
        existingRecords={imports}
        onCreate={(record) => {
          onCreateImport(record);
          setImportOpen(false);
          setTimeout(() => handleSync(record, onUpdateImport, appMessage), 100);
        }}
      />

      <UploadDialog
        open={uploadOpen}
        pendingFiles={pendingUpload}
        onChangePending={setPendingUpload}
        onCancel={() => setUploadOpen(false)}
        onConfirm={handleUploadConfirm}
        form={uploadForm}
        existingTags={tags}
        onCreateTag={onCreateTag}
      />

      <FileTagDrawer
        file={editingFile}
        tags={tags}
        onClose={() => setEditingFile(null)}
        onSave={(next) => {
          if (editingFile) {
            onUpdateFileTags(editingFile.id, next);
            appMessage.success("标签已更新");
          }
          setEditingFile(null);
        }}
        onCreateTag={onCreateTag}
      />
    </section>
  );
}

function handleSync(
  record: ImportRecord,
  onUpdate: (r: ImportRecord) => void,
  appMessage: typeof message,
) {
  onUpdate({ ...record, status: "syncing", lastError: undefined });
  setTimeout(() => {
    const passed = Math.random() > 0.15;
    if (passed) {
      onUpdate({
        ...record,
        status: "success",
        lastSyncedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        importedCount: record.importedCount + Math.floor(Math.random() * 8) + 1,
        lastError: undefined,
      });
      appMessage.success("同步完成");
    } else {
      onUpdate({
        ...record,
        status: "error",
        lastError: "目标数据源返回异常,请稍后重试",
      });
      appMessage.error("同步失败,请稍后重试");
    }
  }, 1200);
}

interface MixedTableProps {
  items: ListItem[];
  tags: TagModel[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRemoveTag: (file: KnowledgeFile, tag: string) => void;
  onEditTags: (file: KnowledgeFile) => void;
  onSyncImport: (record: ImportRecord) => void;
  onDeleteImport: (id: string) => void;
  dbConnections: DatabaseConnection[];
  apiConnections: ApiConnection[];
  externalConfig: ExternalSourceConfig;
}

function MixedTable({
  items,
  tags,
  selectedIds,
  onSelect,
  onDelete,
  onRemoveTag,
  onEditTags,
  onSyncImport,
  onDeleteImport,
  dbConnections,
  apiConnections,
  externalConfig,
}: MixedTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span className={styles.colCheck} />
        <span className={styles.colName}>名称</span>
        <span className={styles.colSource}>数据源</span>
        <span className={styles.colStatus}>状态</span>
        <span className={styles.colTime}>时间</span>
        <span className={styles.colAction} aria-label="操作" />
      </div>
      {items.map((item) =>
        item.kind === "file" ? (
          <FileRow
            key={item.data.id}
            file={item.data}
            tags={tags}
            selected={selectedIds.includes(item.data.id)}
            onSelect={onSelect}
            onDelete={onDelete}
            onRemoveTag={onRemoveTag}
            onEditTags={onEditTags}
          />
        ) : (
          <ImportRow
            key={item.data.id}
            record={item.data}
            selected={selectedIds.includes(item.data.id)}
            onSelect={onSelect}
            onSync={onSyncImport}
            onDelete={onDeleteImport}
            dbConnections={dbConnections}
            apiConnections={apiConnections}
            externalConfig={externalConfig}
          />
        ),
      )}
    </div>
  );
}

interface FileRowProps {
  file: KnowledgeFile;
  tags: TagModel[];
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRemoveTag: (file: KnowledgeFile, tag: string) => void;
  onEditTags: (file: KnowledgeFile) => void;
}

function FileRow({
  file,
  tags,
  selected,
  onSelect,
  onDelete,
  onRemoveTag,
  onEditTags,
}: FileRowProps) {
  return (
    <div
      className={`${styles.tableRow} ${selected ? styles.rowSelected : ""}`}
    >
      <span className={styles.colCheck}>
        <Checkbox
          checked={selected}
          onChange={() => onSelect(file.id)}
          aria-label={`选择 ${file.name}`}
        />
      </span>
      <span className={styles.colName}>
        <FileOutlined className={styles.fileIcon} />
        <span className={styles.fileName}>
          {file.name}
          <FileTagChips
            file={file}
            tags={tags}
            onRemove={onRemoveTag}
            onEdit={() => onEditTags(file)}
          />
        </span>
      </span>
      <span className={styles.colSource}>
        <Tag color="default" bordered={false}>
          本地上传
        </Tag>
      </span>
      <span className={styles.colStatus}>
        <Tag bordered={false}>已上传</Tag>
      </span>
      <span className={styles.colTime}>
        <div>{file.uploadedAt}</div>
        <div className={styles.colTimeMeta}>{formatFileSize(file.size)} · {file.uploader}</div>
      </span>
      <span className={styles.colAction}>
        <FileActions
          onEditTags={() => onEditTags(file)}
          onDelete={() => onDelete(file.id)}
        />
      </span>
    </div>
  );
}

interface ImportRowProps {
  record: ImportRecord;
  selected: boolean;
  onSelect: (id: string) => void;
  onSync: (record: ImportRecord) => void;
  onDelete: (id: string) => void;
  dbConnections: DatabaseConnection[];
  apiConnections: ApiConnection[];
  externalConfig: ExternalSourceConfig;
}

function ImportRow({
  record,
  selected,
  onSelect,
  onSync,
  onDelete,
  dbConnections,
  apiConnections,
  externalConfig,
}: ImportRowProps) {
  const meta = SOURCE_TYPE_META[record.sourceType];
  const connectionName = (() => {
    if (record.sourceType === "database") {
      return dbConnections.find((c) => c.id === record.connectionId)?.name ?? "已删除连接";
    }
    if (record.sourceType === "api") {
      return apiConnections.find((c) => c.id === record.connectionId)?.name ?? "已删除连接";
    }
    const binding = externalConfig.bindings.find((b) => b.id === record.connectionId);
    if (!binding) return "已删除绑定";
    const api = externalConfig.apis.find((a) => a.id === binding.apiId);
    return api ? `${api.name} / ${binding.knowledgeId}` : "已删除 API";
  })();
  const isSyncing = record.status === "syncing";

  return (
    <div
      className={`${styles.tableRow} ${selected ? styles.rowSelected : ""} ${styles.importRow}`}
    >
      <span className={styles.colCheck}>
        <Checkbox
          checked={selected}
          onChange={() => onSelect(record.id)}
          aria-label={`选择 ${record.scope}`}
        />
      </span>
      <span className={styles.colName}>
        <span className={styles.importRowIcon}>{meta.icon}</span>
        <span className={styles.fileName}>
          {record.scope}
          <span className={styles.importRowSub}>
            {meta.label} · {connectionName}
          </span>
        </span>
      </span>
      <span className={styles.colSource}>
        <Tag color={meta.color} icon={meta.icon}>
          {meta.label}
        </Tag>
        <code className={styles.scopeCode}>{record.scope}</code>
      </span>
      <span className={styles.colStatus}>
        <ImportStatusTag status={record.status} />
        {record.lastError ? (
          <div className={styles.importError}>{record.lastError}</div>
        ) : null}
      </span>
      <span className={styles.colTime}>
        <div>{record.lastSyncedAt ? `同步: ${record.lastSyncedAt}` : "尚未同步"}</div>
        <div className={styles.colTimeMeta}>累计 {record.importedCount} 条</div>
      </span>
      <span className={styles.colAction}>
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<ImportOutlined />}
            loading={isSyncing}
            onClick={() => onSync(record)}
          >
            立即同步
          </Button>
          <ImportRowActions onDelete={() => onDelete(record.id)} disabled={isSyncing} />
        </Space>
      </span>
    </div>
  );
}

function ImportRowActions({
  onDelete,
  disabled,
}: {
  onDelete: () => void;
  disabled: boolean;
}) {
  const { modal } = App.useApp();
  const items: MenuProps["items"] = [
    {
      key: "delete",
      label: (
        <span className={styles.dangerLabel}>
          <DeleteOutlined /> 删除
        </span>
      ),
      disabled,
      onClick: () => {
        modal.confirm({
          title: "删除该导入记录?",
          content: "删除后再次同步需要重新创建导入任务。",
          okText: "删除",
          cancelText: "取消",
          okButtonProps: { danger: true },
          onOk: onDelete,
        });
      },
    },
  ];
  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Button
        type="text"
        size="small"
        icon={<EllipsisOutlined />}
        aria-label="更多操作"
        disabled={disabled}
      />
    </Dropdown>
  );
}

function ImportStatusTag({ status }: { status: ImportRecord["status"] }) {
  if (status === "success") {
    return (
      <Tag color="success" icon={<CheckCircleOutlined />}>
        同步成功
      </Tag>
    );
  }
  if (status === "syncing") {
    return (
      <Tag color="processing" icon={<LoadingOutlined spin />}>
        同步中
      </Tag>
    );
  }
  if (status === "error") {
    return (
      <Tag color="error" icon={<CloseCircleOutlined />}>
        同步失败
      </Tag>
    );
  }
  return <Tag>未同步</Tag>;
}

interface MixedCardGridProps {
  items: ListItem[];
  tags: TagModel[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRemoveTag: (file: KnowledgeFile, tag: string) => void;
  onEditTags: (file: KnowledgeFile) => void;
  onSyncImport: (record: ImportRecord) => void;
  onDeleteImport: (id: string) => void;
  dbConnections: DatabaseConnection[];
  apiConnections: ApiConnection[];
  externalConfig: ExternalSourceConfig;
}

function MixedCardGrid(props: MixedCardGridProps) {
  if (props.items.length === 0) return <Empty description="暂无内容" />;
  return (
    <div className={styles.cardGrid}>
      {props.items.map((item) =>
        item.kind === "file" ? (
          <FileCard
            key={item.data.id}
            file={item.data}
            tags={props.tags}
            selected={props.selectedIds.includes(item.data.id)}
            onSelect={props.onSelect}
            onDelete={props.onDelete}
            onRemoveTag={props.onRemoveTag}
            onEditTags={props.onEditTags}
          />
        ) : (
          <ImportCard
            key={item.data.id}
            record={item.data}
            selected={props.selectedIds.includes(item.data.id)}
            onSelect={props.onSelect}
            onSync={props.onSyncImport}
            onDelete={props.onDeleteImport}
            dbConnections={props.dbConnections}
            apiConnections={props.apiConnections}
            externalConfig={props.externalConfig}
          />
        ),
      )}
    </div>
  );
}

interface FileCardProps {
  file: KnowledgeFile;
  tags: TagModel[];
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRemoveTag: (file: KnowledgeFile, tag: string) => void;
  onEditTags: (file: KnowledgeFile) => void;
}

function FileCard({
  file,
  tags,
  selected,
  onSelect,
  onDelete,
  onRemoveTag,
  onEditTags,
}: FileCardProps) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.cardSelected : ""}`}
    >
      <div className={styles.cardTop}>
        <Checkbox
          checked={selected}
          onChange={() => onSelect(file.id)}
        />
        <FileActions
          onEditTags={() => onEditTags(file)}
          onDelete={() => onDelete(file.id)}
        />
      </div>
      <div className={styles.cardIcon}>
        <FileOutlined />
      </div>
      <div className={styles.cardName} title={file.name}>
        {file.name}
      </div>
      <div className={styles.cardTags}>
        <FileTagChips
          file={file}
          tags={tags}
          onRemove={onRemoveTag}
          onEdit={() => onEditTags(file)}
        />
      </div>
      <div className={styles.cardMeta}>
        {formatFileSize(file.size)} · {file.uploader}
      </div>
    </div>
  );
}

interface ImportCardProps {
  record: ImportRecord;
  selected: boolean;
  onSelect: (id: string) => void;
  onSync: (record: ImportRecord) => void;
  onDelete: (id: string) => void;
  dbConnections: DatabaseConnection[];
  apiConnections: ApiConnection[];
  externalConfig: ExternalSourceConfig;
}

function ImportCard({
  record,
  selected,
  onSelect,
  onSync,
  onDelete,
  dbConnections,
  apiConnections,
  externalConfig,
}: ImportCardProps) {
  const meta = SOURCE_TYPE_META[record.sourceType];
  const connectionName = (() => {
    if (record.sourceType === "database") {
      return dbConnections.find((c) => c.id === record.connectionId)?.name ?? "已删除连接";
    }
    if (record.sourceType === "api") {
      return apiConnections.find((c) => c.id === record.connectionId)?.name ?? "已删除连接";
    }
    const binding = externalConfig.bindings.find((b) => b.id === record.connectionId);
    if (!binding) return "已删除绑定";
    const api = externalConfig.apis.find((a) => a.id === binding.apiId);
    return api ? `${api.name} / ${binding.knowledgeId}` : "已删除 API";
  })();
  const isSyncing = record.status === "syncing";

  return (
    <div
      className={`${styles.card} ${selected ? styles.cardSelected : ""} ${styles.importCard}`}
    >
      <div className={styles.cardTop}>
        <Checkbox
          checked={selected}
          onChange={() => onSelect(record.id)}
        />
        <ImportRowActions onDelete={() => onDelete(record.id)} disabled={isSyncing} />
      </div>
      <div className={`${styles.cardIcon} ${styles.cardIconImport}`}>{meta.icon}</div>
      <div className={styles.cardName} title={record.scope}>
        {record.scope}
      </div>
      <div className={styles.cardMeta}>
        <Tag color={meta.color} bordered={false} icon={meta.icon}>
          {meta.label}
        </Tag>
        <span>{connectionName}</span>
      </div>
      <div className={styles.cardStatusRow}>
        <ImportStatusTag status={record.status} />
        <span>{record.lastSyncedAt ? record.lastSyncedAt : "尚未同步"}</span>
      </div>
      <div className={styles.cardActions}>
        <Button
          size="small"
          type="primary"
          icon={<ImportOutlined />}
          loading={isSyncing}
          onClick={() => onSync(record)}
        >
          立即同步
        </Button>
      </div>
    </div>
  );
}

interface FileTagChipsProps {
  file: KnowledgeFile;
  tags: TagModel[];
  onRemove: (file: KnowledgeFile, tag: string) => void;
  onEdit: () => void;
}

function FileTagChips({ file, tags, onRemove, onEdit }: FileTagChipsProps) {
  const fileTags = Array.from(new Set(file.tags ?? []));
  return (
    <span
      className={styles.tagChipRow}
      onClick={(event) => event.stopPropagation()}
    >
      {fileTags.map((name) => {
        const meta = tags.find((t) => t.name === name);
        return (
          <Tag
            key={name}
            color={meta?.color ?? "default"}
            bordered={false}
            closable
            onClose={(event) => {
              event.preventDefault();
              onRemove(file, name);
            }}
            className={styles.fileTag}
          >
            {name}
          </Tag>
        );
      })}
      <Button
        size="small"
        type="text"
        icon={<TagsOutlined />}
        onClick={onEdit}
        className={styles.tagEditBtn}
      >
        {fileTags.length === 0 ? "添加标签" : ""}
      </Button>
    </span>
  );
}

function FileActions({
  onEditTags,
  onDelete,
}: {
  onEditTags: () => void;
  onDelete: () => void;
}) {
  const { modal } = App.useApp();
  const items: MenuProps["items"] = [
    {
      key: "download",
      label: (
        <span>
          <DownloadOutlined /> 下载
        </span>
      ),
      onClick: () => modal.info({ title: "下载待接入" }),
    },
    {
      key: "tags",
      label: (
        <span>
          <TagsOutlined /> 编辑标签
        </span>
      ),
      onClick: onEditTags,
    },
    {
      key: "delete",
      label: (
        <span className={styles.dangerLabel}>
          <DeleteOutlined /> 删除
        </span>
      ),
      onClick: () => {
        modal.confirm({
          title: "删除该文件？",
          content: "删除后无法恢复",
          okText: "删除",
          cancelText: "取消",
          okButtonProps: { danger: true },
          onOk: onDelete,
        });
      },
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

const SOURCE_TYPE_META: Record<
  ImportSourceType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  database: { label: "数据库", icon: <DatabaseOutlined />, color: "blue" },
  api: { label: "API", icon: <ApiOutlined />, color: "geekblue" },
  external: { label: "外部知识库", icon: <ExperimentOutlined />, color: "orange" },
};

interface ImportDialogProps {
  open: boolean;
  onCancel: () => void;
  folderId: string;
  dbConnections: DatabaseConnection[];
  apiConnections: ApiConnection[];
  externalConfig: ExternalSourceConfig;
  existingRecords: ImportRecord[];
  onCreate: (record: ImportRecord) => void;
}

function ImportDialog({
  open,
  onCancel,
  folderId,
  dbConnections,
  apiConnections,
  externalConfig,
  existingRecords,
  onCreate,
}: ImportDialogProps) {
  const [form] = Form.useForm<{
    sourceType: ImportSourceType;
    connectionId?: string;
    bindingId?: string;
    table?: string;
    endpoint?: string;
  }>();
  const sourceType = Form.useWatch("sourceType", form);
  const connectionId = Form.useWatch("connectionId", form);

  const db = dbConnections.find((c) => c.id === connectionId);
  const api = apiConnections.find((c) => c.id === connectionId);

  function handleCreate() {
    form
      .validateFields()
      .then((values) => {
        let scope = "";
        let connectionId = "";
        if (values.sourceType === "database") {
          if (!values.table) {
            message.warning("请填写待导入的数据表");
            return;
          }
          scope = values.table;
          connectionId = values.connectionId ?? "";
        } else if (values.sourceType === "api") {
          if (!values.endpoint) {
            message.warning("请填写待调用的 endpoint");
            return;
          }
          scope = values.endpoint;
          connectionId = values.connectionId ?? "";
        } else {
          const targetBinding = externalConfig.bindings.find(
            (b) => b.id === values.bindingId,
          );
          if (!targetBinding) {
            message.warning("请选择外部知识库绑定");
            return;
          }
          scope = targetBinding.knowledgeId;
          connectionId = targetBinding.id;
        }

        const dup = existingRecords.find(
          (r) =>
            r.folderId === folderId &&
            r.sourceType === values.sourceType &&
            r.connectionId === connectionId &&
            r.scope === scope,
        );
        if (dup) {
          message.warning("相同连接 + 范围的导入任务已存在,请直接在导入记录里同步");
          return;
        }

        const record: ImportRecord = {
          id: `IMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          folderId,
          sourceType: values.sourceType,
          connectionId,
          scope,
          status: "idle",
          importedCount: 0,
          createdAt: new Date().toISOString(),
        };
        onCreate(record);
        form.resetFields();
      })
      .catch(() => {
        /* validation already shown by antd Form */
      });
  }

  const externalBindingsCount = externalConfig.bindings.length;
  const externalAvailable = externalBindingsCount > 0;

  return (
    <Modal
      title="导入数据"
      open={open}
      onCancel={onCancel}
      onOk={handleCreate}
      okText="创建并立即同步"
      cancelText="取消"
      width={640}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ sourceType: "database" }}
        className={styles.importForm}
      >
        <Form.Item label="数据源类型" name="sourceType" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "database", label: "数据库" },
              { value: "api", label: "API 接口" },
              {
                value: "external",
                label: "外部知识库",
                disabled: !externalAvailable,
              },
            ]}
            optionRender={(option) => (
              <Space>
                {SOURCE_TYPE_META[option.value as ImportSourceType].icon}
                <span>{option.label}</span>
              </Space>
            )}
          />
        </Form.Item>

        {sourceType === "database" ? (
          <>
            <Form.Item
              label="数据库连接"
              name="connectionId"
              rules={[{ required: true, message: "请选择数据库连接" }]}
            >
              <DatabaseConnectionSelect connections={dbConnections} />
            </Form.Item>
            <Form.Item
              label="待同步的数据表"
              name="table"
              rules={[{ required: true, message: "请填写数据表" }]}
              extra={
                db?.tables?.length
                  ? `此连接已声明: ${db.tables.join(", ")}`
                  : "未在连接中预声明时,会按表名全量同步"
              }
            >
              <Select
                allowClear
                showSearch
                placeholder="选择或输入表名"
                options={(db?.tables ?? []).map((t) => ({ value: t, label: t }))}
                mode="tags"
                maxCount={1}
              />
            </Form.Item>
          </>
        ) : null}

        {sourceType === "api" ? (
          <>
            <Form.Item
              label="API 连接"
              name="connectionId"
              rules={[{ required: true, message: "请选择 API 连接" }]}
            >
              <ApiConnectionSelect connections={apiConnections} />
            </Form.Item>
            <Form.Item
              label="待调用的 endpoint"
              name="endpoint"
              rules={[{ required: true, message: "请填写 endpoint" }]}
              extra={api ? `此连接已配置: ${api.baseUrl}${api.endpoint}` : undefined}
            >
              <Input
                placeholder={api ? api.endpoint : "/v1/knowledge/list"}
                addonBefore={api ? api.baseUrl : undefined}
              />
            </Form.Item>
          </>
        ) : null}

        {sourceType === "external" ? (
          <>
            <Form.Item
              label="外部知识库绑定"
              name="bindingId"
              rules={[{ required: true, message: "请选择外部知识库绑定" }]}
            >
              <ExternalBindingSelect
                bindings={externalConfig.bindings}
                apis={externalConfig.apis}
              />
            </Form.Item>
          </>
        ) : null}
      </Form>
    </Modal>
  );
}

function DatabaseConnectionSelect({
  connections,
}: {
  connections: DatabaseConnection[];
}) {
  if (connections.length === 0) {
    return (
      <Empty
        description="尚未配置数据库连接,请先在「数据源 → 数据库」创建"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  return (
    <Select
      placeholder="选择数据库连接"
      options={connections.map((c) => ({
        value: c.id,
        label: (
          <Space>
            <DatabaseOutlined />
            <span>{c.name}</span>
            <Tag bordered={false}>{c.driver}</Tag>
          </Space>
        ),
      }))}
    />
  );
}

function ApiConnectionSelect({
  connections,
}: {
  connections: ApiConnection[];
}) {
  if (connections.length === 0) {
    return (
      <Empty
        description="尚未配置 API 连接,请先在「数据源 → API 接口」创建"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  return (
    <Select
      placeholder="选择 API 连接"
      options={connections.map((c) => ({
        value: c.id,
        label: (
          <Space>
            <ApiOutlined />
            <span>{c.name}</span>
          </Space>
        ),
      }))}
    />
  );
}

function ExternalBindingSelect({
  bindings,
  apis,
}: {
  bindings: ExternalSourceConfig["bindings"];
  apis: ExternalSourceConfig["apis"];
}) {
  if (bindings.length === 0) {
    return (
      <Empty
        description="尚未创建外部知识库绑定,请先在「数据源 → 外部知识库」配置"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  return (
    <Select
      placeholder="选择外部知识库绑定"
      options={bindings.map((b) => {
        const api = apis.find((a) => a.id === b.apiId);
        return {
          value: b.id,
          label: (
            <Space>
              <ExperimentOutlined />
              <span>{b.description || b.knowledgeId}</span>
              <Tag bordered={false}>{api?.name ?? "已删除 API"}</Tag>
            </Space>
          ),
        };
      })}
    />
  );
}

interface UploadDialogProps {
  open: boolean;
  pendingFiles: File[];
  onChangePending: (files: File[]) => void;
  onCancel: () => void;
  onConfirm: () => void;
  form: ReturnType<typeof Form.useForm<{ tags: string[] }>>[0];
  existingTags: TagModel[];
  onCreateTag: (name: string) => TagModel | null;
}

function UploadDialog({
  open,
  pendingFiles,
  onChangePending,
  onCancel,
  onConfirm,
  form,
  existingTags,
}: UploadDialogProps) {
  const [uploading] = useState(false);

  function handleAdd() {
    onConfirm();
  }

  return (
    <Modal
      title="上传文件"
      open={open}
      onCancel={onCancel}
      onOk={handleAdd}
      okText="开始上传"
      cancelText="取消"
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className={styles.importForm}>
        <Form.Item label="选择文件">
          <UploadArea
            pendingFiles={pendingFiles}
            onChangePending={onChangePending}
          />
        </Form.Item>
        <Form.Item
          label="标签(可选)"
          name="tags"
          tooltip="可从已有标签中选择,也可直接输入新标签,新标签会同步加入「标签」管理页"
        >
          <Select
            mode="tags"
            placeholder="选择或输入标签"
            options={existingTags.map((t) => ({
              value: t.name,
              label: (
                <Space size={4}>
                  <Tag color={t.color ?? "default"} bordered={false} className={styles.inlineTag}>
                    {t.name}
                  </Tag>
                </Space>
              ),
            }))}
            tokenSeparators={[",", "，", " "]}
            onInputKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            tagRender={(props) => {
              const { value, closable, onClose } = props;
              const meta = existingTags.find((t) => t.name === value);
              return (
                <Tag
                  color={meta?.color ?? "blue"}
                  bordered={false}
                  closable={closable}
                  onClose={onClose}
                  className={styles.inlineTag}
                >
                  {value}
                </Tag>
              );
            }}
            notFoundContent={null}
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  void uploading;
}

interface UploadAreaProps {
  pendingFiles: File[];
  onChangePending: (files: File[]) => void;
}

function UploadArea({ pendingFiles, onChangePending }: UploadAreaProps) {
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
    <>
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
    </>
  );
}

interface FileTagDrawerProps {
  file: KnowledgeFile | null;
  tags: TagModel[];
  onClose: () => void;
  onSave: (tags: string[]) => void;
  onCreateTag: (name: string) => TagModel | null;
}

function FileTagDrawer({
  file,
  tags,
  onClose,
  onSave,
  onCreateTag,
}: FileTagDrawerProps) {
  const [draft, setDraft] = useState<string[]>([]);

  useMemo(() => {
    if (file) {
      setDraft(Array.from(new Set(file.tags ?? [])));
    } else {
      setDraft([]);
    }
  }, [file]);

  if (!file) return null;

  function syncDraft(next: string[]) {
    setDraft(Array.from(new Set(next)));
  }

  function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (draft.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    onCreateTag(trimmed);
    setDraft((prev) => Array.from(new Set([...prev, trimmed])));
  }

  function removeTag(name: string) {
    setDraft((prev) => prev.filter((t) => t !== name));
  }

  return (
    <Drawer
      title={`编辑标签 - ${file.name}`}
      open={file !== null}
      onClose={onClose}
      width={420}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" icon={<TagsOutlined />} onClick={() => onSave(draft)}>
            保存
          </Button>
        </Space>
      }
    >
      <div className={styles.tagDrawerHint}>
        支持选择已有标签,也可直接输入新标签(新标签会自动加入「标签」管理页)。
      </div>
      <Select
        mode="multiple"
        value={draft}
        onChange={(value) => syncDraft(value)}
        placeholder="选择或输入标签"
        options={tags.map((t) => ({
          value: t.name,
          label: (
            <Space size={4}>
              <Tag color={t.color ?? "default"} bordered={false} className={styles.inlineTag}>
                {t.name}
              </Tag>
            </Space>
          ),
        }))}
        tagRender={(props) => {
          const { value, closable, onClose: closeEvent } = props;
          const meta = tags.find((t) => t.name === value);
          return (
            <Tag
              color={meta?.color ?? "blue"}
              bordered={false}
              closable={closable}
              onClose={(event) => {
                event.preventDefault();
                closeEvent?.(event);
              }}
              className={styles.inlineTag}
            >
              {value}
            </Tag>
          );
        }}
        tokenSeparators={[",", "，", " "]}
        style={{ width: "100%" }}
        onSelect={(value) => addTag(value as string)}
        onDeselect={(value) => removeTag(value as string)}
        notFoundContent={null}
      />

      <div className={styles.tagDrawerSection}>
        <h4 className={styles.tagDrawerSubtitle}>当前标签 ({draft.length})</h4>
        {draft.length === 0 ? (
          <Empty
            description="未设置标签"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Space wrap>
            {draft.map((name) => {
              const meta = tags.find((t) => t.name === name);
              return (
                <Tag
                  key={name}
                  color={meta?.color ?? "default"}
                  closable
                  onClose={(event) => {
                    event.preventDefault();
                    removeTag(name);
                  }}
                  className={styles.inlineTag}
                >
                  {name}
                </Tag>
              );
            })}
          </Space>
        )}
      </div>
    </Drawer>
  );
}
