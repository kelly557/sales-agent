import { FileSearchOutlined, ReadOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Tag, Typography } from "antd";
import styles from "./DocumentWorkspace.module.css";

const { Title, Paragraph } = Typography;

const sections = [
  {
    key: "import",
    title: "导入向导",
    icon: <FileSearchOutlined />,
    description: "选择行业 SOP 模板，一键导入到企业知识库和方案生成链路。",
    tag: "立即开始",
    tagColor: "blue",
  },
  {
    key: "best-practice",
    title: "最佳实践文档/视频",
    icon: <ReadOutlined />,
    description: "按行业和应用场景组织的最佳实践资料，支持在线预览和下载。",
    tag: "浏览",
    tagColor: "default",
  },
];

export function SolutionCenterPage() {
  return (
    <section className={styles.capabilityPage} aria-label="解决方案中心">
      <header>
        <Title level={3} style={{ margin: 0 }}>解决方案中心</Title>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          通过导入向导快速复用行业 SOP，并按需查阅最佳实践文档和视频。
        </Paragraph>
      </header>
      <Row gutter={[16, 16]}>
        {sections.map((item) => (
          <Col xs={24} md={12} key={item.key}>
            <Card
              className={styles.capabilityCard}
              title={
                <Space>
                  {item.icon}
                  <span>{item.title}</span>
                </Space>
              }
              extra={<Tag color={item.tagColor}>{item.tag}</Tag>}
            >
              <p style={{ margin: 0 }}>{item.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
