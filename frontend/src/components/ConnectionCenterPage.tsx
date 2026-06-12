import { ApiOutlined, WechatOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Tag, Typography } from "antd";
import styles from "./DocumentWorkspace.module.css";

const { Title, Paragraph } = Typography;

const integrations = [
  {
    key: "wechat",
    name: "企业微信",
    icon: <WechatOutlined />,
    description: "将审批通知、对话结果推送到企业微信群和单聊。",
    status: "未连接",
  },
  {
    key: "dingtalk",
    name: "钉钉",
    icon: <ApiOutlined />,
    description: "支持审批工作流和机器人消息。",
    status: "未连接",
  },
  {
    key: "feishu",
    name: "飞书",
    icon: <ApiOutlined />,
    description: "将销售助手与飞书文档、知识库打通。",
    status: "未连接",
  },
];

export function ConnectionCenterPage() {
  return (
    <section className={styles.capabilityPage} aria-label="连接中心">
      <header>
        <Title level={3} style={{ margin: 0 }}>连接中心</Title>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          选择你的 IM 工具，配置完成后即可在 AI 助手和审批结果中推送消息。
        </Paragraph>
      </header>
      <Row gutter={[16, 16]}>
        {integrations.map((item) => (
          <Col xs={24} sm={12} md={8} key={item.key}>
            <Card
              className={styles.capabilityCard}
              title={
                <Space>
                  {item.icon}
                  <span>{item.name}</span>
                </Space>
              }
              extra={<Tag color="default">{item.status}</Tag>}
            >
              <p style={{ margin: 0 }}>{item.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
