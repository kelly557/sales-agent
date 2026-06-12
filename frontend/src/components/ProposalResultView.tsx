import { Alert, App as AntApp, Button, Progress, Space, Steps, Table, Tabs, Tag } from "antd";
import {
  CheckCircleOutlined,
  CloudDownloadOutlined,
  FilePptOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import type React from "react";
import { useState } from "react";
import {
  proposalApprovalRows,
  proposalCitationRows,
  proposalKnowledgeRows,
  proposalPipeline,
  proposalRuleRows,
  proposalSlides,
  type ProposalFormValues,
} from "./proposalData";
import type { ProposalPptStatus } from "./proposalWorkflow";
import styles from "./ProposalResult.module.css";

interface ProposalResultViewProps {
  summary: string;
  values: ProposalFormValues;
  onReset: () => void;
}

export function ProposalResultView({ summary, values, onReset }: ProposalResultViewProps) {
  const { message: messageApi } = AntApp.useApp();
  const [pptStatus, setPptStatus] = useState<ProposalPptStatus | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportPpt() {
    setIsExporting(true);
    setPptStatus(null);

    try {
      const response = await fetch("/api/proposal/ppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          slides: proposalSlides,
          knowledge: proposalKnowledgeRows,
          rules: proposalRuleRows,
          citations: proposalCitationRows,
          approvals: proposalApprovalRows,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "PPT 生成任务启动失败");
      }

      const jobId = payload.jobId as string;
      await pollPptJob(jobId);
    } catch (error) {
      setIsExporting(false);
      const errorMessage = error instanceof Error ? error.message : "PPT 生成失败";
      setPptStatus({ jobId: "", status: "error", error: errorMessage });
      messageApi.error(errorMessage);
    }
  }

  async function pollPptJob(jobId: string) {
    for (;;) {
      const response = await fetch(`/api/proposal/ppt/status?jobId=${encodeURIComponent(jobId)}`);
      const status = (await response.json()) as ProposalPptStatus;
      setPptStatus(status);

      if (status.status === "done") {
        setIsExporting(false);
        messageApi.success("可编辑 PPT 已生成，可下载编辑");
        return;
      }

      if (status.status === "error") {
        setIsExporting(false);
        messageApi.error(status.error ?? "PPT 生成失败");
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 5000));
    }
  }

  function handleDownloadPpt() {
    if (pptStatus?.localDownloadUrl) {
      window.open(pptStatus.localDownloadUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section className={styles.resultPage} aria-label="定制方案 PPT 生成结果">
      <main className={styles.resultMain}>
        <div className={styles.resultHeader}>
          <div>
            <Tag color="processing">本地演示初稿</Tag>
            <h1>{summary}</h1>
            <p>已按 PPT workflow 拆解为需求、查询、规则、知识、生成、溯源和审批流程；外部 web_search 当前为待接入状态。</p>
          </div>
          <Space>
            <Button icon={<FileSearchOutlined />} onClick={onReset}>
              返回参数
            </Button>
            <Button type="primary" icon={<CloudDownloadOutlined />} loading={isExporting} onClick={handleExportPpt}>
              生成可编辑 PPT
            </Button>
            {pptStatus?.status === "done" ? (
              <Button icon={<FilePptOutlined />} onClick={handleDownloadPpt}>
                下载可编辑 PPT
              </Button>
            ) : null}
          </Space>
        </div>

        {pptStatus ? (
          <Alert
            showIcon
            type={pptStatus.status === "error" ? "error" : pptStatus.status === "done" ? "success" : "info"}
            message={pptStatus.status === "done" ? "可编辑 PPT 已生成" : pptStatus.status === "error" ? "PPT 生成失败" : "正在生成可编辑 PPT"}
            description={
              <div className={styles.exportStatus}>
                {pptStatus.stage ? <p>{pptStatus.stage}</p> : null}
                {typeof pptStatus.progress === "number" ? <Progress percent={Math.min(100, Math.round(pptStatus.progress))} /> : null}
                {pptStatus.outputPath ? <p>本地文件：{pptStatus.outputPath}</p> : null}
                {pptStatus.error ? <p>{pptStatus.error}</p> : null}
              </div>
            }
          />
        ) : null}

        <div className={styles.pipelinePanel}>
          <Steps
            current={3}
            items={proposalPipeline.map((item) => ({
              title: item.title,
              description: item.description,
              status: item.status,
            }))}
          />
        </div>

        <div className={styles.metricGrid}>
          <MetricCard label="PPT 页数" value="10" detail="商务汇报型模板" />
          <MetricCard label="知识引用" value="4" detail="产品、案例、规则、项目知识" />
          <MetricCard label="待复核项" value="3" detail="现场检测、吊篮、雨季窗口" />
          <MetricCard label="生成进度" value="82%" detail={<Progress percent={82} showInfo={false} />} />
        </div>

        <div className={styles.deckPreview}>
          {proposalSlides.map((slide, index) => (
            <article key={slide.key} className={styles.slideCard}>
              <div className={styles.slideNumber}>{String(index + 1).padStart(2, "0")}</div>
              <h2>{slide.title}</h2>
              <p>{slide.content}</p>
            </article>
          ))}
        </div>
      </main>

      <aside className={styles.resultPanel}>
        <Tabs defaultActiveKey="knowledge" items={buildProposalResultTabs()} />
      </aside>
    </section>
  );
}

function buildProposalResultTabs() {
  return [
    { key: "knowledge", label: "知识", children: <KnowledgeTab /> },
    { key: "rules", label: "规则", children: <RulesTab /> },
    { key: "citations", label: "溯源", children: <CitationsTab /> },
    { key: "approval", label: "审批", children: <ApprovalTab /> },
  ];
}

function KnowledgeTab() {
  return (
    <Table
      size="small"
      pagination={false}
      dataSource={proposalKnowledgeRows}
      columns={[
        { title: "资料", dataIndex: "name" },
        { title: "类型", dataIndex: "type", render: (value) => <Tag>{value}</Tag> },
        { title: "状态", dataIndex: "status", render: (value) => <Tag color={value === "待现场复核" ? "warning" : "success"}>{value}</Tag> },
      ]}
    />
  );
}

function RulesTab() {
  return (
    <Table
      size="small"
      pagination={false}
      dataSource={proposalRuleRows}
      columns={[
        { title: "规则", dataIndex: "rule" },
        { title: "结果", dataIndex: "result", render: (value) => <Tag color={value === "通过" ? "success" : "warning"}>{value}</Tag> },
        { title: "说明", dataIndex: "detail" },
      ]}
    />
  );
}

function CitationsTab() {
  return (
    <Table
      size="small"
      pagination={false}
      dataSource={proposalCitationRows}
      columns={[
        { title: "页码", dataIndex: "slide" },
        { title: "来源", dataIndex: "source" },
        { title: "证据", dataIndex: "evidence" },
      ]}
    />
  );
}

function ApprovalTab() {
  return (
    <Space direction="vertical" size={14} className={styles.panelBlock}>
      <Alert
        message="审批流已生成"
        description="PPT 初稿需完成方案、质量和销售三类复核后进入交付中心。"
        type="info"
        showIcon
      />
      <Table
        size="small"
        pagination={false}
        dataSource={proposalApprovalRows}
        columns={[
          { title: "节点", dataIndex: "node" },
          { title: "负责人", dataIndex: "assignee" },
          { title: "状态", dataIndex: "status", render: (value) => <Tag color="processing">{value}</Tag> },
        ]}
      />
    </Space>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: React.ReactNode }) {
  return (
    <div className={styles.metricCard}>
      <CheckCircleOutlined />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
