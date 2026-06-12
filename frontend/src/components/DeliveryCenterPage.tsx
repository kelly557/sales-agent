import { Button, Input, Select, Table, Tag } from "antd";
import { useMemo, useState } from "react";
import styles from "./DeliveryCenterPage.module.css";

type DeliveryType = "proposal" | "guide" | "checklist";
type DeliveryStatus = "draft" | "reviewing" | "ready";

const typeLabels: Record<DeliveryType, string> = {
  proposal: "定制方案",
  guide: "指导书",
  checklist: "交付清单",
};

const statusLabels: Record<DeliveryStatus, string> = {
  draft: "草稿",
  reviewing: "复核中",
  ready: "可交付",
};

const deliveries = [
  { id: "D-001", name: "浦东商业综合体外墙翻新推荐书", type: "proposal", status: "reviewing", project: "浦东商业综合体外墙翻新", version: "V1.3", updatedAt: "2026-05-29" },
  { id: "D-002", name: "外墙涂装施工作业指导书", type: "guide", status: "ready", project: "浦东商业综合体外墙翻新", version: "V2.0", updatedAt: "2026-05-28" },
  { id: "D-003", name: "工业地坪改造方案", type: "proposal", status: "draft", project: "华南智能制造园地坪改造", version: "V0.8", updatedAt: "2026-05-26" },
  { id: "D-004", name: "医院内墙净味交付清单", type: "checklist", status: "ready", project: "医院内墙净味翻新咨询", version: "V1.0", updatedAt: "2026-05-18" },
] satisfies Array<{ id: string; name: string; type: DeliveryType; status: DeliveryStatus; project: string; version: string; updatedAt: string }>;

const versionRows = [
  { id: "V-001", deliverable: "浦东商业综合体外墙翻新推荐书", version: "V1.3", change: "补充耐候体系和材料用量复核说明", owner: "周亦然", date: "2026-05-29" },
  { id: "V-002", deliverable: "浦东商业综合体外墙翻新推荐书", version: "V1.2", change: "调整基层检查项和施工边界", owner: "林闻", date: "2026-05-27" },
  { id: "V-003", deliverable: "外墙涂装施工作业指导书", version: "V2.0", change: "确认吊篮作业停工条件", owner: "陈知行", date: "2026-05-28" },
];

export function DeliveryCenterPage() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<DeliveryType | "all">("all");
  const [version, setVersion] = useState("all");

  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((item) => `${item.name} ${item.project}`.toLowerCase().includes(keyword.trim().toLowerCase()))
      .filter((item) => type === "all" || item.type === type)
      .filter((item) => version === "all" || item.version === version)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [keyword, type, version]);

  return (
    <section className={styles.page} aria-label="交付中心页面">
      <header className={styles.header}>
        <div>
          <h1>交付中心</h1>
          <p>集中管理定制方案、施工作业指导书和项目交付清单，复核后进入可交付状态。</p>
        </div>
        <Button type="primary">导出交付包</Button>
      </header>

      <div className={styles.toolbar}>
        <Input.Search allowClear placeholder="搜索交付物或项目" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        <Select
          value={type}
          options={[{ value: "all", label: "全部类型" }, ...Object.entries(typeLabels).map(([value, label]) => ({ value, label }))]}
          onChange={setType}
        />
        <Select
          value={version}
          options={[{ value: "all", label: "全部版本" }, ...Array.from(new Set(deliveries.map((item) => item.version))).map((value) => ({ value, label: value }))]}
          onChange={setVersion}
        />
      </div>

      <div className={styles.section}>
        <h2>交付物版本</h2>
        <Table
          rowKey="id"
          dataSource={filteredDeliveries}
          pagination={false}
          columns={[
            { title: "交付物", dataIndex: "name" },
            { title: "项目", dataIndex: "project" },
            { title: "类型", dataIndex: "type", width: 120, render: (value: DeliveryType) => <Tag>{typeLabels[value]}</Tag> },
            { title: "版本", dataIndex: "version", width: 100 },
            { title: "状态", dataIndex: "status", width: 120, render: (value: DeliveryStatus) => <Tag color={value === "ready" ? "success" : "processing"}>{statusLabels[value]}</Tag> },
            { title: "更新", dataIndex: "updatedAt", width: 120 },
          ]}
        />
      </div>

      <div className={styles.section}>
        <h2>版本记录</h2>
        <Table
          rowKey="id"
          dataSource={versionRows}
          pagination={false}
          columns={[
            { title: "交付物", dataIndex: "deliverable" },
            { title: "版本", dataIndex: "version", width: 100 },
            { title: "变更说明", dataIndex: "change" },
            { title: "维护人", dataIndex: "owner", width: 100 },
            { title: "日期", dataIndex: "date", width: 120 },
          ]}
        />
      </div>
    </section>
  );
}
