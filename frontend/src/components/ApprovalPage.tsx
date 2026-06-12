import { Button, Progress, Space, Table, Tag } from "antd";
import { CheckCircleOutlined, FileDoneOutlined, ReloadOutlined } from "@ant-design/icons";
import type React from "react";
import styles from "./ApprovalPage.module.css";

type ApprovalStatus = "pending" | "reviewing" | "approved";

const statusLabels: Record<ApprovalStatus, string> = {
  pending: "待提交",
  reviewing: "复核中",
  approved: "已通过",
};

const statusColors: Record<ApprovalStatus, string> = {
  pending: "default",
  reviewing: "processing",
  approved: "success",
};

const approvalRows = [
  {
    key: "1",
    name: "浦东商业综合体外墙翻新推荐书 PPT",
    project: "浦东商业综合体外墙翻新",
    node: "方案工程师复核",
    owner: "周亦然",
    status: "reviewing" as const,
    focus: "体系选型、客户表达、PPT 结构",
    progress: 68,
  },
  {
    key: "2",
    name: "外墙施工作业指导书",
    project: "浦东商业综合体外墙翻新",
    node: "质量复核",
    owner: "林闻",
    status: "pending" as const,
    focus: "基层检测、停工边界、验收口径",
    progress: 35,
  },
  {
    key: "3",
    name: "工业地坪涂装方案",
    project: "华南智能制造园地坪改造",
    node: "销售负责人确认",
    owner: "沈嘉",
    status: "approved" as const,
    focus: "商务措辞、报价口径、交付附件",
    progress: 100,
  },
];

export function ApprovalPage() {
  return (
    <section className={styles.page} aria-label="审批中心页面">
      <header className={styles.header}>
        <div>
          <h1>审批中心</h1>
          <p>集中处理方案 PPT、指导书和交付物的复核节点，确保规则、知识引用和项目资料在交付前完成确认。</p>
        </div>
        <Button icon={<ReloadOutlined />}>刷新审批</Button>
      </header>

      <div className={styles.summaryGrid}>
        <SummaryCard label="待处理" value="2" icon={<FileDoneOutlined />} />
        <SummaryCard label="复核中" value="1" icon={<CheckCircleOutlined />} />
        <SummaryCard label="已通过" value="1" icon={<CheckCircleOutlined />} />
      </div>

      <Table
        rowKey="key"
        dataSource={approvalRows}
        pagination={false}
        columns={[
          {
            title: "审批事项",
            dataIndex: "name",
            render: (name, row) => (
              <div className={styles.nameCell}>
                <strong>{name}</strong>
                <span>{row.project}</span>
              </div>
            ),
          },
          { title: "节点", dataIndex: "node", width: 160 },
          { title: "负责人", dataIndex: "owner", width: 110 },
          {
            title: "状态",
            dataIndex: "status",
            width: 110,
            render: (status: ApprovalStatus) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
          },
          { title: "复核重点", dataIndex: "focus" },
          {
            title: "进度",
            dataIndex: "progress",
            width: 150,
            render: (progress: number) => <Progress percent={progress} size="small" />,
          },
        ]}
      />
    </section>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Space className={styles.summaryCard} size={12}>
      <span className={styles.summaryIcon}>{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </Space>
  );
}
