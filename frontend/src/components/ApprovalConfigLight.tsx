import { Slider, Space, Tag } from "antd";
import { useState } from "react";
import { defaultApprovalLightConfig, type ApprovalLightConfig } from "../data/approvalConfig";
import styles from "./ApprovalConfigShared.module.css";

interface ApprovalConfigLightProps {
  config: ApprovalLightConfig;
  onChange: (next: ApprovalLightConfig) => void;
}

export function ApprovalConfigLight({ config, onChange }: ApprovalConfigLightProps) {
  const [draft, setDraft] = useState<ApprovalLightConfig>(config ?? defaultApprovalLightConfig);

  function update(next: Partial<ApprovalLightConfig>) {
    const merged = { ...draft, ...next };
    setDraft(merged);
    onChange(merged);
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div className={styles.summaryGrid}>
        <SummaryCell
          label="通过阈值"
          value={`${draft.scoreThreshold} 分`}
          detail="AI 评分高于该值自动通过，低于该值进入人工审批"
        />
        <SummaryCell
          label="自动通过"
          value={draft.autoApproveHighScore ? "启用" : "关闭"}
          detail={draft.autoApproveHighScore ? "满足阈值后自动放行" : "无论评分均进入人工审批"}
        />
        <SummaryCell
          label="通知渠道"
          value={channelLabel(draft.notifyChannel)}
          detail="审批节点变更时同步推送"
        />
      </div>

      <div className={styles.scorePanel}>
        <div className={styles.scoreValue}>
          <strong>{draft.scoreThreshold}</strong>
          <small>拖动调整通过阈值（0-100）</small>
        </div>
        <Slider
          min={0}
          max={100}
          value={draft.scoreThreshold}
          onChange={(value) => update({ scoreThreshold: value })}
          style={{ minWidth: 280 }}
        />
      </div>

      <div className={styles.modeCard}>
        <h2>轻量版规则说明</h2>
        <p>
          轻量版仅在 AI 评分与人工通知之间流转。当 AI 评分 ≥ {draft.scoreThreshold} 且自动通过开启时，
          方案直接进入交付中心；否则推送至{draft.notifyChannel === "wechat" ? "企业微信" : draft.notifyChannel === "email" ? "邮件" : "站内消息"}待办。
        </p>
      </div>
    </Space>
  );
}

function SummaryCell({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={styles.summaryCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function channelLabel(channel: ApprovalLightConfig["notifyChannel"]) {
  if (channel === "wechat") return "企业微信";
  if (channel === "email") return "邮件";
  return "站内消息";
}

export function LightConfigBadge({ config }: { config: ApprovalLightConfig }) {
  return (
    <Space wrap>
      <Tag color="blue">阈值 {config.scoreThreshold}</Tag>
      <Tag color={config.autoApproveHighScore ? "success" : "warning"}>
        {config.autoApproveHighScore ? "自动通过" : "全部人工"}
      </Tag>
      <Tag>{channelLabel(config.notifyChannel)}</Tag>
    </Space>
  );
}
