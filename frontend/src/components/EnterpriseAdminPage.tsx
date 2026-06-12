import { Button, Card, Space, Statistic, Tag, Typography } from "antd";
import type { AdminSection } from "./adminSections";
import { approvalModeDescriptions, approvalModeLabels, defaultApprovalLightConfig, defaultApprovalStandardConfig } from "../data/approvalConfig";
import { ApprovalConfigLight } from "./ApprovalConfigLight";
import { ApprovalConfigStandard } from "./ApprovalConfigStandard";
import styles from "./EnterpriseAdminPage.module.css";

const { Title, Paragraph } = Typography;

interface AdminCenterPageProps {
  section: AdminSection;
}

export function AdminCenterPage({ section }: AdminCenterPageProps) {
  return (
    <section className={styles.page} aria-label="管理中心">
      <AdminHeader />
      {renderAdminSection(section)}
    </section>
  );
}

function AdminHeader() {
  return (
    <header className={styles.header}>
      <div>
        <Title level={3} style={{ margin: 0 }}>管理中心</Title>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          管理企业内的权限、知识、记忆、模版、提示词、规则和审批配置。
        </Paragraph>
      </div>
    </header>
  );
}

function renderAdminSection(section: AdminSection) {
  switch (section) {
    case "permission":
      return <PermissionPanel />;
    case "memory":
      return <MemoryPanel />;
    case "approval":
      return <ApprovalPanel />;
    default:
      return null;
  }
}

const permissionUsers = [
  { id: "U-01", name: "周亦然", role: "方案工程师", status: "启用", scope: "方案生成、指导书" },
  { id: "U-02", name: "林闻", role: "质量复核", status: "启用", scope: "知识资产、交付中心" },
  { id: "U-03", name: "陈知行", role: "企业管理员", status: "启用", scope: "全部模块" },
];

function PermissionPanel() {
  return (
    <Table
      rowKey="id"
      pagination={false}
      dataSource={permissionUsers}
      columns={[
        { title: "用户", dataIndex: "name" },
        { title: "角色", dataIndex: "role" },
        { title: "权限范围", dataIndex: "scope" },
        { title: "状态", dataIndex: "status", width: 100, render: (value) => <Tag color="success">{value}</Tag> },
        { title: "操作", width: 120, render: () => <Button size="small">调整权限</Button> },
      ]}
    />
  );
}

const memorySummary = [
  { label: "项目记忆", value: 128, detail: "覆盖 3 个项目" },
  { label: "客户记忆", value: 56, detail: "覆盖 12 个客户" },
  { label: "本周命中", value: 412, detail: "按团队统计" },
  { label: "命中率", value: "78%", detail: "近 7 天" },
];

function MemoryPanel() {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div className={styles.metricGrid}>
        {memorySummary.map((item) => (
          <Card key={item.label} className={styles.metricCard}>
            <Statistic title={item.label} value={item.value} suffix={item.detail} />
          </Card>
        ))}
      </div>
      <Card title="记忆策略">
        <Space direction="vertical" size={8}>
          <span>· 权限与隔离：按项目和客户维度独立</span>
          <span>· 抽取规则：从对话中自动沉淀偏好和确认项</span>
          <span>· 启用状态：已开启</span>
        </Space>
      </Card>
    </Space>
  );
}

function ApprovalPanel() {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card>
        <Space direction="vertical" size={6}>
          <strong>当前模式</strong>
          <span>{approvalModeLabels.standard}：{approvalModeDescriptions.standard}</span>
          <span>轻量版：{approvalModeDescriptions.light}</span>
          <span>不审批：{approvalModeDescriptions.none}</span>
        </Space>
      </Card>
      <Card title="轻量版参数">
        <ApprovalConfigLight config={defaultApprovalLightConfig} onChange={() => undefined} />
      </Card>
      <Card title="标准流程版节点">
        <ApprovalConfigStandard config={defaultApprovalStandardConfig} onChange={() => undefined} />
      </Card>
    </Space>
  );
}
