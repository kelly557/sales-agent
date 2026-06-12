import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { App as AntApp, Button, Input, InputNumber, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import {
  defaultApprovalStandardConfig,
  type ApprovalStandardConfig,
  type ApprovalStandardNode,
} from "../data/approvalConfig";
import styles from "./ApprovalConfigShared.module.css";

interface ApprovalConfigStandardProps {
  config: ApprovalStandardConfig;
  onChange: (next: ApprovalStandardConfig) => void;
}

export function ApprovalConfigStandard({ config, onChange }: ApprovalConfigStandardProps) {
  const { message: messageApi } = AntApp.useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ApprovalStandardConfig>(config ?? defaultApprovalStandardConfig);

  function update(next: ApprovalStandardConfig) {
    setDraft(next);
    onChange(next);
  }

  function addNode() {
    const nextId = `node-${Date.now()}`;
    update({
      ...draft,
      nodes: [
        ...draft.nodes,
        { id: nextId, name: `新节点 ${draft.nodes.length + 1}`, role: "负责人", description: "请补充该节点的复核重点" },
      ],
    });
    setEditingId(nextId);
  }

  function updateNode(id: string, patch: Partial<ApprovalStandardNode>) {
    update({
      ...draft,
      nodes: draft.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
    });
  }

  function removeNode(id: string) {
    if (draft.nodes.length <= 1) {
      messageApi.warning("至少需要保留一个审批节点");
      return;
    }
    update({ ...draft, nodes: draft.nodes.filter((node) => node.id !== id) });
    if (editingId === id) setEditingId(null);
  }

  function resetToDefault() {
    update(defaultApprovalStandardConfig);
    setEditingId(null);
    messageApi.success("已恢复标准流程版默认节点");
  }

  const columns: ColumnsType<ApprovalStandardNode> = [
    {
      title: "顺序",
      dataIndex: "id",
      width: 64,
      render: (_value, _row, index) => (
        <div className={styles.nodeIndex}>{index + 1}</div>
      ),
    },
    {
      title: "节点",
      dataIndex: "name",
      render: (_value, row) =>
        editingId === row.id ? (
          <Input
            value={row.name}
            onChange={(event) => updateNode(row.id, { name: event.target.value })}
            placeholder="节点名称"
          />
        ) : (
          <div className={styles.nodeBody}>
            <strong>{row.name}</strong>
            <small>{row.description}</small>
          </div>
        ),
    },
    {
      title: "角色",
      dataIndex: "role",
      width: 160,
      render: (_value, row) =>
        editingId === row.id ? (
          <Input
            value={row.role}
            onChange={(event) => updateNode(row.id, { role: event.target.value })}
            placeholder="角色"
          />
        ) : (
          <Tag color="blue">{row.role}</Tag>
        ),
    },
    {
      title: "操作",
      width: 140,
      render: (_value, row) => (
        <Space>
          <Button
            size="small"
            icon={editingId === row.id ? <Tag color="success">保存中</Tag> : <EditOutlined />}
            onClick={() => setEditingId(editingId === row.id ? null : row.id)}
          >
            {editingId === row.id ? "完成" : "编辑"}
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeNode(row.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>节点数</span>
          <strong>{draft.nodes.length}</strong>
          <small>按顺序流转，全部完成才进入交付</small>
        </div>
        <div className={styles.summaryCard}>
          <span>超时（天）</span>
          <InputNumber
            min={1}
            max={30}
            value={draft.timeoutDays}
            onChange={(value) => update({ ...draft, timeoutDays: Number(value) || 1 })}
            style={{ width: 120 }}
          />
          <small>超过该天数未处理自动催办</small>
        </div>
        <div className={styles.summaryCard}>
          <span>操作</span>
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={addNode}>
              新增节点
            </Button>
            <Button onClick={resetToDefault}>恢复默认</Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="id"
        size="middle"
        pagination={false}
        columns={columns}
        dataSource={draft.nodes}
        className={styles.nodeList}
      />
    </Space>
  );
}

export function StandardConfigBadge({ config }: { config: ApprovalStandardConfig }) {
  return (
    <Space wrap>
      <Tag color="blue">{config.nodes.length} 个节点</Tag>
      <Tag color="warning">超时 {config.timeoutDays} 天</Tag>
    </Space>
  );
}
