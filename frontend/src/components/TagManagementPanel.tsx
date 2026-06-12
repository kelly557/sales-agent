import {
  DeleteOutlined,
  EditOutlined,
  MergeCellsOutlined,
  PlusOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  ColorPicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import {
  TAG_COLORS,
  type Tag as TagModel,
  type TagColor,
  type KnowledgeFile,
} from "./knowledgeBaseData";
import styles from "./KnowledgeBasePage.module.css";

interface TagManagementPanelProps {
  tags: TagModel[];
  files: KnowledgeFile[];
  onChange: (next: TagModel[], renamedFrom?: string, renamedTo?: string) => void;
}

function makeId() {
  return `TAG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TagManagementPanel({ tags, files, onChange }: TagManagementPanelProps) {
  const { modal, message: appMessage } = App.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TagModel | null>(null);
  const [createForm] = Form.useForm<{ name: string; color?: TagColor }>();
  const [editForm] = Form.useForm<{ name: string; color?: TagColor }>();
  const [mergeForm] = Form.useForm<{ fromId: string; toId: string }>();
  const [mergeOpen, setMergeOpen] = useState(false);

  const usage = useMemo(() => {
    const map = new Map<string, number>();
    for (const file of files) {
      for (const tagName of file.tags ?? []) {
        map.set(tagName, (map.get(tagName) ?? 0) + 1);
      }
    }
    return map;
  }, [files]);

  const rows = useMemo(
    () =>
      [...tags]
        .map((t) => ({ ...t, usageCount: usage.get(t.name) ?? 0 }))
        .sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name, "zh-Hans-CN")),
    [tags, usage],
  );

  function openCreate() {
    createForm.resetFields();
    setCreateOpen(true);
  }

  function handleCreate() {
    createForm
      .validateFields()
      .then((values) => {
        const trimmed = values.name.trim();
        if (!trimmed) {
          appMessage.warning("标签名不能为空");
          return;
        }
        if (tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
          appMessage.warning("已存在同名标签");
          return;
        }
        const next: TagModel = {
          id: makeId(),
          name: trimmed,
          color: values.color,
          createdAt: new Date().toISOString(),
        };
        onChange([next, ...tags]);
        setCreateOpen(false);
        createForm.resetFields();
        appMessage.success("已创建标签");
      })
      .catch(() => {
        /* validation already shown by antd Form */
      });
  }

  function openEdit(tag: TagModel) {
    setEditing(tag);
    editForm.setFieldsValue({ name: tag.name, color: tag.color });
  }

  function handleEdit() {
    if (!editing) return;
    editForm
      .validateFields()
      .then((values) => {
        const trimmed = values.name.trim();
        if (!trimmed) {
          appMessage.warning("标签名不能为空");
          return;
        }
        const conflict = tags.find(
          (t) => t.id !== editing.id && t.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (conflict) {
          appMessage.warning("已存在同名标签");
          return;
        }
        const next = tags.map((t) =>
          t.id === editing.id ? { ...t, name: trimmed, color: values.color } : t,
        );
        onChange(next, editing.name, trimmed);
        setEditing(null);
        editForm.resetFields();
        appMessage.success("已保存");
      })
      .catch(() => {
        /* validation already shown by antd Form */
      });
  }

  function handleDelete(tag: TagModel) {
    modal.confirm({
      title: `删除标签「${tag.name}」?`,
      content: (
        <div>
          <p>该标签将从全局标签池中移除。</p>
          <p>已引用此标签的文件会自动去除引用,不会删除文件本身。</p>
        </div>
      ),
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        onChange(tags.filter((t) => t.id !== tag.id), tag.name, undefined);
        appMessage.success("已删除");
      },
    });
  }

  function openMerge() {
    mergeForm.resetFields();
    setMergeOpen(true);
  }

  function handleMerge() {
    mergeForm
      .validateFields()
      .then((values) => {
        if (values.fromId === values.toId) {
          appMessage.warning("源标签与目标标签不能相同");
          return;
        }
        const fromTag = tags.find((t) => t.id === values.fromId);
        const toTag = tags.find((t) => t.id === values.toId);
        if (!fromTag || !toTag) return;
        modal.confirm({
          title: `合并标签「${fromTag.name}」到「${toTag.name}」?`,
          content: "所有引用源标签的文件将自动改为引用目标标签。",
          okText: "合并",
          cancelText: "取消",
          onOk: () => {
            const nextTags = tags.filter((t) => t.id !== fromTag.id);
            onChange(nextTags, fromTag.name, toTag.name);
            setMergeOpen(false);
            mergeForm.resetFields();
            appMessage.success("已合并");
          },
        });
      })
      .catch(() => {
        /* validation already shown by antd Form */
      });
  }

  const columns: ColumnsType<(typeof rows)[number]> = [
    {
      title: "标签",
      dataIndex: "name",
      key: "name",
      render: (_value, record) => (
        <Tag color={record.color ?? "default"} bordered={false} className={styles.tagChip}>
          {record.name}
        </Tag>
      ),
    },
    {
      title: "颜色",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (_value, record) =>
        record.color ? <Tag color={record.color}>{record.color}</Tag> : <span style={{ color: "var(--color-muted)" }}>默认</span>,
    },
    {
      title: "引用次数",
      dataIndex: "usageCount",
      key: "usageCount",
      width: 120,
      sorter: (a, b) => a.usageCount - b.usageCount,
      render: (value: number) => (
        <span style={{ color: value === 0 ? "var(--color-muted)" : "var(--color-ink)" }}>
          {value} 个文件
        </span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (value: string) => value.slice(0, 10),
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render: (_value, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            重命名
          </Button>
          <Popconfirm
            title="删除该标签?"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.sourcePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>
            <TagsOutlined /> 标签管理
          </h3>
          <p className={styles.panelDesc}>
            在此处统一管理所有可被各知识库复用的标签,引用次数从全部知识文件中实时统计。
          </p>
        </div>
        <Space>
          <Button icon={<MergeCellsOutlined />} onClick={openMerge} disabled={tags.length < 2}>
            合并标签
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建标签
          </Button>
        </Space>
      </div>

      {rows.length === 0 ? (
        <Empty description="尚未创建任何标签" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={rows}
          pagination={false}
        />
      )}

      <Modal
        title="新建标签"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="创建"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" className={styles.importForm}>
          <Form.Item label="标签名" name="name" rules={[{ required: true, message: "请输入标签名" }]}>
            <Input placeholder="例如：标准规范" maxLength={20} showCount />
          </Form.Item>
          <Form.Item label="颜色" name="color">
            <ColorPicker
              presets={[
                {
                  label: "推荐",
                  colors: TAG_COLORS.map((c) => c),
                },
              ]}
              showText
              format="hex"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑标签"
        open={editing !== null}
        onCancel={() => setEditing(null)}
        onOk={handleEdit}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" className={styles.importForm}>
          <Form.Item label="标签名" name="name" rules={[{ required: true, message: "请输入标签名" }]}>
            <Input maxLength={20} showCount />
          </Form.Item>
          <Form.Item label="颜色" name="color">
            <ColorPicker
              presets={[
                {
                  label: "推荐",
                  colors: TAG_COLORS.map((c) => c),
                },
              ]}
              showText
              format="hex"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="合并标签"
        open={mergeOpen}
        onCancel={() => setMergeOpen(false)}
        onOk={handleMerge}
        okText="合并"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={mergeForm} layout="vertical" className={styles.importForm}>
          <Form.Item label="源标签(将被删除)" name="fromId" rules={[{ required: true, message: "请选择源标签" }]}>
            <Select
              placeholder="选择要被合并的标签"
              options={tags.map((t) => ({
                value: t.id,
                label: <Tag color={t.color ?? "default"} bordered={false}>{t.name}</Tag>,
              }))}
            />
          </Form.Item>
          <Form.Item label="目标标签(保留)" name="toId" rules={[{ required: true, message: "请选择目标标签" }]}>
            <Select
              placeholder="选择要保留的标签"
              options={tags.map((t) => ({
                value: t.id,
                label: <Tag color={t.color ?? "default"} bordered={false}>{t.name}</Tag>,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
