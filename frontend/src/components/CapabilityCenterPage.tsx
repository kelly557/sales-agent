import { ApiOutlined, DatabaseOutlined, ToolOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Tag, Typography } from "antd";
import styles from "./DocumentWorkspace.module.css";

const { Title, Paragraph } = Typography;

const modules = [
  {
    key: "mcp",
    title: "MCP 概览",
    icon: <ApiOutlined />,
    description: "已接入连接器数量、健康总览和调用情况。",
    status: "进行中",
  },
  {
    key: "tools",
    title: "工具市场",
    icon: <ToolOutlined />,
    description: "业务系统连接（CRM/ERP 预设）、知识源链接、连接器列表与添加。",
    status: "规划中",
  },
  {
    key: "owned",
    title: "我的 MCP 服务",
    icon: <DatabaseOutlined />,
    description: "已安装连接器列表与自定义 API。",
    status: "规划中",
  },
  {
    key: "custom",
    title: "定制",
    icon: <ToolOutlined />,
    description: "专属 MCP 服务定制入口。",
    status: "规划中",
  },
];

export function CapabilityCenterPage() {
  return (
    <section className={styles.capabilityPage} aria-label="能力中心">
      <header>
        <Title level={3} style={{ margin: 0 }}>能力中心</Title>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          MCP 概览、工具市场、我的 MCP 服务和定制入口。
        </Paragraph>
      </header>
      <Row gutter={[16, 16]}>
        {modules.map((item) => (
          <Col xs={24} md={12} key={item.key}>
            <Card
              className={styles.capabilityCard}
              title={
                <Space>
                  {item.icon}
                  <span>{item.title}</span>
                </Space>
              }
              extra={<Tag color="blue">{item.status}</Tag>}
            >
              <p style={{ margin: 0 }}>{item.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
