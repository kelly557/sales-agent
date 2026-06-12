import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  FileDoneOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Dropdown,
  Empty,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import {
  templates as initialTemplates,
  templateStatusLabels,
  templateTypeLabels,
  type DocumentTemplate,
  type TemplateStatus,
  type TemplateType,
} from "./templateData";

import { TemplateUploadModal } from "./TemplateUploadModal";
import styles from "./TemplatesPage.module.css";

const statusColors: Record<TemplateStatus, string> = {
  ready: "success",
  draft: "default",
  reviewing: "processing",
};

type ViewMode = "card" | "list";

export function TemplatesPage() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<TemplateType | "all">("all");
  const [sortBy, setSortBy] = useState<"updatedAt" | "usageCount">("updatedAt");
  const [view, setView] = useState<ViewMode>("card");
  const [templateList, setTemplateList] = useState<DocumentTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredTemplates = useMemo(() => {
    return templateList
      .filter((item) => matchesKeyword(item, keyword))
      .filter((item) => type === "all" || item.type === type)
      .sort((a, b) =>
        sortBy === "updatedAt" ? b.updatedAt.localeCompare(a.updatedAt) : b.usageCount - a.usageCount,
      );
  }, [templateList, keyword, sortBy, type]);

  function handleDelete(templateId: string) {
    setTemplateList((list) => list.filter((item) => item.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
    message.success("已删除模板");
  }

  function handleUpload(payload: {
    name: string;
    type: TemplateType;
    status: TemplateStatus;
    summary: string;
    tags: string[];
    sourceFile: DocumentTemplate["sourceFile"];
  }) {
    const id = `TPL-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().slice(0, 10);
    const next: DocumentTemplate = {
      id,
      name: payload.name,
      type: payload.type,
      status: payload.status,
      updatedAt: today,
      summary: payload.summary,
      fields: [],
      outputs: [],
      tags: payload.tags,
      usageCount: 0,
      sourceFile: payload.sourceFile,
    };
    setTemplateList((list) => [next, ...list]);
    setIsUploadOpen(false);
    message.success(`已上传模板：${payload.name}`);
  }

  if (selectedTemplate) {
    return (
      <TemplateDetail
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onDelete={() => handleDelete(selectedTemplate.id)}
      />
    );
  }

  return (
    <section className={styles.page} aria-label="模板库">
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsUploadOpen(true)}
          >
            上传模板
          </Button>
          <Input.Search
            allowClear
            placeholder="搜索模板名称、摘要、标签"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className={styles.search}
          />
          <Select
            value={type}
            className={styles.filter}
            options={[{ value: "all", label: "全部类型" }, ...toOptions(templateTypeLabels)]}
            onChange={setType}
          />
          <Select
            value={sortBy}
            className={styles.filter}
            options={[
              { value: "updatedAt", label: "按更新时间" },
              { value: "usageCount", label: "按使用次数" },
            ]}
            onChange={setSortBy}
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

      {filteredTemplates.length === 0 ? (
        <Empty className={styles.empty} description="没有匹配的模板">
          <Button onClick={() => setKeyword("")}>清空搜索</Button>
        </Empty>
      ) : view === "card" ? (
        <div className={styles.cardGrid}>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onOpen={() => setSelectedTemplate(template)}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>
      ) : (
        <TemplateTable
          templates={filteredTemplates}
          onOpen={setSelectedTemplate}
          onDelete={handleDelete}
        />
      )}

      <TemplateUploadModal
        open={isUploadOpen}
        onCancel={() => setIsUploadOpen(false)}
        onSubmit={handleUpload}
      />
    </section>
  );
}

interface TemplateCardProps {
  template: DocumentTemplate;
  onOpen: () => void;
  onDelete: () => void;
}

function TemplateCard({ template, onOpen, onDelete }: TemplateCardProps) {
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
        <div className={styles.cardTags}>
          <Tag>{templateTypeLabels[template.type]}</Tag>
          <Tag color={statusColors[template.status]}>{templateStatusLabels[template.status]}</Tag>
        </div>
        <TemplateActions onDelete={onDelete} />
      </header>
      <h3 className={styles.cardTitle}>{template.name}</h3>
      <p className={styles.cardSummary}>{template.summary || "（暂无说明）"}</p>
      <footer className={styles.cardFooter}>
        <div className={styles.cardTags}>
          {template.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <span className={styles.cardMeta}>{template.usageCount} 次使用 · {template.updatedAt}</span>
      </footer>
    </article>
  );
}

interface TemplateTableProps {
  templates: DocumentTemplate[];
  onOpen: (template: DocumentTemplate) => void;
  onDelete: (templateId: string) => void;
}

function TemplateTable({ templates, onOpen, onDelete }: TemplateTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span>模板名称</span>
        <span>类型</span>
        <span>状态</span>
        <span>使用次数</span>
        <span>更新时间</span>
        <span aria-label="操作" />
      </div>
      {templates.map((template) => (
        <div
          key={template.id}
          className={styles.tableRow}
          onClick={() => onOpen(template)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen(template);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <span className={styles.tableName}>
            <span className={styles.tableNameText}>{template.name}</span>
            <span className={styles.tableId}>{template.id}</span>
          </span>
          <span>
            <Tag>{templateTypeLabels[template.type]}</Tag>
          </span>
          <span>
            <Tag color={statusColors[template.status]}>{templateStatusLabels[template.status]}</Tag>
          </span>
          <span>{template.usageCount}</span>
          <span>{template.updatedAt}</span>
          <span onClick={(event) => event.stopPropagation()}>
            <TemplateActions onDelete={() => onDelete(template.id)} compact />
          </span>
        </div>
      ))}
    </div>
  );
}

interface TemplateActionsProps {
  onDelete: () => void;
  compact?: boolean;
}

function TemplateActions({ onDelete, compact = false }: TemplateActionsProps) {
  const items: MenuProps["items"] = [
    {
      key: "delete",
      label: (
        <Popconfirm
          title="确认删除该模板？"
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

function TemplateDetail({
  template,
  onBack,
  onDelete,
}: {
  template: DocumentTemplate;
  onBack: () => void;
  onDelete: () => void;
}) {
  return (
    <section className={styles.detailPage} aria-label="模板详情页">
      <header className={styles.detailHeader}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回模版
        </Button>
        <Space>
          <Popconfirm
            title="确认删除该模板？"
            description="删除后无法恢复"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={onDelete}
          >
            <Button icon={<DeleteOutlined />}>删除模板</Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            onClick={() => message.success(`已基于 ${template.name} 创建生成任务`)}
          >
            使用模板生成
          </Button>
        </Space>
      </header>

      <main className={styles.detailLayout}>
        <section className={styles.preview}>
          <Tag>{templateTypeLabels[template.type]}</Tag>
          <h1>{template.name}</h1>
          <p>{template.summary}</p>
          <Descriptions
            bordered
            size="small"
            column={2}
            items={[
              { key: "status", label: "状态", children: templateStatusLabels[template.status] },
              { key: "updatedAt", label: "更新时间", children: template.updatedAt },
              { key: "usageCount", label: "使用次数", children: `${template.usageCount} 次` },
              ...(template.sourceFile
                ? [
                    {
                      key: "sourceFile",
                      label: "初始文件",
                      children: `${template.sourceFile.name} (${(
                        template.sourceFile.size / 1024
                      ).toFixed(1)} KB)`,
                    },
                  ]
                : []),
            ]}
          />
        </section>

        <aside className={styles.sidePanel}>
          <h2>字段与输出</h2>
          <Table
            size="small"
            pagination={false}
            dataSource={template.fields.map((field, index) => ({
              key: field,
              field,
              output: template.outputs[index] ?? "按模板规则生成",
            }))}
            columns={[
              { title: "输入字段", dataIndex: "field" },
              { title: "生成内容", dataIndex: "output" },
            ]}
          />
          <div className={styles.tags}>
            {template.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </aside>
      </main>
    </section>
  );
}

function matchesKeyword(template: DocumentTemplate, keyword: string) {
  const source = `${template.name} ${template.summary} ${template.owner} ${template.tags.join(" ")}`;
  return source.toLowerCase().includes(keyword.trim().toLowerCase());
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}
