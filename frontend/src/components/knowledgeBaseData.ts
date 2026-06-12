export type KnowledgeFolder = {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
};

export type KnowledgeFile = {
  id: string;
  folderId: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploader: string;
  source: KnowledgeItemSource;
  tags: string[];
};

export type KnowledgeEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploader: string;
  createdAt: string;
};

export type KnowledgeItemSource =
  | { kind: "local"; uploader: string }
  | { kind: "database"; connectionId: string; table: string }
  | { kind: "api"; connectionId: string; endpoint: string }
  | { kind: "external"; connectionId: string; knowledgeId: string };

export type Tag = {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
};

export const TAG_COLORS = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
] as const;
export type TagColor = (typeof TAG_COLORS)[number];

export type DatabaseDriver = "mysql" | "postgresql" | "sqlserver" | "oracle";
export type ApiAuthType = "none" | "apikey" | "bearer" | "basic";

export type DatabaseConnection = {
  id: string;
  name: string;
  driver: DatabaseDriver;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  tables: string[];
  status: "connected" | "disconnected" | "error";
  lastTestedAt?: string;
};

export type ApiConnection = {
  id: string;
  name: string;
  baseUrl: string;
  endpoint: string;
  authType: ApiAuthType;
  authToken: string;
  fieldMapping: string;
  status: "connected" | "disconnected" | "error";
  lastTestedAt?: string;
};

export type ExternalKbApiConfig = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  retrievalPath: string;
};

export type ExternalKbBinding = {
  id: string;
  apiId: string;
  knowledgeId: string;
  topK: number;
  scoreThreshold: number | null;
  description?: string;
};

export type ExternalSourceConfig = {
  apis: ExternalKbApiConfig[];
  bindings: ExternalKbBinding[];
};

export type ImportSourceType = "database" | "api" | "external";
export type ImportStatus = "idle" | "syncing" | "success" | "error";

export type ImportRecord = {
  id: string;
  folderId: string;
  sourceType: ImportSourceType;
  connectionId: string;
  scope: string;
  status: ImportStatus;
  lastSyncedAt?: string;
  lastError?: string;
  importedCount: number;
  createdAt: string;
};

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

export function formatFileSize(bytes: number) {
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${bytes} B`;
}

export const knowledgeFolders: KnowledgeFolder[] = [
  { id: "F-1001", name: "标准规范库", fileCount: 0, createdAt: "5 分钟前" },
  { id: "F-1002", name: "案例库", fileCount: 0, createdAt: "5 分钟前" },
  { id: "F-1003", name: "产品资料库", fileCount: 0, createdAt: "5 分钟前" },
];

export const initialKnowledgeFiles: KnowledgeFile[] = [];
export const initialKnowledgeEntries: KnowledgeEntry[] = [];
export const initialImportRecords: ImportRecord[] = [];

export const initialDatabaseConnections: DatabaseConnection[] = [];
export const initialApiConnections: ApiConnection[] = [];

export const initialTags: Tag[] = [];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function migrateKnowledgeFiles(raw: unknown): KnowledgeFile[] {
  if (!Array.isArray(raw)) return initialKnowledgeFiles;
  return raw.map((item) => {
    if (!isPlainObject(item)) {
      return {
        id: `FILE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        folderId: "",
        name: "",
        size: 0,
        type: "",
        uploadedAt: "",
        uploader: "当前用户",
        source: { kind: "local", uploader: "当前用户" },
        tags: [],
      };
    }
    const file = item as KnowledgeFile;
    return {
      ...file,
      source: file.source ?? { kind: "local", uploader: file.uploader ?? "当前用户" },
      tags: Array.isArray(file.tags) ? file.tags : [],
    };
  });
}

export function migrateTags(raw: unknown): Tag[] {
  if (!Array.isArray(raw)) return initialTags;
  return raw
    .filter(isPlainObject)
    .map((item) => {
      const tag = item as Tag;
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
      };
    });
}

export function migrateImportRecords(raw: unknown): ImportRecord[] {
  if (!Array.isArray(raw)) return initialImportRecords;
  return raw.filter(isPlainObject) as ImportRecord[];
}

export function migrateDatabaseConnections(raw: unknown): DatabaseConnection[] {
  if (!Array.isArray(raw)) return initialDatabaseConnections;
  return raw.filter(isPlainObject) as DatabaseConnection[];
}

export function migrateApiConnections(raw: unknown): ApiConnection[] {
  if (!Array.isArray(raw)) return initialApiConnections;
  return raw.filter(isPlainObject) as ApiConnection[];
}
