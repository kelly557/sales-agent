import {
  CodeOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FolderOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Card,
  Col,
  Drawer,
  Row,
  Skeleton,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { MarkdownContent } from "./MarkdownContent";
import styles from "./SkillsPage.module.css";

const { Title, Paragraph, Text } = Typography;

interface SkillEntry {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  icon: ReactNode;
  triggers: string[];
  status: "已上线";
  statusColor: "blue" | "green" | "geekblue";
}

const TRIGGER_KEYWORDS: Record<string, string[]> = {
  doc: ["写报告", "起草方案", "帮我写一篇", "生成文档"],
  ppt: ["生成PPT", "帮我做个PPT", "用这个模板", "改一下这个PPT", "删除第N页", "合并PPT"],
  search: ["搜索", "查询", "查找", "最新进展"],
};

const SKILL_LIST: SkillEntry[] = [
  {
    slug: "doc",
    name: "Document",
    description: "把任意主题或素材一键生成 docx / pdf / markdown / html 格式的专业文档。",
    longDescription:
      "覆盖报告、方案、博客、论文、小说、商业写作、社交媒体文案、备忘录、信函、合同、计划、简历、研究摘要、学习笔记等场景。",
    icon: <FileTextOutlined />,
    triggers: TRIGGER_KEYWORDS.doc,
    status: "已上线",
    statusColor: "blue",
  },
  {
    slug: "ppt",
    name: "PPT",
    description: "四合一 PPT 能力：生成新稿、仿照模板风格、自然语言编辑、本地 pptx 文件操作。",
    longDescription:
      "既可以按主题生成全新演示文稿，也可以仿照已有 .pptx 风格出稿，还能用自然语言改某张幻灯片，必要时直接做本地抽取、合并、删除等文件级操作。",
    icon: <ThunderboltOutlined />,
    triggers: TRIGGER_KEYWORDS.ppt,
    status: "已上线",
    statusColor: "geekblue",
  },
  {
    slug: "search",
    name: "Search",
    description: "实现复杂内容的查询逻辑，调用搜索工具拉取复杂信息。",
    longDescription:
      "适合调研类问答、写报告前的资料收集、PPT 素材补充等任何需要训练数据之外最新事实的场景。",
    icon: <GlobalOutlined />,
    triggers: TRIGGER_KEYWORDS.search,
    status: "已上线",
    statusColor: "green",
  },
];

interface SkillDirectoryEntry {
  name: string;
  path: string;
  type: "file" | "dir";
}

export function SkillsPage() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [skillMd, setSkillMd] = useState<string | null>(null);
  const [skillMdLoading, setSkillMdLoading] = useState(false);
  const [extraFile, setExtraFile] = useState<{ path: string; content: string } | null>(null);
  const [extraFileLoading, setExtraFileLoading] = useState(false);
  const [extraFileError, setExtraFileError] = useState<string | null>(null);
  const [entries, setEntries] = useState<SkillDirectoryEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSkill = useMemo(
    () => SKILL_LIST.find((skill) => skill.slug === activeSlug) ?? null,
    [activeSlug],
  );

  useEffect(() => {
    if (!activeSlug) return;
    let cancelled = false;
    setSkillMd(null);
    setExtraFile(null);
    setExtraFileError(null);
    setSkillMdLoading(true);
    setEntriesLoading(true);
    setError(null);

    void (async () => {
      try {
        const [manifestRes, listingRes] = await Promise.all([
          fetch(`/api/skills/${activeSlug}/raw?path=SKILL.md`),
          fetch(`/api/skills/${activeSlug}/files`),
        ]);
        if (!manifestRes.ok) throw new Error(`无法读取 SKILL.md（HTTP ${manifestRes.status}）`);
        if (!listingRes.ok) throw new Error(`无法读取技能目录（HTTP ${listingRes.status}）`);
        const [manifestText, listingPayload] = await Promise.all([
          manifestRes.text(),
          listingRes.json(),
        ]);
        if (cancelled) return;
        setSkillMd(manifestText);
        setEntries(Array.isArray(listingPayload?.entries) ? listingPayload.entries : []);
      } catch (fetchError) {
        if (cancelled) return;
        const messageText = fetchError instanceof Error ? fetchError.message : "读取技能失败";
        setError(messageText);
        message.error(messageText);
      } finally {
        if (!cancelled) {
          setSkillMdLoading(false);
          setEntriesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSlug]);

  useEffect(() => {
    if (!activeSlug) {
      setEntries([]);
      return;
    }
    setExtraFile(null);
    setExtraFileError(null);
  }, [activeSlug]);

  async function handleOpenExtraFile(relativePath: string) {
    if (!activeSlug) return;
    setExtraFileLoading(true);
    setExtraFileError(null);
    try {
      const response = await fetch(
        `/api/skills/${activeSlug}/raw?path=${encodeURIComponent(relativePath)}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const content = await response.text();
      setExtraFile({ path: relativePath, content });
    } catch (fetchError) {
      const text = fetchError instanceof Error ? fetchError.message : "读取文件失败";
      setExtraFileError(text);
      message.error(text);
    } finally {
      setExtraFileLoading(false);
    }
  }

  function handleCloseDrawer() {
    setActiveSlug(null);
    setSkillMd(null);
    setExtraFile(null);
    setExtraFileError(null);
  }

  return (
    <section className={styles.page} aria-label="技能">
      <header className={styles.header}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            技能
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
          </Paragraph>
        </div>
        <Text type="secondary" className={styles.headerCount}>
          共 {SKILL_LIST.length} 个技能
        </Text>
      </header>
      <Row gutter={[16, 16]}>
        {SKILL_LIST.map((skill) => (
          <Col xs={24} sm={12} md={8} key={skill.slug}>
            <Card
              className={styles.card}
              hoverable
              onClick={() => setActiveSlug(skill.slug)}
              title={
                <Space>
                  <span className={styles.cardIcon}>{skill.icon}</span>
                  <span>{skill.name}</span>
                </Space>
              }
              extra={<Tag color={skill.statusColor}>{skill.status}</Tag>}
            >
              <Paragraph style={{ marginBottom: 12 }}>{skill.description}</Paragraph>
              <Paragraph type="secondary" className={styles.longDescription}>
                {skill.longDescription}
              </Paragraph>
              <div className={styles.metaRow}>
                <Tag color="default">slug: {skill.slug}</Tag>
              </div>
              <div className={styles.triggersRow}>
                <Text type="secondary" className={styles.triggersLabel}>
                  触发关键词
                </Text>
                <Space size={[4, 4]} wrap>
                  {skill.triggers.map((keyword) => (
                    <Tag key={keyword} bordered={false} color="blue">
                      {keyword}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer
        title={activeSkill ? `${activeSkill.name} · 技能详情` : "技能详情"}
        open={Boolean(activeSkill)}
        onClose={handleCloseDrawer}
        width={720}
        destroyOnClose
      >
        {activeSkill ? (
          <div className={styles.drawerBody}>
            <Space direction="vertical" size={6} className={styles.drawerIntro}>
              <Text strong>{activeSkill.name}</Text>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {activeSkill.description}
              </Paragraph>
              <Space size={6} wrap>
                <Tag color={activeSkill.statusColor}>{activeSkill.status}</Tag>
                <Tag color="default">slug: {activeSkill.slug}</Tag>
              </Space>
            </Space>
            {error ? (
              <Alert type="error" message={error} showIcon />
            ) : (
              <Tabs
                defaultActiveKey="manifest"
                items={[
                  {
                    key: "manifest",
                    label: (
                      <Space size={4}>
                        <FileTextOutlined />
                        <span>SKILL.md</span>
                      </Space>
                    ),
                    children: skillMdLoading ? (
                      <div className={styles.loading}>
                        <Spin /> <span style={{ marginLeft: 8 }}>正在加载 SKILL.md…</span>
                      </div>
                    ) : skillMd ? (
                      <MarkdownContent content={skillMd} />
                    ) : (
                      <Alert type="info" message="暂无内容" showIcon />
                    ),
                  },
                  {
                    key: "files",
                    label: (
                      <Space size={4}>
                        <FolderOutlined />
                        <span>目录文件</span>
                      </Space>
                    ),
                    children: (
                      <div className={styles.filePane}>
                        {entriesLoading ? (
                          <Skeleton active paragraph={{ rows: 4 }} />
                        ) : entries.length === 0 ? (
                          <Alert type="info" message="该技能目录下没有其他文件" showIcon />
                        ) : (
                          <ul className={styles.fileList}>
                            {entries.map((entry) => (
                              <li key={entry.path} className={styles.fileItem}>
                                <Space>
                                  {entry.type === "dir" ? <FolderOutlined /> : <CodeOutlined />}
                                  <Text>{entry.name}</Text>
                                </Space>
                                {entry.type === "file" &&
                                !entry.name.startsWith("SKILL.") &&
                                !entry.name.endsWith(".pyc") ? (
                                  <a
                                    href={`/api/skills/${activeSkill.slug}/raw?path=${encodeURIComponent(entry.path)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.fileLink}
                                    onClick={(event) => {
                                      event.preventDefault();
                                      void handleOpenExtraFile(entry.path);
                                    }}
                                  >
                                    <FileSearchOutlined /> 预览
                                  </a>
                                ) : (
                                  <Text type="secondary" className={styles.fileMeta}>
                                    {entry.type === "dir" ? "目录" : "脚本"}
                                  </Text>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                        {extraFileLoading ? (
                          <div className={styles.loading}>
                            <Spin /> <span style={{ marginLeft: 8 }}>正在加载 {extraFile?.path}…</span>
                          </div>
                        ) : extraFileError ? (
                          <Alert type="error" message={extraFileError} showIcon />
                        ) : extraFile ? (
                          <div className={styles.extraFile}>
                            <Text strong>{extraFile.path}</Text>
                            <pre className={styles.codeBlock}>
                              <code>{extraFile.content}</code>
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}
