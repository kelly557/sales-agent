import { Alert, Button, Space, Table, Tabs, Tag, message } from "antd";
import { DownloadOutlined, FileTextOutlined, ReloadOutlined } from "@ant-design/icons";
import { guideMaterialRows } from "./constructionGuideData";
import styles from "./ConstructionGuidePage.module.css";

interface ConstructionGuideResultPanelProps {
  onReset: () => void;
}

export function ConstructionGuideResultPanel({ onReset }: ConstructionGuideResultPanelProps) {
  return (
    <aside className={styles.resultPanel}>
      <Tabs
        defaultActiveKey="materials"
        items={[
          {
            key: "materials",
            label: "关联信息",
            children: (
              <Space direction="vertical" size={14} className={styles.panelBlock}>
                <Alert message="已生成可编辑初稿" description="请复核蓝色高亮条款中的现场条件、材料用量和停工边界。" type="info" showIcon />
                <Table
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "资料", dataIndex: "name" },
                    { title: "状态", dataIndex: "status", render: (text) => <Tag color="processing">{text}</Tag> },
                  ]}
                  dataSource={guideMaterialRows}
                />
                <Button type="primary" block icon={<DownloadOutlined />}>
                  导出正文
                </Button>
              </Space>
            ),
          },
          {
            key: "checks",
            label: "复核项",
            children: (
              <div className={styles.checkList}>
                <p>基层含水率、粘结强度和裂缝处理方式需由现场复核。</p>
                <p>雨季施工窗口和吊篮验收记录需在交底前补齐。</p>
                <p>材料用量按 18,600 m2 估算，最终以实测面积调整。</p>
              </div>
            ),
          },
          {
            key: "actions",
            label: "生成设置",
            children: (
              <Space direction="vertical" className={styles.panelBlock}>
                <Button icon={<ReloadOutlined />} onClick={() => message.success("已按当前参数重新生成本地初稿")}>
                  重新生成
                </Button>
                <Button icon={<FileTextOutlined />} onClick={onReset}>
                  返回表单
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </aside>
  );
}
